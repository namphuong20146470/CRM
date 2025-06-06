/**
 * Kiểm tra các trường không được trùng nhau trong nội bộ file import.
 * @param {Array} data - Dữ liệu import.
 * @param {Array} uniqueFields - Danh sách các trường cần kiểm tra không trùng.
 * @returns {Object} - Object với key là trường, value là Set các giá trị đã gặp trùng.
 */
export const checkDuplicateInFile = (data, uniqueFields) => {
  const duplicates = {};
  uniqueFields.forEach(field => {
    const seen = new Set();
    const dup = new Set();
    data.forEach(item => {
      const value = (item[field] || '').toString().trim();
      if (value && seen.has(value)) {
        dup.add(value);
      }
      seen.add(value);
    });
    if (dup.size > 0) {
      duplicates[field] = dup;
    }
  });
  return duplicates;
};

/**
 * Validate data rows based on required fields and custom rules.
 * @param {Array} data - Array of data rows to validate.
 * @param {Array} requiredFields - List of required fields.
 * @param {Function} getFieldLabel - Function to get the label of a field.
 * @param {Function} setErrorItems - Function to set error items.
 * @returns {Array} - Array of error items.
 */
export const validateData = (
  data,
  requiredFields,
  getFieldLabel,
  setErrorItems,
  keyField = 'key',
  nameField = 'name',
  validators = {},
  duplicates = {},
  dateFields = [],
  columnMapping = {},
  options = {}
) => {
  const errors = [];
  const duplicateFields = Object.keys(duplicates);
  // Ánh xạ trường đặc biệt với biến lỗi tương ứng
  const specialFields = {
    nguoi_phu_trach: 'invalidNguoiPhuTrach',
    nguoi_cap_nhat: 'invalidNguoiCapNhat',
    nguoi_lap_don: 'invalidNguoiLapDon',
    nguoi_tao: 'invalidNguoiTao',
    ma_hang: 'invalidMaHang',
    ten_loai_hang: 'invalidTenLoaiHang',
    ten_nha_cung_cap: 'invalidTenNhaCungCap',
    ten_khach_hang: 'invalidTenKhachHang',
    ten_kho: 'invalidTenKho',
    ma_bill: 'invalidMaBill',
    hawb_1: 'invalidHawb1',
    hawb_2: 'invalidHawb2',
    hawb_3: 'invalidHawb3',
    hawb_4: 'invalidHawb4',
    hawb_5: 'invalidHawb5',
    loai_hop_dong: 'invalidLoaiHopDong',
    ma_hop_dong: 'invalidMaHopDong',
    so_xac_nhan_don_hang: 'invalidSoXacNhanDonHang',
  };

  // Thêm biến cộng dồn số lượng xuất theo mã hàng và kho
  const cumulativeExport = {};

  data.forEach((item, index) => {
    const itemErrors = [];

    requiredFields.forEach(field => {
      // Nếu là trường ngày và đã có flag lỗi định dạng thì KHÔNG báo thiếu trường nữa
      const isDateField = dateFields.includes(field);
      const invalidDateFlag = item[`invalid${field.charAt(0).toUpperCase() + field.slice(1)}`];

      if (specialFields[field]) {
        const rawValue = item[field];
        const invalidFlag = item[specialFields[field]];
        if (invalidFlag === true) {
          // Tùy trường, báo lỗi phù hợp
          if (field === 'ma_hang') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách hàng hóa`);
          } else if (field === 'ten_loai_hang') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách loại hàng`);
          } else if (field === 'ten_nha_cung_cap') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách nhà cung cấp`);
          } else if (field === 'ten_khach_hang') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách khách hàng`);
          } else if (field === 'ten_kho') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách kho lưu trữ`);
          } else if (field === 'ma_bill') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách bill`);
          } else if (field === 'loai_hop_dong') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách loại hợp đồng`);
          } else if (field === 'ma_hop_dong') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách hợp đồng`);
          } else if (field === 'so_xac_nhan_don_hang') {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách đơn hàng`);
          } else {
            itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách tài khoản`);
          }
        } else if (
          !(isDateField && invalidDateFlag) &&
          (rawValue === null || rawValue === undefined || rawValue.toString().trim() === '')
        ) {
          itemErrors.push(`Thiếu trường "${getFieldLabel(field, columnMapping)}"`);
        }
      } else {
        const value = item[field];
        if (
          !(isDateField && invalidDateFlag) &&
          (value === null || value === undefined || value.toString().trim() === '')
        ) {
          itemErrors.push(`Thiếu trường "${getFieldLabel(field, columnMapping)}"`);
        }
      }
    });

    const hawbFields = ['hawb_1', 'hawb_2', 'hawb_3', 'hawb_4', 'hawb_5'];

    // Kiểm tra số lượng xuất không vượt quá tồn kho (cộng dồn trong file)
    if (columnMapping && columnMapping['Số lượng'] === 'so_luong_xuat' && typeof options.getCurrentStock === 'function') {
      const maHang = item['ma_hang'];
      const maKho = item['ten_kho'];
      const soLuongXuat = Number(item['so_luong_xuat'] || 0);
      const key = `${maHang}__${maKho}`;
      const tonKho = options.getCurrentStock(maHang, maKho);

      // Cộng dồn số lượng xuất của các dòng trước đó trong file import
      cumulativeExport[key] = (cumulativeExport[key] || 0) + soLuongXuat;

      if (cumulativeExport[key] > tonKho) {
        itemErrors.push(
          `Tổng số lượng xuất (${cumulativeExport[key]}) vượt quá số lượng hiện có (${tonKho}) của mã hàng "${maHang}" tại kho "${maKho}"`
        );
        item.invalidSoLuongXuat = true;
        item.tonKhoHienCo = tonKho;
      }
    }

    // Hàm xử lý dành cho chi tiết đơn hàng với các khóa ngoại HAWB
    hawbFields.forEach(field => {
      const invalidFlag = item[specialFields[field]];
      // Nếu có nhập và flag lỗi, thì báo lỗi
      if (item[field] && invalidFlag) {
        itemErrors.push(`${getFieldLabel(field, columnMapping)} không tồn tại trong danh sách bill`);
      }
    });

    // Kiểm tra định dạng ngày tháng
    dateFields.forEach(field => {
      if (item[`invalid${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
        itemErrors.push(`${getFieldLabel(field, columnMapping)} không đúng định dạng ngày hợp lệ`);
      }
    });

    // Kiểm tra trùng trong file cho các trường unique
    duplicateFields.forEach(field => {
      if (duplicates[field] && duplicates[field].has(item[field])) {
        itemErrors.push(`${getFieldLabel(field, columnMapping)} trùng nhau trong excel`);
      }
    });

    // Kiểm tra tồn tại cho các trường truyền vào validators
    Object.keys(validators).forEach(field => {
      if (
        typeof validators[field] === 'function' &&
        item[field]
      ) {
        const result = validators[field](item[field], item);
        if (typeof result === 'string' && result) {
          itemErrors.push(result);
        } else if (result === true) {
          itemErrors.push(`${getFieldLabel(field, columnMapping)} đã tồn tại`);
        }
      }
    });

    // Kiểm tra định dạng số cho các trường số lượng và số tiền
    const numberFields = [
      { field: 'so_luong_nhap', label: 'Số lượng nhập' },
      { field: 'so_luong_xuat', label: 'Số lượng xuất' },
      { field: 'so_luong', label: 'Số lượng' },
      { field: 'so_luong_lo_1', label: 'Số lượng lô 1' },
      { field: 'so_luong_lo_2', label: 'Số lượng lô 2' },
      { field: 'so_luong_lo_3', label: 'Số lượng lô 3' },
      { field: 'so_luong_lo_4', label: 'Số lượng lô 4' },
      { field: 'so_luong_lo_5', label: 'Số lượng lô 5' },
      { field: 'so_luong_hang_chua_ve', label: 'Số lượng chưa về' },
      { field: 'tong_no_phai_tra', label: 'Tổng nợ phải trả', regex: /^\d+([.,]\d+)?$/ },
      { field: 'tong_no_phai_thu', label: 'Tổng nợ phải thu', regex: /^\d+([.,]\d+)?$/ },
      { field: 'tong_gia_tri_don_hang', label: 'Tổng giá trị đơn hàng', regex: /^\d+([.,]\d+)?$/ },
      { field: 'trong_luong_tinh', label: 'Trọng lượng tịnh', regex: /^\d+([.,]\d+)?$/ },
      { field: 'gia_thuc', label: 'Giá thực', regex: /^\d+([.,]\d+)?$/ },
      { field: 'gia_tri_hop_dong', label: 'Giá trị hợp đồng', regex: /^\d+([.,]\d+)?$/ },
    ];
    numberFields.forEach(({ field, label, regex }) => {
      if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
        const pattern = regex || /^\d+$/;
        if (!pattern.test(item[field])) {
          itemErrors.push(`${label} phải là số${regex ? ' và cho phép dấu "." hoặc ","' : ''}`);
        }
      }
    });

    // Kiểm tra định dạng email và số điện thoại
    if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
      itemErrors.push('Email không đúng định dạng');
    }
    if (item.so_dien_thoai && !/^\d+$/.test(item.so_dien_thoai)) {
      itemErrors.push('Số điện thoại phải là số và không chứa ký tự khác');
    }
    if (item.ma_so_thue && !/^\d+$/.test(item.ma_so_thue)) {
      itemErrors.push('Mã số thuế phải là số và không chứa ký tự khác');
    }

    if (itemErrors.length > 0) {
      errors.push({
        index,
        [keyField]: item[keyField] || `Hàng ${index + 2}`,
        [nameField]: item[nameField] || '(Không có tên)',
        errors: itemErrors
      });
    }
  });

  setErrorItems(errors);
  return errors;
};

/**
 * Get the label of a field based on column mapping.
 * @param {string} apiField - The API field name.
 * @param {Object} columnMapping - Mapping between column headers and API fields.
 * @returns {string} - The label of the field.
 */
export const getFieldLabel = (apiField, columnMapping) => {
  for (const [key, value] of Object.entries(columnMapping)) {
    if (value === apiField) {
      return key;
    }
  }
  return apiField;
};