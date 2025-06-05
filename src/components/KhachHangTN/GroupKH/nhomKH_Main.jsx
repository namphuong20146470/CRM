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
import './nhomKH_Main.css';
import NhomKH_Import from './Function/nhomKH_Import';
import NhomKH_Export from './Function/nhomKH_Export';
import NhomKHTableView from './View/nhomKH_TableView';
import EditNhomKH from './Function/nhomKH_Update';
import AddNhomKH from './Function/nhomKH_Add';
import RemoveNhomKH from './Function/nhomKH_Delete';

const BangNhomKH = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['VTTphuong', 'PPcuong'], // Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02'], // Thêm role này có toàn quyền
    });

    // State phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_cap_nhat');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingNhomKH, setEditingNhomKH] = useState(null);
    const [addNhomKH, setAddNhomKH] = useState(false);
    const [deletingNhomKH, setDeletingNhomKH] = useState(null);

    // Gọi API lấy danh sách nhóm khách hàng bằng hàm tái sử dụng
    const fetchNhomKH = () => {
        fetchData({
            endpoint: '/customer-groups', // endpoint CRM API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
            apiType: 'crm'          // Chỉ định sử dụng API CRM
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchNhomKH();
    }, []);

    const handleEdit = (record) => {
        setEditingNhomKH(record.ma_nhom_khach_hang);
    };

    const handleEditClose = () => {
        setEditingNhomKH(null);
        fetchNhomKH();
    };

    const handleAddSuccess = () => {
        setAddNhomKH(false);
        fetchNhomKH();
    };

    const handleRemove = (record) => {
        setDeletingNhomKH(record);
    };

    const sortedData = sortField
        ? sortTableData(data, sortField, sortOrder)
        : sortTableData(data, 'ngay_cap_nhat', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-nhom-khach-hang-container">
            <AreaHeader
                title="Nhóm Khách Hàng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddNhomKH(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <NhomKH_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchNhomKH(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <NhomKH_Export
                data={data}
                filteredData={data}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <NhomKHTableView
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
                open={!!editingNhomKH}
                onCancel={() => setEditingNhomKH(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditNhomKH
                    nhomKHId={editingNhomKH}
                    onCancel={() => setEditingNhomKH(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addNhomKH}
                onCancel={() => setAddNhomKH(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddNhomKH
                    visible={addNhomKH}
                    onCancel={() => setAddNhomKH(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingNhomKH && (
                <RemoveNhomKH
                    nhomKHId={deletingNhomKH.ma_nhom_khach_hang}
                    nhomKHName={deletingNhomKH.nhom_khach_hang}
                    onSuccess={() => {
                        setDeletingNhomKH(null);
                        fetchNhomKH();
                    }}
                    onCancel={() => setDeletingNhomKH(null)}
                />
            )}
        </div>
    );
};

export default BangNhomKH;