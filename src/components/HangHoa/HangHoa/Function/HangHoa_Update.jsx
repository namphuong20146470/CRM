import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { dayjs } from '../../../utils/format/dayjs-config';
import { fetchDataList, updateItemById } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';

const { Option } = Select;

const Editproduct = ({ productId, productAt, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [product_types, setProduct_Types] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (productId && productAt) fetchProductData(productId, productAt);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/product-types', setProduct_Types, 'Không thể tải danh sách loại hàng');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', setSuppliers, 'Không thể tải danh sách nhà cung cấp');
  }, [productId, productAt]);

  const fetchProductData = async (id, at) => {
    setFetchLoading(true);
    try {
      const allProducts = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/products');
      // So sánh cả mã hàng và ngày cập nhật (so sánh ISO string)
      const product = allProducts.find(item => 
        item.ma_hang === id && item.ngay_cap_nhat === at
      );
      if (!product) throw new Error(`Không tìm thấy hàng hóa với mã: ${id} và ngày cập nhật: ${at}`);
      setProductData(product);
      form.setFieldsValue({
        ...product,
        ngay_gia: product.ngay_gia ? dayjs(product.ngay_gia) : null,
        ngay_cap_nhat: product.ngay_cap_nhat ? dayjs(product.ngay_cap_nhat) : null,
      });
      message.success(`Đã tải thông tin hàng hóa: ${product.ma_hang}`);
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
        ngay_gia: values.ngay_gia?.format('YYYY-MM-DD'),
        ngay_cap_nhat: values.ngay_cap_nhat.format('YYYY-MM-DD'),
      };

      console.log('🚀 Payload gửi đi:', payload);
      
      // Sửa URL API tại đây
      const response = await updateItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/products/${productId}/${productAt}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }

      message.success('Cập nhật hàng hóa thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      message.error('Không thể cập nhật hàng hóa');
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
            Chỉnh sửa Hàng Hóa: {productData?.ma_hang || productId} với ngày cập nhật {
              productData?.ngay_cap_nhat
                ? dayjs(productData.ngay_cap_nhat).format('DD.MM.YYYY')
                : productAt
            }
          </h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_hang" label="Mã hàng " rules={[{ required: true }]}>
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
                  <DatePicker format="DD/MM/YYYY HH:mm:ss" style={{ width: '100%' }}  disabled/>
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
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu
              </Button>
              <Button icon={<CloseOutlined />} onClick={onCancel} danger>
                Hủy
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default Editproduct;
