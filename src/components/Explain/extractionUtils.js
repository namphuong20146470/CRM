// Utilities for extracting data from files

// Extract numbers after a specific phrase from text
export const extractNumberAfterPhrase = (text, phrase) => {
  const lines = text.split('\n');
  let found = false;
  let extractedNumbers = [];

  for (let i = lines.length - 1; i >= 0; i--) {
    if (found) {
      const matches = lines[i].match(/\d{1,3}(?:[.,]\d{3})*/g);
      if (matches) {
        const number = parseInt(matches[matches.length - 1].replace(/[.,]/g, ''), 10);
        extractedNumbers.push(number);
      }
    }
    if (lines[i].includes(phrase)) {
      found = true;
    }
  }
  return extractedNumbers.length > 0 ? extractedNumbers[0] : 0;
};

// Advanced extraction for Excel files - checks for multiple phrases
export const extractNumbersFromExcel = (data, totalPhrases, bangChuPhrase) => {
  // Convert Excel data to searchable text
  const text = data.map(row => row.join(' ')).join('\n');

  // First try to find number after "Bằng chữ:"
  let value = extractNumberAfterPhrase(text, bangChuPhrase);

  // If no value found, or value is 0, try looking for "total" related phrases
  if (value === 0) {
    for (const phrase of totalPhrases) {
      const extractedValue = extractNumberAfterPhrase(text, phrase);
      if (extractedValue > 0) {
        value = extractedValue;
        break;
      }
    }

    // Also search for cells with "total" and a number in the same row
    for (const row of data) {
      if (row && row.length > 1) {
        const rowText = row.join(' ').toLowerCase();
        if (rowText.includes('total') || rowText.includes('tổng') ||
          rowText.includes('part') || rowText.includes('price') ||
          rowText.includes('amount') || rowText.includes('sum') ||
          rowText.includes('cộng')) {
          const matches = rowText.match(/\d{1,3}(?:[.,]\d{3})*/g);
          if (matches) {
            const number = parseInt(matches[matches.length - 1].replace(/[.,]/g, ''), 10);
            if (!isNaN(number) && number > 0) {
              value = number;
              break;
            }
          }
        }
      }
    }
  }

  return value;
}; 