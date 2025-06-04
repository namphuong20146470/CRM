import { normalizeString } from '../../../utils/format/search';

export function filterNhapKho(data, { searchTerm, product_typeFilter, supplierFilter, warehouseFilter, yearFilter  }) {
    const normalizedSearch = normalizeString(searchTerm || '');

    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_hang).includes(normalizedSearch) ||
        normalizeString(item.ma_hop_dong).includes(normalizedSearch) ||
        normalizeString(item.ma_bill).includes(normalizedSearch);
  
      const matchesProductType =
        product_typeFilter === 'all' || item.product?.product_type?.ten_loai_hang === product_typeFilter;

      const matchesSupplier =
        supplierFilter === 'all' || item.product?.suppliers?.ten_nha_cung_cap === supplierFilter;
  
      const matchesWarehouse =
        warehouseFilter === 'all' || item.warehouse?.ten_kho === warehouseFilter;
  
      const matchesYear =
        yearFilter === 'all' ||
        new Date(item.ngay_nhap_hang).getFullYear().toString() === yearFilter;
  
      return matchesSearch && matchesProductType && matchesSupplier && matchesWarehouse && matchesYear;
    });
  }
  