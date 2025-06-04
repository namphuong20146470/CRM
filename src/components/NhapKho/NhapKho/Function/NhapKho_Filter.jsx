import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../../utils/data/dataFilter';
import '../../../utils/css/Custom-Filter.css';

const { Option } = Select;

const NhapKhoFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  product_typeFilter,
  setProduct_TypeFilter,
  supplierFilter,
  setSupplierFilter,
  warehouseFilter,
  setWarehouseFilter,
  yearFilter,
  setYearFilter,
  onRefresh,
  loading
}) => {
  const uniqueProduct_Type = getUniqueValues(data, (item) => item.product?.product_type?.ten_loai_hang);
  const uniqueSuppliers = getUniqueValues(data, (item) => item.product?.suppliers?.ten_nha_cung_cap);
  const uniqueWarehouses = getUniqueValues(data, (item) => item.warehouse?.ten_kho);
  const uniqueYears = getUniqueValues(data, (item) =>
    new Date(item.ngay_nhap_hang).getFullYear().toString()
  );

  return (
    <div className="filters">
      <Input
        placeholder="Tìm kiếm theo mã hàng, số hợp đồng, bill"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={product_typeFilter} onChange={setProduct_TypeFilter}>
          <Option value="all">Loại hàng</Option>
          {uniqueProduct_Type.map((item) => (
              <Option key={item} value={item}>{item}</Option>
          ))}
      </Select>
      <Select value={supplierFilter} onChange={setSupplierFilter}>
        <Option value="all">Nhà cung cấp</Option>
        {uniqueSuppliers.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={warehouseFilter} onChange={setWarehouseFilter}>
        <Option value="all">Kho</Option>
        {uniqueWarehouses.map((item) => (
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

export default NhapKhoFilter;
