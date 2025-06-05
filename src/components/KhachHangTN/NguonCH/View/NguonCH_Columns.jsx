import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getNguonCHColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã nguồn', dataIndex: 'ma_nguon', key: 'ma_nguon', width: "10%", sorter: (a, b) => (a.ma_nguon || '').localeCompare(b.ma_nguon || '') },
    { title: 'Tên nguồn', dataIndex: 'nguon', key: 'nguon', width: "15%", sorter: (a, b) => (a.nguon || '').localeCompare(b.nguon || '') },
    {
        title: 'Người cập nhật',
        dataIndex: ['accounts', 'ho_va_ten'],
        key: 'nguoi_cap_nhat',
        width: "15%",
        sorter: (a, b) => {
            const aName = a.accounts?.ho_va_ten || '';
            const bName = b.accounts?.ho_va_ten || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    {
        title: 'Ngày cập nhật',
        dataIndex: 'ngay_cap_nhat',
        key: 'ngay_cap_nhat',
        render: (text) => formatDate(text),
        width: "15%",
        sorter: (a, b) => new Date(a.ngay_cap_nhat) - new Date(b.ngay_cap_nhat),
        defaultSortOrder: 'descend',
    },
    // { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "30%" },
    {
        title: 'Hành động',
        key: 'hanh_dong',
        render: (_, record) => (
            <Space>
                <Button type="primary" size="small" disabled={!canEdit} onClick={() => handleEdit(record)}>Sửa</Button>
                <Button type="primary" danger size="small" disabled={!canEdit} onClick={() => handleRemove(record)}>Xóa</Button>
            </Space>
        ),
        width: "10%",
    },
];