import { getCountryName } from '../../../utils/convert/countryCodes';
import { getStatusName } from '../../../utils/convert/statusCodes';
import { normalizeString } from '../../../utils/format/search';

export function filterHangHoa(data, { searchTerm, pricelistSearch, statusFilter, countryFilter, supplierFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');
    const normalizedPricelist = normalizeString(pricelistSearch || '');

    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_hang).includes(normalizedSearch) ||
        normalizeString(item.ten_hang).includes(normalizedSearch) ||
        normalizeString(item.product_type?.ten_loai_hang || '').includes(normalizedSearch);

      const matchesPricelist =
        !pricelistSearch ||
        normalizeString(item.price_list || '').includes(normalizedPricelist);

      const matchesStatus =
        statusFilter === 'all' || getStatusName(item.tinh_trang_hang_hoa) === statusFilter;
  
      const matchesCountry =
        countryFilter === 'all' || getCountryName(item.nuoc_xuat_xu) === countryFilter;
  
      const matchesSupplier =
        supplierFilter === 'all' || item.suppliers?.ten_nha_cung_cap === supplierFilter;
  
      return matchesSearch && matchesPricelist && matchesStatus && matchesCountry && matchesSupplier;
    });
  }
  