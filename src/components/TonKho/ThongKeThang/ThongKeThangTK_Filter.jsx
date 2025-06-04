import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../utils/data/dataFilter';
import '../../utils/css/Custom-Filter.css';

const { Option } = Select;

const ThongKeThangFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  yearFilter,
  setYearFilter,
  onRefresh,
  loading
}) => {
  const uniqueYears = getUniqueValues(data, (item) => {
    // Ưu tiên lấy trường 'ngay', nếu không có thì lấy 'ngay_nhap_hang' hoặc 'ngay_xuat_hang'
    const dateStr = item.ngay || item.ngay_nhap_hang || item.ngay_xuat_hang;
    return dateStr ? new Date(dateStr).getFullYear().toString() : '';
  });

  return (
    <div className="filters">
      <Input
        placeholder="Tìm kiếm mã hàng..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={yearFilter} onChange={setYearFilter}>
        <Option value="all">Năm</Option>
        {uniqueYears.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        Làm mới
      </Button>
    </div>
  );
};

export default ThongKeThangFilter;