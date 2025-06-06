import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker } from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import moment from 'moment';
import './AddSupplier.css';

const { Option } = Select;

const EditSupplier = ({ supplierId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Fetch supplier data based on supplierId
  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        // Fetch data for the specific supplier using supplierId
        const response = await fetch(`https://dx.hoangphucthanh.vn:3000/warehouse/suppliers/${supplierId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();

        // Convert date string to moment object for DatePicker
        if (data.ngay_them_vao) {
          data.ngay_them_vao = moment(data.ngay_them_vao);
        }

        setInitialData(data);
        form.setFieldsValue(data);
      } catch (error) {
        console.error('Error fetching supplier data:', error);
        message.error(`Không thể tải thông tin nhà cung cấp: ${error.message}`);

        // Use mock data as fallback
        const mockData = getMockSupplierData(supplierId);
        if (mockData) {
          setInitialData(mockData);
          form.setFieldsValue(mockData);
        }
      }
    };

    if (supplierId) {
      fetchSupplierData();
    }
  }, [supplierId, form]);

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Format the date to ISO string if it exists
      if (values.ngay_them_vao) {
        values.ngay_them_vao = values.ngay_them_vao.toISOString();
      }

      // Prepare request data
      const requestData = {
        ma_nha_cung_cap: supplierId,
        ten_nha_cung_cap: values.ten_nha_cung_cap,
        so_dien_thoai: values.so_dien_thoai,
        email: values.email,
        dia_chi: values.dia_chi,
        quoc_gia: values.quoc_gia,
        ma_so_thue: values.ma_so_thue,
        trang_website: values.trang_website,
        trang_thai: values.trang_thai,
        tong_no_phai_tra: values.tong_no_phai_tra || 0, // Ensure this field is included
        ghi_chu: values.ghi_chu,
        ngay_them_vao: values.ngay_them_vao,
      };

      console.log('Sending data to server:', requestData);

      // Send PUT request to update the supplier
      const response = await fetch(`https://dx.hoangphucthanh.vn:3000/warehouse/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);

      message.success('Cập nhật nhà cung cấp thành công!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      message.error(`Không thể kết nối đến server: ${error.message}`);
      // Simulate success for development
      message.success('Cập nhật nhà cung cấp thành công! (Mock)');
      if (onSuccess) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development/testing
  const getMockSupplierData = (id) => {
    const mockSuppliers = [
      {
        ma_nha_cung_cap: 'NCC001',
        ten_nha_cung_cap: 'Công ty TNHH ABC',
        so_dien_thoai: '0123456789',
        email: 'contact@abc.com',
        dia_chi: '123 Đường ABC, Quận 1, TP.HCM',
        quoc_gia: 'Việt Nam',
        ma_so_thue: '0123456789',
        trang_website: 'www.abc.com',
        trang_thai: 'Hoạt động',
        ngay_them_vao: moment('2023-01-01'),
        ghi_chu: 'Nhà cung cấp chính',
        tong_no_phai_tra: 0,
      },
      {
        ma_nha_cung_cap: 'NCC006',
        ten_nha_cung_cap: 'Karl Storz',
        so_dien_thoai: '0987957805',
        email: 'contact@karlstorz.com',
        dia_chi: '789 Đường Lê Lợi, Quận 1, TP.HCM',
        quoc_gia: 'Mỹ',
        ma_so_thue: '1234567890',
        trang_website: 'www.karlstorz.com',
        trang_thai: 'Hoạt động',
        ngay_them_vao: moment('2023-03-20'),
        ghi_chu: 'Nhà cung cấp thiết bị nội soi hàng đầu',
        tong_no_phai_tra: 0,
      },
    ];

    return mockSuppliers.find((s) => s.ma_nha_cung_cap === id);
  };

  if (!initialData) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          fontSize: '16px',
          color: '#000000',
        }}
      >
        Đang tải thông tin nhà cung cấp...
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<span style={{ color: '#000000' }}>Sửa thông tin nhà cung cấp</span>}
        style={{
          maxWidth: 800,
          margin: '0 auto',
          borderRadius: '8px',
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="ma_nha_cung_cap"
            label={<span style={{ color: '#000000' }}>Mã nhà cung cấp</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã nhà cung cấp!' }]}
          >
            <Input placeholder="Nhập mã nhà cung cấp" className="black-text-input" disabled />
          </Form.Item>

          <Form.Item
            name="ten_nha_cung_cap"
            label={<span style={{ color: '#000000' }}>Tên nhà cung cấp</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" className="black-text-input" />
          </Form.Item>

          <Form.Item
            name="so_dien_thoai"
            label={<span style={{ color: '#000000' }}>Số điện thoại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input placeholder="Nhập số điện thoại" className="black-text-input" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ color: '#000000' }}>Email</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập email" className="black-text-input" />
          </Form.Item>

          <Form.Item
            name="dia_chi"
            label={<span style={{ color: '#000000' }}>Địa chỉ</span>}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Nhập địa chỉ" className="black-text-input" />
          </Form.Item>

          <Form.Item
            name="quoc_gia"
            label={<span style={{ color: '#000000' }}>Quốc gia</span>}
            rules={[{ required: true, message: 'Vui lòng chọn quốc gia!' }]}
          >
            <Select placeholder="Chọn quốc gia" className="black-text-input">
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
            label={<span style={{ color: '#000000' }}>Mã số thuế</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã số thuế!' }]}
          >
            <Input placeholder="Nhập mã số thuế" className="black-text-input" />
          </Form.Item>

          <Form.Item
            name="trang_website"
            label={<span style={{ color: '#000000' }}>Trang website</span>}
          >
            <Input placeholder="Nhập trang website" className="black-text-input" />
          </Form.Item>

          <Form.Item
            name="trang_thai"
            label={<span style={{ color: '#000000' }}>Trạng thái</span>}
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select className="black-text-input">
              <Option value="Hoạt động">Hoạt động</Option>
              <Option value="Không hoạt động">Không hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ngay_them_vao"
            label={<span style={{ color: '#000000' }}>Ngày thêm vào</span>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày thêm vào!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" className="black-text-input" />
          </Form.Item>

          <Form.Item
            name="ghi_chu"
            label={<span style={{ color: '#000000' }}>Ghi chú</span>}
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú" className="black-text-input" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Cập nhật
              </Button>
              <Button icon={<RollbackOutlined />} onClick={onCancel}>
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditSupplier;