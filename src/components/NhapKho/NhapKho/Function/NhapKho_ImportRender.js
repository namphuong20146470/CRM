import { renderWithErrorHighlight } from '../../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setProducts - Hàm set state cho danh sách hàng hóa.
 * @param {function} setSuppliers - Hàm set state cho danh sách nhà cung cấp.
 * @param {function} setWarehouses - Hàm set state cho danh sách kho lưu trữ.
 * @param {function} setBills - Hàm set state cho danh sách bill.
 * @param {function} setContracts - Hàm set state cho danh sách hợp đồng.
 * @param {function} setExistingStockIn - Hàm set state cho danh sách loại hàng.
 */
export const fetchPreviewData = (setProducts, setSuppliers, setWarehouses, setBills, setContracts, setExistingStockIn) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/products',
    setProducts,
    'Không thể tải danh sách hàng hóa'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/suppliers',
    setSuppliers,
    'Không thể tải danh sách nhà cung cấp'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/warehouses',
    setWarehouses,
    'Không thể tải danh sách kho lưu trữ'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/bills',
    setBills,
    'Không thể tải danh sách bill'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/contracts',
    setContracts,
    'Không thể tải danh sách hợp đồng'
  );
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/stock-in',
    setExistingStockIn,
    'Không thể tải danh sách nhập kho'
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
 * Kiểm tra xem nhà cung cấp có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} suppliers - Danh sách nhà cung cấp hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isSupplierExisting = (value, suppliers) => {
  return suppliers.some(
    (sp) => sp.ma_nha_cung_cap === value || sp.ten_nha_cung_cap === value
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
 * Hàm render cột "Tên nhà cung cấp".
 * @param {string} maNhaCungCap - Mã nhà cung cấp.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} suppliers - Danh sách tài khoản.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderTenNhaCungCap = (maNhaCungCap, record, suppliers, errorItems) => {
  if (record.invalidTenNhaCungCap) {
    return renderWithErrorHighlight('', record, errorItems, 'Nhà cung cấp', '(Không lấy được)');
  }

  if (!maNhaCungCap || maNhaCungCap.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Nhà cung cấp');
  }

  const supplier = suppliers.find((sp) => sp.ma_nha_cung_cap === maNhaCungCap);
  return renderWithErrorHighlight(supplier?.ten_nha_cung_cap || maNhaCungCap, record, errorItems, 'Nhà cung cấp');
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
 * Hàm render cột "Bill".
 * @param {string} maBill - Mã bill.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} bills - Danh sách bill.
 * @param {array} errorItems - Danh sách lỗi.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderMaBill = (maBill, record, bills, errorItems) => {
  if (record.invalidMaBill) {
    return renderWithErrorHighlight('', record, errorItems, 'Bill', '(Không tồn tại)');
  }

  if (!maBill || maBill.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, 'Bill');
  }

  const bill = bills.find((cust) => cust.ma_bill === maBill);
  return renderWithErrorHighlight(bill?.ma_bill || maBill, record, errorItems, 'Bill');
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