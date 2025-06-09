import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../../utils/data/dataFilter';
import '../../../utils/css/Custom-Filter.css';

const { Option } = Select;

const HopDongFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  yearFilter,
  setYearFilter,
  contract_typeFilter,
  setContract_TypeFilter,
  accountFilter,
  setAccountFilter,
  statusFilter,
  setStatusFilter,
  onRefresh,
  loading
}) => {
  const uniqueYears = getUniqueValues(data, (item) =>
    new Date(item.ngay_ky_hop_dong).getFullYear().toString()
  );
  const uniqueContract_Type = getUniqueValues(data, (item) => item.contract_type?.ten_loai_hop_dong);
  const uniqueAccounts = getUniqueValues(data, (item) => item.accounts?.ho_va_ten);
  const uniqueStatus = getUniqueValues(data, (item) => item.trang_thai_hop_dong);

  return (
    <div className="filters hopdong-filters">
      <Input
        placeholder="Tìm kiếm theo số hợp đồng, tên đối tác"
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
      <Select value={contract_typeFilter} onChange={setContract_TypeFilter}>
        <Option value="all">Loại hợp đồng</Option>
        {uniqueContract_Type.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={accountFilter} onChange={setAccountFilter}>
        <Option value="all">Người tạo</Option>
        {uniqueAccounts.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={statusFilter} onChange={setStatusFilter}>
        <Option value="all">Trạng thái</Option>
        {uniqueStatus.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        Làm mới
      </Button>
    </div>
  );
};

export default HopDongFilter;
