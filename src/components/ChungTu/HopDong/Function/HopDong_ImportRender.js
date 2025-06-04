import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setContractTypes - Hàm set state cho danh sách hợp đồng.
 * @param {function} setExistingContracts - Hàm set state cho danh sách hàng.
 */
export const fetchPreviewData = (setAccounts, setContractTypes, setExistingContracts) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách người dùng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/contract-types',
    setContractTypes,
    'Không thể tải danh sách loại hợp đồng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/contracts',
    setExistingContracts,
    'Không thể tải danh sách hợp đồng'
  );
};

/**
 * Kiểm tra xem hàng có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} existingContracts - Danh sách hàng hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isContractExisting = (value, existingContracts) => {
  return existingContracts.some(
    (cust) => cust.so_hop_dong === value
  );
};

/**
 * Kiểm tra xem hợp đồng có tồn tại không (theo mã hoặc tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} contract_types - Danh sách hợp đồng.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isContractTypeExisting = (value, contract_types) => {
  return contract_types.some(
    (ct) => ct.ma_loai_hop_dong === value || ct.ten_loai_hop_dong === value
  );
};

/**
 * Kiểm tra xem tài khoản có tồn tại không (theo mã hoặc họ và tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} accounts - Danh sách tài khoản.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isAccountExisting = (value, accounts) => {
  return accounts.some(
    (acc) => acc.ma_nguoi_dung === value || acc.ho_va_ten === value
  );
};

/**
 * Hàm render cột "Mã hàng".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingContracts - Danh sách hàng hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderSoHopDong = (text, record, errorItems, existingContracts) => {
  const customError = isContractExisting(text, existingContracts) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Số hợp đồng', customError);
};

/**
 * Hàm render cột "Người tạo".
 * @param {string} maNguoiDung - Mã người dùng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} accounts - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderNguoiTao = (maNguoiDung, record, accounts, errorItems) => {
  if (record.invalidNguoiTao) {
    return renderWithErrorHighlight('', record, errorItems, 'Người tạo', '(Không tồn tại)');
  }

  if (!maNguoiDung || maNguoiDung.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Người tạo');
  }

  const account = accounts.find((acc) => acc.ma_nguoi_dung === maNguoiDung);
  return renderWithErrorHighlight(account?.ho_va_ten || maNguoiDung, record, errorItems, 'Người tạo');
};

/**
 * Hàm render cột "Tên hợp đồng".
 * @param {string} maLoaiHopDong - Mã hợp đồng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} contract_types - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderLoaiHopDong = (maLoaiHopDong, record, contract_types, errorItems) => {
  if (record.invalidLoaiHopDong) {
    return renderWithErrorHighlight('', record, errorItems, 'Loại hợp đồng', '(Không tồn tại)');
  }

  if (!maLoaiHopDong || maLoaiHopDong.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Loại hợp đồng');
  }

  const contract_type = contract_types.find((acc) => acc.ma_loai_hop_dong === maLoaiHopDong);
  return renderWithErrorHighlight(contract_type?.ten_loai_hop_dong || maLoaiHopDong, record, errorItems, 'Tên loại hợp đồng');
};