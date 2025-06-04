import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { dayjs } from '../../../utils/format/dayjs-config';
import { fetchDataList, updateItemById } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';

const { Option } = Select;

const Editstock_out = ({ stock_outId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [stock_outData, setStockOutData] = useState(null);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (stock_outId) fetchStockOutData(stock_outId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/products', setProducts, 'Không thể tải danh sách hàng hóa');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/warehouses', setWarehouses, 'Không thể tải danh sách kho');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/customers', setCustomers, 'Không thể tải danh sách khách hàng');
  }, [stock_outId]);

  const fetchStockOutData = async (id) => {
    setFetchLoading(true);
    try {
      const allStock_Out = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out');
      const stock_out = allStock_Out.find(item => item.ma_stock_out === id);
      if (!stock_out) throw new Error(`Không tìm thấy xuất hàng với mã: ${id}`);
      setStockOutData(stock_out);
      form.setFieldsValue({
        ...stock_out,
        ngay_xuat_hang: stock_out.ngay_xuat_hang ? dayjs(stock_out.ngay_xuat_hang) : null,
      });  
      message.success(`Đã tải thông tin xuất hàng: ${stock_out.ma_hang}`);
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
        ngay_xuat_hang: values.ngay_xuat_hang?.format('YYYY-MM-DD'),
      };

      console.log('🚀 Payload gửi đi:', payload);
      
      const response = await updateItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/stock-out/${stock_outId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }
      
      message.success('Cập nhật xuất hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      message.error('Không thể cập nhật xuất hàng');
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
            Chỉnh sửa Xuất Hàng: {stock_outData?.ma_hang || stock_outId}
          </h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_stock_out" label="Mã xuất" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ma_hang" label="Mã hàng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn mã hàng">
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
                <Form.Item name="ngay_xuat_hang" label="Ngày xuất hàng" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="so_luong_xuat" label="Số lượng" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} />
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

export default Editstock_out;
