import { message } from 'antd';
import * as XLSX from 'xlsx-js-style';
import { formatDate } from '../format/formatDate';
import { getCountryName } from '../convert/countryCodes';

export const toggleExportField = (field, exportFields, setExportOptions) => {
  const index = exportFields.indexOf(field);
  const updatedFields = [...exportFields];
  if (index > -1) {
    updatedFields.splice(index, 1);
  } else {
    updatedFields.push(field);
  }
  setExportOptions(prev => ({ ...prev, exportFields: updatedFields }));
};

export const selectAllFields = (allFields, setExportOptions) => {
  setExportOptions(prev => ({ ...prev, exportFields: allFields }));
};

export const clearAllFields = (setExportOptions) => {
  setExportOptions(prev => ({ ...prev, exportFields: [] }));
};

// ✅ Hàm xử lý null / '' thành ''
const safeExport = (val, formatter = v => v) => {
  return val == null || val === '' ? '' : formatter(val);
};

export const handleExport = async ({
  exportOptions,
  data,
  filteredData,
  sortedData,
  fieldMappings,
  onClose,
  formatCurrency = val => val?.toLocaleString('vi-VN')
}) => {
  try {
    let sourceData;
    if (exportOptions.dataSource === 'all') sourceData = data;
    else if (exportOptions.dataSource === 'filtered') sourceData = filteredData;
    else if (exportOptions.dataSource === 'sorted') sourceData = sortedData;
    else sourceData = data;

    if (!sourceData.length) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }

    // Thêm cột STT chạy từ 1 đến n
    const dataWithSTT = sourceData.map((item, index) => ({
      ...item,
      stt: index + 1 // Gán STT từ 1 đến n
    }));

    const headers = exportOptions.exportFields.map(f => fieldMappings[f]);
    const rows = dataWithSTT.map(item =>
      exportOptions.exportFields.map(field => {
        switch (field) {
          case 'nguoi_phu_trach':
          case 'nguoi_cap_nhat':
          case 'nguoi_tao':
          case 'nguoi_lap_don':
            return safeExport(item.accounts?.ho_va_ten ?? item[field]);

          case 'ten_loai_hang':
            return safeExport(item.product_type?.ten_loai_hang ?? item[field]);

          case 'ten_nha_cung_cap':
            return safeExport(item.suppliers?.ten_nha_cung_cap ?? item[field]);

          case 'loai_hop_dong':
            return safeExport(item.contract_type?.ten_loai_hop_dong ?? item[field]);

          case 'ten_kho':
            return safeExport(item.warehouse?.ten_kho ?? item[field]);

          case 'ten_khach_hang':
            return safeExport(item.customers?.ten_khach_hang ?? item[field]);

          case 'nuoc_xuat_xu':
            return safeExport(item[field], getCountryName);

          case 'ngay_them_vao':
          case 'ngay_cap_nhat':
          case 'ngay_gia':
          case 'ngay_ky_hop_dong':
          case 'ngay_bat_dau':
          case 'ngay_ket_thuc':
          case 'ngay_nhap_hang':
          case 'ngay_xuat_hang':
          case 'ngay_dat_hang':
          case 'ngay_tam_ung':
          case 'tu_ngay':
          case 'den_ngay':
          case 'hang_bao_ngay_du_kien_lan_1':
          case 'hang_bao_ngay_du_kien_lan_2':
          case 'ngay_tao_don':
            return safeExport(item[field], formatDate);

          case 'trong_luong_tinh':
          case 'gia_thuc':
          case 'tong_no_phai_tra':
          case 'tong_no_phai_thu':
          case 'gia_tri_hop_dong':
          case 'tong_gia_tri_don_hang':
            return safeExport(item[field], formatCurrency);

          default:
            return safeExport(item[field]);
        }
      })
    );

    const dataForExport = exportOptions.includeHeaderRow ? [headers, ...rows] : rows;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataForExport);

    // 👉 Thiết lập chiều cao dòng đầu tiên (header)
    ws['!rows'] = [{ hpt: 20 }];

    const headerStyle = {
      font: { bold: true, sz: 12 },
      fill: { fgColor: { rgb: 'D9D9D9' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'double', color: { rgb: '000000' } },
        bottom: { style: 'double', color: { rgb: '000000' } },
        left: { style: 'double', color: { rgb: '000000' } },
        right: { style: 'double', color: { rgb: '000000' } }
      }
    };    

    const cellStyle = {
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '999999' } },
        bottom: { style: 'thin', color: { rgb: '999999' } },
        left: { style: 'thin', color: { rgb: '999999' } },
        right: { style: 'thin', color: { rgb: '999999' } }
      }
    };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        ws[address].s = R === 0 && exportOptions.includeHeaderRow ? headerStyle : cellStyle;
      }
    }

    ws['!cols'] = exportOptions.exportFields.map((field, idx) => {
      const maxLen = Math.max(
        headers[idx]?.length || 0,
        ...rows.map(row => (row[idx] || '').toString().length)
      );
      return { wch: maxLen + 2 };
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Export');
    XLSX.writeFile(wb, `${exportOptions.fileName}.${exportOptions.fileFormat}`);
    message.success('Xuất file thành công!');
    onClose();
  } catch (err) {
    console.error(err);
    message.error('Lỗi khi xuất file: ' + err.message);
  }
};