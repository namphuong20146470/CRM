import { normalizeString } from '../../utils/format/search';

export function filterThongKeThang(data, { searchTerm, yearFilter }) {
  const normalizedSearch = normalizeString(searchTerm || '');

  return data.filter(item => {
    const matchesSearch =
      !searchTerm ||
      normalizeString(item.ma_hang).includes(normalizedSearch);

    const matchesYear =
      yearFilter === 'all' ||
      new Date(item.ngay_xuat_hang).getFullYear().toString() === yearFilter;

    return matchesSearch && matchesYear;
  });
}