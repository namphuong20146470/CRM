import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../../utils/data/dataFilter';
import { getCountryName } from '../../../utils/convert/countryCodes';
import { getStatusName } from '../../../utils/convert/statusCodes';
import '../../../utils/css/Custom-Filter.css';

const { Option } = Select;

const HangHoaFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  pricelistSearch,
  setPricelistSearch,
  statusFilter,
  setStatusFilter,
  countryFilter,
  setCountryFilter,
  supplierFilter,
  setSupplierFilter,
  onRefresh,
  loading
}) => {
  const uniqueStatus = getUniqueValues(data, (item) => getStatusName(item.tinh_trang_hang_hoa));
  const uniqueCountries = getUniqueValues(data, (item) => getCountryName(item.nuoc_xuat_xu));
  const uniqueSuppliers = getUniqueValues(data, (item) => item.suppliers?.ten_nha_cung_cap);

  return (
    <div className="filters">
        <Input
            className="search-input"
            placeholder="Tìm kiếm theo mã, tên hàng hoặc tên loại hàng"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Input
            className="search-input"
            placeholder="Tìm theo price list"
            prefix={<SearchOutlined />}
            value={pricelistSearch}
            onChange={(e) => setPricelistSearch(e.target.value)}
        />
        <Select value={statusFilter} onChange={setStatusFilter}>
            <Option value="all">Tình trạng</Option>
            {uniqueStatus.map((item) => (
            <Option key={item} value={item}>{item}</Option>
            ))}
        </Select>
        <Select value={countryFilter} onChange={setCountryFilter}>
            <Option value="all">Nước xuất xứ</Option>
            {uniqueCountries.map((item) => (
            <Option key={item} value={item}>{item}</Option>
            ))}
        </Select>
        <Select value={supplierFilter} onChange={setSupplierFilter}>
            <Option value="all">Nhà cung cấp</Option>
            {uniqueSuppliers.map((item) => (
            <Option key={item} value={item}>{item}</Option>
            ))}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Làm mới
        </Button>
  </div>
  );
};

export default HangHoaFilter;
