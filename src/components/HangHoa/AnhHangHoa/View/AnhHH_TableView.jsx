import React from 'react';
import { Table } from 'antd';
import { getLoaiHopDongColumns } from './AnhHH_Columns';
import '../LoaiHopDong_Main.css';

const LoaiHopDongTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getLoaiHopDongColumns(handleEdit, handleRemove);

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
        />
    );
};

export default LoaiHopDongTableView;
