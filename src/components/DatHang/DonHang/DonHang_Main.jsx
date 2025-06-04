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
import './DonHang_Main.css';
import DonHang_Import from './Function/DonHang_Import';
import DonHang_Export from './Function/DonHang_Export';
import DonHangTableView from './View/DonHang_TableView';
import EditOrder from './Function/DonHang_Update';
import AddOrder from './Function/DonHang_Add';
import RemoveOrder from './Function/DonHang_Delete';

const BangDonHang = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['VTTphuong', 'PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02', 'VT03'], // Thêm role này có toàn quyền
    });

    // State phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_tao_don');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingOrder, setEditingOrder] = useState(null);
    const [addOrder, setAddOrder] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchOrders = () => {
        fetchData({
            endpoint: '/orders', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    const handleEdit = (record) => {
        setEditingOrder(record.so_don_hang);
    };

    const handleEditClose = () => {
        setEditingOrder(null);
        fetchOrders();
    };

    const handleAddSuccess = () => {
        setAddOrder(false);
        fetchOrders();
    };

    const handleRemove = (record) => {
        setDeletingOrder(record);
    };

    const sortedData = sortField
        ? sortTableData(data, sortField, sortOrder)
        : sortTableData(data, 'ngay_tao_don', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-don-hang-container">
            <AreaHeader
                title="Đơn Hàng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddOrder(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <DonHang_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchOrders(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <DonHang_Export
                data={data}
                filteredData={data}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <DonHangTableView
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
                open={!!editingOrder}
                onCancel={() => setEditingOrder(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditOrder
                    orderId={editingOrder}
                    onCancel={() => setEditingOrder(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addOrder}
                onCancel={() => setAddOrder(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddOrder
                    visible={addOrder}
                    onCancel={() => setAddOrder(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingOrder && (
                <RemoveOrder
                    orderId={deletingOrder.so_don_hang}
                    onSuccess={() => {
                        setDeletingOrder(null);
                        fetchOrders();
                    }}
                    onCancel={() => setDeletingOrder(null)}
                />
            )}
        </div>
    );
};

export default BangDonHang;