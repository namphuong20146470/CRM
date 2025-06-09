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
import './LoaiHang_Main.css';
import LoaiHang_Import from './Function/LoaiHang_Import';
import LoaiHang_Export from './Function/LoaiHang_Export';
import LoaiHangTableView from './View/LoaiHang_TableView';
import EditProductType from './Function/LoaiHang_Update';
import AddProductType from './Function/LoaiHang_Add';
import RemoveProductType from './Function/LoaiHang_Delete';

const BangLoaiHang = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['NTnhan', 'THtham', 'DTLphuong', 'PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02', 'VT03'], // Thêm role này có toàn quyền
    });

    // State phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_cap_nhat');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingProductType, setEditingProductType] = useState(null);
    const [addProductType, setAddProductType] = useState(false);
    const [deletingProductType, setDeletingProductType] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchProductTypes = () => {
        fetchData({
            endpoint: '/product-types', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchProductTypes();
    }, []);

    const handleEdit = (record) => {
        setEditingProductType(record.ma_loai_hang);
    };

    const handleEditClose = () => {
        setEditingProductType(null);
        fetchProductTypes();
    };

    const handleAddSuccess = () => {
        setAddProductType(false);
        fetchProductTypes();
    };

    const handleRemove = (record) => {
        setDeletingProductType(record);
    };

    const sortedData = sortField
        ? sortTableData(data, sortField, sortOrder)
        : sortTableData(data, 'ngay_cap_nhat', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-loai-hang-container">
            <AreaHeader
                title="Loại Hàng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddProductType(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <LoaiHang_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchProductTypes(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <LoaiHang_Export
                data={data}
                filteredData={data}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <LoaiHangTableView
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
                open={!!editingProductType}
                onCancel={() => setEditingProductType(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditProductType
                    product_typeId={editingProductType}
                    onCancel={() => setEditingProductType(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addProductType}
                onCancel={() => setAddProductType(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddProductType
                    visible={addProductType}
                    onCancel={() => setAddProductType(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingProductType && (
                <RemoveProductType
                    product_typeId={deletingProductType.ma_loai_hang}
                    product_typeName={deletingProductType.ma_loai_hang}
                    onSuccess={() => {
                        setDeletingProductType(null);
                        fetchProductTypes();
                    }}
                    onCancel={() => setDeletingProductType(null)}
                />
            )}
        </div>
    );
};

export default BangLoaiHang;