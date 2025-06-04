import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, updateItemById } from '../../utils/api/requestHelpers';
import '../../utils/css/Custom-Update.css';
import NumericInput from '../../utils/jsx/NumericInput';

const { Option } = Select;

const EditSupplier = ({ supplierId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [supplierData, setSupplierData] = useState(null);

  useEffect(() => {
    if (supplierId) fetchSupplierData(supplierId);
  }, [supplierId]);

  const fetchSupplierData = async (id) => {
    setFetchLoading(true);
    try {
      const allSuppliers = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers');
      const supplier = allSuppliers.find(item => item.ma_nha_cung_cap === id);
      if (!supplier) throw new Error(`Không tìm thấy nhà cung cấp với mã: ${id}`);
      if (supplier.ngay_them_vao) supplier.ngay_them_vao = moment(supplier.ngay_them_vao);
      setSupplierData(supplier);
      form.setFieldsValue(supplier);
      message.success(`Đã tải thông tin nhà cung cấp: ${supplier.ten_nha_cung_cap}`);
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
      
      const response = await updateItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/suppliers/${supplierId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }

      message.success('Cập nhật nhà cung cấp thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      message.error('Không thể cập nhật nhà cung cấp');
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
              Chỉnh sửa Nhà Cung Cấp: {supplierData?.ten_nha_cung_cap || supplierId}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="ma_nha_cung_cap" label="Mã NCC" rules={[{ required: true }]}><Input disabled /></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ten_nha_cung_cap" label="Tên NCC" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="so_dien_thoai" label="SĐT"><Input type="number"/></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email'}]}><Input type="email"/></Form.Item>
                </Col>
              </Row>
              <Form.Item name="dia_chi" label="Địa chỉ"><Input /></Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="quoc_gia" label="Quốc gia" rules={[{ required: true }]}>
                    <Select showSearch optionFilterProp="children" placeholder="Chọn quốc gia">
                      {['Việt Nam', 'Đức', 'Mỹ', 'Nhật Bản', 'Trung Quốc', 'Thái Lan', 'Singapore', 'Đài Loan', 'Anh', 'Pháp', 'Hàn Quốc']
                        .map(country => <Option key={country} value={country}>{country}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ma_so_thue" label="Mã số thuế"><Input type="number"/></Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="trang_website" label="Website"><Input type="url"/></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="trang_thai" label="Trạng thái" rules={[{ required: true }]}>
                    <Select>
                      {['Đang hợp tác', 'Ngừng hợp tác'].map(status => (
                        <Option key={status} value={status}>{status}</Option>
                      ))}
                    </Select>
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
                  <Form.Item name="tong_no_phai_tra" label="Tổng nợ phải trả" rules={[{ required: true }]}>
                    <NumericInput style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="ghi_chu" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
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

export default EditSupplier;
