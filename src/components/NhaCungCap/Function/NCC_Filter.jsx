import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../utils/data/dataFilter';
import '../../utils/css/Custom-Filter.css';

const { Option } = Select;

const NhaCungCapFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  countryFilter,
  setCountryFilter,
  onRefresh,
  loading
}) => {
  const uniqueStatus = getUniqueValues(data, (item) => item.trang_thai);
  const uniqueCountries = getUniqueValues(data, (item) => item.quoc_gia);

  return (
    <div className="filters">
      <Input
        placeholder="Tìm kiếm theo mã hoặc tên nhà cung cấp"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={statusFilter} onChange={setStatusFilter}>
        <Option value="all">Trạng thái</Option>
        {uniqueStatus.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={countryFilter} onChange={setCountryFilter}>
        <Option value="all">Quốc gia</Option>
        {uniqueCountries.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        Làm mới
      </Button>
    </div>
  );
};

export default NhaCungCapFilter;
