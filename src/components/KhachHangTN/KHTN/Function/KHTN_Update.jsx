import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { dayjs } from '../../../utils/format/dayjs-config';
import { fetchDataList } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { Option } = Select;
const { TextArea } = Input;

const EditKhachHangTN = ({ khachHangId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [khachHangData, setKhachHangData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [nhomKhachHang, setNhomKhachHang] = useState([]);
  const [nguonCoHoi, setNguonCoHoi] = useState([]);

  useEffect(() => {
    if (khachHangId) fetchKhachHangData(khachHangId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/crm/customer-groups', setNhomKhachHang, 'Không thể tải danh sách nhóm khách hàng', 'crm');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/crm/opportunity-sources', setNguonCoHoi, 'Không thể tải danh sách nguồn cơ hội', 'crm');
  }, [khachHangId]);

  const fetchKhachHangData = async (id) => {
    setFetchLoading(true);
    try {
      const response = await crmInstance.get(`/potential-customers/${id}`);
      const khachHang = response.data;
      if (!khachHang) throw new Error(`Không tìm thấy khách hàng với mã: ${id}`);
      
      setKhachHangData(khachHang);
      form.setFieldsValue({
        ...khachHang,
        ngay_tao: khachHang.ngay_tao ? dayjs(khachHang.ngay_tao) : null,
      });      
      message.success(`Đã tải thông tin khách hàng: ${khachHang.ten_khach_hang}`);
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
        ngay_tao: values.ngay_tao?.format('YYYY-MM-DD'),
      };
      
      console.log('🚀 Payload gửi đi:', payload);

      const response = await crmInstance.put(`/potential-customers/${khachHangId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }

      message.success('Cập nhật khách hàng tiềm năng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      message.error('Không thể cập nhật khách hàng tiềm năng');
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
            Chỉnh sửa Khách hàng tiềm năng: {khachHangData?.ten_khach_hang || khachHangId}
          </h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="ma_khach_hang" 
                  label="Mã khách hàng"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="ten_khach_hang" 
                  label="Tên khách hàng" 
                  rules={[{ required: true, message: 'Tên khách hàng không được để trống' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="ma_nhom_khach_hang" 
                  label="Nhóm khách hàng" 
                  rules={[{ required: true, message: 'Vui lòng chọn nhóm khách hàng' }]}
                >
                  <Select showSearch optionFilterProp="children" placeholder="Chọn nhóm khách hàng">
                    {nhomKhachHang.map(nhom => (
                      <Option key={nhom.ma_nhom_khach_hang} value={nhom.ma_nhom_khach_hang}>
                        {nhom.nhom_khach_hang}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="ma_nguon" 
                  label="Nguồn cơ hội" 
                  rules={[{ required: true, message: 'Vui lòng chọn nguồn cơ hội' }]}
                >
                  <Select showSearch optionFilterProp="children" placeholder="Chọn nguồn cơ hội">
                    {nguonCoHoi.map(nguon => (
                      <Option key={nguon.ma_nguon} value={nguon.ma_nguon}>
                        {nguon.nguon}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="so_dien_thoai" label="Số điện thoại">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="dia_chi" label="Địa chỉ">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trang_thai" label="Trạng thái" rules={[{ required: true }]}>
                  <Select>
                    {['Tiềm năng', 'Quan tâm', 'Đã chuyển đổi', 'Đã hủy'].map(status => (
                      <Option key={status} value={status}>{status}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="doanh_thu_du_kien" label="Doanh thu dự kiến">
                  <NumericInput style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ngay_tao" label="Ngày tạo">
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="nguoi_phu_trach" 
                  label="Người phụ trách" 
                  rules={[{ required: true, message: 'Vui lòng chọn người phụ trách' }]}
                >
                  <Select showSearch optionFilterProp="children" placeholder="Chọn người phụ trách">
                    {accounts.map(account => (
                      <Option key={account.ma_nguoi_dung} value={account.ma_nguoi_dung}>
                        {account.ho_va_ten}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>
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

export default EditKhachHangTN;