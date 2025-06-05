import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { Option } = Select;

const EditNhomKH = ({ nhomKHId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [nhomKHData, setNhomKHData] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (nhomKHId) fetchNhomKHData(nhomKHId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng');
  }, [nhomKHId]);

  const fetchNhomKHData = async (id) => {
    setFetchLoading(true);
    try {
      const response = await crmInstance.get(`/customer-groups/${id}`);
      const nhomKH = response.data;
      
      if (!nhomKH) throw new Error(`Không tìm thấy nhóm khách hàng với mã: ${id}`);
      
      // Format date if it exists
      if (nhomKH.ngay_cap_nhat) {
        nhomKH.ngay_cap_nhat = moment(nhomKH.ngay_cap_nhat);
      } else {
        // Set today's date if no date exists
        nhomKH.ngay_cap_nhat = moment();
      }
      
      setNhomKHData(nhomKH);
      form.setFieldsValue(nhomKH);
      message.success(`Đã tải thông tin nhóm khách hàng: ${nhomKH.nhom_khach_hang}`);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      message.error(`Không thể tải thông tin: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Extract ma_nhom_khach_hang from values to ensure it's not modified in the payload
      const { ma_nhom_khach_hang, ...updateData } = values;
      
      const payload = {
        ...updateData,
        ngay_cap_nhat: values.ngay_cap_nhat ? moment(values.ngay_cap_nhat).format('YYYY-MM-DD') : null,
      };

      console.log('🚀 Payload gửi đi:', payload);

      const response = await crmInstance.put(`/customer-groups/${nhomKHId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }

      message.success('Cập nhật nhóm khách hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('❌ Lỗi cập nhật:', error);
      message.error('Không thể cập nhật nhóm khách hàng');
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
              Chỉnh sửa Nhóm Khách Hàng: {nhomKHData?.nhom_khach_hang || nhomKHId}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    name="ma_nhom_khach_hang" 
                    label="Mã nhóm khách hàng"
                    extra={`Mã nhóm: ${nhomKHData?.ma_nhom_khach_hang || nhomKHId}`}
                  >
                    <Input disabled style={{ color: '#000', fontWeight: 'bold' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    name="nhom_khach_hang" 
                    label="Tên nhóm khách hàng" 
                    rules={[{ required: true, message: 'Tên nhóm khách hàng không được để trống' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    name="nguoi_cap_nhat" 
                    label="Người cập nhật" 
                    rules={[{ required: true, message: 'Vui lòng chọn người cập nhật' }]}
                  >
                    <Select showSearch optionFilterProp="children" placeholder="Chọn người cập nhật">
                      {accounts.map(account => (
                        <Option key={account.ma_nguoi_dung} value={account.ma_nguoi_dung}>
                          {account.ho_va_ten}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    name="ngay_cap_nhat" 
                    label="Ngày cập nhật"
                    rules={[{ required: true, message: 'Ngày cập nhật không được để trống' }]}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="mo_ta" label="Mô tả">
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

export default EditNhomKH;