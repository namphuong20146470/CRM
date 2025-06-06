import React, { useState } from 'react';
import { Modal, Button, Spin, Tabs } from 'antd';
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleExport } from '../../utils/export/exportHandlers';
import ExportOptionsTab from '../../utils/export/ExportOptionsTab';
import '../../utils/css/Custom-Export.css';

const { TabPane } = Tabs;

function NhaCungCap_Export({ data, filteredData, sortedData, onClose, visible }) {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const fieldMappings = {
    stt: 'STT',
    ma_nha_cung_cap: 'Mã Nhà Cung Cấp',
    ten_nha_cung_cap: 'Tên nhà cung cấp',
    so_dien_thoai: 'Số điện thoại',
    email: 'Email',
    dia_chi: 'Địa chỉ',
    quoc_gia: 'Quốc gia',
    ma_so_thue: 'Mã số thuế',
    trang_website: 'Trang website',
    trang_thai: 'Trạng thái',
    ngay_them_vao: 'Ngày thêm vào',
    tong_no_phai_tra: 'Tổng nợ phải trả',
    ghi_chu: 'Ghi chú'
  };

  const [exportOptions, setExportOptions] = useState({
    dataSource: 'sorted',
    fileFormat: 'xlsx',
    exportFields: Object.keys(fieldMappings),
    fileName: `nha_cung_cap_${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true
  });

  return (
    <Modal
      className="export-modal"
      title={<div className="export-modal-title"><FileExcelOutlined /> Xuất dữ liệu nhà cung cấp</div>}
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

export default NhaCungCap_Export;