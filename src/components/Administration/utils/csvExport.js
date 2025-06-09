import moment from 'moment';
import { formatVietnamTime } from './timeUtils';

/**
 * Xuất dữ liệu sang định dạng CSV và tải về
 * @param {Array} filteredData - Dữ liệu cần xuất
 */
export const exportLoginHistoryToCSV = (filteredData) => {
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
      item.loginTime ? formatVietnamTime(item.loginTime) : 'N/A',
      item.logoutTime ? formatVietnamTime(item.logoutTime) : 'Chưa đăng xuất',
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
  
  return 'Đã xuất file CSV thành công';
};