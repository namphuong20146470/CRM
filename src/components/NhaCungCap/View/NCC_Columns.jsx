import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../utils/format/formatDate';

export const getNhaCungCapColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "2%" },
    { title: 'Mã NCC', dataIndex: 'ma_nha_cung_cap', key: 'ma_nha_cung_cap', width: "4%", sorter: (a, b) => (a.ma_nha_cung_cap || '').localeCompare(b.ma_nha_cung_cap || '') },
    { title: 'Nhà cung cấp', dataIndex: 'ten_nha_cung_cap', key: 'ten_nha_cung_cap', width: "6%", sorter: (a, b) => (a.ten_nha_cung_cap || '').localeCompare(b.ten_nha_cung_cap || '') },
    { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai', width: "6%" },
    { title: 'Email', dataIndex: 'email', key: 'email', width: "8%" },
    { title: 'Địa chỉ', dataIndex: 'dia_chi', key: 'dia_chi', width: "18%" },
    { title: 'Quốc gia', dataIndex: 'quoc_gia', key: 'quoc_gia', width: "6%" },
    { title: 'Mã số thuế', dataIndex: 'ma_so_thue', key: 'ma_so_thue', width: "6%" },
    { title: 'Trang website', dataIndex: 'trang_website', key: 'trang_website', width: "8%" },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "6%",
        render: (status) => {
            let color = '';
            switch (status) {
                case 'Đang hợp tác':
                    color = 'blue';
                    break;
                case 'Ngừng hợp tác':
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
        title: 'Ngày thêm vào',
        dataIndex: 'ngay_them_vao',
        key: 'ngay_them_vao',
        render: (text) => formatDate(text),
        width: "6%",
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
        width: "6%",
    },
    { title: 'Tổng nợ phải trả', dataIndex: 'tong_no_phai_tra', key: 'tong_no_phai_tra', render: (value) => value?.toLocaleString('vi-VN'), width: "7%", sorter: (a, b) => (Number(a.tong_no_phai_tra) || 0) - (Number(b.tong_no_phai_tra) || 0) },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "10%" },
];
