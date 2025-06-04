import * as XLSX from 'xlsx-js-style';

/**
 * Download Excel template cho Hàng hóa với 3 dòng đầu đặc biệt.
 * @param {Array} specialHeaders - Dòng 1: Header đặc biệt.
 * @param {Array} specialValues - Dòng 2: Giá trị mẫu.
 * @param {Array} headers - Dòng 3: Header chính.
 * @param {Array} sampleData - Dữ liệu mẫu.
 * @param {string} fileName - Tên file.
 */
export const downloadHangHoaTemplate = (specialHeaders, specialValues, headers, sampleData, fileName) => {
  const aoa = [specialHeaders, specialValues, headers, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Style cho dòng 1 (specialHeaders)
  const specialHeaderStyle = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: 'D9D9D9' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };
  // Style cho dòng 3 (headers)
  const headerStyle = specialHeaderStyle;
  // Style cho dòng 2 và data
  const cellStyle = {
    alignment: { horizontal: 'left', vertical: 'center' },
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
      if (ws[address]) {
        if (R === 0) ws[address].s = specialHeaderStyle; // Dòng 1
        else if (R === 2) ws[address].s = headerStyle;   // Dòng 3
        else ws[address].s = cellStyle;                  // Dòng 2 và data
      }
    }
  }

  // Auto-width columns
  ws['!cols'] = aoa[2].map((col, idx) => {
    const maxLen = Math.max(
      (col || '').toString().length,
      ...sampleData.map(row => (row[idx] || '').toString().length)
    );
    return { wch: maxLen + 2 };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};