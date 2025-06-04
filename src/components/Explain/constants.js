// Constants used in the file processing application

// Extended list of phrases to check for totals in documents
export const TOTAL_PHRASES = [
  "total", "Total", "TOTAL",
  "tổng", "Tổng", "TỔNG",
  "total part", "Total Part", "TOTAL PART",
  "total price", "Total Price", "TOTAL PRICE",
  "total amount", "Total Amount", "TOTAL AMOUNT",
  "TOTAL PRICE PART I + II:",
  "TOTAL PRICE PART I + II",
  "TOTAL PRICE PART",
  "Grand Total", "GRAND TOTAL",
  "Sum", "SUM",
  "Tổng cộng", "TỔNG CỘNG",
  // Vietnamese phrases
  "tổng tiền", "Tổng tiền", "TỔNG TIỀN",
  "tổng giá", "Tổng giá", "TỔNG GIÁ",
  "TỔNG GIÁ PHẦN I + II:", "Tổng giá phần I + II:",
  "tổng cộng phần", "Tổng cộng phần", "TỔNG CỘNG PHẦN",
  "tổng cộng giá", "Tổng cộng giá", "TỔNG CỘNG GIÁ"
];

// Key phrase to look for in documents
export const BANG_CHU_PHRASE = "Bằng chữ:";

// File version regex pattern
export const VERSION_REGEX = /^(\d+)([A-Za-z])?[\s\.](.+)$/;

// PDF.js worker source
export const PDFJS_WORKER_SRC = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/VERSION/pdf.worker.min.js`; 