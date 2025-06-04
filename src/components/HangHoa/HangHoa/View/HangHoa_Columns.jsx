import React, { useEffect, useState } from 'react';
import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';
import { getCountryName } from '../../../utils/convert/countryCodes';
import { getStatusName } from '../../../utils/convert/statusCodes';
import { getUnitName } from '../../../utils/convert/unitCodes';
import { getProductDescription } from '../../../utils/convert/productDescriptionsExcel';
import { getStockByMaHang } from '../../../utils/inventory/getStockByMaHang';

// Component hiển thị mô tả tiếng Việt dựa vào mã hàng (bất đồng bộ)
const MoTaCell = ({ maHang }) => {
  const [moTa, setMoTa] = useState('');

  useEffect(() => {
    getProductDescription(maHang).then(setMoTa);
  }, [maHang]);

  return <span>{moTa}</span>;
};

// Component hiển thị mã hàng kèm số lượng tồn kho (tô đỏ số lượng)
const MaHangWithStock = ({ maHang }) => {
  const [stock, setStock] = useState(null);

  useEffect(() => {
    let mounted = true;
    getStockByMaHang(maHang).then(sl => {
      if (mounted) setStock(sl);
    });
    return () => { mounted = false; };
  }, [maHang]);

  return (
    <span>
      {maHang}
      {typeof stock === 'number' && (
        <span style={{ color: 'red', fontWeight: 'bold' }}> ({stock})</span>
      )}
    </span>
  );
};

export const getHangHoaColumns = (handleEdit, handleRemove, canEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "3%" },
    { 
        title: 'Mã hàng', 
        dataIndex: 'ma_hang', 
        key: 'ma_hang', 
        width: "5%", 
        render: (maHang) => <MaHangWithStock maHang={maHang} />,
        sorter: (a, b) => (a.ma_hang || '').localeCompare(b.ma_hang || '') 
    },
    { title: 'Tên hàng', dataIndex: 'ten_hang', key: 'ten_hang', width: "11%", sorter: (a, b) => (a.ten_hang || '').localeCompare(b.ten_hang || '') },
    { 
        title: 'Loại hàng', 
        dataIndex: ['product_type', 'ten_loai_hang'], 
        key: 'ten_loai_hang', 
        width: "7%", 
        sorter: (a, b) => {
            const aName = a.product_type?.ten_loai_hang || '';
            const bName = b.product_type?.ten_loai_hang || '';
            return aName.localeCompare(bName, 'vi');
        }  
    },
    { 
        title: 'Tình trạng', 
        dataIndex: 'tinh_trang_hang_hoa', 
        key: 'tinh_trang_hang_hoa', 
        width: "4%", 
        render: (status) => {
            let color = '';
            const statusText = getStatusName(status);
            switch (statusText) {
                case 'Đang kinh doanh':
                    color = 'blue';
                    break;
                case 'Ngừng kinh doanh':
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
                    {statusText || 'N/A'}
                </Tag>
            );
        },
        sorter: (a, b) => (a.tinh_trang_hang_hoa || '').localeCompare(b.tinh_trang_hang_hoa || '')
    },
    { 
        title: 'Nhà cung cấp', 
        dataIndex: ['suppliers', 'ten_nha_cung_cap'], 
        key: 'ten_nha_cung_cap', 
        width: "5%", 
        sorter: (a, b) => {
            const aName = a.suppliers?.ten_nha_cung_cap || '';
            const bName = b.suppliers?.ten_nha_cung_cap || '';
            return aName.localeCompare(bName, 'vi');
        } 
    },
    { 
        title: 'Nước xuất xứ', 
        dataIndex: 'nuoc_xuat_xu', 
        key: 'nuoc_xuat_xu', 
        render: (code) => getCountryName(code), 
        width: "4%", 
        sorter: (a, b) => (a.nuoc_xuat_xu || '').localeCompare(b.nuoc_xuat_xu || '') 
    },
    { 
        title: 'Trọng lượng', 
        dataIndex: 'trong_luong_tinh', 
        key: 'trong_luong_tinh', 
        render: (value) => value?.toLocaleString('vi-VN'), 
        width: "5%", 
        sorter: (a, b) => (Number(a.trong_luong_tinh) || 0) - (Number(b.trong_luong_tinh) || 0) 
    },
    { 
        title: 'Giá thực', 
        dataIndex: 'gia_thuc', 
        key: 'gia_thuc', 
        render: (value) => value?.toLocaleString('vi-VN'), 
        width: "5%", 
        sorter: (a, b) => (Number(a.gia_thuc) || 0) - (Number(b.gia_thuc) || 0) 
    },
    { 
        title: 'Đơn vị', 
        dataIndex: 'don_vi_ban_hang', 
        key: 'don_vi_ban_hang', 
        width: "3%", 
        render: (value) => getUnitName(value),
        sorter: (a, b) => (a.don_vi_ban_hang || '').localeCompare(b.don_vi_ban_hang || ''),
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
        width: "4%",
    },
    { title: 'Price list', dataIndex: 'price_list', key: 'price_list', width: "6%" },
    { title: 'Ngày giá', dataIndex: 'ngay_gia', key: 'ngay_gia', width: "4%", render: (text) => formatDate(text) },
    {
        title: 'Người cập nhật',
        dataIndex: ['accounts', 'ho_va_ten'],
        key: 'nguoi_cap_nhat',
        width: "5%",
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
        width: "5%",
        render: (text) => formatDate(text), 
        sorter: (a, b) => new Date(a.ngay_cap_nhat) - new Date(b.ngay_cap_nhat),
        defaultSortOrder: 'descend',
    },
    { 
        title: 'Mô tả', 
        dataIndex: 'mo_ta', 
        key: 'mo_ta', 
        width: "10%",
    },
    { 
        title: 'Mô tả VIE', 
        dataIndex: 'ma_hang', 
        key: 'mo_ta_vie', 
        width: "14%",
        render: (maHang) => <MoTaCell maHang={maHang} />
    },
];