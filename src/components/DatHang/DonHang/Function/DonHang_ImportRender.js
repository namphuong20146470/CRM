import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setExistingOrders - Hàm set state cho danh sách order.
 */
export const fetchPreviewData = (setAccounts, setExistingOrders) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách người dùng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/orders',
    setExistingOrders,
    'Không thể tải danh sách order'
  );
};

/**
 * Kiểm tra xem order có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} existingOrders - Danh sách order hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isOrderExisting = (value, existingOrders) => {
  return existingOrders.some(
    (item) => item.so_don_hang === value
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
 * Hàm render cột "Mã order".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingOrders - Danh sách order hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
// ...renderSoDonHang không cần kiểm tra trùng mã nữa, chỉ cần hiển thị mã tự sinh...
export const renderSoDonHang = (text, record, errorItems, existingOrders) => {
  const customError = isOrderExisting(text, existingOrders) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Số đơn hàng', customError);
};

/**
 * Hàm render cột "Người lập đơn".
 * @param {string} maNguoiDung - Mã người dùng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} accounts - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderNguoiLapDon = (maNguoiDung, record, accounts, errorItems) => {
  if (record.invalidNguoiLapDon) {
    return renderWithErrorHighlight('', record, errorItems, 'Người lập đơn', '(Không tồn tại)');
  }

  if (!maNguoiDung || maNguoiDung.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Người lập đơn');
  }

  const account = accounts.find((acc) => acc.ma_nguoi_dung === maNguoiDung);
  return renderWithErrorHighlight(account?.ho_va_ten || maNguoiDung, record, errorItems, 'Người lập đơn');
};