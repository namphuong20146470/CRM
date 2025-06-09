/**
 * Phân tích thông tin trình duyệt từ user_agent
 * @param {string} userAgent - Chuỗi user agent từ request
 * @returns {Object} - Thông tin về thiết bị và trình duyệt
 */
export const getBrowserInfo = (userAgent) => {
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
};

/**
 * Tạo dữ liệu mẫu cho trường hợp không kết nối được API
 * @returns {Array} - Dữ liệu mẫu
 */
export const generateMockData = () => {
  const users = [
    { username: 'admin', fullName: 'Administrator', role: 'VT01' },
    { username: 'TNphuong', fullName: 'Trần Nam Phương', role: 'VT02' },
    { username: 'PPcuong', fullName: 'Phạm Phi Cường', role: 'VT02' },
    { username: 'staff1', fullName: 'Nhân viên 1', role: 'VT03' }
  ];
      
  const mockData = [];
  const moment = require('moment');
  
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
      activityType: logoutTime ? 'login' : Math.random() > 0.5 ? 'login' : 'logout'
    });
  }
  
  return mockData.sort((a, b) => moment(b.loginTime).valueOf() - moment(a.loginTime).valueOf());
};