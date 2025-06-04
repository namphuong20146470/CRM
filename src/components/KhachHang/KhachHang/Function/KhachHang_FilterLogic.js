import { normalizeString } from '../../../utils/format/search';

export function filterKhachHang(data, { searchTerm, yearFilter, accountFilter, provinceFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');
    
    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_khach_hang).includes(normalizedSearch) ||
        normalizeString(item.ten_khach_hang).includes(normalizedSearch) ||
        normalizeString(item.tinh_thanh).includes(normalizedSearch);
  
      const matchesAccount =
        accountFilter === 'all' || item.accounts?.ho_va_ten === accountFilter;
  
      const matchesProvince =
        provinceFilter === 'all' || item.tinh_thanh === provinceFilter;
  
      const matchesYear =
        yearFilter === 'all' ||
        new Date(item.ngay_them_vao).getFullYear().toString() === yearFilter;
  
      return matchesSearch && matchesAccount && matchesProvince && matchesYear;
    });
  }
  