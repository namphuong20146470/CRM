import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../../utils/data/dataFilter';
import '../../../utils/css/Custom-Filter.css';

const { Option } = Select;

const TonKhoFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  yearFilter,
  setYearFilter,
  product_typeFilter,
  setProductTypeFilter,
  warehouseFilter,
  setWarehouseFilter,
  multiplierFilter, // Thêm state cho bộ lọc số lần gấp
  setMultiplierFilter, // Hàm cập nhật state
  statusFilter,
  setStatusFilter,
  onRefresh,
  loading
}) => {
  const uniqueYears = getUniqueValues(data, (item) => item.nam).sort((a, b) => b - a);
  const uniqueProductTypes = getUniqueValues(data, (item) => item.product?.product_type?.ten_loai_hang).filter(Boolean);
  const uniqueWarehouses = getUniqueValues(data, (item) => item.warehouse?.ten_kho);

  return (
    <div className="filters">
      <Input
        placeholder="Tìm kiếm theo mã hàng"
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
      <Select value={product_typeFilter} onChange={setProductTypeFilter}>
        <Option value="all">Loại hàng</Option>
        {uniqueProductTypes.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={warehouseFilter} onChange={setWarehouseFilter}>
        <Option value="all">Kho</Option>
        {uniqueWarehouses.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      {/* Bộ lọc mới: Lọc theo số lần gấp */}
      <Select
        value={multiplierFilter}
        onChange={setMultiplierFilter}
        placeholder="Lọc theo số lần gấp"
      >
        <Option value="all">Tồn hiện tại và tồn TT</Option>
        <Option value={2}>Lớn hơn gấp 2 lần</Option>
        <Option value={3}>Lớn hơn gấp 3 lần</Option>
        <Option value={4}>Lớn hơn gấp 4 lần</Option>
        <Option value={5}>Lớn hơn gấp 5 lần</Option>
      </Select>
      <Select
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="Lọc theo trạng thái"
      >
        <Option value="all">Trạng thái</Option>
        <Option value="thieu_hang">Thiếu hàng</Option>
        <Option value="du_hang">Dư hàng tồn quá nhiều</Option>
        <Option value="on_dinh">Hàng ổn định</Option>
      </Select>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        Làm mới
      </Button>
    </div>
  );
};

export default TonKhoFilter;