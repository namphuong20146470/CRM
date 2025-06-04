import React from 'react';
import { Table } from 'antd';
import { getKhachHangColumns } from './KhachHang_Columns';
import '../KhachHang_Main.css';

const KhachHangTableView = ({
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
    let columns = getKhachHangColumns(handleEdit, handleRemove, canEdit);

    // Gắn sortOrder cho đúng cột đang sort
    columns = columns.map(col =>
        col.key === sortField
            ? { ...col, sortOrder: sortOrder || undefined }
            : { ...col, sortOrder: undefined }
    );

    return (
        <div className="bang-khach-hang-scroll-wrapper">
            <div style={{ width: 2050 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
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
                            onSortChange && onSortChange('ngay_them_vao', 'descend');
                        }
                    }}
                    sortDirections={['descend', 'ascend']}
                />
            </div>
        </div>
    );
};

export default KhachHangTableView;
