// File processors for different document types
import Mammoth from "mammoth";
import * as XLSX from "xlsx";
import { extractNumberAfterPhrase, extractNumbersFromExcel } from './extractionUtils';
import { BANG_CHU_PHRASE, TOTAL_PHRASES } from './constants';

// Process DOCX files
export const processDocxFile = async (file, index) => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await Mammoth.extractRawText({ arrayBuffer });
        const extractedNumber = extractNumberAfterPhrase(result.value, BANG_CHU_PHRASE);
        resolve({ file, value: extractedNumber, index });
      } catch (err) {
        reject({ file, error: err.message, index });
      }
    };
    reader.onerror = () => reject({ file, error: "File read error", index });
    reader.readAsArrayBuffer(file);
  });
};

// Process Excel files
export const processExcelFile = async (file, index) => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Use the enhanced extraction function for Excel
        const extractedNumber = extractNumbersFromExcel(data, TOTAL_PHRASES, BANG_CHU_PHRASE);
        resolve({ file, value: extractedNumber, index });
      } catch (err) {
        reject({ file, error: err.message, index });
      }
    };
    reader.onerror = () => reject({ file, error: "File read error", index });
    reader.readAsArrayBuffer(file);
  });
};

// Process PDF files (skip PDF reading)
export const processPdfFile = async (file, index) => {
  return new Promise((resolve) => {
    resolve({ file, value: "Bỏ qua PDF", index });
  });
}; 