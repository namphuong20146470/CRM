import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, createItem } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { Option } = Select;

const AddNguonCH = ({ onCancel, onSuccess, disabled }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [existingNguonCH, setExistingNguonCH] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch accounts
        await fetchAndSetList(
          'https://dx.hoangphucthanh.vn:3000/warehouse/accounts', 
          setAccounts, 
          'Không thể tải danh sách người dùng'
        );
        
        // Fetch existing nguon co hoi (for automatic code generation in backend)
        try {
          const nguonResponse = await crmInstance.get('/opportunity-sources');
          // Make sure we're setting an array
          const nguonData = Array.isArray(nguonResponse.data) 
            ? nguonResponse.data 
            : Array.isArray(nguonResponse.data?.data) 
              ? nguonResponse.data.data 
              : [];
          
          console.log('Nguồn cơ hội data:', nguonData);
          setExistingNguonCH(nguonData);
        } catch (err) {
          console.error('Error fetching nguon co hoi:', err);
          setExistingNguonCH([]);
        }
        
        // Set form values - just the date
        form.setFieldsValue({
          ngay_cap_nhat: moment()
        });
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
      // Generate the next ma_nguon code
      let maxNumber = 0;
      
      // Safely iterate through existingNguonCH
      if (Array.isArray(existingNguonCH)) {
        existingNguonCH.forEach(item => {
          if (item && item.ma_nguon) {
            const match = item.ma_nguon.match(/^CH(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNumber) maxNumber = num;
            }
          }
        });
      } else {
        console.warn('existingNguonCH is not an array:', existingNguonCH);
      }
      
      const nextCode = `CH${String(maxNumber + 1).padStart(2, '0')}`;
      console.log('Generated next code:', nextCode);

      const payload = {
        ...values,
        ma_nguon: nextCode, // Add automatically generated code
        ngay_cap_nhat: values.ngay_cap_nhat?.format('YYYY-MM-DD'),
      };

      console.log('🚀 Payload gửi đi:', payload);
      
      // Use CRM API endpoint for opportunity sources
      const response = await crmInstance.post('/opportunity-sources', payload);

      console.log('📦 Kết quả thêm mới:', response);

      if (response && response.status && response.status >= 400) {
        throw new Error('Thêm mới thất bại từ server');
      }

      message.success('Thêm mới Nguồn cơ hội thành công!');
      onSuccess?.(); // Callback reload data
    } catch (error) {
      console.error('Lỗi thêm mới:', error);
      message.error('Không thể thêm mới Nguồn cơ hội: ' + (error.message || 'Lỗi không xác định'));
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
          <h2 className="edit-title" style={{ marginBottom: 24 }}>Thêm mới Nguồn cơ hội</h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="nguon" label="Tên nguồn" rules={[{ required: true, message: 'Tên nguồn không được để trống' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
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
            </Row>
            <Form.Item name="ngay_cap_nhat" hidden>
              <DatePicker />
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

export default AddNguonCH;