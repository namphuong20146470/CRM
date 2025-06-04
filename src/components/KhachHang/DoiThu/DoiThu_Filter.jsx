import { getCountryName } from '../../utils/convert/countryCodes';

export const getUniqueValues = (data, accessor) => {
  return [...new Set(data.map(accessor).filter(Boolean))];
};

export const filterData = (data, options) => {
  const {
    searchTerm = '',
    statusFilter = 'all',
    countryFilter = 'all',
    supplierFilter = 'all',
  } = options;

  const search = searchTerm.toLowerCase();

  return data.filter((item) => {
    if (!item) return false;

    const matchesSearch =
      !searchTerm ||
      item.ma_hang?.toLowerCase().includes(search) ||
      item.ten_hang?.toLowerCase().includes(search) ||
      item.product_type?.ten_loai_hang?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'all' || item.tinh_trang_hang_hoa === statusFilter;

    const matchesCountry =
      countryFilter === 'all' || getCountryName(item.nuoc_xuat_xu) === countryFilter;

    const matchesSupplier =
      supplierFilter === 'all' || item.suppliers?.ten_nha_cung_cap === supplierFilter;

    return matchesSearch && matchesStatus && matchesCountry && matchesSupplier;
  });
};
