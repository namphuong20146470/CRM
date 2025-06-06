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
import './HangHoa_Main.css';
import HangHoa_Import from './Function/import/HangHoa_Import';
import HangHoa_Export from './Function/HangHoa_Export';
import HangHoaFilter from './Function/HangHoa_Filter';
import { filterHangHoa } from "./Function/HangHoa_FilterLogic";
import HangHoaTableView from './View/HangHoa_TableView';
import EditProduct from './Function/HangHoa_Update';
import AddProduct from './Function/HangHoa_Add';
import RemoveProduct from './Function/HangHoa_Delete';

const BangHangHoa = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['NTnhan', 'THtham', 'DTLphuong', 'PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02', 'VT03'], // Thêm role này có toàn quyền
    });

    // State các bộ lọc và phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [pricelistSearch, setPricelistSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_cap_nhat');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingProduct, setEditingProduct] = useState(null);
    const [addProduct, setAddProduct] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchProducts = () => {
        fetchData({
            endpoint: '/products', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEdit = (record) => {
        setEditingProduct({ ma_hang: record.ma_hang, stt: record.stt });
    };

    const handleEditClose = () => {
        setEditingProduct(null);
        fetchProducts();
    };

    const handleAddSuccess = () => {
        setAddProduct(false);
        fetchProducts();
    };

    const handleRemove = (record) => {
        setDeletingProduct({
            ma_hang: record.ma_hang,
            ten_hang: record.ten_hang,
            ngay_cap_nhat: record.ngay_cap_nhat, // Đảm bảo trường này được gán
        });
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setPricelistSearch('');
        resetFilters([setStatusFilter, setCountryFilter, setSupplierFilter]);
        setCurrentPage(1);
        fetchProducts();
        setSortField('ngay_cap_nhat');
        setSortOrder('descend');
    };

    const filteredData = filterHangHoa(data, {
        searchTerm,
        pricelistSearch,
        statusFilter,
        countryFilter,
        supplierFilter,
    });
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'ngay_cap_nhat', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-hang-hoa-container">
            <AreaHeader
                title="Danh mục Hàng hóa"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddProduct(true)} 
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <HangHoa_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchProducts(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <HangHoa_Export
                data={data}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <HangHoaFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                pricelistSearch={pricelistSearch}
                setPricelistSearch={setPricelistSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                countryFilter={countryFilter}
                setCountryFilter={setCountryFilter}
                supplierFilter={supplierFilter}
                setSupplierFilter={setSupplierFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <HangHoaTableView
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
                open={!!editingProduct}
                onCancel={() => setEditingProduct(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
            {editingProduct && (
                <EditProduct
                    productId={editingProduct.ma_hang}
                    stt={editingProduct.stt}
                    onCancel={() => setEditingProduct(null)}
                    onSuccess={handleEditClose}
                />
            )}
            </Modal>

            <Modal
                className="add_update-modal"
                open={addProduct}
                onCancel={() => setAddProduct(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddProduct
                    visible={addProduct}
                    onCancel={() => setAddProduct(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingProduct && (
                <RemoveProduct
                    productId={deletingProduct.ma_hang}
                    productName={deletingProduct.ten_hang}
                    updatedAt={deletingProduct.ngay_cap_nhat} // Đổi từ updated_at thành updatedAt
                    onSuccess={() => {
                        setDeletingProduct(null);
                        fetchProducts();
                    }}
                    onCancel={() => setDeletingProduct(null)}
                />
            )}
        </div>
    );
};

export default BangHangHoa;