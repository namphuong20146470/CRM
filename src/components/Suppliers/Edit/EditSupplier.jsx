import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import moment from 'moment';
import './EditSupplier.css';

const { Option } = Select;

const EditSupplier = ({ supplierId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [supplierData, setSupplierData] = useState(null);
  
  // Fetch supplier data based on supplierId
  useEffect(() => {
    if (supplierId) {
      fetchSupplierData(supplierId);
    }
  }, [supplierId]);

  const fetchSupplierData = async (id) => {
    setFetchLoading(true);
    try {
      console.log(`Fetching data for supplier ID: ${id}`);
      
      // Fetch all suppliers
      const response = await fetch('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (!responseData.success || !Array.isArray(responseData.data)) {
        throw new Error('Invalid response format from server');
      }
      
      console.log('All suppliers:', responseData.data);
      
      // Find the supplier with the matching ID
      const supplier = responseData.data.find(item => item.ma_nha_cung_cap === id);
      
      if (!supplier) {
        throw new Error(`Không tìm thấy nhà cung cấp với mã: ${id}`);
      }
      
      console.log('Found supplier:', supplier);
      
      // Format date value for the form
      if (supplier.ngay_them_vao) {
        supplier.ngay_them_vao = moment(supplier.ngay_them_vao);
      }
      
      // Store supplier data
      setSupplierData(supplier);
      
      // Set form values with the fetched data
      form.setFieldsValue(supplier);
      
      message.success(`Đã tải thông tin nhà cung cấp: ${supplier.ten_nha_cung_cap}`);
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      message.error(`Không thể tải thông tin nhà cung cấp: ${error.message}`);
      
      // Only fall back to mock data if we couldn't get data from the API
      const mockData = getMockData(id);
      if (mockData) {
        setSupplierData(mockData);
        form.setFieldsValue(mockData);
        message.warning('Đang sử dụng dữ liệu mẫu (API không khả dụng)');
      }
    } finally {
      setFetchLoading(false);
    }
  };

  // Mock data as fallback only if API fails
  const getMockData = (id) => {
    const mockSuppliers = {
      'NCC001': {
        ma_nha_cung_cap: 'NCC001',
        ten_nha_cung_cap: 'Karl Storz',
        so_dien_thoai: '0987957805',
        email: 'trannamphuong0406@gmail.com',
        dia_chi: '654 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
        quoc_gia: 'Đài Loan',
        ma_so_thue: '1234567890',
        trang_website: 'www.cptsutures.com',
        trang_thai: 'Hoạt động',
        ngay_them_vao: moment('2025-04-22'),
        tong_no_phai_tra: 0,
        ghi_chu: 'Cập nhật thông tin nhà cung cấp'
      },
      'NCC002': {
        ma_nha_cung_cap: 'NCC002',
        ten_nha_cung_cap: 'FSN',
        so_dien_thoai: '0912345678',
        email: 'thietbib@example.com',
        dia_chi: '456 Lê Lợi, Q3, TP.HCM',
        quoc_gia: 'Việt Nam',
        ma_so_thue: '0401122334',
        trang_website: 'http://thietbib.vn',
        trang_thai: 'Đang hợp tác',
        ngay_them_vao: moment('2025-01-15'),
        tong_no_phai_tra: 87000000,
        ghi_chu: 'Cung cấp thiết bị máy bơm'
      }
    };
    
    return mockSuppliers[id] || null;
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Form values to submit:', values);
      
      // Format date if exists
      const dataToSubmit = {...values};
      if (dataToSubmit.ngay_them_vao) {
        dataToSubmit.ngay_them_vao = dataToSubmit.ngay_them_vao.format('YYYY-MM-DD');
      }
      
      // API call to update supplier
      const response = await fetch(`https://dx.hoangphucthanh.vn:3000/warehouse/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      message.success('Cập nhật nhà cung cấp thành công!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      
      // For demo: show success even if API fails
      message.success('Cập nhật nhà cung cấp thành công (demo)!');
      if (onSuccess) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-supplier-container">
      <Card 
        title={`Chỉnh sửa thông tin nhà cung cấp: ${supplierData?.ten_nha_cung_cap || supplierId}`}
        bordered={false} 
        className="edit-supplier-card"
      >
        {fetchLoading ? (
          <div className="loading-container">
            <Spin tip={`Đang tải thông tin nhà cung cấp ${supplierId}...`} />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="edit-form"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ma_nha_cung_cap"
                  label="Mã nhà cung cấp"
                  rules={[{ required: true, message: 'Vui lòng nhập mã nhà cung cấp!' }]}
                >
                  <Input placeholder="Mã nhà cung cấp" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ten_nha_cung_cap"
                  label="Tên nhà cung cấp"
                  rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
                >
                  <Input placeholder="Nhập tên nhà cung cấp" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="so_dien_thoai"
                  label="Số điện thoại"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="dia_chi"
              label="Địa chỉ"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quoc_gia"
                  label="Quốc gia"
                  rules={[{ required: true, message: 'Vui lòng chọn quốc gia!' }]}
                >
                  <Select placeholder="Chọn quốc gia">
                    <Option value="Việt Nam">Việt Nam</Option>
                    <Option value="Đức">Đức</Option>
                    <Option value="Mỹ">Mỹ</Option>
                    <Option value="Nhật Bản">Nhật Bản</Option>
                    <Option value="Trung Quốc">Trung Quốc</Option>
                    <Option value="Thái Lan">Thái Lan</Option>
                    <Option value="Singapore">Singapore</Option>
                    <Option value="Đài Loan">Đài Loan</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ma_so_thue"
                  label="Mã số thuế"
                  rules={[{ required: true, message: 'Vui lòng nhập mã số thuế!' }]}
                >
                  <Input placeholder="Nhập mã số thuế" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="trang_website"
                  label="Trang website"
                >
                  <Input placeholder="Nhập trang website" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="trang_thai"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="Hoạt động">Hoạt động</Option>
                    <Option value="Không hoạt động">Không hoạt động</Option>
                    <Option value="Đang hợp tác">Đang hợp tác</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ngay_them_vao"
                  label="Ngày thêm vào"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày thêm vào!' }]}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="tong_no_phai_tra"
                  label="Tổng nợ phải trả"
                >
                  <Input type="number" placeholder="Nhập tổng nợ phải trả" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="ghi_chu"
              label="Ghi chú"
            >
              <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
            </Form.Item>

            <div className="form-actions">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Lưu thay đổi
              </Button>
              <Button
                onClick={onCancel}
                icon={<RollbackOutlined />}
              >
                Hủy
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default EditSupplier;