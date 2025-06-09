import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { dayjs } from '../../../utils/format/dayjs-config';
import { fetchDataList, updateItemById } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';

const { Option } = Select;

const Editstock_in = ({ stock_inId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [stock_inData, setStockInData] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [bills, setBills] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    if (stock_inId) fetchStockInData(stock_inId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/products', setProducts, 'Không thể tải danh sách hàng hóa');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', setSuppliers, 'Không thể tải danh sách nhà cung cấp');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/warehouses', setWarehouses, 'Không thể tải danh sách kho');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/bills', setBills, 'Không thể tải danh sách bill');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/contracts', setContracts, 'Không thể tải danh sách hợp đồng');
  }, [stock_inId]);

  const fetchStockInData = async (id) => {
    setFetchLoading(true);
    try {
      const allStock_In = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-in');
      const stock_in = allStock_In.find(item => item.ma_stock_in === id);
      if (!stock_in) throw new Error(`Không tìm thấy nhập hàng với mã: ${id}`);
      setStockInData(stock_in);
      form.setFieldsValue({
        ...stock_in,
        ngay_nhap_hang: stock_in.ngay_nhap_hang ? dayjs(stock_in.ngay_nhap_hang) : null,
      });   
      message.success(`Đã tải thông tin nhập hàng: ${stock_in.ma_hang}`);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      message.error(error.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        ngay_nhap_hang: values.ngay_nhap_hang?.format('YYYY-MM-DD'),
      };

      console.log('🚀 Payload gửi đi:', payload);
      
      const response = await updateItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/stock-in/${stock_inId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }
      
      message.success('Cập nhật nhập hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      message.error('Không thể cập nhật nhập hàng');
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
          <h2 className="edit-title" style={{ marginBottom: 24 }}>
            Chỉnh sửa Nhập Hàng: {stock_inData?.ma_hang || stock_inId}
          </h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_stock_in" label="Mã nhập" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ma_hang" label="Mã hàng" rules={[{ required: true }]}>
                  <Select
                    showSearch
                    optionFilterProp="children"
                    placeholder="Chọn mã hàng"
                    onChange={ma_hang => {
                      const product = products.find(p => p.ma_hang === ma_hang);
                      if (product && product.suppliers) {
                        form.setFieldsValue({
                          ten_nha_cung_cap: product.suppliers.ma_nha_cung_cap,
                        });
                      }
                    }}
                  >
                    {products
                      .filter((product, index, self) =>
                        index === self.findIndex(p => p.ma_hang === product.ma_hang)
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
                <Form.Item name="ngay_nhap_hang" label="Ngày nhập hàng" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="so_luong_nhap" label="Số lượng" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ten_nha_cung_cap" label="Nhà cung cấp" rules={[{ required: true }]}>
                  <Select optionFilterProp="children" placeholder="Chọn nhà cung cấp" disabled>
                    {suppliers.map(supplier => (
                      <Option key={supplier.ma_nha_cung_cap} value={supplier.ma_nha_cung_cap}>
                        {supplier.ten_nha_cung_cap}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ten_kho" label="Kho" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn kho">
                    {warehouses.map(warehouse => (
                      <Option key={warehouse.ma_kho} value={warehouse.ma_kho}>
                        {warehouse.ten_kho}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_bill" label="Mã Bill" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn mã bill">
                    {bills.map(bill => (
                      <Option key={bill.ma_bill} value={bill.ma_bill}>
                        {bill.ma_bill}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ma_hop_dong" label="Số hợp đồng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn hợp đồng">
                    {contracts.map(contract => (
                      <Option key={contract.so_hop_dong} value={contract.so_hop_dong}>
                        {contract.so_hop_dong}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div className="form-actions">
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu
              </Button>
              <Button icon={<CloseOutlined />} onClick={onCancel} danger>
                Hủy
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default Editstock_in;
