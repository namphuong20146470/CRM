import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getKhachHangTNColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "3%" },
    { title: 'Mã KH', dataIndex: 'ma_khach_hang', key: 'ma_khach_hang', width: "8%", sorter: (a, b) => (a.ma_khach_hang || '').localeCompare(b.ma_khach_hang || '') },
    { title: 'Tên khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang', width: "12%", sorter: (a, b) => (a.ten_khach_hang || '').localeCompare(b.ten_khach_hang || '') },
    { 
        title: 'Nhóm khách hàng', 
        dataIndex: ['customer_group', 'nhom_khach_hang'], 
        key: 'nhom_khach_hang', 
        width: "10%", 
        sorter: (a, b) => {
            const aName = a.customer_group?.nhom_khach_hang || '';
            const bName = b.customer_group?.nhom_khach_hang || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    { 
        title: 'Nguồn cơ hội', 
        dataIndex: ['opportunity_source', 'nguon'], 
        key: 'nguon_co_hoi', 
        width: "10%", 
        sorter: (a, b) => {
            const aName = a.opportunity_source?.nguon || '';
            const bName = b.opportunity_source?.nguon || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "7%", 
        render: (status) => {
            let color = '';
            switch (status) {
                case 'Tiềm năng':
                    color = 'orange';
                    break;
                case 'Quan tâm':
                    color = 'blue';
                    break;
                case 'Đã chuyển đổi':
                    color = 'green';
                    break;
                case 'Đã hủy':
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
                        textAlign: 'center',
                        width: '100%'
                    }}
                >
                    {status || 'N/A'}
                </Tag>
            );
        },
        sorter: (a, b) => (a.trang_thai || '').localeCompare(b.trang_thai || '')
    },
    { title: 'SĐT', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai', width: "8%" },
    { title: 'Email', dataIndex: 'email', key: 'email', width: "10%" },
    { title: 'Địa chỉ', dataIndex: 'dia_chi', key: 'dia_chi', width: "12%" },
    {
        title: 'Ngày tạo',
        dataIndex: 'ngay_tao',
        key: 'ngay_tao',
        render: (text) => formatDate(text),
        width: "7%",
        sorter: (a, b) => new Date(a.ngay_tao) - new Date(b.ngay_tao),
        defaultSortOrder: 'descend',
    },
    { title: 'Doanh thu dự kiến', dataIndex: 'doanh_thu_du_kien', key: 'doanh_thu_du_kien', render: (value) => value?.toLocaleString('vi-VN'), width: "8%", sorter: (a, b) => (Number(a.doanh_thu_du_kien) || 0) - (Number(b.doanh_thu_du_kien) || 0) },
    { 
        title: 'Người phụ trách', 
        dataIndex: ['accounts', 'ho_va_ten'], 
        key: 'nguoi_phu_trach', 
        width: "10%", 
        sorter: (a, b) => {
            const aName = a.accounts?.ho_va_ten || '';
            const bName = b.accounts?.ho_va_ten || '';
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
        width: "7%",
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "10%" },
];