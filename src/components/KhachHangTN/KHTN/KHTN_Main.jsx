// Thư viện React và Ant Design
import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

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
import './KHTN_Main.css';
import KhachHangTNImport from './Function/KHTN_Import';
import KhachHangTNExport from './Function/KHTN_Export';
import KhachHangTNTableView from './View/KHTN_TableView';
import EditKhachHangTN from './Function/KHTN_Update';
import AddKhachHangTN from './Function/KHTN_Add';
import RemoveKhachHangTN from './Function/KHTN_Delete';

const BangKhachHangTN = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const canEdit = hasFullPermission(undefined, {
        allowedUsernames: ['VTTphuong', 'PPcuong'], // Thêm user này có toàn quyền
        allowedRoles: ['VT01', 'VT02'], // Thêm role này có toàn quyền
    });
    
    // State các bộ lọc và phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [nhomKHFilter, setNhomKHFilter] = useState('all');
    const [nguonCHFilter, setNguonCHFilter] = useState('all');
    const [accountFilter, setAccountFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pageSize, setPageSize] = useState(1000); // Set to a very large number
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('ngay_tao');
    const [sortOrder, setSortOrder] = useState('descend');
    const [editingKhachHang, setEditingKhachHang] = useState(null);
    const [addKhachHang, setAddKhachHang] = useState(false);
    const [deletingKhachHang, setDeletingKhachHang] = useState(null);
    const [showAllRecords, setShowAllRecords] = useState(false);

    // Gọi API lấy danh sách khách hàng tiềm năng bằng hàm tái sử dụng
    const fetchKhachHangTN = () => {
        fetchData({
            endpoint: '/potential-customers', // endpoint CRM API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
            apiType: 'crm'          // Chỉ định sử dụng API CRM
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchKhachHangTN();
    }, []);

    const handleEdit = (record) => {
        setEditingKhachHang(record.ma_khach_hang);
    };

    const handleEditClose = () => {
        setEditingKhachHang(null);
        fetchKhachHangTN();
    };

    const handleAddSuccess = () => {
        setAddKhachHang(false);
        fetchKhachHangTN();
    };

    const handleRemove = (record) => {
        setDeletingKhachHang(record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setYearFilter, setAccountFilter, setStatusFilter, setNhomKHFilter, setNguonCHFilter]);
        setCurrentPage(1);
        fetchKhachHangTN();
        setSortField('ngay_tao');
        setSortOrder('descend');
    };

    // Temporary basic filter logic without the external component
    const filteredData = data.filter(item => {
        // Simple search logic
        const searchLower = searchTerm.toLowerCase();
        return searchTerm === '' || 
            (item.ma_khach_hang && item.ma_khach_hang.toLowerCase().includes(searchLower)) ||
            (item.ten_khach_hang && item.ten_khach_hang.toLowerCase().includes(searchLower));
    });
    
    const sortedData = sortField
        ? sortTableData(filteredData, sortField, sortOrder)
        : sortTableData(filteredData, 'ngay_tao', 'descend');

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-khach-hang-container">
            <AreaHeader
                title="Khách hàng tiềm năng"
                onImportClick={() => setShowImportModal(true)}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddKhachHang(true)} 
                disableImport={!canEdit}
                disableAdd={!canEdit}
            />

            <KhachHangTNImport
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchKhachHangTN(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <KhachHangTNExport
                data={data}
                filteredData={filteredData}
                sortedData={sortedData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            {/* Filter component removed */}

            <KhachHangTNTableView
                data={sortedData}
                currentPage={currentPage}
                pageSize={pageSize}
                showAllRecords={showAllRecords}
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
                open={!!editingKhachHang}
                onCancel={() => setEditingKhachHang(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditKhachHangTN
                    khachHangId={editingKhachHang}
                    onCancel={() => setEditingKhachHang(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                className="add_update-modal"
                open={addKhachHang}
                onCancel={() => setAddKhachHang(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddKhachHangTN
                    visible={addKhachHang}
                    onCancel={() => setAddKhachHang(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingKhachHang && (
                <RemoveKhachHangTN
                    khachHangId={deletingKhachHang.ma_khach_hang}
                    khachHangName={deletingKhachHang.ten_khach_hang}
                    onSuccess={() => {
                        setDeletingKhachHang(null);
                        fetchKhachHangTN();
                    }}
                    onCancel={() => setDeletingKhachHang(null)}
                />
            )}
        </div>
    );
};

export default BangKhachHangTN;