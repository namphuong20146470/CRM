import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker } from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
// import '../Suppliers/AddSupplier.css'; // Reuse the same CSS

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

const CatalogProduct = () => {
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
      const response = await fetch('https://dx.hoangphucthanh.vn:3000/warehouse/product-catalogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      
      if (response.ok) {
        message.success('Thêm danh mục hàng hóa mới thành công!');
        form.resetFields();
      } else {
        message.error(`Lỗi: ${result.message || 'Không thể thêm danh mục hàng hóa'}`);
      }
    } catch (error) {
      console.error('Error adding product catalog:', error);
      message.error('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<span style={styles.label}>Thêm danh mục hàng hóa mới</span>}
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
            trang_thai: 'Hoạt động'
          }}
        >
          <Form.Item
            name="ma_danh_muc"
            label={<span style={styles.label}>Mã danh mục</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã danh mục!' }]}
          >
            <Input 
              placeholder="Nhập mã danh mục" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="ten_danh_muc"
            label={<span style={styles.label}>Tên danh mục</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input 
              placeholder="Nhập tên danh mục" 
              className="black-text-input"
            />
          </Form.Item>

          <Form.Item
            name="mo_ta"
            label={<span style={styles.label}>Mô tả</span>}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập mô tả" 
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

export default CatalogProduct;