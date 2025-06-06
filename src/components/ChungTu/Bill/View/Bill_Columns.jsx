import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getBillColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã bill', dataIndex: 'ma_bill', key: 'ma_bill', width: "8%", sorter: (a, b) => (a.ma_bill || '').localeCompare(b.ma_bill || '') },
    {
        title: 'Người cập nhật',
        dataIndex: ['accounts', 'ho_va_ten'],
        key: 'nguoi_cap_nhat',
        width: "8%",
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
        width: "8%",
        sorter: (a, b) => new Date(a.ngay_cap_nhat) - new Date(b.ngay_cap_nhat),
        defaultSortOrder: 'descend',
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "63%" },
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
