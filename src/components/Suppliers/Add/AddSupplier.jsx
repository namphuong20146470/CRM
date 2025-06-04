import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker } from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import './AddSupplier.css';

const { Option } = Select;

// Define styles
const styles = {
  input: {
    color: '#000000 !important',
    '& input': {
      color: '#000000 !important'
    }
  },
  label: {
    color: '#000000'
  },
  select: {
    color: '#000000 !important',
    '& .ant-select-selection-item': {
      color: '#000000 !important'
    }
  }
};

const AddSupplier = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Format the date to ISO string
      if (values.ngay_them_vao) {
        values.ngay_them_vao = values.ngay_them_vao.toISOString();
      }

      // Send data to API
      const response = await fetch('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      
      if (response.ok) {
        message.success('Thêm nhà cung cấp mới thành công!');
        form.resetFields();
      } else {
        message.error(`Lỗi: ${result.message || 'Không thể thêm nhà cung cấp'}`);
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      message.error('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<span style={styles.label}>Thêm nhà cung cấp mới</span>}
        style={{ 
          maxWidth: 800, 
          margin: '0 auto',
          borderRadius: '8px'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            trang_thai: 'Hoạt động',
            tong_no_phai_tra: 0
          }}
        >
          <Form.Item
            name="ma_nha_cung_cap"
            label={<span style={styles.label}>Mã nhà cung cấp</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã nhà cung cấp!' }]}
          >
            <Input 
              placeholder="Nhập mã nhà cung cấp" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="ten_nha_cung_cap"
            label={<span style={styles.label}>Tên nhà cung cấp</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
          >
            <Input 
              placeholder="Nhập tên nhà cung cấp" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="so_dien_thoai"
            label={<span style={styles.label}>Số điện thoại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input 
              placeholder="Nhập số điện thoại" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={styles.label}>Email</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              placeholder="Nhập email" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="dia_chi"
            label={<span style={styles.label}>Địa chỉ</span>}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input 
              placeholder="Nhập địa chỉ" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="quoc_gia"
            label={<span style={styles.label}>Quốc gia</span>}
            rules={[{ required: true, message: 'Vui lòng chọn quốc gia!' }]}
          >
            <Select 
              placeholder="Chọn quốc gia"
              className="black-text-input"
            >
              <Option value="Việt Nam">Việt Nam</Option>
              <Option value="Đức">Đức</Option>
              <Option value="Mỹ">Mỹ</Option>
              <Option value="Nhật Bản">Nhật Bản</Option>
              <Option value="Hàn Quốc">Hàn Quốc</Option>
              <Option value="Trung Quốc">Trung Quốc</Option>
              <Option value="Đài Loan">Đài Loan</Option>
              <Option value="Singapore">Singapore</Option>
              <Option value="Thái Lan">Thái Lan</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ma_so_thue"
            label={<span style={styles.label}>Mã số thuế</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã số thuế!' }]}
          >
            <Input 
              placeholder="Nhập mã số thuế" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="trang_website"
            label={<span style={styles.label}>Trang website</span>}
          >
            <Input 
              placeholder="Nhập trang website" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="trang_thai"
            label={<span style={styles.label}>Trạng thái</span>}
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select className="black-text-input">
              <Option value="Hoạt động">Hoạt động</Option>
              <Option value="Không hoạt động">Không hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ngay_them_vao"
            label={<span style={styles.label}>Ngày thêm vào</span>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày thêm vào!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="ghi_chu"
            label={<span style={styles.label}>Ghi chú</span>}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập ghi chú" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
              >
                Lưu
              </Button>
              <Button 
                icon={<RollbackOutlined />}
                onClick={() => window.history.back()}
              >
                Quay lại
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddSupplier; 