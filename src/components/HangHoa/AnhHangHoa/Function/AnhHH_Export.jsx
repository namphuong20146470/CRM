import React, { useState } from 'react';
import { Modal, Button, Spin, Tabs } from 'antd';
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleExport } from '../../../utils/export/exportHandlers';
import ExportOptionsTab from '../../../utils/export/ExportOptionsTab';
import '../../../utils/css/Custom-Export.css';

const { TabPane } = Tabs;

function LoaiHopDong_Export({ data, filteredData, onClose, visible }) {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const fieldMappings = {
    stt: 'STT',
    ma_loai_hop_dong: 'Mã loại hợp đồng',
    ten_loai_hop_dong: 'Tên loại hợp đồng',
    tinh_trang: 'Tình trạng',
    nguoi_cap_nhat: 'Người cập nhật',
    ngay_cap_nhat: 'Ngày cập nhật',
    mo_ta: 'Mô tả'
  };

  const [exportOptions, setExportOptions] = useState({
    dataSource: 'filtered',
    fileFormat: 'xlsx',
    exportFields: Object.keys(fieldMappings),
    fileName: `loai_hop_dong_${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true
  });

  return (
    <Modal
      title={<div className="export-modal-title"><FileExcelOutlined /> Xuất dữ liệu hợp đồng</div>}
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
            handleExport({ exportOptions, data, filteredData, fieldMappings, onClose })
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
              fieldMappings={fieldMappings}
            />
          </TabPane>
        </Tabs>
      )}
    </Modal>
  );
}

export default LoaiHopDong_Export;