import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getLoaiHopDongColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã loại hợp đồng', dataIndex: 'ma_loai_hop_dong', key: 'ma_loai_hop_dong', width: "10%" },
    { title: 'Tên loại hợp đồng', dataIndex: 'ten_loai_hop_dong', key: 'ten_loai_hop_dong', width: "20%" },
    { title: 'Tình trạng', dataIndex: 'tinh_trang', key: 'tinh_trang', width: "8%" },
    { title: 'Người cập nhật', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_cap_nhat', width: "8%" },
    {
        title: 'Ngày cập nhật',
        dataIndex: 'ngay_cap_nhat',
        key: 'ngay_cap_nhat',
        render: (text) => formatDate(text),
        width: "8%",
    },
    { title: 'Mô tả', dataIndex: 'mo_ta', key: 'mo_ta', width: "33%" },
    {
        title: 'Hành động',
        key: 'hanh_dong',
        render: (_, record) => (
            <Space>
                <Button type="primary" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>Xóa</Button>
            </Space>
        ),
        width: "8%",
    },
];
