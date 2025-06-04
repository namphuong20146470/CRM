import React from 'react';
import { Table } from 'antd';
import { getLoaiHopDongColumns } from './LoaiHopDong_Columns';
import '../LoaiHopDong_Main.css';

const LoaiHopDongTableView = ({
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
    let columns = getLoaiHopDongColumns(handleEdit, handleRemove, canEdit);

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
            rowKey="ma_loai_hop_dong"
            bordered
            size="small"
            pagination={false}
            className="custom-ant-table"
            loading={loading}
            onChange={(_, __, sorter) => {
                if (sorter && sorter.columnKey && sorter.order) {
                    onSortChange && onSortChange(sorter.columnKey, sorter.order);
                } else {
                    onSortChange && onSortChange('ngay_cap_nhat', 'descend');
                }
            }}
            sortDirections={['descend', 'ascend']}
        />
    );
};

export default LoaiHopDongTableView;
