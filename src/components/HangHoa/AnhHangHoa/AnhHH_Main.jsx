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
// Hàm xử lý Import / Export
import { handleGenericImport } from '../../utils/data/dataHandler';
// Header của mỗi bảng dữ liệu
import AreaHeader from '../../utils/jsx/AreaHeader';

// Các tính năng
import './LoaiHopDong_Main.css';
import LoaiHopDong_Import from './Function/AnhHH_Import';
import LoaiHopDong_Export from './Function/AnhHH_Export';
import LoaiHopDongTableView from './View/AnhHH_TableView';
import EditContractType from './Function/AnhHH_Update';
import AddContractType from './Function/AnhHH_Add';
import RemoveContractType from './Function/AnhHH_Delete';

const BangLoaiHopDong = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // State phân trang
    const [showExportModal, setShowExportModal] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingContractType, setEditingContractType] = useState(null);
    const [addContractType, setAddContractType] = useState(false);
    const [deletingContractType, setDeletingContractType] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchContractTypes = () => {
        fetchData({
            endpoint: '/contract-types', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchContractTypes();
    }, []);

    const handleImport = (importedData) => {
        // Dùng hàm tái sử dụng để tự sinh STT và nối vào data cũ
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingContractType(record.ma_loai_hop_dong);
    };

    const handleEditClose = () => {
        setEditingContractType(null);
        fetchContractTypes();
    };

    const handleAddSuccess = () => {
        setAddContractType(false);
        fetchContractTypes();
    };

    const handleRemove = (record) => {
        setDeletingContractType(record);
    }; 

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-loai-hop-dong-container">
            <AreaHeader
                title="Loại Hợp Đồng"
                onImportClick={() => document.getElementById('import-excel').click()}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddContractType(true)}
                ImportComponent={<LoaiHopDong_Import onImport={handleImport} />}
            />

            <LoaiHopDong_Export
                data={data}
                filteredData={data}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <LoaiHopDongTableView
                data={data}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                handleEdit={handleEdit}
                handleRemove={handleRemove}
            />

            <PaginationControl
                total={data.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
            />

            <Modal
                open={!!editingContractType}
                onCancel={() => setEditingContractType(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditContractType
                    contract_typeId={editingContractType}
                    onCancel={() => setEditingContractType(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                open={addContractType}
                onCancel={() => setAddContractType(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddContractType
                    visible={addContractType}
                    onCancel={() => setAddContractType(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingContractType && (
                <RemoveContractType
                    contract_typeId={deletingContractType.ma_loai_hop_dong}
                    contract_typeName={deletingContractType.ten_loai_hop_dong}
                    onSuccess={() => {
                        setDeletingContractType(null);
                        fetchContractTypes();
                    }}
                    onCancel={() => setDeletingContractType(null)}
                />
            )}
        </div>
    );
};

export default BangLoaiHopDong;