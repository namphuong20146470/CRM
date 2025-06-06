import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Modal } from 'antd';
import { SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import EditSupplier from './Edit/EditSupplier';
import RemoveSupplier from './Remove/RemoveSupplier';
import ExportSupplier from './Export/Export.Supplier';
import ImportSupplier from './Import/Import.Supplier';
import './Suppliers.css';

// Constants
const DEFAULT_YEAR = new Date().getFullYear().toString();
const DEFAULT_PAGE_SIZE = 20;
const API_URL = 'https://dx.hoangphucthanh.vn:3000/warehouse/suppliers';

function SuppliersTable({ isNewSuppliers = false }) {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // API functions
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      const dataArray = result?.data || [];

      if (Array.isArray(dataArray)) {
        const dataWithSTT = dataArray.map((item, index) => ({
          ...item,
          stt: index + 1,
        }));
        setData(dataWithSTT);
        setFilteredData(dataWithSTT);
      } else {
        message.error('Dữ liệu trả về không đúng định dạng');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Filtering functions
  const filterData = (searchValue, year) => {
    let filtered = [...data];

    if (searchValue) {
      const lowercaseSearch = searchValue.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.ma_nha_cung_cap?.toLowerCase().includes(lowercaseSearch) ||
          item.ten_nha_cung_cap?.toLowerCase().includes(lowercaseSearch)
      );
    }

    if (year && year.length === 4) {
      filtered = filtered.filter((item) => {
        if (!item.ngay_them_vao) return false;
        const itemYear = new Date(item.ngay_them_vao).getFullYear().toString();
        return itemYear === year;
      });
    }

    setFilteredData(filtered);
  };

  // Event handlers
  const handleSearch = (value) => {
    setSearchText(value);
    filterData(value, selectedYear);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    filterData(searchText, value);
  };

  const handleEdit = (record) => {
    setSelectedSupplier(record);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchSuppliers();
  };

  const handleRemove = (record) => {
    setSelectedSupplier(record);
    setRemoveModalVisible(true);
  };

  const handleRemoveSuccess = () => {
    setRemoveModalVisible(false);
    fetchSuppliers();
  };

  const handleRemoveCancel = () => {
    setRemoveModalVisible(false);
    setSelectedSupplier(null);
  };

  // Import handlers
  const handleImportClick = () => {
    setImportModalVisible(true);
  };

  const handleImportClose = () => {
    setImportModalVisible(false);
  };

  const handleImportSuccess = () => {
    fetchSuppliers();
  };

  // Export handlers
  const handleExportClick = () => {
    setExportModalVisible(true);
  };

  const handleExportClose = () => {
    setExportModalVisible(false);
  };

  // Format display functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Table configuration
  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 70 },
    { title: 'Mã Nhà Cung Cấp', dataIndex: 'ma_nha_cung_cap', key: 'ma_nha_cung_cap' },
    { title: 'Tên nhà cung cấp', dataIndex: 'ten_nha_cung_cap', key: 'ten_nha_cung_cap' },
    { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Địa chỉ', dataIndex: 'dia_chi', key: 'dia_chi' },
    { title: 'Quốc gia', dataIndex: 'quoc_gia', key: 'quoc_gia' },
    { title: 'Mã số thuế', dataIndex: 'ma_so_thue', key: 'ma_so_thue' },
    { title: 'Trang website', dataIndex: 'trang_website', key: 'trang_website' },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai' },
    { 
      title: 'Ngày thêm vào', 
      dataIndex: 'ngay_them_vao', 
      key: 'ngay_them_vao',
      render: (text) => formatDate(text)
    },
    {
      title: 'Hành động',
      key: 'hanh_dong',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
    {
      title: 'Không nợ phải trả',
      dataIndex: 'tong_no_phai_tra',
      key: 'tong_no_phai_tra',
      render: (value) => (value === 0 ? 'Không nợ' : value),
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu' },
  ];

  // Component rendering
  const renderActionButtons = () => (
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder="Tìm kiếm theo mã hoặc tên nhà cung cấp"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 300 }}
        className="black-text-input"
        allowClear
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setSearchText('');
            setFilteredData(data);
          }
        }}
      />
      <Button
        type="primary"
        onClick={handleImportClick}
        icon={<UploadOutlined />}
      >
        Nhập File
      </Button>
      <Button onClick={handleExportClick} icon={<DownloadOutlined />}>
        Xuất File
      </Button>
    </Space>
  );

  const renderTableHeader = () => (
    <div className="table-header">
      <h2 className="table-title">
        {isNewSuppliers ? 'Danh sách nhà cung cấp mới trong năm' : 'Danh sách nhà cung cấp'}
      </h2>
      <Space>
        <span>Chọn năm:</span>
        <Input
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          style={{ width: 100 }}
          className="black-text-input"
          maxLength={4}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSelectedYear(DEFAULT_YEAR);
              filterData(searchText, DEFAULT_YEAR);
            }
          }}
        />
      </Space>
    </div>
  );

  return (
    <div className="suppliers-container">
      {renderActionButtons()}
      {renderTableHeader()}

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="stt"
        bordered
        size="small"
        pagination={{
          total: filteredData.length,
          pageSize: DEFAULT_PAGE_SIZE,
          showSizeChanger: false,
          position: ['bottomCenter'],
        }}
        className="suppliers-table"
        loading={loading}
      />

      {/* Edit Modal */}
      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <EditSupplier
          supplierId={selectedSupplier?.ma_nha_cung_cap}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
        />
      </Modal>

      {/* Remove Modal */}
      {removeModalVisible && selectedSupplier && (
        <RemoveSupplier
          supplierId={selectedSupplier.ma_nha_cung_cap}
          supplierName={selectedSupplier.ten_nha_cung_cap}
          onSuccess={handleRemoveSuccess}
          onCancel={handleRemoveCancel}
        />
      )}

      {/* Export Modal */}
      <ExportSupplier
        data={data}
        filteredData={filteredData}
        visible={exportModalVisible}
        onClose={handleExportClose}
      />

      {/* Import Modal */}
      <ImportSupplier
        visible={importModalVisible}
        onClose={handleImportClose}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}

export default SuppliersTable;