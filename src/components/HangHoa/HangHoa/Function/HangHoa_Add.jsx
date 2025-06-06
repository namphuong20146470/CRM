import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, createItem } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';

const { Option } = Select;

const AddProduct = ({ onCancel, onSuccess, disabled }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [product_types, setProduct_Types] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/product-types', setProduct_Types, 'Không thể tải danh sách loại hàng').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', setSuppliers, 'Không thể tải danh sách nhà cung cấp').finally(() => setFetchLoading(false));
    form.setFieldsValue({ngay_cap_nhat: moment()});
  }, []);

  const onFinish = async (values) => {
        setLoading(true);
        try {
          const payload = {
            ...values,
            ngay_gia: values.ngay_gia?.format('YYYY-MM-DD'),
            ngay_cap_nhat: values.ngay_cap_nhat?.format('YYYY-MM-DD'),
          };
    
          console.log('🚀 Payload gửi đi:', payload);
    
          const response = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/products', payload);
    
          console.log('📦 Kết quả thêm mới:', response);
    
          if (response && response.status && response.status >= 400) {
            throw new Error('Thêm mới thất bại từ server');
          }
    
          message.success('Thêm mới hàng hóa thành công!');
          onSuccess?.(); // Callback reload data
        } catch (error) {
          console.error('Lỗi thêm mới:', error);
          message.error('Không thể thêm mới hàng hóa');
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
            <h2 className="edit-title" style={{ marginBottom: 24 }}>Thêm mới Hàng Hóa</h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_hang" label="Mã hàng " 
                  rules={[
                      { required: true, message: 'Mã hàng không được để trống' },
                      {
                          pattern: /^[^a-z]+$/,
                          message: 'Không được chứa chữ thường (a–z)',
                      },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ten_hang" label="Tên hàng" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ten_loai_hang" label="Loại hàng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn loại hàng">
                    {product_types.map(product => (
                      <Option key={product.ma_loai_hang} value={product.ma_loai_hang}>
                        {product.ten_loai_hang}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ten_nha_cung_cap" label="Nhà cung cấp" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn nhà cung cấp">
                    {suppliers.map(supplier => (
                      <Option key={supplier.ma_nha_cung_cap} value={supplier.ma_nha_cung_cap}>
                        {supplier.ten_nha_cung_cap}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="trong_luong_tinh" label="Trọng lượng" rules={[{ required: true }]}>
                  <NumericInput style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gia_thuc" label="Giá thực" rules={[{ required: true }]}>
                  <NumericInput style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nuoc_xuat_xu" label="Nước xuất xứ" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="don_vi_ban_hang" label="Đơn vị tính" rules={[{ required: true }]}>
                  <Select>
                    {['ST', 'PAK'].map(sales_unit => (
                      <Option key={sales_unit} value={sales_unit}>{sales_unit}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="tinh_trang_hang_hoa" label="Tình trạng" rules={[{ required: true }]}>
                  <Select>
                    {['O', 'N'].map(status => (
                      <Option key={status} value={status}>{status}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="price_list" label="Price list" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="ngay_gia" label="Ngày giá" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ngay_cap_nhat" label="Ngày cập nhật" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabled/>
                </Form.Item>
              </Col>
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

export default AddProduct;
