import moment from 'moment';
import 'moment/locale/vi';

// Cấu hình moment.js sử dụng múi giờ Việt Nam và ngôn ngữ tiếng Việt
moment.locale('vi');

/**
 * Định dạng thời gian theo múi giờ Việt Nam
 * @param {string} timestamp - Thời gian cần định dạng
 * @returns {string} - Thời gian đã định dạng theo múi giờ Việt Nam
 */
export const formatVietnamTime = (timestamp) => {
  if (!timestamp) return null;
  return moment(timestamp).utcOffset('+07:00').format('DD/MM/YYYY HH:mm:ss');
};

/**
 * Xử lý cặp login/logout để hiển thị đúng
 * @param {Array} activities - Danh sách hoạt động
 * @returns {Array} - Danh sách phiên đăng nhập đã xử lý
 */
export const processLoginLogoutPairs = (activities) => {
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
};