import { normalizeString } from '../../utils/format/search';

export function filterThongKeThang(data, { searchTerm, yearFilter }) {
  const normalizedSearch = normalizeString(searchTerm || '');

  return data.filter(item => {
    const matchesSearch =
      !searchTerm ||
      normalizeString(item.ma_hang).includes(normalizedSearch);

    const dateStr = item.ngay || item.ngay_nhap_hang || item.ngay_xuat_hang;
    const matchesYear =
      yearFilter === 'all' ||
      (dateStr && new Date(dateStr).getFullYear().toString() === yearFilter);

    return matchesSearch && matchesYear;
  });
}