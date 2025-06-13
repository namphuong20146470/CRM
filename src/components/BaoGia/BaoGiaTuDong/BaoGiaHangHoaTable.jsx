import React, { useState, useEffect } from 'react';
import { Table, Button, Select, InputNumber, message } from 'antd';
import { getCountryName } from '../../utils/convert/countryCodes';
import { getUnitName } from '../../utils/convert/unitCodes';
import { getProductDescription } from '../../utils/convert/productDescriptionsExcel';
import { getStockByMaHang } from '../../utils/inventory/getStockByMaHang';
import { fetchAndSetList } from '../../utils/api/fetchHelpers';

const { Option } = Select;

const MoTaCell = ({ maHang }) => {
  const [moTa, setMoTa] = useState('');
  useEffect(() => {
    getProductDescription(maHang).then(setMoTa);
  }, [maHang]);
  return <span>{moTa}</span>;
};

const SoLuongCell = ({ value, maHang, onChange }) => {
  const [stock, setStock] = useState(null);
  useEffect(() => {
    getStockByMaHang(maHang).then(setStock);
  }, [maHang]);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <InputNumber
        min={1}
        value={value}
        onChange={onChange}
        style={{ width: 32, height: 20, fontSize: 9 }}
      />
      {typeof stock === 'number' && (
        <span style={{ color: 'red', fontWeight: 'bold', marginLeft: 4, fontSize: 9, whiteSpace: 'nowrap' }}>({stock})</span>
      )}
    </div>
  );
};

// Hàm tính toán theo công thức mới
function calcDonGia(gia_thuc, heSo, ty_le_thue_nk, ty_le_thue_gtgt, chiet_khau) {
  const gia_co_thue_nk = gia_thuc * (1 + ty_le_thue_nk);
  // Làm tròn đến nghìn sau mỗi bước như Excel
  const base = roundToThousands((gia_co_thue_nk * heSo) / (1 + ty_le_thue_gtgt));
  const don_gia = roundToThousands(base * (1 + chiet_khau));
  return don_gia;
}

function roundToThousands(num) {
  return Math.round(num / 1000) * 1000;
}

