import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getLoaiHangColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã loại hàng', dataIndex: 'ma_loai_hang', key: 'ma_loai_hang', width: "8%", sorter: (a, b) => (a.ma_loai_hang || '').localeCompare(b.ma_loai_hang || '') },
    { title: 'Tên loại hàng', dataIndex: 'ten_loai_hang', key: 'ten_loai_hang', width: "20%", sorter: (a, b) => (a.ten_loai_hang || '').localeCompare(b.ten_loai_hang || '') },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "8%",
        render: (status) => {
            let color = '';
            switch (status) {
                case 'Hoạt động':
                    color = 'blue';
                    break;
                case 'Dừng':
                    color = 'red';
                    break;
                default:
                    color = 'gray';
            }
            return (
                <Tag 
                    color={color} 
                    style={{ 
                        fontSize: '10px',
                        borderRadius: '6px', 
                        padding: '2px 4px', 
                        fontWeight: 'bold', 
                        display: 'inline-block', 
                        textAlign: 'center', // Căn giữa chữ trong Tag
                        width: '100%' // Đảm bảo Tag chiếm toàn bộ chiều rộng của ô
                    }}
                >
                    {status || 'N/A'}
                </Tag>
            );
        },
        sorter: (a, b) => (a.trang_thai || '').localeCompare(b.trang_thai || '')
    },
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
    { title: 'Mô tả', dataIndex: 'mo_ta', key: 'mo_ta', width: "35%" },
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
