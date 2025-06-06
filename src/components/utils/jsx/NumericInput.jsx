import React, { useState, useEffect } from 'react';
import { Input } from 'antd';

// Format hiển thị: thêm dấu chấm cho phần nghìn
const formatNumber = (value) => {
  if (!value) return value;
  const parts = value.split(','); // Tách phần nguyên và phần thập phân
  const integerPart = parts[0].replace(/\D/g, ''); // Giữ số ở phần nguyên
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Thêm dấu . vào phần nguyên
  const decimalPart = parts[1] !== undefined ? `,${parts[1]}` : ''; // Giữ phần thập phân nếu có
  return formattedInteger + decimalPart; // Ghép phần nguyên và phần thập phân
};

// Parse về số thật (dấu , -> .)
const parseNumber = (value) => {
  if (!value) return null;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

const NumericInput = ({ value, onChange, ...rest }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Cập nhật khi value từ ngoài thay đổi
  useEffect(() => {
    if (value === null || value === undefined || isNaN(value)) {
      setDisplayValue('');
    } else {
      const raw = value.toString().replace('.', ',');
      setDisplayValue(formatNumber(raw));
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Chỉ cho nhập số, dấu . và ,
    if (!/^[0-9.,]*$/.test(inputValue)) return;

    setDisplayValue(inputValue); // Cập nhật UI

    const parsed = parseNumber(inputValue);
    if (!isNaN(parsed)) {
      onChange?.(parsed); // Truyền số thực ra ngoài
    } else {
      onChange?.(null);
    }
  };

  return (
    <Input
      {...rest}
      value={displayValue}
      onChange={handleChange}
      placeholder="Nhập số..."
    />
  );
};

export default NumericInput;
