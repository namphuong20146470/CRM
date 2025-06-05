// Thư viện React và Ant Design
import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';

//Thao tác chung
// Các file CSS dùng chung để chuẩn hóa giao diện bảng, nút, filter
import '../../utils/css/Custom-Table.css';
import '../../utils/css/Custom-Button.css';
import '../../utils/css/Custom-Filter.css';
// Hàm gọi API
import { fetchData } from '../../utils/api/apiHandler';
// Component phân trang
import PaginationControl from '../../utils/format/PaginationControl';
// Header của mỗi bảng dữ liệu
import AreaHeader from '../../utils/jsx/AreaHeader';
import { sortTableData } from '../../utils/data/sortTable';
import { hasFullPermission } from '../../utils/auth/permissionUtils';

// Các tính năng
import './NguonCH_Main.css';
import NguonCH_Import from './Function/NguonCH_Import';
import NguonCH_Export from './Function/NguonCH_Export';
import NguonCHTableView from './View/NguonCH_TableView';
import EditNguonCH from './Function/NguonCH_Update';
import AddNguonCH from './Function/NguonCH_Add';
import RemoveNguonCH from './Function/NguonCH_Delete';

const BangNguonCH = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['VTTphuong', 'PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02'], // Thêm role này có toàn quyền
    });

    // State phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_cap_nhat');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingNguonCH, setEditingNguonCH] = useState(null);
    const [addNguonCH, setAddNguonCH] = useState(false);
    const [deletingNguonCH, setDeletingNguonCH] = useState(null);

    // Gọi API lấy danh sách nguồn cơ hội bằng hàm tái sử dụng
    const fetchNguonCH = () => {
        fetchData({
            endpoint: '/opportunity-sources', // Corrected endpoint CRM API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
            apiType: 'crm'          // Chỉ định sử dụng API CRM
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchNguonCH();
    }, []);

    const handleEdit = (record) => {
        setEditingNguonCH(record.ma_nguon); // Use ma_nguon instead of ma_nguon_ch
    };

    const handleEditClose = () => {
        setEditingNguonCH(null);
        fetchNguonCH();
    };

    const handleAddSuccess = () => {
        setAddNguonCH(false);
        fetchNguonCH();
    };

    const handleRemove = (record) => {
        setDeletingNguonCH(record);
    };

    const sortedData = sortField
        ? sortTableData(data, sortField, sortOrder)
        : sortTableData(data, 'ngay_cap_nhat', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-nguon-ch-container">
            <AreaHeader
                title="Nguồn cơ hội"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddNguonCH(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <NguonCH_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchNguonCH(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <NguonCH_Export
                data={data}
                filteredData={data}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <NguonCHTableView
                data={sortedData}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                handleEdit={handleEdit}
                handleRemove={handleRemove}
                canEdit={canEdit}
                onSortChange={(field, order) => {
                    setSortField(field || null);
                    setSortOrder(order || null);
                    setCurrentPage(1);
                }}
                sortField={sortField}
                sortOrder={sortOrder}
            />

            <PaginationControl
                total={data.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
            />

            <Modal
                className="add_update-modal"
                open={!!editingNguonCH}
                onCancel={() => setEditingNguonCH(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditNguonCH
                    nguonCHId={editingNguonCH}
                    onCancel={() => setEditingNguonCH(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addNguonCH}
                onCancel={() => setAddNguonCH(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddNguonCH
                    visible={addNguonCH}
                    onCancel={() => setAddNguonCH(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingNguonCH && (
                <RemoveNguonCH
                    nguonCHId={deletingNguonCH.ma_nguon} // Use ma_nguon instead of ma_nguon_ch
                    onSuccess={() => {
                        setDeletingNguonCH(null);
                        fetchNguonCH();
                    }}
                    onCancel={() => setDeletingNguonCH(null)}
                />
            )}
        </div>
    );
};

export default BangNguonCH;