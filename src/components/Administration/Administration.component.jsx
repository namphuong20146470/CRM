import React, { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Input, Button, Space, Row, Col, Typography, Select, Tag, message } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Administration = () => {
  const [loginData, setLoginData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [userFilter, setUserFilter] = useState(null);
  const [userList, setUserList] = useState([]);
  const [accountsData, setAccountsData] = useState([]);

  useEffect(() => {
    fetchLoginData();
    fetchUserAccounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, dateRange, userFilter, loginData]);

  const fetchUserAccounts = async () => {
    try {
      const response = await axios.get('https://dx.hoangphucthanh.vn:3000/warehouse/accounts');
      console.log('Accounts data:', response.data);
      setAccountsData(response.data || []);
      
      // Extract unique users for the filter dropdown
      const users = response.data.map(account => ({
        username: account.ma_nguoi_dung,
        displayName: account.ho_va_ten || account.ma_nguoi_dung,
      }));
      
      setUserList(users);
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      message.error('Không thể tải danh sách tài khoản');
    }
  };

  const fetchLoginData = async () => {
    setLoading(true);
    try {
      // Try to get login history from localStorage
      const localHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
      
      let loginHistoryData = [];
      
      // If we have local history, use it
      if (localHistory && localHistory.length > 0) {
        console.log('Found local login history:', localHistory);
        loginHistoryData = localHistory.map((item, index) => ({
          id: index + 1,
          ...item
        }));
      } else {
        // Otherwise try to get from API
        try {
          // In production, replace with actual API endpoint
          // const response = await axios.get('https://dx.hoangphucthanh.vn:3000/api/login-history');
          // loginHistoryData = response.data;
          
          // For demo, use mock data if no local history
          console.log('No local login history found, generating mock data');
          loginHistoryData = generateMockDataWithRealUsers();
        } catch (apiError) {
          console.error('API error, falling back to mock data:', apiError);
          loginHistoryData = generateMockDataWithRealUsers();
        }
      }
      
      // Sort by login time descending
      loginHistoryData.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
      
      setLoginData(loginHistoryData);
      setFilteredData(loginHistoryData);
    } catch (error) {
      console.error('Error fetching login history:', error);
      message.error('Không thể tải dữ liệu lịch sử đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const generateMockDataWithRealUsers = () => {
    // Use real account data if available, otherwise fall back to mock users
    const users = accountsData.length > 0
      ? accountsData
      : [
          { ma_nguoi_dung: 'admin', ho_va_ten: 'Administrator', vai_tro: 'VT01' },
          { ma_nguoi_dung: 'VTTphuong', ho_va_ten: 'Vũ Thị Thu Phương', vai_tro: 'VT02' },
          { ma_nguoi_dung: 'PPcuong', ho_va_ten: 'Phạm Phi Cường', vai_tro: 'VT02' },
          { ma_nguoi_dung: 'staff1', ho_va_ten: 'Nhân viên 1', vai_tro: 'VT03' }
        ];
        
    const mockData = [];
    
    // Generate data for the past 30 days
    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      
      const loginTime = moment().subtract(randomDaysAgo, 'days').hour(randomHour).minute(randomMinute);
      const logoutTime = Math.random() > 0.3 ? loginTime.clone().add(Math.floor(Math.random() * 5) + 1, 'hours') : null;
      
      mockData.push({
        id: i + 1,
        username: randomUser.ma_nguoi_dung,
        fullName: randomUser.ho_va_ten || randomUser.ma_nguoi_dung,
        role: randomUser.vai_tro || 'VT03',
        loginTime: loginTime.format('YYYY-MM-DD HH:mm:ss'),
        logoutTime: logoutTime ? logoutTime.format('YYYY-MM-DD HH:mm:ss') : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        device: Math.random() > 0.7 ? 'Mobile' : 'Desktop',
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
      });
    }
    
    return mockData;
  };

  const applyFilters = () => {
    let result = [...loginData];
    
    // Search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(item =>
        (item.username?.toLowerCase() || '').includes(searchLower) ||
        (item.fullName?.toLowerCase() || '').includes(searchLower) ||
        (item.ipAddress || '').includes(searchText)
      );
    }
    
    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      result = result.filter(item => {
        const loginDate = moment(item.loginTime);
        return loginDate.isBetween(startDate, endDate, null, '[]');
      });
    }
    
    // User filter
    if (userFilter) {
      result = result.filter(item => item.username === userFilter);
    }
    
    setFilteredData(result);
  };

  const handleReset = () => {
    setSearchText('');
    setDateRange([]);
    setUserFilter(null);
    setFilteredData(loginData);
  };

  // Custom function to export data as CSV
  const exportCSV = () => {
    // Format data for CSV
    const csvContent = [
      // CSV header
      ['STT', 'Tên đăng nhập', 'Họ và tên', 'Vai trò', 'Thời gian đăng nhập', 'Thời gian đăng xuất', 'Địa chỉ IP', 'Thiết bị', 'Trình duyệt'],
      // CSV rows
      ...filteredData.map(item => [
        item.id,
        item.username,
        item.fullName,
        item.role === 'VT01' ? 'Admin' : item.role === 'VT02' ? 'Quản lý' : 'Nhân viên',
        moment(item.loginTime).format('DD/MM/YYYY HH:mm:ss'),
        item.logoutTime ? moment(item.logoutTime).format('DD/MM/YYYY HH:mm:ss') : 'Chưa đăng xuất',
        item.ipAddress,
        item.device,
        item.browser
      ])
    ]
    .map(row => row.join(','))
    .join('\n');
    
    // Create a blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a downloadable URL from the blob
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download link properties
    link.href = url;
    link.setAttribute('download', `lich-su-dang-nhap-${moment().format('YYYY-MM-DD')}.csv`);
    
    // Append link to document, click it to start download, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Đã xuất file CSV thành công');
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text) => <span><UserOutlined /> {text}</span>
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => {
        let color = 'blue';
        let label = 'Nhân viên';
        
        if (role === 'VT01') {
          color = 'red';
          label = 'Admin';
        } else if (role === 'VT02') {
          color = 'green';
          label = 'Quản lý';
        }
        
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Thời gian đăng nhập',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      render: (text) => (
        <span>
          <ClockCircleOutlined /> {moment(text).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      ),
    },
    {
      title: 'Thời gian đăng xuất',
      dataIndex: 'logoutTime',
      key: 'logoutTime',
      width: 180,
      render: (text) => (
        text ? <span><ClockCircleOutlined /> {moment(text).format('DD/MM/YYYY HH:mm:ss')}</span> : <Tag color="orange">Đang hoạt động hoặc bất thường</Tag>
      ),
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device',
      key: 'device',
      width: 120,
    },
    {
      title: 'Trình duyệt',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3}>Quản trị hệ thống - Lịch sử đăng nhập</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên người dùng, họ tên, IP..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo người dùng"
              allowClear
              value={userFilter}
              onChange={setUserFilter}
            >
              {userList.map(user => (
                <Option key={user.username} value={user.username}>{user.displayName}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchLoginData}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
              >
                Xóa bộ lọc
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={exportCSV}
              >
                Xuất CSV
              </Button>
            </Space>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1300 }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Tổng ${total} bản ghi`
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default Administration;