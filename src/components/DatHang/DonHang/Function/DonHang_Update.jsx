import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, updateItemById } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';


const { Option } = Select;

const EditOrder = ({ orderId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (orderId) fetchOrderData(orderId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng');
  }, [orderId]);

  const fetchOrderData = async (id) => {
    setFetchLoading(true);
    try {
      const allOrders = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/orders');
      const order = allOrders.find(item => item.so_don_hang === id);
      if (!order) throw new Error(`Không tìm thấy đơn hàng với mã: ${id}`);
      if (order.ngay_tao_don) order.ngay_tao_don = moment(order.ngay_tao_don);
      setOrderData(order);
      form.setFieldsValue(order);
      message.success(`Đã tải thông tin đơn hàng: ${order.so_don_hang}`);
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
        ngay_tao_don: values.ngay_tao_don ? moment(values.ngay_tao_don).format('YYYY-MM-DD') : null,
      };

      console.log('🚀 Payload gửi đi:', payload);

      const response = await updateItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/orders/${orderId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }

      message.success('Cập nhật đơn hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('❌ Lỗi cập nhật:', error);
      message.error('Không thể cập nhật đơn hàng');
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
            Chỉnh sửa Đơn Hàng: {orderData?.so_don_hang || orderId}
          </h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="so_don_hang" label="Số đơn hàng" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tong_gia_tri_don_hang" label="Tổng giá trị đơn hàng">
                  <NumericInput style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nguoi_lap_don" label="Người lập đơn" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn người lập đơn">
                    {accounts.map(account => (
                      <Option key={account.ma_nguoi_dung} value={account.ma_nguoi_dung}>
                        {account.ho_va_ten}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ngay_tao_don" label="Ngày tạo đơn" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="ghi_chu" label="Ghi chú">
              <Input.TextArea rows={3} />
            </Form.Item>
            <div className="form-actions">
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Lưu</Button>
              <Button icon={<CloseOutlined />} onClick={onCancel} danger>Hủy</Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default EditOrder;