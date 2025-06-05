import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { Option } = Select;

const EditNguonCH = ({ nguonCHId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [nguonCHData, setNguonCHData] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (nguonCHId) fetchNguonCHData(nguonCHId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng');
  }, [nguonCHId]);

  const fetchNguonCHData = async (id) => {
    setFetchLoading(true);
    try {
      const response = await crmInstance.get(`/opportunity-sources/${id}`);
      const nguonCH = response.data;
      
      if (!nguonCH) throw new Error(`Không tìm thấy nguồn cơ hội với mã: ${id}`);
      
      // Format date if it exists
      if (nguonCH.ngay_cap_nhat) {
        nguonCH.ngay_cap_nhat = moment(nguonCH.ngay_cap_nhat);
      } else {
        // Set today's date if no date exists
        nguonCH.ngay_cap_nhat = moment();
      }
      
      setNguonCHData(nguonCH);
      form.setFieldsValue(nguonCH);
      message.success(`Đã tải thông tin nguồn cơ hội: ${nguonCH.ma_nguon}`);
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
      // Extract ma_nguon from values to ensure it's not modified in the payload
      const { ma_nguon, ...updateData } = values;
      
      const payload = {
        ...updateData,
        ngay_cap_nhat: values.ngay_cap_nhat ? moment(values.ngay_cap_nhat).format('YYYY-MM-DD') : null,
      };

      console.log('🚀 Payload gửi đi:', payload);

      const response = await crmInstance.put(`/opportunity-sources/${nguonCHId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }

      message.success('Cập nhật Nguồn cơ hội thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('❌ Lỗi cập nhật:', error);
      message.error('Không thể cập nhật Nguồn cơ hội');
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
              Chỉnh sửa Nguồn cơ hội: {nguonCHData?.ma_nguon || nguonCHId}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    name="ma_nguon" 
                    label="Mã nguồn"
                    extra={`Mã nguồn: ${nguonCHData?.ma_nguon || nguonCHId}`}
                  >
                    <Input disabled style={{ color: '#000', fontWeight: 'bold' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    name="nguon" 
                    label="Tên nguồn" 
                    rules={[{ required: true, message: 'Tên nguồn không được để trống' }]}
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

export default EditNguonCH;