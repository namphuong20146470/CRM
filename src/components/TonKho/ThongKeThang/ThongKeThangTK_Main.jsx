import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { fetchData } from '../../utils/api/apiHandler';
import AreaHeader from '../../utils/jsx/AreaHeader';
import PaginationControl from '../../utils/format/PaginationControl';
import { resetFilters } from '../../utils/data/resetFilter';
import ThongKeThangFilter from './ThongKeThangTK_Filter';
import { filterThongKeThang } from './ThongKeThangTK_FilterLogic';
import '../../utils/css/Highlight.css';
import '../../utils/css/Custom-Button.css';
import '../../utils/css/Custom-Filter.css';
import './ThongKeThangTK_Main.css';

const ThongKeThang = () => {
  const [dataIn, setDataIn] = useState([]);
  const [dataOut, setDataOut] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Gọi API lấy dữ liệu stock-in và stock-out
  const fetchStock_In = () => {
    setLoading(true);
    fetchData({
      endpoint: '/stock-in',
      setData: (res) => {
        setDataIn(res?.data || res || []);
        setLoading(false);
      },
      setLoading,
    });
  };

  const fetchStock_Out = () => {
    setLoading(true);
    fetchData({
      endpoint: '/stock-out',
      setData: (res) => {
        setDataOut(res?.data || res || []);
        setLoading(false);
      },
      setLoading,
    });
  };

  // Gộp dữ liệu từ stock-in và stock-out
  useEffect(() => {
    fetchStock_In();
    fetchStock_Out();
  }, []);

  // Chuẩn hóa dữ liệu nhập
  const nhap = dataIn.map(item => ({
    ma_hang: item.ma_hang,
    ngay: item.ngay_nhap_hang,
    so_luong: item.so_luong_nhap,
    loai: 'nhap',
  }));
  // Chuẩn hóa dữ liệu xuất
  const xuat = dataOut.map(item => ({
    ma_hang: item.ma_hang,
    ngay: item.ngay_xuat_hang,
    so_luong: item.so_luong_xuat,
    loai: 'xuat',
  }));

  const data = [...nhap, ...xuat];

  // Lọc dữ liệu
  const filteredRawData = filterThongKeThang(data, { searchTerm, yearFilter });

  // Lấy tất cả mã hàng từng xuất hiện
  const allMaHang = Array.from(new Set(filteredRawData.map(item => item.ma_hang)));

  // Group dữ liệu: mỗi mã hàng là 1 dòng, mỗi tháng có nhập và xuất
  const groupedData = {};
  allMaHang.forEach(maHang => {
    groupedData[maHang] = {
      nhap: Array(12).fill(0),
      xuat: Array(12).fill(0),
      totalNhap: 0,
      totalXuat: 0,
    };
  });
  filteredRawData.forEach(item => {
    const month = new Date(item.ngay).getMonth();
    const maHang = item.ma_hang;
    if (!groupedData[maHang]) return;
    if (item.loai === 'nhap') {
      groupedData[maHang].nhap[month] += item.so_luong;
      groupedData[maHang].totalNhap += item.so_luong;
    } else if (item.loai === 'xuat') {
      groupedData[maHang].xuat[month] += item.so_luong;
      groupedData[maHang].totalXuat += item.so_luong;
    }
  });

  // Tạo dữ liệu cho bảng: mỗi mã hàng là 1 dòng
  const tableData = allMaHang.map(maHang => ({
    ma_hang: maHang,
    ...groupedData[maHang],
  }));

  // Cột header gộp
  const columns = [
    {
      title: 'Mã hàng',
      dataIndex: 'ma_hang',
      key: 'ma_hang',
      fixed: 'left',
      width: 150,
      align: 'center',
    },
    ...Array.from({ length: 12 }, (_, i) => ({
      title: `Tháng ${i + 1}`,
      align: 'center',
      children: [
        {
          title: 'Nhập',
          key: `nhap_${i + 1}`,
          width: 60,
          align: 'center',
          render: (_, row) => (
            <div className={row.nhap[i] > 0 ? 'blue-highlight' : ''}>
              {row.nhap[i] > 0 ? row.nhap[i] : 0}
            </div>
          ),
        },
        {
          title: 'Xuất',
          key: `xuat_${i + 1}`,
          width: 60,
          align: 'center',
          render: (_, row) => (
            <div className={row.xuat[i] > 0 ? 'red-highlight' : ''}>
              {row.xuat[i] > 0 ? row.xuat[i] : 0}
            </div>
          ),
        },
      ],
    })),
    {
      title: 'Tổng cả năm',
      align: 'center',
      children: [
        {
          title: 'Nhập',
          dataIndex: 'totalNhap',
          key: 'totalNhap',
          width: 90,
          align: 'center',
          render: value => (
            <div className="green-highlight">{value}</div>
          ),
        },
        {
          title: 'Xuất',
          dataIndex: 'totalXuat',
          key: 'totalXuat',
          width: 90,
          align: 'center',
          render: value => (
            <div className="green-highlight">{value}</div>
          ),
        },
      ],
    },
  ];

  const handleRefresh = () => {
      setSearchTerm('');
      resetFilters([setYearFilter]);
      setCurrentPage(1);
      fetchStock_In();
      fetchStock_Out();
  };
  
  const handlePageChange = (page, pageSize) => {
      setCurrentPage(page);
      setPageSize(pageSize);
  };

  return (
    <div className="thong-ke-thang-container">
      <AreaHeader title="Tổng số lượng nhập/xuất theo tháng (Tồn kho)" />
      <ThongKeThangFilter
        data={data}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        onRefresh={handleRefresh}
        loading={loading}
      />
      <Table
        columns={columns}
        dataSource={tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        rowKey="ma_hang"
        bordered
        pagination={false}
        className="custom-ant-table-highlight"
        loading={loading}
      />
      <PaginationControl
        total={tableData.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSizeChange={handlePageChange}
      />
    </div>
  );
};

export default ThongKeThang;