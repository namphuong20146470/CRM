import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setExistingContractTypes - Hàm set state cho danh sách loại hợp đồng.
 */
export const fetchPreviewData = (setAccounts, setExistingContractTypes) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách người dùng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/contract-types',
    setExistingContractTypes,
    'Không thể tải danh sách loại hợp đồng'
  );
};

/**
 * Kiểm tra xem loại hợp đồng có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} existingContractTypes - Danh sách loại hợp đồng hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isContractTypeExisting = (value, existingContractTypes) => {
  return existingContractTypes.some(
    (item) => item.ten_loai_hop_dong === value
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
 * Hàm render cột "Mã loại hợp đồng".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingContractTypes - Danh sách loại hợp đồng hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
// ...renderMaLoaiHopDong không cần kiểm tra trùng mã nữa, chỉ cần hiển thị mã tự sinh...
export const renderMaLoaiHopDong = (text, record, errorItems) => {
  return renderWithErrorHighlight(text, record, errorItems, 'Mã loại hợp đồng');
};

/**
 * Hàm render cột "Khách hàng".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingContractTypes - Danh sách loại hợp đồng hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderTenLoaiHopDong = (text, record, errorItems, existingContractTypes) => {
  const customError = isContractTypeExisting(text, existingContractTypes) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Loại hợp đồng', customError);
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