import { normalizeString } from '../../../utils/format/search';

export function filterTonKho(data, { searchTerm, yearFilter, product_typeFilter, warehouseFilter, multiplierFilter, statusFilter }) {
  const normalizedSearch = normalizeString(searchTerm || '');

  return data.filter(item => {
    const matchesSearch =
      !searchTerm ||
      normalizeString(item.ma_hang).includes(normalizedSearch);

    const matchesYear =
      yearFilter === 'all' || item.nam === yearFilter;

    const matchesProductType =
      product_typeFilter === 'all' || item.product?.product_type?.ten_loai_hang === product_typeFilter;

    const matchesWarehouse =
      warehouseFilter === 'all' || item.warehouse?.ten_kho === warehouseFilter;

    const matchesMultiplier =
      multiplierFilter === 'all' || item.ton_hien_tai >= item.muc_ton_toi_thieu * multiplierFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'thieu_hang' && item.ton_hien_tai < item.muc_ton_toi_thieu) ||
      (statusFilter === 'du_hang' && item.ton_hien_tai > item.muc_ton_toi_thieu * 2.5) ||
      (statusFilter === 'on_dinh' && item.ton_hien_tai >= item.muc_ton_toi_thieu && item.ton_hien_tai <= item.muc_ton_toi_thieu * 2.5);

    return matchesSearch && matchesYear && matchesProductType && matchesWarehouse && matchesMultiplier && matchesStatus;
  });
}