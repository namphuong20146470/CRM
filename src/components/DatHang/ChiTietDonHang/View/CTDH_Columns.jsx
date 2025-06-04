import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getChiTietDonHangColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "1%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "2%", sorter: (a, b) => (a.ma_hang || '').localeCompare(b.ma_hang || '') },
    { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong', width: "2%", sorter: (a, b) => (Number(a.so_luong) || 0) - (Number(b.so_luong) || 0) },
    { 
        title: 'Ngày đặt', 
        dataIndex: 'ngay_dat_hang', 
        key: 'ngay_dat_hang', 
        render: (text) => formatDate(text), 
        width: "3%",
        sorter: (a, b) => new Date(a.ngay_dat_hang) - new Date(b.ngay_dat_hang),
        defaultSortOrder: 'descend',
    },
    { title: 'Hợp đồng', dataIndex: 'ma_hop_dong', key: 'ma_hop_dong', width: "3%", sorter: (a, b) => (a.ma_hop_dong || '').localeCompare(b.ma_hop_dong || '') },
    { title: 'Số xác nhận đơn hàng', dataIndex: 'so_xac_nhan_don_hang', key: 'so_xac_nhan_don_hang', width: "3%", sorter: (a, b) => (a.so_xac_nhan_don_hang || '').localeCompare(b.so_xac_nhan_don_hang || '') },
    { 
        title: 'Khách hàng', 
        dataIndex: ['customers', 'ten_khach_hang'], 
        key: 'ten_khach_hang', 
        width: "12%",
        sorter: (a, b) => {
            const aName = a.customers?.ten_khach_hang || '';
            const bName = b.customers?.ten_khach_hang || '';
            return aName.localeCompare(bName, 'vi');
        }
    },
    { 
        title: 'Người phụ trách', 
        dataIndex: ['accounts', 'ho_va_ten'], 
        key: 'nguoi_phu_trach', 
        width: "4%",
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
        width: "3%",
    },
    { 
        title: 'Ngày tạm ứng', 
        dataIndex: 'ngay_tam_ung', 
        key: 'ngay_tam_ung', 
        render: (text) => formatDate(text), 
        width: "3%",
        sorter: (a, b) => new Date(a.ngay_tam_ung) - new Date(b.ngay_tam_ung),
    },
    { 
        title: 'Từ ngày', 
        dataIndex: 'tu_ngay', 
        key: 'tu_ngay', 
        render: (text) => formatDate(text), 
        width: "3%",
        sorter: (a, b) => new Date(a.tu_ngay) - new Date(b.tu_ngay),
    },
    { 
        title: 'Đến ngày', 
        dataIndex: 'den_ngay', 
        key: 'den_ngay', 
        render: (text) => formatDate(text), 
        width: "3%",
        sorter: (a, b) => new Date(a.den_ngay) - new Date(b.den_ngay),
    },
    { title: 'Tình trạng đơn hàng', dataIndex: 'tinh_trang_don_hang', key: 'tinh_trang_don_hang', width: "4%",
        render: (status) => {
            let color = '';
            switch (status) {
                case 'Đang xử lý':
                    color = 'orange';
                    break;
                case 'Hoàn thành':
                    color = 'green';
                    break;
                case 'Đã hủy':
                    color = 'red';
                    break;
                case 'Đã giao, đặt trả kho':
                    color = 'blue';
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
                        fontWeight: 600, 
                        display: 'inline-block', 
                        textAlign: 'center', // Căn giữa chữ trong Tag
                        width: '100%' // Đảm bảo Tag chiếm toàn bộ chiều rộng của ô
                    }}
                >
                    {status || 'N/A'}
                </Tag>
            );
        },
        sorter: (a, b) => (a.tinh_trang_don_hang || '').localeCompare(b.tinh_trang_don_hang || '')
    },
    { 
        title: 'Hãng báo ngày dự kiến 1', 
        dataIndex: 'hang_bao_ngay_du_kien_lan_1', 
        key: 'hang_bao_ngay_du_kien_lan_1', 
        render: (text) => formatDate(text), 
        width: "3%",
        sorter: (a, b) => new Date(a.hang_bao_ngay_du_kien_lan_1) - new Date(b.hang_bao_ngay_du_kien_lan_1),
    },
    { 
        title: 'Hãng báo ngày dự kiến 2', 
        dataIndex: 'hang_bao_ngay_du_kien_lan_2', 
        key: 'hang_bao_ngay_du_kien_lan_2', 
        render: (text) => formatDate(text), 
        width: "3%",
        sorter: (a, b) => new Date(a.hang_bao_ngay_du_kien_lan_2) - new Date(b.hang_bao_ngay_du_kien_lan_2),
    },
    { title: 'INV 1', dataIndex: 'invoice_1', key: 'invoice_1', width: "2%" },
    { title: 'PKL 1', dataIndex: 'packing_list_1', key: 'packing_list_1', width: "2%"},
    { title: 'Số lượng lô 1', dataIndex: 'so_luong_lo_1', key: 'so_luong_lo_1', width: "2%" },
    { title: 'HAWB 1', dataIndex: 'hawb_1', key: 'hawb_1', width: "2%" },
    { title: 'INV 2', dataIndex: 'invoice_2', key: 'invoice_2', width: "2%" },
    { title: 'PKL 2', dataIndex: 'packing_list_2', key: 'packing_list_2', width: "2%"},
    { title: 'Số lượng lô 2', dataIndex: 'so_luong_lo_2', key: 'so_luong_lo_2', width: "2%" },
    { title: 'HAWB 2', dataIndex: 'hawb_2', key: 'hawb_2', width: "2%" },
    { title: 'INV 3', dataIndex: 'invoice_3', key: 'invoice_3', width: "2%" },
    { title: 'PKL 3', dataIndex: 'packing_list_3', key: 'packing_list_3', width: "2%"},
    { title: 'Số lượng lô 3', dataIndex: 'so_luong_lo_3', key: 'so_luong_lo_3', width: "2%" },
    { title: 'HAWB 3', dataIndex: 'hawb_3', key: 'hawb_3', width: "2%" },
    { title: 'INV 4', dataIndex: 'invoice_4', key: 'invoice_4', width: "2%" },
    { title: 'PKL 4', dataIndex: 'packing_list_4', key: 'packing_list_4', width: "2%"},
    { title: 'Số lượng lô 4', dataIndex: 'so_luong_lo_4', key: 'so_luong_lo_4', width: "2%" },
    { title: 'HAWB 4', dataIndex: 'hawb_4', key: 'hawb_4', width: "2%" },
    { title: 'INV 5', dataIndex: 'invoice_5', key: 'invoice_5', width: "2%" },
    { title: 'PKL 5', dataIndex: 'packing_list_5', key: 'packing_list_5', width: "2%"},
    { title: 'Số lượng lô 5', dataIndex: 'so_luong_lo_5', key: 'so_luong_lo_5', width: "2%" },
    { title: 'HAWB 5', dataIndex: 'hawb_5', key: 'hawb_5', width: "2%" },
    { title: 'Số lượng chưa về', dataIndex: 'so_luong_hang_chua_ve', key: 'so_luong_hang_chua_ve', width: "2%", sorter: (a, b) => (Number(a.so_luong_hang_chua_ve) || 0) - (Number(b.so_luong_hang_chua_ve) || 0) },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "8%" },
];
