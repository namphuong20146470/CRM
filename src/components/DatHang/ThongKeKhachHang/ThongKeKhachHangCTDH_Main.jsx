import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { fetchData } from '../../utils/api/apiHandler';
import AreaHeader from '../../utils/jsx/AreaHeader';
import PaginationControl from '../../utils/format/PaginationControl';
import ThongKeKhachHangCTDH_Export from './ThongKeKhachHangCTDH_Export';
import ThongKeKhachHangCTDH_Filter from './ThongKeKhachHangCTDH_Filter';
import { filterThongKeKhachHang } from './ThongKeKhachHangCTDH_FilterLogic';
import '../../utils/css/Highlight.css';
import '../../utils/css/Custom-Button.css';
import '../../utils/css/Custom-Filter.css';
import './ThongKeKhachHangCTDH_Main.css';

const ThongKeKhachHangCTDH = () => {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Lấy dữ liệu xuất kho và danh sách khách hàng
  const fetchOrder_Detail = () => {
    fetchData({
      endpoint: '/order-details',
      setData,
      setLoading,
    });
  };
  const fetchCustomers = () => {
    fetchData({
      endpoint: '/customers',
      setData: setCustomers,
      setLoading,
    });
  };

  useEffect(() => {
    fetchOrder_Detail();
    fetchCustomers();
  }, []);

  // Sử dụng filterLogic để lọc dữ liệu
  const filteredRawData = filterThongKeKhachHang(data, { searchTerm, yearFilter, customers });

  // Lấy tất cả mã hàng và mã khách hàng
  const allMaHang = Array.from(new Set(data.map(item => item.ma_hang)));
  // Lọc ra các mã khách hàng có ít nhất 1 dòng có số lượng > 0
  const allMaKhach = Array.from(
    new Set(
      filteredRawData
        .filter(item => item.so_luong > 0)
        .map(item => item.ten_khach_hang)
    )
  );

  // Group dữ liệu: mỗi mã hàng là 1 dòng, mỗi mã khách là 1 cột
  const groupedData = {};
  allMaHang.forEach(maHang => {
    groupedData[maHang] = {};
    allMaKhach.forEach(maKhach => {
      groupedData[maHang][maKhach] = 0;
    });
    groupedData[maHang].total = 0;
  });
  filteredRawData.forEach(item => {
    const maHang = item.ma_hang;
    // Lấy đúng trường liên kết khách hàng
    const maKhach = item.ten_khach_hang;
    const soLuong = item.so_luong || 0;
    if (groupedData[maHang] && maKhach && groupedData[maHang][maKhach] !== undefined) {
      groupedData[maHang][maKhach] += soLuong;
      groupedData[maHang].total += soLuong;
    }
  });

  // Chỉ lấy các mã hàng đã lọc ra từ filteredRawData
  const filteredMaHang = Array.from(new Set(filteredRawData.map(item => item.ma_hang)));
  let tableData = filteredMaHang.map(maHang => ({
    ma_hang: maHang,
    ...groupedData[maHang],
  }));

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchedCustomer = normalizedSearch
    ? customers.find(
        cus =>
          cus.ma_khach_hang.toLowerCase().includes(normalizedSearch) ||
          cus.ten_khach_hang.toLowerCase().includes(normalizedSearch)
      )
    : null;

  let columns;
  if (matchedCustomer) {
    columns = [
      {
        title: 'Mã hàng',
        dataIndex: 'ma_hang',
        key: 'ma_hang',
        fixed: 'left',
        width: 120,
      },
      {
        title: matchedCustomer.ma_khach_hang,
        dataIndex: matchedCustomer.ma_khach_hang,
        key: matchedCustomer.ma_khach_hang,
        width: 120,
        render: value => (
          <div className={value > 0 ? 'blue-highlight' : ''}>
            {value > 0 ? value : 0}
          </div>
        ),
      },
    ];
  } else {
    columns = [
      {
        title: 'Mã hàng',
        dataIndex: 'ma_hang',
        key: 'ma_hang',
        fixed: 'left',
        width: 120,
      },
      ...allMaKhach.map(maKhach => ({
        title: maKhach,
        dataIndex: maKhach,
        key: maKhach,
        width: 120,
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
        width: 120,
        fixed: 'right',
        render: value => (
          <div className="green-highlight">{value}</div>
        ),
      },
    ];
  }

  const handleRefresh = () => {
    setSearchTerm('');
    setYearFilter('all');
    setCurrentPage(1);
    fetchOrder_Detail();
    fetchCustomers();
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div className="thong-ke-khach-hang-container">
      <AreaHeader
        title="Tổng số lượng hàng đặt theo khách hàng"
        onExportClick={() => setShowExportModal(true)}
        hideAddButton
      />
      <ThongKeKhachHangCTDH_Export
        data={tableData}
        filteredData={tableData}
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        allMaKhach={allMaKhach}
        matchedCustomer={matchedCustomer}
      />
      <ThongKeKhachHangCTDH_Filter
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
        className={
          "custom-ant-table-highlight" +
          (matchedCustomer ? " only-two-cols" : "")
        }
        loading={loading}
        scroll={{ x: 'max-content' }}
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

export default ThongKeKhachHangCTDH;