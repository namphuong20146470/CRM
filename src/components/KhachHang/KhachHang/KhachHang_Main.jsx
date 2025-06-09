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
// Hàm reset các bộ lọc
import { resetFilters } from '../../utils/data/resetFilter';
// Header của mỗi bảng dữ liệu
import AreaHeader from '../../utils/jsx/AreaHeader';
import { sortTableData } from '../../utils/data/sortTable';
import { hasFullPermission } from '../../utils/auth/permissionUtils';

// Các tính năng
import './KhachHang_Main.css';
import KhachHang_Import from './Function/KhachHang_Import';
import KhachHang_Export from './Function/KhachHang_Export';
import KhachHangFilter from './Function/KhachHang_Filter';
import { filterKhachHang } from "./Function/KhachHang_FilterLogic";
import KhachHangTableView from './View/KhachHang_TableView';
import EditCustomer from './Function/KhachHang_Update';
import AddCustomer from './Function/KhachHang_Add';
import RemoveCustomer from './Function/KhachHang_Delete';

const BangKhachHang = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['DTLphuong', 'PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02', 'VT04'], // Thêm role này có toàn quyền
    });

    // State các bộ lọc và phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [accountFilter, setAccountFilter] = useState('all');
    const [provinceFilter, setProvinceFilter] = useState('all');
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_them_vao');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [addCustomer, setAddCustomer] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchCustomers = () => {
        fetchData({
            endpoint: '/customers', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleEdit = (record) => {
        setEditingCustomer(record.ma_khach_hang);
    };

    const handleEditClose = () => {
        setEditingCustomer(null);
        fetchCustomers();
    };

    const handleAddSuccess = () => {
        setAddCustomer(false);
        fetchCustomers();
    };

    const handleRemove = (record) => {
        setDeletingCustomer(record);
    };   

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setYearFilter, setAccountFilter, setProvinceFilter]);
        setCurrentPage(1);
        fetchCustomers();
        setSortField('ngay_them_vao');
        setSortOrder('descend');
    };

    const filteredData = filterKhachHang(data, {
        searchTerm,
        yearFilter,
        accountFilter,
        provinceFilter,
    });
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'ngay_them_vao', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-khach-hang-container">
            <AreaHeader
                title="Danh mục khách hàng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddCustomer(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <KhachHang_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchCustomers(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <KhachHang_Export
                data={sortedData}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <KhachHangFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                provinceFilter={provinceFilter}
                setProvinceFilter={setProvinceFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <KhachHangTableView
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
                total={filteredData.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
            />

            <Modal
                className="add_update-modal"
                open={!!editingCustomer}
                onCancel={() => setEditingCustomer(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditCustomer
                    customerId={editingCustomer}
                    onCancel={() => setEditingCustomer(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addCustomer}
                onCancel={() => setAddCustomer(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddCustomer
                    visible={addCustomer}
                    onCancel={() => setAddCustomer(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingCustomer && (
                <RemoveCustomer
                    customerId={deletingCustomer.ma_khach_hang}
                    customerName={deletingCustomer.ten_khach_hang}
                    onSuccess={() => {
                        setDeletingCustomer(null);
                        fetchCustomers();
                    }}
                    onCancel={() => setDeletingCustomer(null)}
                />
            )}
        </div>
    );
};

export default BangKhachHang;