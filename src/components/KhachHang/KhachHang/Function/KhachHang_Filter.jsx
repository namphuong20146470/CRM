import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../../utils/data/dataFilter';
import '../../../utils/css/Custom-Filter.css';

const { Option } = Select;

const KhachHangFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  yearFilter,
  setYearFilter,
  accountFilter,
  setAccountFilter,
  provinceFilter,
  setProvinceFilter,
  onRefresh,
  loading
}) => {
  const uniqueAccounts = getUniqueValues(data, (item) => item.accounts?.ho_va_ten);
  const uniqueProvinces = getUniqueValues(data, (item) => item.tinh_thanh);
  const uniqueYears = getUniqueValues(data, (item) =>
    new Date(item.ngay_them_vao).getFullYear().toString()
  );

  return (
    <div className="filters">
      <Input
        placeholder="Tìm kiếm theo mã, tên khách hàng hoặc tỉnh"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={accountFilter} onChange={setAccountFilter}>
        <Option value="all">Người phụ trách</Option>
        {uniqueAccounts.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={provinceFilter} onChange={setProvinceFilter}>
        <Option value="all">Tỉnh thành</Option>
        {uniqueProvinces.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
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

export default KhachHangFilter;
