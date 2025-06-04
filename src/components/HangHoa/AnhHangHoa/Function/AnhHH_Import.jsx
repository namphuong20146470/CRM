import React from 'react';
import * as XLSX from 'xlsx';
import { message } from 'antd';

const HangHoa_Import = ({ onImport }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const today = new Date().toISOString();

      const processedData = jsonData.map((item) => ({
        ma_loai_hang: item['Mã loại hàng'] || '',
        ten_loai_hang: item['Tên loại hàng'] || '',
        trang_thai: item['Trạng thái'] || '',
        mo_ta: item['Mô tả'] || '',
        nguoi_cap_nhat: 'Nguyễn Trung Hiếu',
        ngay_cap_nhat: today,
      }));

      if (onImport) {
        onImport(processedData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <input
      type="file"
      accept=".xlsx, .xls"
      style={{ display: 'none' }}
      onChange={handleFileUpload}
      id="import-excel"
      key={Date.now()}
    />
  );
};

export default HangHoa_Import;
