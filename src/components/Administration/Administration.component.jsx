import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, DatePicker, Input, Button, Space, Row, Col, Typography, Select, Tag, message, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, UserOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi'; // Thêm locale tiếng Việt
import axios from 'axios';

// Cấu hình moment.js sử dụng múi giờ Việt Nam và ngôn ngữ tiếng Việt
moment.locale('vi');

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
  const [errorMessage, setErrorMessage] = useState('');

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchLoginData();
  }, []);

  // Áp dụng bộ lọc khi các tham số thay đổi
  const applyFilters = useCallback(() => {
    let result = [...loginData];
    
    // Lọc theo text tìm kiếm
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(item =>
        (item.username?.toLowerCase() || '').includes(searchLower) ||
        (item.fullName?.toLowerCase() || '').includes(searchLower) ||
        (item.ipAddress || '').includes(searchText)
      );
    }
    
    // Lọc theo khoảng thời gian
    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      result = result.filter(item => {
        const loginDate = item.loginTime ? moment(item.loginTime) : null;
        const logoutDate = item.logoutTime ? moment(item.logoutTime) : null;
        
        // Nếu phiên đăng nhập hoặc đăng xuất nằm trong khoảng thời gian
        return (loginDate && loginDate.isBetween(startDate, endDate, null, '[]')) || 
               (logoutDate && logoutDate.isBetween(startDate, endDate, null, '[]'));
      });
    }
    
    // Lọc theo người dùng
    if (userFilter) {
      result = result.filter(item => item.username === userFilter);
    }
    
    setFilteredData(result);
  }, [loginData, searchText, dateRange, userFilter]);

  // Áp dụng bộ lọc khi các phụ thuộc thay đổi
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Phân tích thông tin trình duyệt từ user_agent
  const getBrowserInfo = useCallback((userAgent) => {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown' };
    
    // Xác định thiết bị
    const device = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'Mobile' : 'Desktop';
    
    // Xác định trình duyệt
    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1) browser = 'Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) browser = 'Safari';
    else if (userAgent.indexOf('Edg') !== -1) browser = 'Edge';
    else if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) browser = 'IE';
    
    return { device, browser };
  }, []);

  // Xử lý cặp login/logout để hiển thị đúng
  const processLoginLogoutPairs = useCallback((activities) => {
    // Sắp xếp theo thời gian tăng dần
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(a.loginTime || a.logoutTime) - new Date(b.loginTime || b.logoutTime)
    );
    
    const loginSessions = [];
    const processedUsers = {};
    
    // Tạo các phiên đăng nhập
    sortedActivities.forEach(activity => {
      const username = activity.username;
      
      if (activity.activityType === 'login') {
        // Nếu đã có phiên đăng nhập trước đó mà chưa đăng xuất, đánh dấu phiên cũ là bất thường
        if (processedUsers[username] && !processedUsers[username].logoutTime) {
          processedUsers[username].abnormal = true;
        }
        
        // Tạo phiên đăng nhập mới
        processedUsers[username] = {
          ...activity,
          id: loginSessions.length + 1
        };
        loginSessions.push(processedUsers[username]);
      } 
      else if (activity.activityType === 'logout') {
        // Tìm phiên đăng nhập gần nhất chưa có đăng xuất
        if (processedUsers[username] && !processedUsers[username].logoutTime) {
          processedUsers[username].logoutTime = activity.logoutTime;
        } else {
          // Nếu không tìm thấy phiên đăng nhập, tạo một phiên bất thường
          loginSessions.push({
            ...activity,
            id: loginSessions.length + 1,
            loginTime: null,
            abnormal: true
          });
        }
      }
    });
    
    // Sắp xếp kết quả theo thời gian đăng nhập giảm dần (mới nhất lên đầu)
    return loginSessions.sort((a, b) => 
      new Date(b.loginTime || b.logoutTime) - new Date(a.loginTime || a.logoutTime)
    );
  }, []);

  // Tạo dữ liệu mẫu nếu cần
  const generateMockData = useCallback(() => {
    const users = [
      { username: 'admin', fullName: 'Administrator', role: 'VT01' },
      { username: 'TNphuong', fullName: 'Trần Nam Phương', role: 'VT02' },
      { username: 'PPcuong', fullName: 'Phạm Phi Cường', role: 'VT02' },
      { username: 'staff1', fullName: 'Nhân viên 1', role: 'VT03' }
    ];
        
    const mockData = [];
    
    // Tạo dữ liệu mẫu cho 30 ngày gần đây
    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      
      const loginTime = moment().subtract(randomDaysAgo, 'days').hour(randomHour).minute(randomMinute);
      const logoutTime = Math.random() > 0.3 ? loginTime.clone().add(Math.floor(Math.random() * 5) + 1, 'hours') : null;
      
      mockData.push({
        id: i + 1,
        username: randomUser.username,
        fullName: randomUser.fullName,
        role: randomUser.role,
        loginTime: loginTime.format('YYYY-MM-DD HH:mm:ss'),
        logoutTime: logoutTime ? logoutTime.format('YYYY-MM-DD HH:mm:ss') : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        device: Math.random() > 0.7 ? 'Mobile' : 'Desktop',
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
      });
    }
    
    return mockData.sort((a, b) => moment(b.loginTime).valueOf() - moment(a.loginTime).valueOf());
  }, []);

  // Tải dữ liệu lịch sử hoạt động
  const fetchLoginData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Gọi API thực tế để lấy dữ liệu lịch sử hoạt động
      const response = await axios.get('https://dx.hoangphucthanh.vn:3000/admin/activity/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Dữ liệu lịch sử hoạt động:', response.data);
        
        // Xử lý dữ liệu từ API
        const activityData = response.data.data.map((item, index) => {
          // Phân tích thông tin trình duyệt từ user_agent
          const browserInfo = getBrowserInfo(item.user_agent);
          
          // Đảm bảo timestamp sử dụng giờ địa phương
          const timestamp = item.timestamp ? moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss') : null;
          
          return {
            id: index + 1,
            username: item.ma_nguoi_dung || item.user?.ten_dang_nhap || 'N/A',
            fullName: item.user?.ho_va_ten || 'Người dùng không xác định',
            role: item.vai_tro || 'VT03', // Giả định vai trò nếu không có
            loginTime: item.activity_type === 'login' ? timestamp : null,
            logoutTime: item.activity_type === 'logout' ? timestamp : null,
            ipAddress: item.ip_address || 'N/A',
            device: browserInfo.device,
            browser: browserInfo.browser,
            activityType: item.activity_type,
            rawData: item // Lưu dữ liệu gốc để tham khảo nếu cần
          };
        });
        
        // Xử lý cặp login/logout
        const processedData = processLoginLogoutPairs(activityData);
        
        // Tạo danh sách người dùng để lọc
        const users = [...new Set(processedData.map(item => item.username))]
          .filter(username => username && username !== 'N/A')
          .map(username => {
            const user = processedData.find(item => item.username === username);
            return {
              username,
              displayName: user.fullName || username
            };
          });
        
        setUserList(users);
        setLoginData(processedData);
        setFilteredData(processedData);
      } else {
        throw new Error(response.data?.message || 'Dữ liệu không hợp lệ từ API');
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lịch sử đăng nhập:', error);
      setErrorMessage(error.message || 'Không thể tải dữ liệu lịch sử đăng nhập');
      message.error('Không thể tải dữ liệu lịch sử đăng nhập. Đang sử dụng dữ liệu mẫu.');
      
      // Sử dụng dữ liệu mẫu khi không thể kết nối tới API
      const mockData = generateMockData();
      setLoginData(mockData);
      setFilteredData(mockData);
      
      // Tạo danh sách người dùng mẫu
      const mockUsers = [...new Set(mockData.map(item => item.username))]
        .map(username => {
          const user = mockData.find(item => item.username === username);
          return {
            username,
            displayName: user.fullName || username
          };
        });
      setUserList(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Reset các bộ lọc
  const handleReset = () => {
    setSearchText('');
    setDateRange([]);
    setUserFilter(null);
    setFilteredData(loginData);
  };

  // Xuất dữ liệu sang CSV
  const exportCSV = () => {
    // Định dạng dữ liệu cho CSV
    const csvContent = [
      // CSV header
      ['STT', 'Tên đăng nhập', 'Họ và tên', 'Vai trò', 'Thời gian đăng nhập', 'Thời gian đăng xuất', 'Địa chỉ IP', 'Thiết bị', 'Trình duyệt'],
      // CSV rows
      ...filteredData.map(item => [
        item.id,
        item.username,
        item.fullName,
        item.role === 'VT01' ? 'Admin' : item.role === 'VT02' ? 'Quản lý' : 'Nhân viên',
        item.loginTime ? moment(item.loginTime).format('DD/MM/YYYY HH:mm:ss') : 'N/A',
        item.logoutTime ? moment(item.logoutTime).format('DD/MM/YYYY HH:mm:ss') : 'Chưa đăng xuất',
        item.ipAddress,
        item.device,
        item.browser
      ])
    ]
    .map(row => row.join(','))
    .join('\n');
    
    // Tạo blob từ nội dung CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Tạo URL có thể download từ blob
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Thiết lập thuộc tính link download
    link.href = url;
    link.setAttribute('download', `lich-su-dang-nhap-${moment().format('DD-MM-YYYY')}.csv`);
    
    // Thêm link vào document, click để bắt đầu download, và xóa nó
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Đã xuất file CSV thành công');
  };

  // Định nghĩa các cột của bảng
  const columns = useMemo(() => [
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
        text ? 
        <Tooltip title={`Giờ địa phương: ${moment(text).format('DD/MM/YYYY HH:mm:ss')}`}>
          <span>
            <ClockCircleOutlined /> {moment(text).format('DD/MM/YYYY HH:mm:ss')}
          </span>
        </Tooltip> : 
        <Tag color="red">Không xác định</Tag>
      ),
    },
    {
      title: 'Thời gian đăng xuất',
      dataIndex: 'logoutTime',
      key: 'logoutTime',
      width: 180,
      render: (text, record) => (
        text ? 
        <Tooltip title={`Giờ địa phương: ${moment(text).format('DD/MM/YYYY HH:mm:ss')}`}>
          <span>
            <ClockCircleOutlined /> {moment(text).format('DD/MM/YYYY HH:mm:ss')}
          </span>
        </Tooltip> : 
        record.abnormal ? 
        <Tag color="red">Bất thường</Tag> : 
        <Tag color="orange">Đang hoạt động</Tag>
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
  ], []);

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 120px)', overflow: 'auto' }}>
      <Card style={{ height: '100%' }}>
        <Title level={3}>Quản trị hệ thống - Lịch sử đăng nhập</Title>
        
        {errorMessage && (
          <div style={{ marginBottom: 16, color: 'red' }}>
            <InfoCircleOutlined /> {errorMessage}
          </div>
        )}
        
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
                disabled={filteredData.length === 0}
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
          scroll={{ x: 1300, y: 'calc(100vh - 350px)' }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Tổng ${total} bản ghi`,
            showQuickJumper: true
          }}
          loading={loading}
          locale={{
            emptyText: 'Không có dữ liệu',
            filterConfirm: 'Đồng ý',
            filterReset: 'Đặt lại',
            selectAll: 'Chọn tất cả dữ liệu trang này',
            selectInvert: 'Đảo ngược lựa chọn trang này'
          }}
        />
      </Card>
    </div>
  );
};

export default Administration;