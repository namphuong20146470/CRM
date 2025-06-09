import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../utils/data/dataFilter';
import '../../utils/css/Custom-Filter.css';

const { Option } = Select;

const ThongKeKhachHangXK_Filter = ({
  data,
  searchTerm,
  setSearchTerm,
  yearFilter,
  setYearFilter,
  onRefresh,
  loading
}) => {
  const uniqueYears = getUniqueValues(data, (item) =>
    new Date(item.ngay_xuat_hang).getFullYear().toString()
  );

  return (
    <div className="filters TKKHxuatkho-filters">
      <Input
        placeholder="Tìm kiếm theo mã hàng, mã hoặc tên khách hàng"
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

export default ThongKeKhachHangXK_Filter;