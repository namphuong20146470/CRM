import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setExistingBills - Hàm set state cho danh sách bill.
 */
export const fetchPreviewData = (setAccounts, setExistingBills) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách người dùng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/bills',
    setExistingBills,
    'Không thể tải danh sách bill'
  );
};

/**
 * Kiểm tra xem bill có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} existingBills - Danh sách bill hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isBillExisting = (value, existingBills) => {
  return existingBills.some(
    (item) => item.ma_bill === value
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
 * Hàm render cột "Số đơn hàng".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingBills - Danh sách bill hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderMaBill = (text, record, errorItems, existingBills) => {
  const customError = isBillExisting(text, existingBills) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Mã bill', customError);
};

/**
 * Hàm render cột "Người cập nhật".
 * @param {string} maNguoiDung - Mã người dùng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} accounts - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderNguoiCapNhat = (maNguoiDung, record, accounts, errorItems) => {
  if (record.invalidNguoiCapNhat) {
    return renderWithErrorHighlight('', record, errorItems, 'Người cập nhật', '(Không tồn tại)');
  }

  if (!maNguoiDung || maNguoiDung.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Người cập nhật');
  }

  const account = accounts.find((acc) => acc.ma_nguoi_dung === maNguoiDung);
  return renderWithErrorHighlight(account?.ho_va_ten || maNguoiDung, record, errorItems, 'Người cập nhật');
};