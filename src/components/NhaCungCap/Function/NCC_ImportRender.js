import { renderWithErrorHighlight } from '../../utils/import/renderHelpers';
import { fetchAndSetList } from '../../utils/api/fetchHelpers';

/**
 * Hàm tải danh sách từ API.
 * @param {function} setExistingSuppliers - Hàm set state cho danh sách nhà cung cấp.
 */
export const fetchPreviewData = (setExistingSuppliers) => {
  fetchAndSetList(
    'https://dx.hoangphucthanh.vn:3000/warehouse/suppliers',
    setExistingSuppliers,
    'Không thể tải danh sách nhà cung cấp'
  );
};

/**
 * Kiểm tra xem nhà cung cấp có tồn tại không.
 * @param {string} value - Giá trị cần kiểm tra.
 * @param {array} existingSuppliers - Danh sách nhà cung cấp hiện có.
 * @returns {boolean} - Kết quả kiểm tra.
 */
export const isSupplierExisting = (value, existingSuppliers) => {
  return existingSuppliers.some(
    (cust) => cust.ma_nha_cung_cap === value || cust.ten_nha_cung_cap === value
  );
};

/**
 * Hàm render cột "Mã nhà cung cấp".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingSuppliers - Danh sách nhà cung cấp hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderMaNhaCungCap = (text, record, errorItems, existingSuppliers) => {
  const customError = isSupplierExisting(text, existingSuppliers) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Mã nhà cung cấp', customError);
};

/**
 * Hàm render cột "Nhà cung cấp".
 * @param {string} text - Giá trị của ô.
 * @param {object} record - Dữ liệu của dòng hiện tại.
 * @param {array} errorItems - Danh sách lỗi.
 * @param {array} existingSuppliers - Danh sách nhà cung cấp hiện có.
 * @returns {JSX.Element} - Nội dung hiển thị trong ô.
 */
export const renderTenNhaCungCap = (text, record, errorItems, existingSuppliers) => {
  const customError = isSupplierExisting(text, existingSuppliers) ? '(Đã tồn tại)' : null;
  return renderWithErrorHighlight(text, record, errorItems, 'Nhà cung cấp', customError);
};