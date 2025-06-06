import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Tag, 
  Space, 
  Spin, 
  Alert, 
  Typography, 
  Card,
  Button,
  Input,
  Select
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

// Create proper debugging
const DEBUG = true; 

// Add this to suppress ResizeObserver errors
const originalError = console.error;
console.error = (...args) => {
  if (/ResizeObserver loop/.test(args[0])) return;
  originalError(...args);
};

const ProductType = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProductTypes = async () => {
    setLoading(true);
    try {
      // Don't use Node.js https module in browser environment
      const response = await axios.get('https://dx.hoangphucthanh.vn:3000/warehouse/product-types', {
        // Remove this option that requires Node.js https module
        // httpsAgent: new (require('https').Agent)({
        //   rejectUnauthorized: false
        // })
      });
      
      if (DEBUG) {
        console.log('API Response:', response.data);
      }
      
      if (response.data.success) {
        // Add explicit check for data array
        if (Array.isArray(response.data.data)) {
          setProductTypes(response.data.data);
          setError(null);
        } else {
          setError('API returned success but data is not an array');
          setProductTypes([]);
        }
      } else {
        setError(response.data.message || 'Failed to fetch data');
        setProductTypes([]);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'An error occurred while fetching data');
      setProductTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  useEffect(() => {
    // Debug output when productTypes changes
    if (DEBUG) {
      console.log('Product Types State:', productTypes);
      console.log('Product Types Length:', productTypes.length);
    }
  }, [productTypes]);

  const formatDate = (dateString) => {
    try {
      return moment(dateString).format('DD/MM/YYYY');
    } catch (error) {
      return '—';
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 70,
      render: text => text || '—',
    },
    {
      title: 'Mã loại hàng',
      dataIndex: 'ma_loai_hang',
      key: 'ma_loai_hang',
      render: text => text || '—',
    },
    {
      title: 'Tên loại hàng',
      dataIndex: 'ten_loai_hang',
      key: 'ten_loai_hang',
      render: text => text || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: status => (
        <Tag color={status === 'Hoạt động' ? 'green' : 'red'}>
          {status || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Người cập nhật',
      dataIndex: ['accounts', 'ho_va_ten'],
      key: 'nguoi_cap_nhat',
      render: text => text || '—',
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'ngay_cap_nhat',
      key: 'ngay_cap_nhat',
      render: date => date ? formatDate(date) : '—',
    },
    {
      title: 'Mô tả',
      dataIndex: 'mo_ta',
      key: 'mo_ta',
      render: text => text || '—',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small">Sửa</Button>
          <Button danger size="small">Xóa</Button>
        </Space>
      ),
    },
  ];

  // Simplify filtering to prevent issues
  const filteredData = productTypes.filter(item => {
    if (!item) return false;
    
    const maLoaiHang = item.ma_loai_hang || '';
    const tenLoaiHang = item.ten_loai_hang || '';
    
    const matchesSearch = searchTerm === '' || 
      maLoaiHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenLoaiHang.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.trang_thai === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (DEBUG) {
    console.log('Filtered Data Length:', filteredData.length);
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>Danh mục loại sản phẩm</Title>
        
        <div style={{ marginBottom: 16, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select 
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={value => setStatusFilter(value)}
          >
            <Option value="all">Tất cả</Option>
            <Option value="Hoạt động">Hoạt động</Option>
            <Option value="Không hoạt động">Không hoạt động</Option>
          </Select>
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchProductTypes}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : filteredData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => record.ma_loai_hang || Math.random().toString()}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false
            }}
            bordered
            size="middle"
            scroll={{ x: '100%' }}
          />
        ) : (
          <Alert 
            message="Không có dữ liệu" 
            type="info" 
            showIcon 
            style={{ marginBottom: 16 }} 
          />
        )}
      </Card>
    </div>
  );
};

export default ProductType;