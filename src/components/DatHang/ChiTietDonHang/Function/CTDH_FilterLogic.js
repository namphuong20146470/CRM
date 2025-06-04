import { normalizeString } from '../../../utils/format/search';

export function filterChiTietDonHang(data, { searchTerm, product_typeFilter, accountFilter, yearFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');

    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_hang).includes(normalizedSearch) ||
        normalizeString(item.ma_hop_dong).includes(normalizedSearch) ||
        normalizeString(item.so_xac_nhan_don_hang).includes(normalizedSearch) ||
        normalizeString(item.customers?.ten_khach_hang).includes(normalizedSearch);

      const matchesProductType =
        product_typeFilter === 'all' || item.product?.product_type?.ten_loai_hang === product_typeFilter;

      const matchesAccount =
        accountFilter === 'all' || item.accounts?.ho_va_ten === accountFilter;

      const matchesYear =
        yearFilter === 'all' ||
        new Date(item.ngay_dat_hang).getFullYear().toString() === yearFilter;

      return matchesSearch && matchesProductType && matchesAccount && matchesYear;
    });
  }
  