import React from 'react';
import { Table } from 'antd';
import { getNhapKhoColumns } from './NhapKho_Columns';
import '../NhapKho_Main.css';

const NhapKhoTableView = ({
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
    let columns = getNhapKhoColumns(handleEdit, handleRemove, canEdit);

    // Gắn sortOrder cho đúng cột đang sort
    columns = columns.map(col =>
        col.key === sortField
            ? { ...col, sortOrder: sortOrder || undefined }
            : { ...col, sortOrder: undefined }
    );

    return (
        <div className="bang-nhap-kho-scroll-wrapper">
            <div style={{ width: 1440 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_stock-in"
                    bordered
                    size="small"
                    pagination={false}
                    className="custom-ant-table"
                    loading={loading}
                    onChange={(_, __, sorter) => {
                        if (sorter && sorter.columnKey && sorter.order) {
                            onSortChange && onSortChange(sorter.columnKey, sorter.order);
                        } else {
                            onSortChange && onSortChange('ngay_nhap_hang', 'descend');
                        }
                    }}
                    sortDirections={['descend', 'ascend']}
                />
            </div>
        </div>
    );
};

export default NhapKhoTableView;
