import React from 'react';
import { Table } from 'antd';
import { getTonKhoColumns } from './TonKho_Columns';
import '../TonKho_Main.css';

const TonKhoTableView = ({
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
    let columns = getTonKhoColumns(handleEdit, handleRemove, canEdit);

    // Gắn sortOrder cho đúng cột đang sort
    columns = columns.map(col =>
        col.key === sortField
            ? { ...col, sortOrder: sortOrder || undefined }
            : { ...col, sortOrder: undefined }
    );

    // Hàm xác định lớp CSS cho từng dòng
    const getRowClassName = (record) => {
        if (record.ton_hien_tai > record.muc_ton_toi_thieu * 2.5) return 'row-du-ton-qua-muc';
        if (record.ton_hien_tai < record.muc_ton_toi_thieu) return 'row-thieu-ton';
        return 'row-binh-thuong';
    };

    return (
        <div className="bang-ton-kho-scroll-wrapper">
            <div style={{ width: 1440 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_inventory"
                    bordered
                    size="small"
                    pagination={false}
                    className="custom-ant-table"
                    loading={loading}
                    onChange={(_, __, sorter) => {
                        if (sorter && sorter.columnKey && sorter.order) {
                            onSortChange && onSortChange(sorter.columnKey, sorter.order);
                        } else {
                            onSortChange && onSortChange('nam', 'descend');
                        }
                    }}
                    sortDirections={['descend', 'ascend']}
                    rowClassName={getRowClassName} // Áp dụng lớp CSS cho từng dòng
                />
            </div>
        </div>
    );
};

export default TonKhoTableView;
