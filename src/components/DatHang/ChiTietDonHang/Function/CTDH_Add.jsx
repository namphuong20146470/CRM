import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, createItem } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';

const { Option } = Select;

const AddOrderDetail = ({ onCancel, onSuccess, disabled }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [newMaOrderDetail, setNewMaOrderDetail] = useState('');
  const [products, setProducts] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetchMaxSTT()
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/products', setProducts, 'Không thể tải danh sách hàng hóa').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/contracts', setContracts, 'Không thể tải danh sách hợp đồng').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/orders', setOrders, 'Không thể tải danh sách đơn hàng').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/customers', setCustomers, 'Không thể tải danh sách khách hàng').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', setAccounts, 'Không thể tải danh sách người dùng').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/warehouse/bills', setBills, 'Không thể tải danh sách bill').finally(() => setFetchLoading(false));
    form.setFieldsValue({ngay_dat_hang: moment()});
  }, []);

  const fetchMaxSTT = async () => {
    setFetchLoading(true);
    try {
      const allOrder_Detail = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/order-details');
      const maxSTT = allOrder_Detail.length ? Math.max(...allOrder_Detail.map(item => item.stt || 0)) : 0;
      const newSTT = maxSTT + 1;
      const generatedMaOrderDetail = `CTDH${String(newSTT)}`;
      setNewMaOrderDetail(generatedMaOrderDetail);

      // Gán luôn giá trị mặc định vào form
      form.setFieldsValue({
        ma_chi_tiet_don_hang: generatedMaOrderDetail,
      });

    } catch (error) {
      console.error('Lỗi khi lấy STT:', error);
      message.error('Không thể khởi tạo mã chi tiết đơn hàng mới');
    } finally {
      setFetchLoading(false);
    }
  };

  const onFinish = async (values) => {
        setLoading(true);
        try {
          const payload = {
            ...values,
            ngay_dat_hang: values.ngay_dat_hang?.format('YYYY-MM-DD'),
          };
    
          console.log('🚀 Payload gửi đi:', payload);
    
          const response = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/order-details', payload);
    
          console.log('📦 Kết quả thêm mới:', response);
    
          if (response && response.status && response.status >= 400) {
            throw new Error('Thêm mới thất bại từ server');
          }
    
          message.success('Thêm mới chi tiết đơn hàng thành công!');
          onSuccess?.(); // Callback reload data
        } catch (error) {
          console.error('Lỗi thêm mới:', error);
          message.error('Không thể thêm mới chi tiết đơn hàng');
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
          <h2 className="edit-title" style={{ marginBottom: 24 }}>Thêm mới Chi Tiết Đơn Hàng</h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_chi_tiet_don_hang" label="Mã CTDH" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ma_hang" label="Mã hàng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn mã hàng">
                    {products
                      .filter((product, index, self) => 
                        index === self.findIndex(p => p.ma_hang === product.ma_hang) // Loại bỏ các mã hàng trùng lặp
                      )
                      .map(product => (
                        <Option key={product.stt} value={product.ma_hang}>
                          {product.ma_hang} ({product.ten_hang})
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ngay_dat_hang" label="Ngày đặt hàng" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="so_luong" label="Số lượng" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_hop_dong" label="Số hợp đồng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn hợp đồng">
                    {contracts.map(contract => (
                      <Option key={contract.so_hop_dong} value={contract.so_hop_dong}>
                        {contract.so_hop_dong}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="so_xac_nhan_don_hang" label="Số xác nhận đơn hàng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn đơn hàng">
                    {orders.map(order => (
                      <Option key={order.so_don_hang} value={order.so_don_hang}>
                        {order.so_don_hang}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ten_khach_hang" label="Tên khách hàng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn khách hàng">
                    {customers.map(customer => (
                      <Option key={customer.ma_khach_hang} value={customer.ma_khach_hang}>
                        {customer.ten_khach_hang}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="nguoi_phu_trach" label="Người phụ trách" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn người phụ trách">
                    {accounts.map(account => (
                      <Option key={account.ma_nguoi_dung} value={account.ma_nguoi_dung}>
                        {account.ho_va_ten}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="ngay_tam_ung" label="Ngày tạm ứng" >
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="tu_ngay" label="Từ ngày" >
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="den_ngay" label="Đến ngày" >
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="tinh_trang_don_hang" label="Tình trạng đơn hàng" rules={[{ required: true }]}>
                  <Select>
                    {['Đang xử lý', 'Hoàn thành', 'Đã hủy', 'Đã giao, đặt trả kho'].map(status => (
                      <Option key={status} value={status}>{status}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="hang_bao_ngay_du_kien_lan_1" label="Hãng báo ngày dự kiến 1" >
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="hang_bao_ngay_du_kien_lan_2" label="Hãng báo ngày dự kiến 2" >
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="invoice_1" label="Invoice 1">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="packing_list_1" label="Packing List 1">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="so_luong_lo_1" label="Số lượng lô 1">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="hawb_1" label="HAWB 1">
                  <Select showSearch optionFilterProp="children" placeholder="Chọn hawb">
                    {bills.map(bill => (
                      <Option key={bill.ma_bill} value={bill.ma_bill}>
                        {bill.ma_bill}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="invoice_2" label="Invoice 2">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="packing_list_2" label="Packing List 2">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="so_luong_lo_2" label="Số lượng lô 2">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="hawb_2" label="HAWB 2" >
                  <Select showSearch optionFilterProp="children" placeholder="Chọn hawb">
                    {bills.map(bill => (
                      <Option key={bill.ma_bill} value={bill.ma_bill}>
                        {bill.ma_bill}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="invoice_3" label="Invoice 3">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="packing_list_3" label="Packing List 3">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="so_luong_lo_3" label="Số lượng lô 3">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="hawb_3" label="HAWB 3" >
                  <Select showSearch optionFilterProp="children" placeholder="Chọn hawb">
                    {bills.map(bill => (
                      <Option key={bill.ma_bill} value={bill.ma_bill}>
                        {bill.ma_bill}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="invoice_4" label="Invoice 4">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="packing_list_4" label="Packing List 4">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="so_luong_lo_4" label="Số lượng lô 4">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="hawb_4" label="HAWB 4" >
                  <Select showSearch optionFilterProp="children" placeholder="Chọn hawb">
                    {bills.map(bill => (
                      <Option key={bill.ma_bill} value={bill.ma_bill}>
                        {bill.ma_bill}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="invoice_5" label="Invoice 5">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="packing_list_5" label="Packing List 5">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="so_luong_lo_5" label="Số lượng lô 5">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="hawb_5" label="HAWB 5" >
                  <Select showSearch optionFilterProp="children" placeholder="Chọn hawb">
                    {bills.map(bill => (
                      <Option key={bill.ma_bill} value={bill.ma_bill}>
                        {bill.ma_bill}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="so_luong_hang_chua_ve" label="Số lượng chưa về">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ghi_chu" label="Ghi chú">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
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

export default AddOrderDetail;
