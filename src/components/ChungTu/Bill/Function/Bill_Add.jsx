import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, createItem } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';

const { Option } = Select;

const AddBill = ({ onCancel, onSuccess, disabled }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
      fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng').finally(() => setFetchLoading(false));
      form.setFieldsValue({ngay_cap_nhat: moment()});
    }, []);
  
    const onFinish = async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          ngay_cap_nhat: values.ngay_cap_nhat?.format('YYYY-MM-DD'),
        };
  
        console.log('🚀 Payload gửi đi:', payload);
  
        const response = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/bills', payload);
  
        console.log('📦 Kết quả thêm mới:', response);
  
        if (response && response.status && response.status >= 400) {
          throw new Error('Thêm mới thất bại từ server');
        }
  
        message.success('Thêm mới Bill thành công!');
        onSuccess?.(); // Callback reload data
      } catch (error) {
        console.error('Lỗi thêm mới:', error);
        message.error('Không thể thêm mới Bill');
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
          <h2 className="edit-title" style={{ marginBottom: 24 }}>Thêm mới Bill</h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_bill" label="Mã bill" 
                  rules={[
                      { required: true, message: 'Mã bill không được để trống' },
                      {
                          pattern: /^[^a-z]+$/,
                          message: 'Không được chứa chữ thường (a–z)',
                      },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nguoi_cap_nhat" label="Người cập nhật" rules={[{ required: true }]}>
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
                <Form.Item name="ngay_cap_nhat" label="Ngày cập nhật" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="ghi_chu" label="Ghi chú">
              <Input.TextArea rows={3} />
            </Form.Item>
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

export default AddBill;