const BaoGiaHangHoaTable = ({ thongTin, heSo, hangHoa, setHangHoa }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchAndSetList(
      'https://dx.hoangphucthanh.vn:3000/warehouse/products',
      (data) => {
        const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        setProducts(arr);
      },
      'Không thể tải danh sách hàng hóa'
    );
  }, []);

  // Lọc sản phẩm theo price_list đã chọn
  const filteredProducts = thongTin.price_list
    ? products.filter(p => p.price_list === thongTin.price_list)
    : [];

  // Khi chọn mã hàng
  const handleAddProduct = (ma_hang) => {
    const prod = products.find(p => p.ma_hang === ma_hang);
    if (!prod) return;
    if (hangHoa.some(h => h.ma_hang === ma_hang)) {
      message.warning('Mã hàng đã có trong bảng!');
      return;
    }
    // Giá trị mặc định
    const ty_le_thue_gtgt = 0.05;
    const ty_le_thue_nk = 0;
    const chiet_khau = 0;
    const so_luong = 1;
    const don_gia = calcDonGia(prod.gia_thuc, heSo, ty_le_thue_nk, ty_le_thue_gtgt, chiet_khau);
    const thanh_tien = don_gia * so_luong;
    const thue_gtgt = thanh_tien * ty_le_thue_gtgt;
    const tong_cong = thanh_tien + thue_gtgt;

    setHangHoa([
      ...hangHoa,
      {
        mo_ta: prod.mo_ta,
        ma_hang: prod.ma_hang,
        don_vi_ban_hang: prod.don_vi_ban_hang,
        hang_chu_so_huu: prod.suppliers?.ten_nha_cung_cap || prod.ten_nha_cung_cap || '',
        nuoc_xuat_xu: prod.nuoc_xuat_xu,
        gia_thuc: prod.gia_thuc,
        so_luong,
        don_gia,
        thanh_tien,
        thue_gtgt,
        tong_cong,
        ty_le_thue_gtgt,
        ty_le_thue_nk,
        chiet_khau,
      },
    ]);
  };

  // Xử lý thay đổi các trường mới
  const handleChange = (key, value, record) => {
    setHangHoa(hangHoa.map(h =>
      h.ma_hang === record.ma_hang
        ? { ...h, [key]: value }
        : h
    ));
  };

  // Xóa dòng
  const handleRemove = (ma_hang) => {
    setHangHoa(hangHoa.filter(h => h.ma_hang !== ma_hang));
  };

  // Tính toán lại khi số lượng, hệ số, thuế, chiết khấu thay đổi
  useEffect(() => {
    setHangHoa(hangHoa.map(h => {
      const so_luong = Number(h.so_luong) || 0;
      const ty_le_thue_nk = Number(h.ty_le_thue_nk) || 0;
      const ty_le_thue_gtgt = Number(h.ty_le_thue_gtgt) || 0.05;
      const chiet_khau = Number(h.chiet_khau) || 0;
      const gia_thuc = Number(h.gia_thuc) || 0;

      const don_gia = calcDonGia(gia_thuc, heSo, ty_le_thue_nk, ty_le_thue_gtgt, chiet_khau);
      const thanh_tien = don_gia * so_luong;
      const thue_gtgt = thanh_tien * ty_le_thue_gtgt;
      const tong_cong = thanh_tien + thue_gtgt;

      return { ...h, don_gia, thanh_tien, thue_gtgt, tong_cong };
    }));
    // eslint-disable-next-line
  }, [heSo, hangHoa.length, JSON.stringify(hangHoa.map(h => [h.so_luong, h.ty_le_thue_nk, h.ty_le_thue_gtgt, h.chiet_khau]))]);

  const columns = [
    { title: 'STT', dataIndex: 'stt', width: '3%', render: (_, __, idx) => idx + 1 },
    { title: 'Mô tả', dataIndex: 'ma_hang', width: '15%', render: maHang => <MoTaCell maHang={maHang} /> },
    { title: 'Mã hàng', dataIndex: 'ma_hang', width: '5%' },
    {
      title: 'SL',
      dataIndex: 'so_luong',
      width: '5%',
      render: (value, record) => (
        <SoLuongCell
          value={value}
          maHang={record.ma_hang}
          onChange={val => handleChange('so_luong', val, record)}
        />
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'don_vi_ban_hang',
      width: '3%',
      render: value => getUnitName(value)
    },
    { title: 'Hãng chủ sở hữu', dataIndex: 'hang_chu_so_huu', width: '5%' },
    {
      title: 'Xuất xứ',
      dataIndex: 'nuoc_xuat_xu',
      width: '5%',
      render: value => getCountryName(value)
    },
    {
      title: 'Đơn giá',
      dataIndex: 'don_gia',
      width: '5%',
      render: val => val?.toLocaleString(),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'thanh_tien',
      width: '6%',
      render: val => val?.toLocaleString(),
    },
    {
      title: 'Thuế GTGT',
      dataIndex: 'thue_gtgt',
      width: '6%',
      render: val => val?.toLocaleString(),
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'tong_cong',
      width: '6%',
      render: val => val?.toLocaleString(),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'ma_hang',
      width: '10%',
      render: (ma_hang) => (
        <div style={{ width: '100%', height: 48, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <img
            src={`/image/HangHoa/${ma_hang}.jpg`}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 4,
              display: 'block'
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      width: '5%',
      render: (_, record) => (
        <Button
          danger
          size="small"
          style={{ padding: '0 8px', height: 20, fontSize: 10, lineHeight: '18px' }}
          onClick={() => handleRemove(record.ma_hang)}
        >
          Xóa
        </Button>
      )
    },
    {
      title: 'Tỷ lệ Thuế GTGT',
      dataIndex: 'ty_le_thue_gtgt',
      width: '7%',
      render: (value, record) => (
        <Select
          value={value}
          style={{ width: 48, height: 20, fontSize: 9, textAlign: 'center' }}
          dropdownStyle={{ fontSize: 12 }}
          onChange={val => handleChange('ty_le_thue_gtgt', val, record)}
          getPopupContainer={trigger => trigger.parentNode}
        >
          <Option value={0.05}>5%</Option>
          <Option value={0.08}>8%</Option>
          <Option value={0.1}>10%</Option>
        </Select>
      )
    },
    {
      title: 'Tỷ lệ Thuế NK',
      dataIndex: 'ty_le_thue_nk',
      width: '7%',
      render: (value, record) => (
        <Select
          value={value}
          style={{ width: 48, height: 20, fontSize: 9, textAlign: 'center' }}
          dropdownRender={menu => (
            <div style={{ maxHeight: 80, overflowY: 'auto' }}>
              {menu}
            </div>
          )}
          onChange={val => handleChange('ty_le_thue_nk', val, record)}
          getPopupContainer={trigger => trigger.parentNode}
        >
          <Option value={0}>0%</Option>
          <Option value={0.07}>7%</Option>
          <Option value={0.1}>10%</Option>
          <Option value={0.12}>12%</Option>
          <Option value={0.15}>15%</Option>
          <Option value={0.2}>20%</Option>
          <Option value={0.25}>25%</Option>
        </Select>
      )
    },
    {
      title: 'Chiết khấu',
      dataIndex: 'chiet_khau',
      width: '7%',
      render: (value, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InputNumber
            min={0}
            max={100}
            value={value * 100}
            formatter={v => `${v}`}
            parser={v => v.replace('%', '')}
            onChange={val => handleChange('chiet_khau', (Number(val) || 0) / 100, record)}
            style={{ width: 32, height: 20, fontSize: 9 }}
          />
          <span style={{ marginLeft: 4, fontSize: 9, whiteSpace: 'nowrap' }}>%</span>
        </div>
      )
    }
  ];

  return (
    <div className="bao-gia-scroll-wrapper">
      <div style={{ width: 1800 }}>
        <div style={{ marginBottom: 16 }}>
          <Select
            showSearch
            placeholder="Chọn mã hàng để thêm"
            style={{ width: 450, marginRight: 8 }}
            onSelect={handleAddProduct}
            filterOption={(input, option) =>
              option.value.toLowerCase().includes(input.toLowerCase())
            }
          >
            {filteredProducts.map(p => (
              <Select.Option key={p.ma_hang} value={p.ma_hang}>
                {p.ma_hang} ( {p.ten_hang} )
              </Select.Option>
            ))}
          </Select>
        </div>
        <Table
          columns={columns}
          dataSource={hangHoa}
          rowKey="ma_hang"
          pagination={false}
          bordered
          scroll={{ x: 1500 }}
          size="small"
        />
      </div>
    </div>
  );
};

export default BaoGiaHangHoaTable;