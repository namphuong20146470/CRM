import * as XLSX from 'xlsx-js-style';
import { getCountryName } from '../../utils/convert/countryCodes';
import { formatDate } from '../../utils/format/formatDate';

const HangHoa_Export = (data, filename) => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const finalFilename = filename || `HangHoa_${formattedDate}.xlsx`;
  const headers = [
    'STT', 'Mã hàng', 'Tên hàng', 'Loại hàng', 'Nhà cung cấp',
    'Nước xuất xứ', 'Trọng lượng', 'Giá thực', 'Đơn vị',
    'Tình trạng', 'Người cập nhật', 'Ngày cập nhật', 'Mô tả'
  ];

  const formattedData = data.map((item, index) => ({
    STT: index + 1,
    'Mã hàng': item.ma_hang,
    'Tên hàng': item.ten_hang,
    'Loại hàng': item.product_type?.ten_loai_hang || '',
    'Nhà cung cấp': item.suppliers?.ten_nha_cung_cap || '',
    'Nước xuất xứ': getCountryName(item.nuoc_xuat_xu) || '',
    'Trọng lượng': item.trong_luong_tinh,
    'Giá thực': item.gia_thuc,
    'Đơn vị': item.don_vi_ban_hang,
    'Tình trạng': item.tinh_trang_hang_hoa,
    'Người cập nhật': item.accounts?.ho_va_ten || '',
    'Ngày cập nhật': formatDate(item.ngay_cap_nhat),
    'Mô tả': item.mo_ta,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData, { cellStyles: true });
  const range = XLSX.utils.decode_range(worksheet['!ref']);

  // Style dòng tiêu đề
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'BFBFBF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'double', color: { rgb: '000000' } },
      bottom: { style: 'double', color: { rgb: '000000' } },
      left: { style: 'double', color: { rgb: '000000' } },
      right: { style: 'double', color: { rgb: '000000' } },
    },
  };

  // Style cho ô dữ liệu
  const cellStyle = {
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '999999' } },
      bottom: { style: 'thin', color: { rgb: '999999' } },
      left: { style: 'thin', color: { rgb: '999999' } },
      right: { style: 'thin', color: { rgb: '999999' } },
    },
  };

  // Gán style cho dòng tiêu đề
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (worksheet[address]) {
      worksheet[address].s = headerStyle;
    }
  }

  // Gán style cho dữ liệu
  for (let R = 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (worksheet[address]) {
        worksheet[address].s = cellStyle;
      }
    }
  }

  // Căn chỉnh độ rộng cột theo cả tiêu đề và nội dung
  const colWidths = headers.map((header, i) => {
    let maxLen = header.length;
    formattedData.forEach((row) => {
      const val = row[header];
      const len = String(val || '').length;
      if (len > maxLen) maxLen = len;
    });
    return { wch: maxLen + 2 }; // thêm padding cho thoáng
  });
  worksheet['!cols'] = colWidths;

  // Đóng băng dòng tiêu đề (A2 là dòng dưới dòng tiêu đề)
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'HangHoa');
  XLSX.writeFile(workbook, finalFilename);
};

export default HangHoa_Export;
