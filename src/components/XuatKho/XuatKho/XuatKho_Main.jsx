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
import './XuatKho_Main.css';
import XuatKho_Import from './Function/XuatKho_Import';
import XuatKho_Export from './Function/XuatKho_Export';
import XuatKhoFilter from './Function/XuatKho_Filter';
import { filterXuatKho } from "./Function/XuatKho_FilterLogic";
import XuatKhoTableView from './View/XuatKho_TableView';
import EditStock_Out from './Function/XuatKho_Update';
import AddStockOut from './Function/XuatKho_Add';
import RemoveStockOut from './Function/XuatKho_Delete';

const BangXuatKho = () => {
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
    const [accountFilter, setAccountFilter] = useState('all');
    const [warehouseFilter, setWarehouseFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_xuat_hang');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingStock_Out, setEditingStock_Out] = useState(null);
    const [addStockOut, setAddStockOut] = useState(false);
    const [deletingStockOut, setDeletingStockOut] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchStock_Out = () => {
        fetchData({
            endpoint: '/stock-out', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchStock_Out();
    }, []);

    const handleEdit = (record) => {
        setEditingStock_Out(record.ma_stock_out);
    };

    const handleEditClose = () => {
        setEditingStock_Out(null);
        fetchStock_Out();
    };

    const handleAddSuccess = () => {
        setAddStockOut(false);
        fetchStock_Out();
    };

    const handleRemove = (record) => {
        setDeletingStockOut(record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setProduct_TypeFilter, setAccountFilter, setWarehouseFilter, setYearFilter]);
        setCurrentPage(1);
        fetchStock_Out();
        setSortField('ngay_xuat_hang');
        setSortOrder('descend');
    };

    const filteredData = filterXuatKho(data, {
        searchTerm,
        product_typeFilter,
        accountFilter,
        warehouseFilter,
        yearFilter,
    });
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'ngay_xuat_hang', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-xuat-kho-container">
            <AreaHeader
                title="Xuất Hàng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddStockOut(true)}
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <XuatKho_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchStock_Out(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <XuatKho_Export
                data={data}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <XuatKhoFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                product_typeFilter={product_typeFilter}
                setProduct_TypeFilter={setProduct_TypeFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                warehouseFilter={warehouseFilter}
                setWarehouseFilter={setWarehouseFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <XuatKhoTableView
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
                open={!!editingStock_Out}
                onCancel={() => setEditingStock_Out(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditStock_Out
                    stock_outId={editingStock_Out}
                    onCancel={() => setEditingStock_Out(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addStockOut}
                onCancel={() => setAddStockOut(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddStockOut
                    visible={addStockOut}
                    onCancel={() => setAddStockOut(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingStockOut && (
                <RemoveStockOut
                    stock_outId={deletingStockOut.ma_stock_out}
                    stock_out={deletingStockOut.ma_stock_out}
                    onSuccess={() => {
                        setDeletingStockOut(null);
                        fetchStock_Out();
                    }}
                    onCancel={() => setDeletingStockOut(null)}
                />
            )}
        </div>
    );
};

export default BangXuatKho;