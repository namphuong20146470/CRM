import React from 'react';
import { Table, Switch } from 'antd';
import { getKhachHangTNColumns } from './KHTN_Columns';
import '../KHTN_Main.css';

const KhachHangTNTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove,
    canEdit,
    onSortChange,
    sortField,
    sortOrder,
    showAllRecords = false, // New prop to control whether to show all records
}) => {
    // Lấy columns gốc
    let columns = getKhachHangTNColumns(handleEdit, handleRemove, canEdit);

    // Gắn sortOrder cho đúng cột đang sort
    columns = columns.map(col =>
        col.key === sortField
            ? { ...col, sortOrder: sortOrder || undefined }
            : { ...col, sortOrder: undefined }
    );

    // If showAllRecords is true, display all data; otherwise, use pagination
    const displayData = showAllRecords 
        ? data 
        : data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="bang-khach-hang-scroll-wrapper">
            <div style={{ width: 2000 }}>
                <Table
                    columns={columns}
                    dataSource={displayData}
                    rowKey="ma_khach_hang"
                    bordered
                    size="small"
                    pagination={false}
                    className="custom-ant-table"
                    loading={loading}
                    onChange={(_, __, sorter) => {
                        if (sorter && sorter.columnKey && sorter.order) {
                            onSortChange && onSortChange(sorter.columnKey, sorter.order);
                        } else {
                            onSortChange && onSortChange('ngay_tao', 'descend');
                        }
                    }}
                    sortDirections={['descend', 'ascend']}
                />
            </div>
        </div>
    );
};

export default KhachHangTNTableView;