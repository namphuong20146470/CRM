import { renderWithErrorHighlight } from '../../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setProductTypes - Hàm set state cho danh sách loại hàng.
 * @param {function} setSuppliers - Hàm set state cho danh sách nhà cung cấp.
 */
export const fetchPreviewData = (setAccounts, setProductTypes, setSuppliers) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách người dùng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/product-types',
    setProductTypes,
    'Không thể tải danh sách loại hàng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/suppliers',
    setSuppliers,
    'Không thể tải danh sách nhà cung cấp'
  );
};

/**
 * Kiểm tra xem loại hàng có tồn tại không (theo mã hoặc tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} product_types - Danh sách loại hàng.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isProductTypeExisting = (value, product_types) => {
  return product_types.some(
    (pt) => pt.ma_loai_hang === value || pt.ten_loai_hang === value
  );
};

/**
 * Kiểm tra xem nhà cung cấp có tồn tại không (theo mã hoặc tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} suppliers - Danh sách nhà cung cấp.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isSupplierExisting = (value, suppliers) => {
  return suppliers.some(
    (sup) => sup.ma_nha_cung_cap === value || sup.ten_nha_cung_cap === value
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
 */
export const renderMaHang = (text, record, errorItems) => {
  if (!text || text.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Mã hàng');
  }
  return renderWithErrorHighlight(text, record, errorItems, 'Mã hàng');
};

/**
 * Hàm render cột "Tên hàng".
 */
export const renderTenHang = (text, record, errorItems) => {
  if (!text || text.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Tên hàng');
  }
  return renderWithErrorHighlight(text, record, errorItems, 'Tên hàng');
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

/**
 * Hàm render cột "Tên loại hàng".
 * @param {string} maLoaiHang - Mã loại hàng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} product_types - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderLoaiHang = (maLoaiHang, record, product_types, errorItems) => {
  if (record.invalidTenLoaiHang) {
    return renderWithErrorHighlight('', record, errorItems, 'Loại hàng', '(Không tồn tại)');
  }

  if (!maLoaiHang || maLoaiHang.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Loại hàng');
  }

  const product_type = product_types.find((acc) => acc.ma_loai_hang === maLoaiHang);
  return renderWithErrorHighlight(product_type?.ten_loai_hang || maLoaiHang, record, errorItems, 'Tên loại hàng');
};

/**
 * Hàm render cột "Nhà cung cấp".
 * @param {string} maNhaCungCap - Mã người dùng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} suppliers - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderNhaCungCap = (maNhaCungCap, record, suppliers, errorItems) => {
  if (record.invalidTenNhaCungCap) {
    return renderWithErrorHighlight('', record, errorItems, 'Nhà cung cấp', '(Không tồn tại)');
  }

  if (!maNhaCungCap || maNhaCungCap.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Nhà cung cấp');
  }

  const supplier = suppliers.find((acc) => acc.ma_nha_cung_cap === maNhaCungCap);
  return renderWithErrorHighlight(supplier?.ten_nha_cung_cap || maNhaCungCap, record, errorItems, 'Nhà cung cấp');
};