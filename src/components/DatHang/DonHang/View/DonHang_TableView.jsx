import React from 'react';
import { Table } from 'antd';
import { getDonHangColumns } from './DonHang_Columns';
import '../DonHang_Main.css';

const DonHangTableView = ({
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
}) => {
    // Lấy columns gốc
    let columns = getDonHangColumns(handleEdit, handleRemove, canEdit);

    // Gắn sortOrder cho đúng cột đang sort
    columns = columns.map(col =>
        col.key === sortField
            ? { ...col, sortOrder: sortOrder || undefined }
            : { ...col, sortOrder: undefined }
    );

    return (
        <Table
            columns={columns}
            dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            rowKey="so_don_hang"
            bordered
            size="small"
            pagination={false}
            className="custom-ant-table"
            loading={loading}
            onChange={(_, __, sorter) => {
                if (sorter && sorter.columnKey && sorter.order) {
                    onSortChange && onSortChange(sorter.columnKey, sorter.order);
                } else {
                    onSortChange && onSortChange('ngay_tao_don', 'descend');
                }
            }}
            sortDirections={['descend', 'ascend']}
        />
    );
};

export default DonHangTableView;
