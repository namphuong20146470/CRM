import { normalizeString } from '../../utils/format/search';

export function filterNhaCungCap(data, { searchTerm, statusFilter, countryFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');
  
    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_nha_cung_cap).includes(normalizedSearch) ||
        normalizeString(item.ten_nha_cung_cap).includes(normalizedSearch);
  
      const matchesStatus =
        statusFilter === 'all' || item.trang_thai === statusFilter;
  
      const matchesCountry =
        countryFilter === 'all' || item.quoc_gia === countryFilter;
  
      return matchesSearch && matchesStatus && matchesCountry;
    });
  }
  