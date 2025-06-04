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
import './CTDH_Main.css';
import ChiTietDonHang_Import from './Function/CTDH_Import';
import ChiTietDonHang_Export from './Function/CTDH_Export';
import ChiTietDonHangFilter from './Function/CTDH_Filter';
import { filterChiTietDonHang } from "./Function/CTDH_FilterLogic";
import ChiTietDonHangTableView from './View/CTDH_TableView';
import EditOrder_Detail from './Function/CTDH_Update';
import AddOrderDetail from './Function/CTDH_Add';
import RemoveOrderDetail from './Function/CTDH_Delete';

const BangChiTietDonHang = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['VTTphuong', 'PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02', 'VT03'], // Thêm role này có toàn quyền
    });

    // State các bộ lọc và phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [product_typeFilter, setProduct_TypeFilter] = useState('all');
    const [accountFilter, setAccountFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_dat_hang');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingOrder_Detail, setEditingOrder_Detail] = useState(null);
    const [addOrderDetail, setAddOrderDetail] = useState(false);
    const [deletingOrderDetail, setDeletingOrderDetail] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchOrder_Detail = () => {
        fetchData({
            endpoint: '/order-details', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchOrder_Detail();
    }, []);

    const handleEdit = (record) => {
        setEditingOrder_Detail(record.ma_chi_tiet_don_hang);
    };

    const handleEditClose = () => {
        setEditingOrder_Detail(null);
        fetchOrder_Detail();
    };

    const handleAddSuccess = () => {
        setAddOrderDetail(false);
        fetchOrder_Detail();
    };

    const handleRemove = (record) => {
        setDeletingOrderDetail(record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setProduct_TypeFilter, setAccountFilter, setYearFilter]);
        setCurrentPage(1);
        fetchOrder_Detail();
        setSortField('ngay_dat_hang');
        setSortOrder('descend');
    };

    const filteredData = filterChiTietDonHang(data, {
        searchTerm,
        product_typeFilter,
        accountFilter,
        yearFilter,
    });
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'ngay_dat_hang', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-chi-tiet-don-hang-container">
            <AreaHeader
                title="Chi Tiết Đơn Hàng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddOrderDetail(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <ChiTietDonHang_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchOrder_Detail(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <ChiTietDonHang_Export
                data={data}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <ChiTietDonHangFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                product_typeFilter={product_typeFilter}
                setProduct_TypeFilter={setProduct_TypeFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <ChiTietDonHangTableView
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
                open={!!editingOrder_Detail}
                onCancel={() => setEditingOrder_Detail(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditOrder_Detail
                    order_detailId={editingOrder_Detail}
                    onCancel={() => setEditingOrder_Detail(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addOrderDetail}
                onCancel={() => setAddOrderDetail(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddOrderDetail
                    visible={addOrderDetail}
                    onCancel={() => setAddOrderDetail(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingOrderDetail && (
                <RemoveOrderDetail
                    order_detailId={deletingOrderDetail.ma_chi_tiet_don_hang}
                    customerName={deletingOrderDetail.customers?.ten_khach_hang}
                    onSuccess={() => {
                        setDeletingOrderDetail(null);
                        fetchOrder_Detail();
                    }}
                    onCancel={() => setDeletingOrderDetail(null)}
                />
            )}
        </div>
    );
};

export default BangChiTietDonHang;