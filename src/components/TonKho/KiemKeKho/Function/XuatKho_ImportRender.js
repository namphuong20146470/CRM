import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setProducts - Hàm set state cho danh sách hàng hóa.
 * @param {function} setWarehouses - Hàm set state cho danh sách kho lưu trữ.
 * @param {function} setCustomers - Hàm set state cho danh sách khách hàng.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setExistingStockIn - Hàm set state cho danh sách nhập kho.
 * @param {function} setExistingStockOut - Hàm set state cho danh sách xuất kho.
 */
export const fetchPreviewData = (setProducts, setWarehouses, setCustomers, setAccounts, setExistingStockIn, setExistingStockOut) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/products',
    setProducts,
    'Không thể tải danh sách hàng hóa'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/warehouses',
    setWarehouses,
    'Không thể tải danh sách kho lưu trữ'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/customers',
    setCustomers,
    'Không thể tải danh sách khách hàng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/accounts',
    setAccounts,
    'Không thể tải danh sách tài khoản'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/stock-in',
    setExistingStockIn,
    'Không thể tải danh sách nhập kho'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/stock-out',
    setExistingStockOut,
    'Không thể tải danh sách xuất kho'
  );
};

/**
 * Kiểm tra xem hàng hóa có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} products - Danh sách hàng hóa hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isProductExisting = (value, products) => {
  return products.some(
    (pd) => pd.ma_hang === value || pd.ten_hang === value
  );
};

/**
 * Kiểm tra xem kho lưu trữ có tồn tại không (theo mã hoặc tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} warehouses - Danh sách kho lưu trữ.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isWarehouseExisting = (value, warehouses) => {
  return warehouses.some(
    (wh) => wh.ma_kho === value || wh.ten_kho === value
  );
};

/**
 * Kiểm tra xem khách hàng có tồn tại không (theo mã hoặc họ và tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} customers - Danh sách khách hàng.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isCustomerExisting = (value, customers) => {
  return customers.some(
    (cust) => cust.ma_khach_hang === value || cust.ten_khach_hang === value
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
    (ac) => ac.ma_nguoi_dung === value || ac.ho_va_ten === value
  );
};

/**
 * Hàm render cột "Mã hàng".
 * @param {string} maHang - Mã hàng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} products - Danh sách hàng hóa.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderMaHang = (maHang, record, products, errorItems) => {
  if (record.invalidMaHang) {
    return renderWithErrorHighlight('', record, errorItems, 'Mã hàng', '(Không tồn tại)');
  }

  if (!maHang || maHang.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Mã hàng');
  }

  const product = products.find((pd) => pd.ma_hang === maHang);
  return renderWithErrorHighlight(product?.ma_hang || maHang, record, errorItems, 'Mã hàng');
};

/**
 * Hàm render cột "Tên kho lưu trữ".
 * @param {string} maKho - Mã kho lưu trữ.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} warehouses - Danh sách kho lưu trữ.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderTenKho = (maKho, record, warehouses, errorItems) => {
  if (record.invalidTenKho) {
    return renderWithErrorHighlight('', record, errorItems, 'Kho', '(Không tồn tại)');
  }

  if (!maKho || maKho.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Kho');
  }

  const warehouse = warehouses.find((wh) => wh.ma_kho === maKho);
  return renderWithErrorHighlight(warehouse?.ten_kho || maKho, record, errorItems, 'Kho');
};

/**
 * Hàm render cột "Khách hàng".
 * @param {string} maKhachHang - Mã khách hàng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} customers - Danh sách khách hàng.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderTenKhachHang = (maKhachHang, record, customers, errorItems) => {
  if (record.invalidTenKhachHang) {
    return renderWithErrorHighlight('', record, errorItems, 'Khách hàng', '(Không tồn tại)');
  }

  if (!maKhachHang || maKhachHang.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Khách hàng');
  }

  const customer = customers.find((cust) => cust.ma_khach_hang === maKhachHang);
  return renderWithErrorHighlight(customer?.ten_khach_hang || maKhachHang, record, errorItems, 'Khách hàng');
};

/**
 * Hàm render cột "Số tài khoản".
 * @param {string} maNguoiDung - Số tài khoản.
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

  const account = accounts.find((ac) => ac.ma_nguoi_dung === maNguoiDung);
  return renderWithErrorHighlight(account?.ho_va_ten || maNguoiDung, record, errorItems, 'Người phụ trách');
};

/**
 * Render cột "Số lượng xuất" với kiểm tra tồn kho
 */
export const renderSoLuongXuat = (soLuong, record, errorItems) => {
  const displayValue = (soLuong === null || soLuong === undefined) ? '' : soLuong.toString();
  if (record.invalidSoLuongXuat) {
    return renderWithErrorHighlight(
      displayValue,
      record,
      errorItems,
      'Số lượng',
      `(Vượt tồn kho: ${record.tonKhoHienCo ?? 0})`
    );
  }
  return renderWithErrorHighlight(displayValue, record, errorItems, 'Số lượng');
};