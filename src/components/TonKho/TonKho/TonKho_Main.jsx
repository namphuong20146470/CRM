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
import './TonKho_Main.css';
import TonKho_Import from './Function/TonKho_Import';
import TonKho_Export from './Function/TonKho_Export';
import TonKhoFilter from './Function/TonKho_Filter';
import { filterTonKho } from "./Function/TonKho_FilterLogic";
import TonKhoTableView from './View/TonKho_TableView';
import EditStock_In from './Function/TonKho_Update';
import TonKho_UpdateAuto from './Function/TonKho_UpdateAuto';

const BangTonKho = () => {
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
    const [product_typeFilter, setProductTypeFilter] = useState('all');
    const [warehouseFilter, setWarehouseFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [multiplierFilter, setMultiplierFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('nam');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingStock_In, setEditingStock_In] = useState(null);
    const [showUpdateInventoryModal, setShowUpdateInventoryModal] = useState(false);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchInventory = () => {
        fetchData({
        endpoint: '/inventory',
        setData: (rawData) => {
            const dataWithSTT = rawData.map((item, index) => ({
                ...item,
                stt: item.stt || index + 1, // Sử dụng `stt` từ API hoặc tự động gán nếu không có
            }));
            setData(dataWithSTT);
        },
        setLoading,
    });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchInventory();
    }, []);

    const handleEdit = (record) => {
        setEditingStock_In(record.ma_stock_in);
    };

    const handleEditClose = () => {
        setEditingStock_In(null);
        fetchInventory();
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setProductTypeFilter, setWarehouseFilter, setYearFilter, setMultiplierFilter, setStatusFilter]);
        setCurrentPage(1);
        fetchInventory();
        setSortField('nam');
        setSortOrder('descend');
    };

    const filteredData = filterTonKho(data, {
        searchTerm,
        product_typeFilter,
        warehouseFilter,
        yearFilter,
        multiplierFilter,
        statusFilter,
    });
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'nam', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-ton-kho-container">
            <AreaHeader
                title="Tồn Kho"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onGetdataClick={() => setShowUpdateInventoryModal(true)} // thêm dòng này
                hideAddButton={true} // ẩn "Thêm mới"
                disableGetdata={!canEdit}
            />

            <TonKho_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchInventory(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <TonKho_UpdateAuto
                visible={showUpdateInventoryModal}
                onClose={() => setShowUpdateInventoryModal(false)}
                onRefresh={fetchInventory}
            />

            <TonKho_Export
                data={data}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <TonKhoFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                product_typeFilter={product_typeFilter}
                setProductTypeFilter={setProductTypeFilter}
                warehouseFilter={warehouseFilter}
                setWarehouseFilter={setWarehouseFilter}
                multiplierFilter={multiplierFilter}
                setMultiplierFilter={setMultiplierFilter}
                statusFilter={statusFilter} // Truyền state vào bộ lọc
                setStatusFilter={setStatusFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <TonKhoTableView
                data={sortedData}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                handleEdit={handleEdit}
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
        </div>
    );
};

export default BangTonKho;