import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setProducts - Hàm set state cho danh sách hàng hóa.
 * @param {function} setContracts - Hàm set state cho danh sách hợp đồng.
 * @param {function} setOrders - Hàm set state cho danh sách đơn hàng.
 * @param {function} setCustomers - Hàm set state cho danh sách khách hàng.
 * @param {function} setAccounts - Hàm set state cho danh sách tài khoản.
 * @param {function} setBills - Hàm set state cho danh sách bill.
 * @param {function} setExistingOrderDetail - Hàm set state cho danh sách loại hàng.
 */
export const fetchPreviewData = (setProducts, setContracts, setOrders, setCustomers, setAccounts, setBills, setExistingOrderDetail) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/products',
    setProducts,
    'Không thể tải danh sách hàng hóa'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/contracts',
    setContracts,
    'Không thể tải danh sách hợp đồng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/orders',
    setOrders,
    'Không thể tải danh sách đơn hàng'
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
    'https://dx.hoangphucthanh.vn:3000/warehouse/bills',
    setBills,
    'Không thể tải danh sách bill'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/order-details',
    setExistingOrderDetail,
    'Không thể tải danh sách chi tiết đơn hàng'
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
 * Kiểm tra xem hợp đồng có tồn tại không (theo mã hoặc họ và tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} contracts - Danh sách hợp đồng.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isContractExisting = (value, contracts) => {
  return contracts.some(
    (ct) => ct.so_hop_dong === value
  );
};

/**
 * Kiểm tra xem đơn hàng có tồn tại không (theo mã hoặc họ và tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} orders - Danh sách đơn hàng.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isOrderExisting = (value, orders) => {
  return orders.some(
    (od) => od.so_don_hang === value
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
 * Kiểm tra xem bill có tồn tại không (theo mã hoặc họ và tên).
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} bills - Danh sách bill.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isBillExisting = (value, bills) => {
  return bills.some(
    (cust) => cust.ma_bill === value
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
 * Hàm render cột "Số hợp đồng".
 * @param {string} soHopDong - Số hợp đồng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} contracts - Danh sách hợp đồng.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderMaHopDong = (soHopDong, record, contracts, errorItems) => {
  if (record.invalidMaHopDong) {
    return renderWithErrorHighlight('', record, errorItems, 'Hợp đồng', '(Không tồn tại)');
  }

  if (!soHopDong || soHopDong.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Hợp đồng');
  }

  const contract = contracts.find((ct) => ct.so_hop_dong === soHopDong);
  return renderWithErrorHighlight(contract?.so_hop_dong || soHopDong, record, errorItems, 'Hợp đồng');
};

/**
 * Hàm render cột "Số xác nhận đơn hàng".
 * @param {string} soDonHang - Số đơn hàng.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} orders - Danh sách đơn hàng.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderSoXacNhanDonHang = (soDonHang, record, orders, errorItems) => {
  if (record.invalidSoXacNhanDonHang) {
    return renderWithErrorHighlight('', record, errorItems, 'Số xác nhận đơn hàng', '(Không tồn tại)');
  }

  if (!soDonHang || soDonHang.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Số xác nhận đơn hàng');
  }

  const order = orders.find((od) => od.so_don_hang === soDonHang);
  return renderWithErrorHighlight(order?.so_don_hang || soDonHang, record, errorItems, 'Số xác nhận đơn hàng');
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

// /**
//  * Hàm render cột "Bill".
//  * @param {string} maBill - Mã bill.
//  * @param {object} record - Dữ liệu của dòng hiện tại.
//  * @param {array} bills - Danh sách bill.
//  * @param {array} errorItems - Danh sách lỗi.
//  * @returns {JSX.Element} - Nội dung hiển thị trong ô.
//  */
// export const renderHawb = (maBill, record, bills, errorItems, fieldLabel = 'HAWB 1') => {
//   const field = fieldLabel.toLowerCase().replace(/\s/g, '_'); // 'HAWB 1' -> 'hawb_1'
//   const invalidKey = `invalid${field.charAt(0).toUpperCase() + field.slice(1)}`; // 'invalidHawb_1'
//   if (record[invalidKey]) {
//     return renderWithErrorHighlight('', record, errorItems, fieldLabel, '(Không tồn tại)');
//   }
//   if (!maBill || maBill.trim() === '') {
//     return renderWithErrorHighlight('(Trống)', record, errorItems, fieldLabel);
//   }
//   const bill = bills.find((b) => b.ma_bill === maBill);
//   return renderWithErrorHighlight(bill?.ma_bill || maBill, record, errorItems, fieldLabel);
// };

/**
 * Hàm render cột "Bill".
 * @param {string} hawb - Mã bill.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} bills - Danh sách bill.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderHawb = (hawb, record, bills, errorItems, fieldLabel) => {
  // fieldLabel: 'HAWB 1', 'HAWB 2', ...
  const fieldNum = fieldLabel.split(' ')[1]; // '1', '2', ...
  const invalidKey = `invalidHawb${fieldNum}`;
  if (record[invalidKey]) {
    return renderWithErrorHighlight('', record, errorItems, fieldLabel, '(Không tồn tại)');
  }
  if (!hawb || hawb.toString().trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, fieldLabel);
  }
  const bill = bills.find((b) => b.ma_bill === hawb);
  return renderWithErrorHighlight(bill?.ma_bill || hawb, record, errorItems, fieldLabel);
};