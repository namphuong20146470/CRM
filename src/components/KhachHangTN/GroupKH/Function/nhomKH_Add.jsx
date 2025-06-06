import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { Option } = Select;

const AddNhomKH = ({ onCancel, onSuccess, disabled }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [existingGroups, setExistingGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the warehouse API for accounts since that's where they're stored
        await fetchAndSetList(
          'https://dx.hoangphucthanh.vn:3000/warehouse/accounts', 
          setAccounts, 
          'Không thể tải danh sách người dùng'
        );
        
        // Fetch existing customer groups
        const groupsResponse = await crmInstance.get('/customer-groups');
        const groupsData = Array.isArray(groupsResponse.data) 
          ? groupsResponse.data 
          : Array.isArray(groupsResponse.data?.data)
            ? groupsResponse.data.data
            : [];
            
        console.log('Nhóm khách hàng data:', groupsData);
        setExistingGroups(groupsData);
        
        // Set default date
        form.setFieldsValue({ngay_cap_nhat: moment()});
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Generate the next ma_nhom_khach_hang code
      let maxNumber = 0;
      
      if (Array.isArray(existingGroups)) {
        existingGroups.forEach(item => {
          if (item && item.ma_nhom_khach_hang) {
            const match = item.ma_nhom_khach_hang.match(/^NKH(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNumber) maxNumber = num;
            }
          }
        });
      } else {
        console.warn('existingGroups is not an array:', existingGroups);
      }
      
      const nextCode = `NKH${maxNumber + 1}`;
      console.log('Generated next code:', nextCode);

      const payload = {
        ...values,
        ma_nhom_khach_hang: nextCode, // Add automatically generated code
        ngay_cap_nhat: values.ngay_cap_nhat?.format('YYYY-MM-DD'),
      };

      console.log('🚀 Payload gửi đi:', payload);
      
      // Use CRM API endpoint for customer groups
      const response = await crmInstance.post('/customer-groups', payload);

      console.log('📦 Kết quả thêm mới:', response);

      if (response && response.status && response.status >= 400) {
        throw new Error('Thêm mới thất bại từ server');
      }

      message.success('Thêm mới nhóm khách hàng thành công!');
      onSuccess?.(); // Callback reload data
    } catch (error) {
      console.error('Lỗi thêm mới:', error);
      message.error('Không thể thêm mới nhóm khách hàng: ' + (error.message || 'Lỗi không xác định'));
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
          <h2 className="edit-title" style={{ marginBottom: 24 }}>Thêm mới Nhóm Khách Hàng</h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="nhom_khach_hang" label="Tên nhóm khách hàng" rules={[{ required: true, message: 'Tên nhóm khách hàng không được để trống' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nguoi_cap_nhat" label="Người cập nhật" rules={[{ required: true, message: 'Vui lòng chọn người cập nhật' }]}>
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
            <Form.Item name="mo_ta" label="Mô tả">
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

export default AddNhomKH;