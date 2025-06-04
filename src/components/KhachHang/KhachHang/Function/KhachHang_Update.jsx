import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, updateItemById } from '../../../utils/api/requestHelpers';
import { getVietnamProvinces } from '../../../utils/format/location';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';

const { Option } = Select;

const Editcustomer = ({ customerId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (customerId) fetchCustomerData(customerId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng');
  }, [customerId]);

  const fetchCustomerData = async (id) => {
    setFetchLoading(true);
    try {
      const allCustomers = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/customers');
      const customer = allCustomers.find(item => item.ma_khach_hang === id);
      if (!customer) throw new Error(`Không tìm thấy khách hàng với mã: ${id}`);
      if (customer.ngay_them_vao) customer.ngay_them_vao = moment(customer.ngay_them_vao);
      setCustomerData(customer);
      form.setFieldsValue(customer);
      message.success(`Đã tải thông tin khách hàng: ${customer.ten_khach_hang}`);
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
        ngay_them_vao: values.ngay_them_vao?.format('YYYY-MM-DD'),
      };

      console.log('🚀 Payload gửi đi:', payload);
      
      const response = await updateItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/customers/${customerId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }
      
      message.success('Cập nhật khách hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      message.error('Không thể cập nhật khách hàng');
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
            Chỉnh sửa Khách Hàng: {customerData?.ten_khach_hang || customerId}
          </h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_khach_hang" label="Mã khách hàng" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ten_khach_hang" label="Tên khách hàng" 
                  rules={[
                    { required: true, message: 'Tên khách hàng không được để trống' },
                    { pattern: /^[A-Z0-9 ]+$/, message: 'Chỉ cho phép chữ hoa, số và khoảng trắng' },
                  ]}
                >
                  <Input />
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
                <Form.Item name="ma_so_thue" label="Mã số thuế" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="dia_chi_cu_the" label="Địa chỉ cụ thể">
              <Input />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="tinh_thanh" label="Tỉnh thành">
                  <Select showSearch optionFilterProp="children" placeholder="Chọn tỉnh thành">
                    {getVietnamProvinces().map(province => (
                      <Option key={province} value={province}>{province}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="nguoi_lien_he" label="Người liên hệ">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="so_dien_thoai" label="SĐT" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                  <Input type="email" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ngay_them_vao" label="Ngày thêm" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tong_no_phai_thu" label="Tổng nợ phải thu" rules={[{ required: true }]}>
                  <NumericInput style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="ghi_chu" label="Ghi chú">
              <Input.TextArea rows={3} />
            </Form.Item>
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

export default Editcustomer;
