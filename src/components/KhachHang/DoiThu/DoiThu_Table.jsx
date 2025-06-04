import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Input, Select, Pagination } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import '../../utils/css/Custom-Table.css';
import '../../utils/css/Custom-Button.css';
import '../../utils/css/Custom-Filter.css';
import './HangHoa_Table.css';
import HangHoa_Import from './DoiThu_Import';
import HangHoa_Export from './DoiThu_Export';
import { formatDate } from '../../utils/format/formatDate';
import { getCountryName } from '../../utils/convert/countryCodes';
import { filterData, getUniqueValues } from './DoiThu_Filter';
import axios from '../../utils/api/axiosConfig';
import PaginationControl from '../../utils/format/PaginationControl';  // Import component phân trang

const { Option } = Select;

const BangHangHoa = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [pageSize, setPageSize] = useState(5);  // State cho số dòng mỗi trang
    const [currentPage, setCurrentPage] = useState(1);  // State cho trang hiện tại

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/products');
            const dataArray = res?.data?.data || [];
            const dataWithNames = dataArray.map((item, index) => ({
                ...item,
                stt: index + 1,
            }));
            setData(dataWithNames);
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleImportedData = (importedData) => {
        const lastSTT = data.length > 0 ? data[data.length - 1].stt : 0;
        const dataWithSTT = importedData.map((item, index) => ({
            ...item,
            stt: lastSTT + index + 1,
        }));
        const newData = [...data, ...dataWithSTT];
        setData(newData);
        message.success('Import thành công!');
    };

    const handleExport = () => {
        try {
            HangHoa_Export(data);
        } catch (err) {
            message.error('Xuất file thất bại!');
            console.error(err);
        }
    };

    const handleEdit = (record) => {
        console.log('Sửa:', record);
    };

    const handleRemove = (record) => {
        console.log('Xóa:', record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCountryFilter('all');
        setSupplierFilter('all');
        setCurrentPage(1);
        fetchProducts();
    };

    const filteredData = filterData(data, {
        searchTerm,
        statusFilter,
        countryFilter,
        supplierFilter,
    });

    const uniqueStatus = getUniqueValues(data, (item) => item.tinh_trang_hang_hoa);
    const uniqueCountries = getUniqueValues(data, (item) => getCountryName(item.nuoc_xuat_xu));
    const uniqueSuppliers = getUniqueValues(data, (item) => item.suppliers?.ten_nha_cung_cap);

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const columns = [
        { title: 'STT', dataIndex: 'stt', key: 'stt', width: "3%" },
        { title: 'Mã đối thủ', dataIndex: 'ma_hang', key: 'ma_hang', width: "5%" },
        { title: 'Tên đối thủ', dataIndex: 'ten_hang', key: 'ten_hang', width: "15%" },
        { title: 'Sản phẩm cạnh tranh', dataIndex: ['product_type', 'ten_loai_hang'], key: 'ten_loai_hang', width: "9%" },
        { title: 'Chiến lược giá cả', dataIndex: ['suppliers', 'ten_nha_cung_cap'], key: 'ten_nha_cung_cap', width: "6%" },
        { title: 'Đánh giá mức độ cạnh tranh', dataIndex: 'nuoc_xuat_xu', key: 'nuoc_xuat_xu', render: (code) => getCountryName(code), width: "6%" },
        { title: 'Người cập nhật', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_cap_nhat', width: "9%" },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'ngay_cap_nhat',
            key: 'ngay_cap_nhat',
            render: (text) => formatDate(text),
            width: "5%",
        },
        { title: 'Ghi chú', dataIndex: 'mo_ta', key: 'mo_ta', width: "18%" },
        {
            title: 'Hành động',
            key: 'hanh_dong',
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>Xóa</Button>
                </Space>
            ),
            width: "5%",
        },
    ];

    return (
        <div className="bang-hang-hoa-container">
            <div className="area-header">
                <h2 className="custom-title">Danh mục hàng hóa</h2>
                <div className="button-level1">
                    <Button icon={<ImportOutlined />} onClick={() => document.getElementById('import-excel').click()}>
                        Nhập File
                    </Button>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>
                        Xuất File
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                </div>
                <HangHoa_Import onImport={handleImportedData} />
            </div>

            <div className="filters">
                <Input
                    placeholder="Tìm kiếm theo mã, tên hàng hoặc tên loại hàng"
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                    placeholder="Lọc theo tình trạng"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                >
                    <Option value="all">Tình trạng</Option>
                    {uniqueStatus.map((status) => (
                        <Option key={status} value={status}>
                            {status}
                        </Option>
                    ))}
                </Select>
                <Select
                    placeholder="Lọc theo nước xuất xứ"
                    value={countryFilter}
                    onChange={(value) => setCountryFilter(value)}
                >
                    <Option value="all">Nước xuất xứ</Option>
                    {uniqueCountries.map((country) => (
                        <Option key={country} value={country}>
                            {country}
                        </Option>
                    ))}
                </Select>
                <Select
                    placeholder="Lọc theo nhà cung cấp"
                    value={supplierFilter}
                    onChange={(value) => setSupplierFilter(value)}
                >
                    <Option value="all">Nhà cung cấp</Option>
                    {uniqueSuppliers.map((supplier) => (
                        <Option key={supplier} value={supplier}>
                            {supplier}
                        </Option>
                    ))}
                </Select>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                    Làm mới
                </Button>
            </div>

            <div className="bang-hang-hoa-scroll-wrapper">
              <div style={{ width: 2050 }}>
                  <Table
                      columns={columns}
                      dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                      rowKey="ma_hang"
                      bordered
                      size="small"
                      pagination={false} // Tắt pagination trong Table
                      className="custom-ant-table"
                      loading={loading}
                  />
                </div>
            </div>

            {/* Phân trang và lựa chọn số dòng */}
              <PaginationControl
                total={filteredData.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
              />
        </div>
    );
};

export default BangHangHoa;
