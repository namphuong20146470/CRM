import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getXuatKhoColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "8%", sorter: (a, b) => (a.ma_hang || '').localeCompare(b.ma_hang || '') },
    { 
        title: 'Ngày xuất', 
        dataIndex: 'ngay_xuat_hang', 
        key: 'ngay_xuat_hang', 
        render: (text) => formatDate(text), 
        width: "8%",
        sorter: (a, b) => new Date(a.ngay_xuat_hang) - new Date(b.ngay_xuat_hang),
        defaultSortOrder: 'descend',
    },
    { title: 'Số lượng', dataIndex: 'so_luong_xuat', key: 'so_luong_xuat', width: "8%", sorter: (a, b) => (Number(a.so_luong_xuat) || 0) - (Number(b.so_luong_xuat) || 0) },
    { 
        title: 'Người phụ trách', 
        dataIndex: ['accounts', 'ho_va_ten'], 
        key: 'nguoi_phu_trach', 
        width: "15%",
        sorter: (a, b) => {
            const aName = a.accounts?.ho_va_ten || '';
            const bName = b.accounts?.ho_va_ten || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    { 
        title: 'Kho', 
        dataIndex: ['warehouse', 'ten_kho'], 
        key: 'ten_kho', 
        width: "15%",
        sorter: (a, b) => {
            const aName = a.warehouse?.ten_kho || '';
            const bName = b.warehouse?.ten_kho || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    { 
        title: 'Khách hàng', 
        dataIndex: ['customers', 'ten_khach_hang'], 
        key: 'ten_khach_hang', 
        width: "33%",
        sorter: (a, b) => {
            const aName = a.customers?.ten_khach_hang || '';
            const bName = b.customers?.ten_khach_hang || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
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
