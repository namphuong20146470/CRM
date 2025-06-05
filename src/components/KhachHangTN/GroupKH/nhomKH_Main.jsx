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
// import '../nhomKH_Main.css';
import LoaiHopDong_Import from './Function/nhomKH_Import';
import LoaiHopDong_Export from './Function/nhomKH_Export';
import LoaiHopDongTableView from './View/nhomKH_TableView';
import EditContractType from './Function/nhomKH_Update';
import AddContractType from './Function/nhomKH_Add';
import RemoveContractType from './Function/nhomKH_Delete';

const BangLoaiHopDong = () => {
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
    const [editingContractType, setEditingContractType] = useState(null);
    const [addContractType, setAddContractType] = useState(false);
    const [deletingContractType, setDeletingContractType] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchContractTypes = () => {
        fetchData({
            endpoint: '/contract-types', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchContractTypes();
    }, []);

    const handleEdit = (record) => {
        setEditingContractType(record.ma_loai_hop_dong);
    };

    const handleEditClose = () => {
        setEditingContractType(null);
        fetchContractTypes();
    };

    const handleAddSuccess = () => {
        setAddContractType(false);
        fetchContractTypes();
    };

    const handleRemove = (record) => {
        setDeletingContractType(record);
    };

    const sortedData = sortField
        ? sortTableData(data, sortField, sortOrder)
        : sortTableData(data, 'ngay_cap_nhat', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-loai-hop-dong-container">
            <AreaHeader
                title="Loại Hợp Đồng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddContractType(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <LoaiHopDong_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchContractTypes(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <LoaiHopDong_Export
                data={data}
                filteredData={data}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <LoaiHopDongTableView
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
                open={!!editingContractType}
                onCancel={() => setEditingContractType(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditContractType
                    contract_typeId={editingContractType}
                    onCancel={() => setEditingContractType(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addContractType}
                onCancel={() => setAddContractType(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddContractType
                    visible={addContractType}
                    onCancel={() => setAddContractType(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingContractType && (
                <RemoveContractType
                    contract_typeId={deletingContractType.ma_loai_hop_dong}
                    contract_typeName={deletingContractType.ten_loai_hop_dong}
                    onSuccess={() => {
                        setDeletingContractType(null);
                        fetchContractTypes();
                    }}
                    onCancel={() => setDeletingContractType(null)}
                />
            )}
        </div>
    );
};

export default BangLoaiHopDong;