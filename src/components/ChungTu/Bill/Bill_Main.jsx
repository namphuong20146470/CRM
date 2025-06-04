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
import './Bill_Main.css';
import Bill_Import from './Function/Bill_Import';
import Bill_Export from './Function/Bill_Export';
import BillTableView from './View/Bill_TableView';
import EditBill from './Function/Bill_Update';
import AddBill from './Function/Bill_Add';
import RemoveBill from './Function/Bill_Delete';

const BangBill = () => {
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
    const [editingBill, setEditingBill] = useState(null);
    const [addBill, setAddBill] = useState(false);
    const [deletingBill, setDeletingBill] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchBills = () => {
        fetchData({
            endpoint: '/bills', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchBills();
    }, []);

    const handleEdit = (record) => {
        setEditingBill(record.ma_bill);
    };

    const handleEditClose = () => {
        setEditingBill(null);
        fetchBills();
    };

    const handleAddSuccess = () => {
        setAddBill(false);
        fetchBills();
    };

    const handleRemove = (record) => {
        setDeletingBill(record);
    };

    const sortedData = sortField
        ? sortTableData(data, sortField, sortOrder)
        : sortTableData(data, 'ngay_cap_nhat', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-bill-container">
            <AreaHeader
                title="Bill"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddBill(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <Bill_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchBills(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <Bill_Export
                data={data}
                filteredData={data}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <BillTableView
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
                open={!!editingBill}
                onCancel={() => setEditingBill(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditBill
                    billId={editingBill}
                    onCancel={() => setEditingBill(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addBill}
                onCancel={() => setAddBill(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddBill
                    visible={addBill}
                    onCancel={() => setAddBill(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingBill && (
                <RemoveBill
                    billId={deletingBill.ma_bill}
                    onSuccess={() => {
                        setDeletingBill(null);
                        fetchBills();
                    }}
                    onCancel={() => setDeletingBill(null)}
                />
            )}
        </div>
    );
};

export default BangBill;