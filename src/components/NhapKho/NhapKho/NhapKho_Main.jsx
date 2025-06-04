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
import './NhapKho_Main.css';
import NhapKho_Import from './Function/NhapKho_Import';
import NhapKho_Export from './Function/NhapKho_Export';
import NhapKhoFilter from './Function/NhapKho_Filter';
import { filterNhapKho } from "./Function/NhapKho_FilterLogic";
import NhapKhoTableView from './View/NhapKho_TableView';
import EditStock_In from './Function/NhapKho_Update';
import AddStockIn from './Function/NhapKho_Add';
import RemoveStockIn from './Function/NhapKho_Delete';

const BangNhapKho = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02', 'VT03'], // Thêm role này có toàn quyền
    });

    // State các bộ lọc và phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [product_typeFilter, setProduct_TypeFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [warehouseFilter, setWarehouseFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_nhap_hang');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingStock_In, setEditingStock_In] = useState(null);
    const [addStockIn, setAddStockIn] = useState(false);
    const [deletingStockIn, setDeletingStockIn] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchStock_In = () => {
        fetchData({
            endpoint: '/stock-in', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchStock_In();
    }, []);

    const handleEdit = (record) => {
        setEditingStock_In(record.ma_stock_in);
    };

    const handleEditClose = () => {
        setEditingStock_In(null);
        fetchStock_In();
    };

    const handleAddSuccess = () => {
        setAddStockIn(false);
        fetchStock_In();
    };

    const handleRemove = (record) => {
        setDeletingStockIn(record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setProduct_TypeFilter, setSupplierFilter, setWarehouseFilter, setYearFilter]);
        setCurrentPage(1);
        fetchStock_In();
        setSortField('ngay_nhap_hang');
        setSortOrder('descend');
    };

    const filteredData = filterNhapKho(data, {
        searchTerm,
        product_typeFilter,
        supplierFilter,
        warehouseFilter,
        yearFilter,
    });
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'ngay_nhap_hang', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-nhap-kho-container">
            <AreaHeader
                title="Nhập Hàng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddStockIn(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <NhapKho_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchStock_In(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <NhapKho_Export
                data={data}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <NhapKhoFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                product_typeFilter={product_typeFilter}
                setProduct_TypeFilter={setProduct_TypeFilter}
                supplierFilter={supplierFilter}
                setSupplierFilter={setSupplierFilter}
                warehouseFilter={warehouseFilter}
                setWarehouseFilter={setWarehouseFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <NhapKhoTableView
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
                open={!!editingStock_In}
                onCancel={() => setEditingStock_In(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditStock_In
                    stock_inId={editingStock_In}
                    onCancel={() => setEditingStock_In(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addStockIn}
                onCancel={() => setAddStockIn(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddStockIn
                    visible={addStockIn}
                    onCancel={() => setAddStockIn(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingStockIn && (
                <RemoveStockIn
                    stock_inId={deletingStockIn.ma_stock_in}
                    stock_in={deletingStockIn.ma_stock_in}
                    onSuccess={() => {
                        setDeletingStockIn(null);
                        fetchStock_In();
                    }}
                    onCancel={() => setDeletingStockIn(null)}
                />
            )}
        </div>
    );
};

export default BangNhapKho;