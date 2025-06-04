import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getNhapKhoColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "8%", sorter: (a, b) => (a.ma_hang || '').localeCompare(b.ma_hang || '') },
    { 
        title: 'Ngày nhập', 
        dataIndex: 'ngay_nhap_hang', 
        key: 'ngay_nhap_hang', 
        render: (text) => formatDate(text), 
        width: "8%",
        sorter: (a, b) => new Date(a.ngay_nhap_hang) - new Date(b.ngay_nhap_hang),
        defaultSortOrder: 'descend',
    },
    { title: 'Số lượng', dataIndex: 'so_luong_nhap', key: 'so_luong_nhap', width: "8%", sorter: (a, b) => (Number(a.so_luong_nhap) || 0) - (Number(b.so_luong_nhap) || 0) },
    { 
        title: 'Nhà cung cấp', 
        key: 'ten_nha_cung_cap', 
        width: "25%", 
        render: (_, record) => record.product?.suppliers?.ten_nha_cung_cap, 
        sorter: (a, b) => {
            const aName = a.product?.suppliers?.ten_nha_cung_cap || '';
            const bName = b.product?.suppliers?.ten_nha_cung_cap || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    { 
        title: 'Kho', 
        dataIndex: ['warehouse', 'ten_kho'], 
        key: 'ten_kho', 
        width: "10%", 
        sorter: (a, b) => {
            const aName = a.warehouse?.ten_kho || '';
            const bName = b.warehouse?.ten_kho || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    { title: 'Bill', dataIndex: 'ma_bill', key: 'ma_bill', width: "8%", sorter: (a, b) => (a.ma_bill || '').localeCompare(b.ma_bill || '') },
    { title: 'Hợp Đồng', dataIndex: 'ma_hop_dong', key: 'ma_hop_dong', width: "13%", sorter: (a, b) => (a.ma_hop_dong || '').localeCompare(b.ma_hop_dong || '') },
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
