import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col, Radio } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { fetchDataList, createItem } from '../../../utils/api/requestHelpers';
import '../../../utils/css/Custom-Update.css';

const { Option } = Select;

const AddStockOut = ({ onCancel, onSuccess, disabled }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [newMaStockOut, setNewMaStockOut] = useState('');
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [selectedWarehouseStock, setSelectedWarehouseStock] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [currentStock, setCurrentStock] = useState(0); // Số lượng hàng hiện có

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetchLoading(true);
    try {
      await Promise.all([
        fetchMaxSTT(),
        fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/products').then(setProducts), // Lấy danh sách mã hàng
        fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts').then(setAccounts),
        fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/warehouses').then(setWarehouses),
        fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/customers').then(setCustomers),
      ]);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải dữ liệu.');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchMaxSTT = async () => {
    setFetchLoading(true);
    try {
      const allStock_Out = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out');
      const maxSTT = allStock_Out.length ? Math.max(...allStock_Out.map(item => item.stt || 0)) : 0;
      const newSTT = maxSTT + 1;
      const generatedMaStockOut = `XK${String(newSTT)}`;
      setNewMaStockOut(generatedMaStockOut);

      // Gán luôn giá trị mặc định vào form
      form.setFieldsValue({
        ma_stock_out: generatedMaStockOut,
      });

    } catch (error) {
      console.error('Lỗi khi lấy STT:', error);
      message.error('Không thể khởi tạo mã xuất hàng mới');
    } finally {
      setFetchLoading(false);
    }
  };

  const calculateCurrentStock = async (maHang) => {
  try {
    const stockInData = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-in');
    const stockOutData = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out');

    const relatedStockIn = stockInData.filter(item => item.ma_hang === maHang);
    const stockByWarehouse = {};

    // Nếu không tìm thấy mã hàng trong bất kỳ kho nào (stock-in), coi như "không có kho phù hợp"
    if (relatedStockIn.length === 0) {
      setFilteredWarehouses([]);
      setCurrentStock(0);
      return;
    }

    // Tính tổng số lượng nhập theo từng kho
    relatedStockIn.forEach(item => {
      const maKho = item.ten_kho;
      stockByWarehouse[maKho] = (stockByWarehouse[maKho] || 0) + item.so_luong_nhap;
    });

    // Trừ đi số lượng xuất
    stockOutData
      .filter(item => item.ma_hang === maHang)
      .forEach(item => {
        const maKho = item.ten_kho;
        stockByWarehouse[maKho] = (stockByWarehouse[maKho] || 0) - item.so_luong_xuat;
      });

    // Cập nhật tồn tổng
    const totalStock = Object.values(stockByWarehouse).reduce((sum, sl) => sum + sl, 0);
    setCurrentStock(totalStock);

    // Hiển thị tất cả kho từng chứa mã hàng (dù SL = 0)
    const relevantMaKhoList = Object.keys(stockByWarehouse);

    const filtered = warehouses
      .filter(warehouse => relevantMaKhoList.includes(warehouse.ma_kho))
      .map(warehouse => ({
        ...warehouse,
        so_luong_hien_co: stockByWarehouse[warehouse.ma_kho] || 0
      }));

    setFilteredWarehouses(filtered);
  } catch (error) {
    console.error('Lỗi khi tính toán tồn kho:', error);
    message.error('Không thể tính số lượng hàng hiện có.');
  }
};

  const handleProductChange = (maHang) => {
    form.setFieldsValue({ so_luong_xuat: null, ten_kho: null }); // Reset kho & SL
    setSelectedWarehouseStock(0); // 🔒 Reset SL kho đã chọn -> sẽ khóa lại input số lượng
    calculateCurrentStock(maHang);
  };

  const handleWarehouseChange = (maKho) => {
    const selected = filteredWarehouses.find(w => w.ma_kho === maKho);
    setSelectedWarehouseStock(selected?.so_luong_hien_co || 0);
  };

  const onFinish = async (values) => {
    if (values.so_luong_xuat > currentStock) {
      message.error('Số lượng xuất không được lớn hơn số lượng hàng hiện có.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        ngay_xuat_hang: values.ngay_xuat_hang?.format('YYYY-MM-DD'),
      };

      await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out', payload);

      message.success('Thêm mới xuất hàng thành công!');
      onSuccess?.(); // Callback reload data
    } catch (error) {
      console.error('Lỗi thêm mới:', error);
      message.error('Không thể thêm mới xuất hàng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-container">
      {fetchLoading ? (
        <div className="loading-container">
          <Spin tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          <h2 className="edit-title" style={{ marginBottom: 24 }}>Thêm mới Xuất Hàng</h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_stock_out" label="Mã xuất" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ma_hang" label="Mã hàng">
                  <Select showSearch optionFilterProp="children" placeholder="Chọn mã hàng" onChange={handleProductChange}>
                    {products
                      .filter((product, index, self) =>
                        index === self.findIndex(p => p.ma_hang === product.ma_hang) // Loại bỏ các mã hàng trùng lặp
                      )
                      .map(product => (
                        <Option key={product.stt} value={product.ma_hang}>
                          {product.ma_hang} ({product.ten_hang})
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nguoi_phu_trach" label="Người phụ trách" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn người phụ trách">
                    {accounts.map(account => (
                      <Option key={account.ma_nguoi_dung} value={account.ma_nguoi_dung}>
                        {account.ho_va_ten}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ngay_xuat_hang" label="Ngày xuất hàng" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Số lượng hiện có">
                  <Input value={currentStock} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="so_luong_xuat"
                  label="Số lượng xuất"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lượng xuất' },
                    () => ({
                      validator(_, value) {
                        if (value > selectedWarehouseStock) {
                          return Promise.reject(new Error('Số lượng xuất không được lớn hơn số lượng hiện có trong kho đã chọn.'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    disabled={selectedWarehouseStock === 0}
                    placeholder={selectedWarehouseStock === 0 ? 'Vui lòng chọn kho trước' : 'Nhập số lượng xuất'}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ten_kho" label="Kho" rules={[{ required: true }]}>
                  {filteredWarehouses.length === 0 ? (
                    <p style={{ color: 'red' }}>Không có kho phù hợp</p>
                  ) : (
                    <Radio.Group onChange={e => handleWarehouseChange(e.target.value)}>
                      {filteredWarehouses.map(warehouse => (
                        <Radio key={warehouse.ma_kho} value={warehouse.ma_kho}>
                          {`${warehouse.ten_kho} (SL: ${warehouse.so_luong_hien_co})`}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ten_khach_hang" label="Tên khách hàng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn khách hàng">
                    {customers.map(customer => (
                      <Option key={customer.ma_khach_hang} value={customer.ma_khach_hang}>
                        {customer.ten_khach_hang}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div className="form-actions">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} disabled={disabled}>Thêm</Button>
                <Button icon={<CloseOutlined />} onClick={onCancel} danger>Hủy</Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default AddStockOut;