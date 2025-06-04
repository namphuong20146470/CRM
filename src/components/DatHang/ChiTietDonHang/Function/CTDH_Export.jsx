import React, { useState } from 'react';
import { Modal, Button, Spin, Tabs } from 'antd';
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleExport } from '../../../utils/export/exportHandlers';
import ExportOptionsTab from '../../../utils/export/ExportOptionsTab';
import '../../../utils/css/Custom-Export.css';

const { TabPane } = Tabs;

function ChiTietDonHang_Export({ data, filteredData, sortedData, onClose, visible }) {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const fieldMappings = {
    stt: 'STT',
    ma_chi_tiet_don_hang: 'Mã CTHD',
    ma_hang: 'Mã hàng',
    so_luong: 'Số lượng',
    ngay_dat_hang: 'Ngày đặt hàng',
    ma_hop_dong: 'Hợp đồng',
    so_xac_nhan_don_hang: 'Số xác nhận đơn hàng',
    ten_khach_hang: 'Khách hàng',
    nguoi_phu_trach: 'Người phụ trách',
    ngay_tam_ung: 'Ngày tạm ứng',
    tu_ngay: 'Từ ngày',
    den_ngay: 'Đến ngày',
    tinh_trang_don_hang: 'Tình trạng đơn hàng',
    hang_bao_ngay_du_kien_lan_1: 'Hãng báo ngày dự kiến 1',
    hang_bao_ngay_du_kien_lan_2: 'Hãng báo ngày dự kiến 2',
    invoice_1: 'INV 1',
    packing_list_1: 'PKL 1',
    so_luong_lo_1: 'Số lượng lô 1',
    hawb_1: 'HAWB 1',
    invoice_2: 'INV 2',
    packing_list_2: 'PKL 2',
    so_luong_lo_2: 'Số lượng lô 2',
    hawb_2: 'HAWB 2',
    invoice_3: 'INV 3',
    packing_list_3: 'PKL 3',
    so_luong_lo_3: 'Số lượng lô 3',
    hawb_3: 'HAWB 3',
    invoice_4: 'INV 4',
    packing_list_4: 'PKL 4',
    so_luong_lo_4: 'Số lượng lô 4',
    hawb_4: 'HAWB 4',
    invoice_5: 'INV 5',
    packing_list_5: 'PKL 5',
    so_luong_lo_5: 'Số lượng lô 5',
    hawb_5: 'HAWB 5',
    so_luong_hang_chua_ve: 'Số lượng chưa về',
    ghi_chu: 'Ghi chú',
  };

  const [exportOptions, setExportOptions] = useState({
    dataSource: 'sorted',
    fileFormat: 'xlsx',
    exportFields: Object.keys(fieldMappings),
    fileName: `chi_tiet_don_hang_${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true
  });

  return (
    <Modal
      className="export-modal"
      title={<div className="export-modal-title"><FileExcelOutlined /> Xuất dữ liệu chi tiết đơn hàng</div>}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>Hủy</Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => {
            setExporting(true);
            handleExport({ exportOptions, data, filteredData, sortedData, fieldMappings, onClose })
              .finally(() => setExporting(false));
          }}
          loading={exporting}
          disabled={exportOptions.exportFields.length === 0}
        >
          Xuất File
        </Button>
      ]}
    >
      {exporting ? (
        <div className="export-loading">
          <Spin tip="Đang xuất dữ liệu..." />
        </div>
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tùy chọn xuất" key="1">
            <ExportOptionsTab
              exportOptions={exportOptions}
              setExportOptions={setExportOptions}
              data={data}
              filteredData={filteredData}
              sortedData={sortedData}
              fieldMappings={fieldMappings}
            />
          </TabPane>
        </Tabs>
      )}
    </Modal>
  );
}

export default ChiTietDonHang_Export;