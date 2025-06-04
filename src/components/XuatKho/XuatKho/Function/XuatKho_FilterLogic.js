import { normalizeString } from '../../../utils/format/search';

export function filterXuatKho(data, { searchTerm, product_typeFilter, accountFilter, warehouseFilter, yearFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');

    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_hang).includes(normalizedSearch) ||
        normalizeString(item.customers?.ten_khach_hang).includes(normalizedSearch);

      const matchesProductType =
        product_typeFilter === 'all' || item.product?.product_type?.ten_loai_hang === product_typeFilter;

      const matchesAccount =
        accountFilter === 'all' || item.accounts?.ho_va_ten === accountFilter;

      const matchesWarehouse =
        warehouseFilter === 'all' || item.warehouse?.ten_kho === warehouseFilter;

      const matchesYear =
        yearFilter === 'all' ||
        new Date(item.ngay_xuat_hang).getFullYear().toString() === yearFilter;

      return matchesSearch && matchesProductType && matchesAccount && matchesWarehouse && matchesYear;
    });
  }
  