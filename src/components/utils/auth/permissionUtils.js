const FULL_ACCESS_ROLES = ['VT01', 'VT02']; // Super Admin, Admin

/**
 * Kiểm tra user hiện tại có quyền thao tác (thêm, sửa, xóa, import) với bảng không.
 * @param {object} [user] - Thông tin user (nếu không truyền sẽ lấy từ localStorage)
 * @param {object} [options] - { allowedRoles, allowedUsernames }
 * @returns {boolean}
 */
export function hasFullPermission(user, options = {}) {
  let currentUser = user;
  if (!currentUser) {
    try {
      currentUser = JSON.parse(localStorage.getItem('userData'));
    } catch {
      return false;
    }
  }
  if (!currentUser) return false;

  // Lấy danh sách role và username được phép
  const allowedRoles = options.allowedRoles || FULL_ACCESS_ROLES;
  const allowedUsernames = options.allowedUsernames || [];

  // Kiểm tra theo role hoặc username
  return (
    allowedRoles.includes(currentUser.vai_tro) ||
    allowedRoles.includes(currentUser.role) ||
    allowedUsernames.includes(currentUser.ten_dang_nhap)
  );
}

/**
 * Lấy user hiện tại từ localStorage
 */
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('userData'));
  } catch {
    return null;
  }
}