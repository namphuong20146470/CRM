import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setNhomKhachHang - Hàm set state cho danh sách nhóm khách hàng.
 * @param {function} setNguonCoHoi - Hàm set state cho danh sách nguồn cơ hội.
 * @param {function} setExistingKhachHang - Hàm set state cho danh sách khách hàng tiềm năng.
 */
export const fetchPreviewData = (setAccounts, setNhomKhachHang, setNguonCoHoi, setExistingKhachHang) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách người dùng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/crm/customer-groups',
    setNhomKhachHang,
    'Không thể tải danh sách nhóm khách hàng',
    'crm'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/crm/opportunity-sources',
    setNguonCoHoi,
    'Không thể tải danh sách nguồn cơ hội',
    'crm'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/crm/potential-customers',
    setExistingKhachHang,
    'Không thể tải danh sách khách hàng tiềm năng',
    'crm'
  );
};

/**
 * Kiểm tra xem khách hàng có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} existingKhachHang - Danh sách khách hàng hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isKhachHangExisting = (value, existingKhachHang) => {
  return existingKhachHang.some(
    (kh) => kh.ma_khach_hang === value
  );
};

/**
 * Kiểm tra xem nhóm khách hàng có tồn tại không (theo mã hoặc tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} nhomKhachHang - Danh sách nhóm khách hàng.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isNhomKhachHangExisting = (value, nhomKhachHang) => {
  return nhomKhachHang.some(
    (nhom) => nhom.ma_nhom_khach_hang === value || nhom.nhom_khach_hang === value
  );
};

/**
 * Kiểm tra xem nguồn cơ hội có tồn tại không (theo mã hoặc tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} nguonCoHoi - Danh sách nguồn cơ hội.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isNguonCoHoiExisting = (value, nguonCoHoi) => {
  return nguonCoHoi.some(
    (nguon) => nguon.ma_nguon === value || nguon.nguon === value
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
 * Hàm render cột "Mã khách hàng".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingKhachHang - Danh sách khách hàng hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderMaKhachHang = (text, record, errorItems, existingKhachHang) => {
  const customError = isKhachHangExisting(text, existingKhachHang) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Mã khách hàng', customError);
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

/**
 * Hàm render cột "Nhóm khách hàng".
 * @param {string} maNhom - Mã nhóm khách hàng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} nhomKhachHang - Danh sách nhóm khách hàng.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderNhomKhachHang = (maNhom, record, nhomKhachHang, errorItems) => {
  if (record.invalidNhomKhachHang) {
    return renderWithErrorHighlight('', record, errorItems, 'Nhóm khách hàng', '(Không tồn tại)');
  }

  if (!maNhom || maNhom.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Nhóm khách hàng');
  }

  const nhom = nhomKhachHang.find((item) => item.ma_nhom_khach_hang === maNhom);
  return renderWithErrorHighlight(nhom?.nhom_khach_hang || maNhom, record, errorItems, 'Nhóm khách hàng');
};

/**
 * Hàm render cột "Nguồn cơ hội".
 * @param {string} maNguon - Mã nguồn cơ hội.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} nguonCoHoi - Danh sách nguồn cơ hội.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderNguonCoHoi = (maNguon, record, nguonCoHoi, errorItems) => {
  if (record.invalidNguonCoHoi) {
    return renderWithErrorHighlight('', record, errorItems, 'Nguồn cơ hội', '(Không tồn tại)');
  }

  if (!maNguon || maNguon.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Nguồn cơ hội');
  }

  const nguon = nguonCoHoi.find((item) => item.ma_nguon === maNguon);
  return renderWithErrorHighlight(nguon?.nguon || maNguon, record, errorItems, 'Nguồn cơ hội');
};