import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getKhachHangColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "3%" },
    { title: 'Mã khách hàng', dataIndex: 'ma_khach_hang', key: 'ma_khach_hang', width: "7%", sorter: (a, b) => (a.ma_khach_hang || '').localeCompare(b.ma_khach_hang || '') },
    { title: 'Tên khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang', width: "18%", sorter: (a, b) => (a.ten_khach_hang || '').localeCompare(b.ten_khach_hang || '') },
    { 
        title: 'Người phụ trách', 
        dataIndex: ['accounts', 'ho_va_ten'], 
        key: 'nguoi_phu_trach', 
        width: "8%", 
        sorter: (a, b) => {
            const aName = a.accounts?.ho_va_ten || '';
            const bName = b.accounts?.ho_va_ten || '';
            return aName.localeCompare(bName, 'vi');
        } 
    },
    { title: 'Mã số thuế', dataIndex: 'ma_so_thue', key: 'ma_so_thue', width: "4%" },
    { title: 'Địa chỉ cụ thể', dataIndex: 'dia_chi_cu_the', key: 'dia_chi_cu_the', width: "8%" },
    { title: 'Tỉnh thành', dataIndex: 'tinh_thanh', key: 'tinh_thanh', width: "5%", sorter: (a, b) => (a.tinh_thanh || '').localeCompare(b.tinh_thanh || '') },
    { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai', width: "5%" },
    { title: 'Email', dataIndex: 'email', key: 'email', width: "5%" },
    { title: 'Người liên hệ', dataIndex: 'nguoi_lien_he', key: 'nguoi_lien_he', width: "10%" },
    {
        title: 'Ngày thêm vào',
        dataIndex: 'ngay_them_vao',
        key: 'ngay_them_vao',
        render: (text) => formatDate(text),
        width: "5%",
        sorter: (a, b) => new Date(a.ngay_them_vao) - new Date(b.ngay_them_vao),
        defaultSortOrder: 'descend',
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
        width: "5%",
    },
    { title: 'Tổng nợ phải thu', dataIndex: 'tong_no_phai_thu', key: 'tong_no_phai_thu', render: (value) => value?.toLocaleString('vi-VN'), width: "7%", sorter: (a, b) => (Number(a.tong_no_phai_thu) || 0) - (Number(b.tong_no_phai_thu) || 0) },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "10%" },
];
