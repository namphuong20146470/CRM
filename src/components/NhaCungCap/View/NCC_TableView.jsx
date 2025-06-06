import React from 'react';
import { Table } from 'antd';
import { getNhaCungCapColumns } from './NCC_Columns';
import '../NCC_Main.css';

const NhaCungCapTableView = ({
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
    let columns = getNhaCungCapColumns(handleEdit, handleRemove, canEdit);

    // Gắn sortOrder cho đúng cột đang sort
    columns = columns.map(col =>
        col.key === sortField
            ? { ...col, sortOrder: sortOrder || undefined }
            : { ...col, sortOrder: undefined }
    );

    return (
        <div className="bang-nha-cung-cap-scroll-wrapper">
            <div style={{ width: 1800 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_nha_cung_cap"
                    bordered
                    size="small"
                    pagination={false}
                    className="custom-ant-table"
                    loading={loading}
                    onChange={(_, __, sorter) => {
                        if (sorter && sorter.columnKey && sorter.order) {
                            onSortChange && onSortChange(sorter.columnKey, sorter.order);
                        } else {
                            onSortChange && onSortChange('ngay_them_vao', 'descend');
                        }
                    }}
                    sortDirections={['descend', 'ascend']}
                />
            </div>
        </div>
    );
};

export default NhaCungCapTableView;
