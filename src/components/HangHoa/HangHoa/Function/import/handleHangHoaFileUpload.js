import * as XLSX from 'xlsx';
import { message } from 'antd';

// Các mảng field đặc biệt
const userFields = ['nguoi_phu_trach', 'nguoi_cap_nhat', 'nguoi_lap_don', 'nguoi_tao'];
const productTypeFields = ['ten_loai_hang'];
const supplierFields = ['ten_nha_cung_cap'];
const stringFields = ['so_don_hang', 'so_xac_nhan_don_hang', 'ma_hang', 'ma_bill'];

// Hàm sinh key lỗi cho các trường
const getInvalidKey = (apiField) =>
  'invalid' + apiField.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

// Xử lý giá trị cho các trường đặc biệt (số)
const processSpecialField = (field, value) => {
  const numericFields = [
    'tong_no_phai_tra', 'tong_no_phai_thu', 'tong_gia_tri_don_hang',
    'trong_luong_tinh', 'gia_thuc', 'gia_tri_hop_dong', 'so_luong_nhap',
    'so_luong_xuat', 'so_luong', 'so_luong_lo_1', 'so_luong_lo_2',
    'so_luong_lo_3', 'so_luong_lo_4', 'so_luong_lo_5', 'so_luong_hang_chua_ve',
  ];
  if (numericFields.includes(field)) {
    if (value !== null && /^\d+([.,]\d+)?$/.test(value.toString().replace(/,/g, '.'))) {
      return parseFloat(value.toString().replace(/,/g, '.'));
    }
  }
  return value;
};

const mapTenLoaiHangToMaLoaiHang = (tenLoaiHang, product_types = []) => {
  if (!Array.isArray(product_types)) return null;
  const product_type = product_types.find(pt => pt.ten_loai_hang === tenLoaiHang);
  return product_type ? product_type.ma_loai_hang : null;
};

const mapTenNhaCungCapToMaNhaCungCap = (tenNhaCungCap, suppliers = []) => {
  if (!Array.isArray(suppliers)) return null;
  const supplier = suppliers.find(sup => sup.ten_nha_cung_cap === tenNhaCungCap);
  return supplier ? supplier.ma_nha_cung_cap : null;
};

const mapHoVaTenToMaNguoiDung = (hoVaTen, accounts = []) => {
  if (!Array.isArray(accounts)) return null;
  const account = accounts.find(acc => acc.ho_va_ten === hoVaTen);
  return account ? account.ma_nguoi_dung : null;
};

export const handleHangHoaFileUpload = (file, {
  columnMapping,
  setParsedData,
  validateData,
  setShowPreview,
  setFileList,
  accounts,
  product_types,
  suppliers,
  defaultFields = {},
}) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    message.error('Chỉ hỗ trợ tải lên file Excel!');
    return false;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

      if (jsonData.length < 4) {
        message.error('File không đúng cấu trúc! (Thiếu dòng tiêu đề hoặc dữ liệu)');
        setFileList([]);
        return;
      }

      // Dòng 1: header đặc biệt, Dòng 2: value đặc biệt, Dòng 3: header chính, Dòng 4+: data
      const specialHeaders = jsonData[0];
      const specialValues = jsonData[1];
      const headers = jsonData[2];
      const rows = jsonData.slice(3).filter(row => row.some(cell => cell !== null));

      const specialMap = {};
      specialHeaders.forEach((header, idx) => {
        if (header === 'Nhà cung cấp' || header === 'Price List' || header === 'Người cập nhật') {
          specialMap[header] = specialValues[idx];
        }
      });

      const processedData = rows.map((row, index) => {
        const item = {};
        headers.forEach((header, colIndex) => {
          const apiField = columnMapping[header];
          if (!apiField) return;
          let value = row[colIndex];

          // Ép kiểu chuỗi cho các trường cần thiết
          if (stringFields.includes(apiField) && value !== undefined && value !== null) {
            value = value.toString();
          }
          value = processSpecialField(apiField, value);

          // Xử lý từng loại trường
          if (userFields.includes(apiField)) {
            const maNguoiDung = mapHoVaTenToMaNguoiDung(value, accounts);
            item[apiField] = maNguoiDung || null;
            if (!maNguoiDung && value) item[getInvalidKey(apiField)] = true;
          }
          else if (productTypeFields.includes(apiField)) {
            if (value === undefined || value === null || value.toString().trim() === '') {
              // Nếu không nhập, cho phép null
              item[apiField] = null;
            } else {
              // Nếu có nhập, kiểm tra tồn tại
              const maLoaiHang = mapTenLoaiHangToMaLoaiHang(value, product_types);
              item[apiField] = maLoaiHang || null;
              if (!maLoaiHang) item[getInvalidKey(apiField)] = true;
            }
          }
          else if (supplierFields.includes(apiField)) {
            const maNhaCungCap = mapTenNhaCungCapToMaNhaCungCap(value, suppliers);
            item[apiField] = maNhaCungCap || null;
            if (!maNhaCungCap && value) item[getInvalidKey(apiField)] = true;
          }
          else {
            item[apiField] = value;
          }
        });

        // Gán giá trị đặc biệt cho từng dòng
        if ('Nhà cung cấp' in specialMap) {
          const maNhaCungCap = mapTenNhaCungCapToMaNhaCungCap(specialMap['Nhà cung cấp'], suppliers);
          // Nếu không tìm thấy thì giữ lại giá trị gốc để validate báo lỗi đúng
          item['ten_nha_cung_cap'] = maNhaCungCap || specialMap['Nhà cung cấp'];
          if (!maNhaCungCap && specialMap['Nhà cung cấp']) item.invalidTenNhaCungCap = true;
        }
        if ('Price List' in specialMap) item['price_list'] = specialMap['Price List'];
        if ('Người cập nhật' in specialMap) {
          const maNguoiDung = mapHoVaTenToMaNguoiDung(specialMap['Người cập nhật'], accounts);
          // Nếu không tìm thấy thì giữ lại giá trị gốc để validate báo lỗi đúng
          item['nguoi_cap_nhat'] = maNguoiDung || specialMap['Người cập nhật'];
          if (!maNguoiDung && specialMap['Người cập nhật']) item.invalidNguoiCapNhat = true;
        }

        Object.assign(item, defaultFields);
        item.key = index;
        return item;
      });

      setParsedData(processedData);
      validateData(processedData);
      setShowPreview(true);
      message.success(`File "${file.name}" đã được tải lên thành công!`);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      message.error('Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file!');
    }
  };

  reader.onerror = () => {
    message.error('Không thể đọc file!');
  };

  reader.readAsArrayBuffer(file);
  setFileList([file]);
  return false;
};