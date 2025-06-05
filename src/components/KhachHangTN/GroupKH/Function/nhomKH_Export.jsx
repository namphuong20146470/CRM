import React, { useState } from 'react';
import { Modal, Button, Spin, Tabs } from 'antd';
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleExport } from '../../../utils/export/exportHandlers';
import ExportOptionsTab from '../../../utils/export/ExportOptionsTab';
import '../../../utils/css/Custom-Export.css';

const { TabPane } = Tabs;

function NhomKH_Export({ data, filteredData, sortedData, onClose, visible }) {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const fieldMappings = {
    stt: 'STT',
    ma_nhom_khach_hang: 'Mã nhóm khách hàng',
    nhom_khach_hang: 'Tên nhóm khách hàng',
    'accounts.ho_va_ten': 'Người cập nhật',
    ngay_cap_nhat: 'Ngày cập nhật',
    mo_ta: 'Mô tả'
  };

  // Add a custom accessor function to process the data before export
  const processRowForExport = (row) => {
    return {
      stt: row.stt,
      ma_nhom_khach_hang: row.ma_nhom_khach_hang,
      nhom_khach_hang: row.nhom_khach_hang,
      'accounts.ho_va_ten': row.accounts?.ho_va_ten || row.nguoi_cap_nhat || '',
      ngay_cap_nhat: row.ngay_cap_nhat,
      mo_ta: row.mo_ta
    };
  };

  const [exportOptions, setExportOptions] = useState({
    dataSource: 'sorted',
    fileFormat: 'xlsx',
    exportFields: Object.keys(fieldMappings),
    fileName: `nhom_khach_hang_${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true
  });

  return (
    <Modal
      className="export-modal"
      title={<div className="export-modal-title"><FileExcelOutlined /> Xuất dữ liệu nhóm khách hàng</div>}
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
            handleExport({ 
              exportOptions, 
              data: data.map(processRowForExport), 
              filteredData: filteredData.map(processRowForExport), 
              sortedData: sortedData.map(processRowForExport), 
              fieldMappings, 
              onClose 
            }).finally(() => setExporting(false));
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

export default NhomKH_Export;