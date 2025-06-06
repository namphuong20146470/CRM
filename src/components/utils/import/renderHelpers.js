import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

/**
 * Render a table cell with error highlighting.
 * @param {string} text - The text to display in the cell.
 * @param {Object} record - The current row record.
 * @param {Array} errorItems - The list of error items.
 * @param {string} fieldName - The field name to check for errors.
 * @param {string} customError - Custom error message (e.g., "Không tồn tại", "Đã tồn tại").
 * @returns {JSX.Element} - The rendered cell.
 */
export const renderWithErrorHighlight = (text, record, errorItems, fieldName, customError = null) => {
  const hasError = errorItems.some(
    (item) =>
      item.index === record.key &&
      item.errors.some((err) => err.includes(fieldName))
  );

  if (customError) {
    // Trường hợp lỗi tùy chỉnh (ví dụ: "Không tồn tại", "Đã tồn tại")
    return <Text type="danger">{customError}</Text>;
  }

  if (!text || text.trim() === '') {
    // Trường hợp không nhập gì
    return <Text type="danger">(Trống)</Text>;
  }

  if (hasError) {
    // Trường hợp có lỗi khác
    return <Text type="danger">{text}</Text>;
  }

  return <Text>{text}</Text>;
};