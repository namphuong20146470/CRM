import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setExistingCustomers - Hàm set state cho danh sách khách hàng.
 */
export const fetchPreviewData = (setAccounts, setExistingCustomers) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách người dùng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/customers',
    setExistingCustomers,
    'Không thể tải danh sách khách hàng'
  );
};

/**
 * Kiểm tra xem khách hàng có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} existingCustomers - Danh sách khách hàng hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isCustomerExisting = (value, existingCustomers) => {
  return existingCustomers.some(
    (cust) => cust.ma_khach_hang === value || cust.ten_khach_hang === value
  );
};

/**
 * Kiểm tra xem tài khoản có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} accounts - Danh sách tài khoản.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isAccountExisting = (value, accounts) => {
  return accounts.some((acc) => acc.ma_nguoi_dung === value);
};

/**
 * Hàm render cột "Mã khách hàng".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingCustomers - Danh sách khách hàng hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderMaKhachHang = (text, record, errorItems, existingCustomers) => {
  const customError = isCustomerExisting(text, existingCustomers) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Mã khách hàng', customError);
};

/**
 * Hàm render cột "Khách hàng".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingCustomers - Danh sách khách hàng hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderTenKhachHang = (text, record, errorItems, existingCustomers) => {
  const customError = isCustomerExisting(text, existingCustomers) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Khách hàng', customError);
};

/**
 * Hàm render cột "Người phụ trách".
 * @param {string} maNguoiDung - Mã người dùng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} accounts - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderNguoiPhuTrach = (maNguoiDung, record, accounts, errorItems) => {
  if (record.invalidNguoiPhuTrach) {
    return renderWithErrorHighlight('', record, errorItems, 'Người phụ trách', '(Không tồn tại)');
  }

  if (!maNguoiDung || maNguoiDung.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Người phụ trách');
  }

  const account = accounts.find((acc) => acc.ma_nguoi_dung === maNguoiDung);
  return renderWithErrorHighlight(account?.ho_va_ten || maNguoiDung, record, errorItems, 'Người phụ trách');
};