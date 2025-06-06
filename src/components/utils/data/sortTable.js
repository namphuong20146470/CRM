export function sortTableData(data, field, order = 'descend') {
  if (!Array.isArray(data) || !field) return data;
  return [...data].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Xử lý trường hợp trường lồng cho nhà cung cấp
    if (field === 'ten_nha_cung_cap') {
      // Ưu tiên lấy qua product nếu có (dùng cho nhập kho)
      aValue = a.product?.suppliers?.ten_nha_cung_cap || a.suppliers?.ten_nha_cung_cap || '';
      bValue = b.product?.suppliers?.ten_nha_cung_cap || b.suppliers?.ten_nha_cung_cap || '';
    }
    if (field === 'ten_kho') {
      aValue = a.warehouse?.ten_kho || '';
      bValue = b.warehouse?.ten_kho || '';
    }
    if (field === 'ten_khach_hang') {
      aValue = a.customers?.ten_khach_hang || '';
      bValue = b.customers?.ten_khach_hang || '';
    }
    if (field === 'ten_loai_hang') {
      aValue = a.product_type?.ten_loai_hang || '';
      bValue = b.product_type?.ten_loai_hang || '';
    }
    if (field === 'loai_hop_dong') {
      aValue = a.contract_type?.ten_loai_hop_dong || '';
      bValue = b.contract_type?.ten_loai_hop_dong || '';
    }
    if (field === 'nguoi_cap_nhat' || field === 'nguoi_phu_trach' || field === 'nguoi_tao' || field === 'nguoi_lap_don') {
      aValue = a.accounts?.ho_va_ten || '';
      bValue = b.accounts?.ho_va_ten || '';
    }

    // Nếu là số
    if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    // Nếu là ngày
    else if (Date.parse(aValue) && Date.parse(bValue)) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    // Nếu là chuỗi
    else {
      aValue = (aValue || '').toString().toLowerCase();
      bValue = (bValue || '').toString().toLowerCase();
    }
    if (order === 'ascend') return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  });
}