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
import './HopDong_Main.css';
import HopDong_Import from './Function/HopDong_Import';
import HopDong_Export from './Function/HopDong_Export';
import HopDongFilter from './Function/HopDong_Filter';
import { filterHopDong } from "./Function/HopDong_FilterLogic";
import HopDongTableView from './View/HopDong_TableView';
import EditContract from './Function/HopDong_Update';
import AddContract from './Function/HopDong_Add';
import RemoveContract from './Function/HopDong_Delete';

const BangHopDong = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['VTTphuong', 'PPcuong'] ,// Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02'], // Thêm role này có toàn quyền
    });
    
    // State các bộ lọc và phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [contract_typeFilter, setContract_TypeFilter] = useState('all');
    const [accountFilter, setAccountFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_ky_hop_dong');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingContract, setEditingContract] = useState(null);
    const [addContract, setAddContract] = useState(false);
    const [deletingContract, setDeletingContract] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchContracts = () => {
        fetchData({
            endpoint: '/contracts', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchContracts();
    }, []);

    const handleEdit = (record) => {
        setEditingContract(record.so_hop_dong);
    };

    const handleEditClose = () => {
        setEditingContract(null);
        fetchContracts();
    };

    const handleAddSuccess = () => {
        setAddContract(false);
        fetchContracts();
    };

    const handleRemove = (record) => {
        setDeletingContract(record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setYearFilter, setAccountFilter, setStatusFilter, setContract_TypeFilter]);
        setCurrentPage(1);
        fetchContracts();
        setSortField('ngay_ky_hop_dong');
        setSortOrder('descend');
    };

    const filteredData = filterHopDong(data, {
        searchTerm,
        yearFilter,
        contract_typeFilter,
        accountFilter,
        statusFilter,
    });
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'ngay_ky_hop_dong', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-hop-dong-container">
            <AreaHeader
                title="Danh mục hợp đồng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddContract(true)} 
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <HopDong_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchContracts(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <HopDong_Export
                data={data}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <HopDongFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                contract_typeFilter={contract_typeFilter}
                setContract_TypeFilter={setContract_TypeFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <HopDongTableView
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
                open={!!editingContract}
                onCancel={() => setEditingContract(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditContract
                    contractId={editingContract}
                    onCancel={() => setEditingContract(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addContract}
                onCancel={() => setAddContract(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddContract
                    visible={addContract}
                    onCancel={() => setAddContract(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingContract && (
                <RemoveContract
                    contractId={deletingContract.so_hop_dong}
                    onSuccess={() => {
                        setDeletingContract(null);
                        fetchContracts();
                    }}
                    onCancel={() => setDeletingContract(null)}
                />
            )}
        </div>
    );
};

export default BangHopDong;