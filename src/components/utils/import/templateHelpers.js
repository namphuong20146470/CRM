import * as XLSX from 'xlsx-js-style';

/**
 * Download an Excel template file with formatted headers and auto-width columns.
 * @param {Array} columns - Array of column headers.
 * @param {Array} sampleData - Array of sample data rows.
 * @param {string} fileName - Name of the file to download.
 * @param {Array} [highlightRows] - Mảng index các dòng cần highlight đỏ nhạt (tính từ 0, không tính header)
 */
export const downloadTemplate = (columns, sampleData, fileName, highlightRows = []) => {
  // Create worksheet with header and sample data
  const ws = XLSX.utils.aoa_to_sheet([columns, ...sampleData]);

  // Define header style
  const headerStyle = {
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

  // Define cell style
  const cellStyle = {
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '999999' } },
      bottom: { style: 'thin', color: { rgb: '999999' } },
      left: { style: 'thin', color: { rgb: '999999' } },
      right: { style: 'thin', color: { rgb: '999999' } }
    }
  };

  // Apply styles to the worksheet
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[address]) {
        // Nếu là header
        if (R === 0) {
          ws[address].s = headerStyle;
        } else if (highlightRows.includes(R - 1)) {
          // Highlight đỏ nhạt cho dòng cần tô màu (R-1 vì sampleData bắt đầu từ R=1)
          ws[address].s = {
            ...cellStyle,
            fill: { fgColor: { rgb: "FFF4CCCC" } },
            font: { color: { rgb: "FF0000" } }
          };
        } else {
          ws[address].s = cellStyle;
        }
      }
    }
  }

  // Auto-width columns
  ws['!cols'] = columns.map((col, idx) => {
    const maxLen = Math.max(
      col.length,
      ...sampleData.map(row => (row[idx] || '').toString().length)
    );
    return { wch: maxLen + 2 };
  });

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  // Generate file and trigger download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
