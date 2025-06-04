import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Row, Col, Spin } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { fetchDataList, createItem } from '../../utils/api/requestHelpers';
import '../../utils/css/Custom-Update.css';
import NumericInput from '../../utils/jsx/NumericInput';
import moment from 'moment';

const { Option } = Select;

const AddSupplier = ({ onCancel, onSuccess, disabled }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [newMaNCC, setNewMaNCC] = useState('');

  useEffect(() => {
    fetchMaxSTT();
  }, []);

  const fetchMaxSTT = async () => {
    setFetchLoading(true);
    try {
      const allSuppliers = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers');
      const maxSTT = allSuppliers.length ? Math.max(...allSuppliers.map(item => item.stt || 0)) : 0;
      const newSTT = maxSTT + 1;
      const generatedMaNCC = `NCC${String(newSTT).padStart(3, '0')}`;
      setNewMaNCC(generatedMaNCC);

      // Gán luôn giá trị mặc định vào form
      form.setFieldsValue({
        ma_nha_cung_cap: generatedMaNCC,
        trang_thai: 'Đang hợp tác',
        ngay_them_vao: moment(),
      });

    } catch (error) {
      console.error('Lỗi khi lấy STT:', error);
      message.error('Không thể khởi tạo mã nhà cung cấp mới');
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

      const response = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', payload);

      console.log('📦 Kết quả thêm mới:', response);

      if (response && response.status && response.status >= 400) {
        throw new Error('Thêm mới thất bại từ server');
      }

      message.success('Thêm mới nhà cung cấp thành công!');
      onSuccess?.(); // Callback reload data
    } catch (error) {
      console.error('Lỗi thêm mới:', error);
      message.error('Không thể thêm mới nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-container">
        {fetchLoading ? (
          <div className="loading-container">
            <Spin tip="Đang khởi tạo..." />
          </div>
        ) : (
          <>
            <h2 className="edit-title" style={{ marginBottom: 24 }}>Thêm mới Nhà Cung Cấp</h2>
            <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="ma_nha_cung_cap" label="Mã NCC" rules={[{ required: true }]}>
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ten_nha_cung_cap" label="Tên NCC" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="so_dien_thoai" label="SĐT" >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                    <Input type="email" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="dia_chi" label="Địa chỉ">
                <Input />
              </Form.Item>
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
                  <Form.Item name="ma_so_thue" label="Mã số thuế" >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="trang_website" label="Website">
                    <Input type="url" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="trang_thai" label="Trạng thái" rules={[{ required: true }]}>
                    <Select disabled>
                      <Option value="Đang hợp tác">Đang hợp tác</Option>
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
                  <Form.Item name="tong_no_phai_tra" label="Tổng nợ phải trả">
                    <NumericInput style={{ width: '100%' }} />
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

export default AddSupplier;
