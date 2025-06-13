import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Card } from 'antd';
import { fetchAndSetList } from '../../utils/api/fetchHelpers';
import moment from 'moment';
import '../../utils/css/Custom-Quotation.css';

const DEFAULT_DIEU_KIEN = `- Giá trên đã bao gồm thuế GTGT, phí vận chuyển và các phí khác (nếu có).
- Trong trường hợp chính sách thuế thay đổi, khoản thuế GTGT sẽ được điều chỉnh tương ứng.
- Thời gian giao hàng: trong vòng 01 - 04 tuần sau khi nhận được thanh toán.
- Bảo hành: 12 tháng đối với các máy chính và ống soi thuộc các lỗi kỹ thuật của nhà sản xuất kể từ ngày ký biên bản bàn giao nghiệm thu.
- Phương thức thanh toán:
+ Đối với hàng có sẵn ở kho
Thanh toán 100% giá trị hợp đồng trong vòng 30 ngày kể từ ngày giao hàng và xuất hóa đơn
+ Đối với hàng không có sẵn ở kho
Tùy chọn 1: Thanh toán 2 đợt
* Đợt 1: Thanh toán 70% - 80% giá trị hợp đồng trong vòng 07 ngày kể từ ngày ký hợp đồng.
* Đợt 2: Thanh toán 20% - 30% giá trị hợp đồng trong vòng 30 ngày kể từ ngày giao hàng và xuất hóa đơn.
Tùy chọn 2: Thanh toán 3 đợt
* Đợt 1: Tạm ứng 30% - 40% giá trị hợp đồng trong vòng 07 ngày kể từ ngày ký hợp đồng
* Đợt 2: Thanh toán 40% - 50% giá trị hợp đồng trong vòng 07 ngày khi nhận thông báo giao hàng
* Đợt 3: Thanh toán 20% - 30% giá trị hợp đồng còn lại trong vòng 30 ngày kể từ ngày nghiệm thu và xuất hóa đơn
- Giá trị bảng báo giá: 03 tháng kể từ ngày ký báo giá.`;

const DEFAULT_NOI_DUNG = `Công ty TNHH DV và TM Hoàng Phúc Thanh (HOPT) chân thành cảm ơn sự quan tâm của Quý Khách hàng đối với trang thiết bị y tế của chúng tôi. Chúng tôi xin gửi đến Quý Khách hàng bảng báo giá thiết bị và dụng cụ nội soi với chi tiết như sau:`;

const { Option } = Select;

const BaoGiaThongTinForm = ({ onChange }) => {
  const [form] = Form.useForm();
  const [priceLists, setPriceLists] = useState([]);
  const [hangChuSoHuu, setHangChuSoHuu] = useState([]);
  const [heSoList, setHeSoList] = useState([64000, 65000, 66000]);

  useEffect(() => {
    fetchAndSetList(
      'https://dx.hoangphucthanh.vn:3000/warehouse/products',
      (data) => {
        const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        const uniquePriceLists = Array.from(new Set(arr.map(p => p.price_list).filter(Boolean)));
        setPriceLists(uniquePriceLists);
      },
      'Không thể tải danh sách Price List'
    );
    fetchAndSetList(
      'https://dx.hoangphucthanh.vn:3000/warehouse/suppliers',
      (data) => {
        const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        const uniqueSuppliers = Array.from(new Set(arr.map(s => s.ten_nha_cung_cap).filter(Boolean)));
        setHangChuSoHuu(uniqueSuppliers);
      },
      'Không thể tải danh sách nhà cung cấp'
    );
    onChange(form.getFieldsValue());
    // eslint-disable-next-line
  }, []);

  const doiTuongBaoGia = [
    'Giá kế hoạch',
    'Bệnh viện Tư',
    'Bệnh viện Công',
    'Công ty Thầu'
  ];

  const handleValuesChange = (changed, values) => {
    if (changed.doi_tuong_bao_gia) {
      let hs = [];
      switch (changed.doi_tuong_bao_gia) {
        case 'Giá kế hoạch':
          hs = [64000, 65000, 66000];
          break;
        case 'Bệnh viện Tư':
          hs = [50000, 51000, 52000, 53000, 54000, 55000, 56000];
          break;
        case 'Bệnh viện Công':
          hs = [55000, 56000, 57000, 58000, 59000, 60000];
          break;
        case 'Công ty Thầu':
          hs = [47000, 48000, 49000, 50000];
          break;
        default:
          hs = [];
      }
      setHeSoList(hs);
      form.setFieldsValue({ he_so: hs[0] });
      onChange({ ...values, he_so: hs[0] });
    } else {
      onChange(values);
    }
  };

  return (
    <>
      <h2 className="quotation-title" style={{ marginBottom: 24 }}>Thông tin báo giá</h2>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={{
          ngay_bao_gia: moment(),
          doi_tuong_bao_gia: 'Giá kế hoạch',
          he_so: 64000,
          dieu_kien_thuong_mai: DEFAULT_DIEU_KIEN,
          noi_dung_bao_gia: DEFAULT_NOI_DUNG,
          hang_chu_so_huu: 'Karl Storz',
        }}
        className="quotation-form"
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Số báo giá" name="so_bao_gia" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ngày báo giá" name="ngay_bao_gia" rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Hãng chủ sở hữu" name="hang_chu_so_huu" rules={[{ required: true }]}>
              <Select>
                {hangChuSoHuu.map(h => <Option key={h} value={h}>{h}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Price List" name="price_list" rules={[{ required: true }]}>
              <Select>
                {priceLists.map(pl => <Option key={pl} value={pl}>{pl}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Tiêu đề báo giá" name="tieu_de" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col> 
          <Col span={8}>
            <Form.Item label="Đối tượng báo giá" name="doi_tuong_bao_gia" rules={[{ required: true }]}>
              <Select>
                {doiTuongBaoGia.map(dt => <Option key={dt} value={dt}>{dt}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Hệ số" name="he_so" rules={[{ required: true }]}>
              <Select>
                {heSoList.map(hs => <Option key={hs} value={hs}>{hs}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Kính gửi" name="kinh_gui" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tên file báo giá" name="ten_file_bao_gia" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Nội dung báo giá" name="noi_dung_bao_gia">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Điều kiện thương mại" name="dieu_kien_thuong_mai">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default BaoGiaThongTinForm;