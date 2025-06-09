import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import axios from 'axios';
import { getBrowserInfo, generateMockData } from '../utils/browserUtils';
import { processLoginLogoutPairs } from '../utils/timeUtils';

/**
 * Custom hook quản lý dữ liệu lịch sử đăng nhập
 * @returns {Object} - Các state và hàm xử lý
 */
export const useLoginHistory = () => {
  const [loginData, setLoginData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [userFilter, setUserFilter] = useState(null);
  const [userList, setUserList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

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
      const startDate = dateRange[0].utcOffset('+07:00').startOf('day');
      const endDate = dateRange[1].utcOffset('+07:00').endOf('day');
      
      result = result.filter(item => {
        const loginDate = item.loginTime ? moment(item.loginTime).utcOffset('+07:00') : null;
        const logoutDate = item.logoutTime ? moment(item.logoutTime).utcOffset('+07:00') : null;
        
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
  // Thêm vào file useLoginHistory.js
// Tải dữ liệu khi component mount
useEffect(() => {
  fetchLoginData();
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
            // Sửa lại phần xử lý dữ liệu trong fetchLoginData
            const activityData = response.data.data.map((item, index) => {
            // Phân tích thông tin trình duyệt từ user_agent
            const browserInfo = getBrowserInfo(item.user_agent);
            
            return {
                id: index + 1,
                username: item.ma_nguoi_dung || item.user?.ten_dang_nhap || 'N/A',
                fullName: item.user?.ho_va_ten || 'Người dùng không xác định',
                role: item.vai_tro || 'VT03', // Giả định vai trò nếu không có
                loginTime: item.activity_type === 'login' ? item.timestamp : null, // Lưu timestamp gốc
                logoutTime: item.activity_type === 'logout' ? item.timestamp : null, // Lưu timestamp gốc
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

  return {
    loginData,
    filteredData,
    loading,
    searchText,
    setSearchText,
    dateRange,
    setDateRange,
    userFilter,
    setUserFilter,
    userList,
    errorMessage,
    fetchLoginData,
    handleReset
  };
};