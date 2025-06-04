import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getDonHangColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Số đơn hàng', dataIndex: 'so_don_hang', key: 'so_don_hang', width: "10%", sorter: (a, b) => (a.so_don_hang || '').localeCompare(b.so_don_hang || '') },
    { title: 'Tổng giá trị đơn hàng', dataIndex: 'tong_gia_tri_don_hang', key: 'tong_gia_tri_don_hang', render: (value) => value?.toLocaleString('vi-VN'), width: "20%", sorter: (a, b) => (Number(a.tong_gia_tri_don_hang) || 0) - (Number(b.tong_gia_tri_don_hang) || 0) },
    { 
        title: 'Người lập đơn', 
        dataIndex: ['accounts', 'ho_va_ten'], 
        key: 'nguoi_lap_don', 
        width: "8%",
        sorter: (a, b) => {
            const aName = a.accounts?.ho_va_ten || '';
            const bName = b.accounts?.ho_va_ten || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    {
        title: 'Ngày tạo đơn',
        dataIndex: 'ngay_tao_don',
        key: 'ngay_tao_don',
        render: (text) => formatDate(text),
        width: "8%",
        sorter: (a, b) => new Date(a.ngay_tao_don) - new Date(b.ngay_tao_don),
        defaultSortOrder: 'descend',
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "41%" },
    {
        title: 'Hành động',
        key: 'hanh_dong',
        render: (_, record) => (
            <Space>
                <Button type="primary" size="small" disabled={!canEdit} onClick={() => handleEdit(record)}>Sửa</Button>
                <Button type="primary" danger size="small" disabled={!canEdit} onClick={() => handleRemove(record)}>Xóa</Button>
            </Space>
        ),
        width: "8%",
    },
];
