// Utilities for Excel file operations
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { EXPORT_FIELD_MAPPING } from './constants';

// Export data to Excel file
export const exportToExcel = (data) => {
  // Prepare data for export
  const exportData = data.map((item) => {
    const rowData = {};
    
    // Map the data fields using the field mapping
    Object.keys(EXPORT_FIELD_MAPPING).forEach(key => {
      rowData[EXPORT_FIELD_MAPPING[key]] = item[key];
    });
    
    return rowData;
  });

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "LoaiBaoTri");

  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "LoaiBaoTri.xlsx");
  
  return true;
};

// Parse Excel file and convert to usable data format
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel data to expected format for API
        const importData = jsonData.map((row) => ({
          ma_loai_bao_tri: row["Mã loại bảo trì"] || "",
          loai_bao_tri: row["Loại bảo trì"] || "",
          trang_thai: row["Trạng thái"] || "Hoạt động",
          nguoi_cap_nhat: row["Người cập nhật"] || "",
          ngay_cap_nhat: row["Ngày cập nhật"] || new Date().toISOString().split("T")[0],
          mo_ta: row["Mô tả"] || null,
        }));

        resolve(importData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
}; 