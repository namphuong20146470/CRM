import { Button, Space, Tag } from 'antd';

export const getTonKhoColumns = (handleEdit, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "10%", sorter: (a, b) => (a.ma_hang || '').localeCompare(b.ma_hang || '') },
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
        title: 'Trạng thái',
        key: 'trang_thai',
        render: (_, record) => {
            let color = '';
            let text = '';

            if (record.ton_hien_tai > record.muc_ton_toi_thieu * 2.5) {
                color = 'orange';
                text = 'Dư hàng tồn quá nhiều';
            } else if (record.ton_hien_tai < record.muc_ton_toi_thieu) {
                color = 'red';
                text = 'Thiếu hàng';
            } else {
                color = 'green';
                text = 'Hàng ổn định';
            }

            return (
                <Tag
                    color={color}
                    style={{
                        fontSize: '12px',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        textAlign: 'center',
                        width: '100%', // Đảm bảo Tag chiếm toàn bộ chiều rộng của ô
                    }}
                >
                    {text}
                </Tag>
            );
        },
        width: "10%",
    },
    { title: 'Tồn trước đó', dataIndex: 'ton_truoc_do', key: 'ton_truoc_do', width: "10%", sorter: (a, b) => (Number(a.ton_truoc_do) || 0) - (Number(b.ton_truoc_do) || 0) },
    { title: 'Tổng nhập', dataIndex: 'tong_nhap', key: 'tong_nhap', width: "10%", sorter: (a, b) => (Number(a.tong_nhap) || 0) - (Number(b.tong_nhap) || 0) },
    { title: 'Tổng xuất', dataIndex: 'tong_xuat', key: 'tong_xuat', width: "10%", sorter: (a, b) => (Number(a.tong_xuat) || 0) - (Number(b.tong_xuat) || 0) },
    { title: 'Tồn hiện tại', dataIndex: 'ton_hien_tai', key: 'ton_hien_tai', width: "10%", sorter: (a, b) => (Number(a.ton_hien_tai) || 0) - (Number(b.ton_hien_tai) || 0) },
    { title: 'Mức tồn tối thiểu', dataIndex: 'muc_ton_toi_thieu', key: 'muc_ton_toi_thieu', width: "12%", sorter: (a, b) => (Number(a.muc_ton_toi_thieu) || 0) - (Number(b.muc_ton_toi_thieu) || 0) },
    {
        title: 'Hành động',
        key: 'hanh_dong',
        render: (_, record) => (
            <Space>
                <Button type="primary" size="small" disabled={!canEdit} onClick={() => handleEdit(record)}>Sửa</Button>
            </Space>
        ),
        width: "8%",
    },
];
