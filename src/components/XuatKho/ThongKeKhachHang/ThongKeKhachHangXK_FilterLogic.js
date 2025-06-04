import { normalizeString } from '../../utils/format/search';

export function filterThongKeKhachHang(data, { searchTerm, yearFilter, customers }) {
  const normalizedSearch = normalizeString(searchTerm || '');

  // Nếu không có searchTerm, chỉ lọc theo năm
  if (!searchTerm) {
    return data.filter(item =>
      yearFilter === 'all' ||
      new Date(item.ngay_xuat_hang).getFullYear().toString() === yearFilter
    );
  }

  // Tìm khách hàng theo mã hoặc tên
  const matchedCustomer = customers?.find(
    cus =>
      normalizeString(cus.ma_khach_hang).includes(normalizedSearch) ||
      normalizeString(cus.ten_khach_hang).includes(normalizedSearch)
  );

  return data.filter(item => {
    const matchesMaHang = normalizeString(item.ma_hang).includes(normalizedSearch);
    const matchesMaKhach = matchedCustomer
      ? item.ten_khach_hang === matchedCustomer.ma_khach_hang
      : false;
    const matchesYear =
      yearFilter === 'all' ||
      new Date(item.ngay_xuat_hang).getFullYear().toString() === yearFilter;

    // Nếu searchTerm là mã hàng thì chỉ trả về dòng mã hàng đó
    // Nếu searchTerm là mã khách hàng hoặc tên khách hàng thì trả về các dòng xuất cho khách đó
    return (matchesMaHang || matchesMaKhach) && matchesYear;
  });
}