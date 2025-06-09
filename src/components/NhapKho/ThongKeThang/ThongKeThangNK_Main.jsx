import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { fetchData } from '../../utils/api/apiHandler';
import AreaHeader from '../../utils/jsx/AreaHeader';
import PaginationControl from '../../utils/format/PaginationControl';
import { resetFilters } from '../../utils/data/resetFilter';
import ThongKeThangFilter from './ThongKeThangNK_Filter';
import { filterThongKeThang } from './ThongKeThangNK_FilterLogic';
import ThongKeThang_Export from './ThongKeThangNK_Export';
import '../../utils/css/Highlight.css';
import '../../utils/css/Custom-Button.css';
import '../../utils/css/Custom-Filter.css';
import './ThongKeThangNK_Main.css';

const ThongKeThang = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Gọi API lấy dữ liệu stock-in
  const fetchStock_In = () => {
    fetchData({
      endpoint: '/stock-in',
      setData,
      setLoading,
    });
  };

  useEffect(() => {
    fetchStock_In();
  }, []);

  // Lấy tất cả mã hàng từng xuất hiện
  const allMaHang = Array.from(new Set(data.map(item => item.ma_hang)));

  // Lọc dữ liệu
  const filteredRawData = filterThongKeThang(data, { searchTerm, yearFilter });

  // Group lại theo tất cả mã hàng
  const groupedData = {};
  allMaHang.forEach(maHang => {
    groupedData[maHang] = Array(12).fill(0);
    groupedData[maHang].total = 0;
  });
  filteredRawData.forEach(item => {
    const month = new Date(item.ngay_nhap_hang).getMonth();
    const maHang = item.ma_hang;
    groupedData[maHang][month] += item.so_luong_nhap;
    groupedData[maHang].total += item.so_luong_nhap;
  });
  const tableData = allMaHang.map(maHang => ({
    ma_hang: maHang,
    ...groupedData[maHang],
  }));

  // Lọc theo mã hàng nếu có searchTerm
  const finalTableData = tableData.filter(row =>
    row.ma_hang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cột của bảng
  const columns = [
    {
      title: 'Mã hàng',
      dataIndex: 'ma_hang',
      key: 'ma_hang',
      width: '10%',
    },
    ...Array.from({ length: 12 }, (_, index) => ({
      title: `Tháng ${index + 1}`,
      dataIndex: index,
      key: `month_${index + 1}`,
      width: '6%',
      render: value => (
        <div className={value > 0 ? 'blue-highlight' : ''}>
          {value > 0 ? value : 0}
        </div>
      ),
    })),
    {
      title: 'Tổng cả năm',
      dataIndex: 'total',
      key: 'total',
      width: '10%',
      render: value => (
        <div className="green-highlight">{value}</div>
      ),
    },
  ];

  const handleRefresh = () => {
      setSearchTerm('');
      resetFilters([setYearFilter]);
      setCurrentPage(1);
      fetchStock_In();
  };

  const handlePageChange = (page, pageSize) => {
      setCurrentPage(page);
      setPageSize(pageSize);
  };

  return (
    <div className="thong-ke-thang-container">
      <AreaHeader
        title="Tổng số lượng hàng nhập theo tháng"
        onExportClick={() => setShowExportModal(true)}
        hideAddButton
      />
      <ThongKeThang_Export
        data={tableData}
        filteredData={tableData}
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
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
        dataSource={finalTableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        rowKey="ma_hang"
        bordered
        pagination={false}
        className="custom-ant-table-highlight"
        loading={loading}
      />
      <PaginationControl
          total={finalTableData.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onSizeChange={handlePageChange}
      />
    </div>
  );
};

export default ThongKeThang;