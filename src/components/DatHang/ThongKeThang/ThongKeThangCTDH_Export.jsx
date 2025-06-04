import React, { useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleExport } from '../../utils/export/exportHandlers';
import '../../utils/css/Custom-Export.css';

function ThongKeThang_Export({ data, filteredData, onClose, visible }) {
  const [exporting, setExporting] = useState(false);

  const fieldMappings = {
    ma_hang: 'Mã hàng',
    ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`${i}`, `Tháng ${i + 1}`])),
    total: 'Tổng cả năm'
  };

  const exportOptions = {
    dataSource: 'filtered',
    fileFormat: 'xlsx',
    exportFields: Object.keys(fieldMappings),
    fileName: `thong_ke_hang_dat_theo_thang${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true
  };

  return (
    <Modal
      title={<div className="export-modal-title"><FileExcelOutlined /> Xuất thống kê hàng đặt theo tháng</div>}
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
        <div>Nhấn "Xuất File" để tải thống kê về máy.</div>
      )}
    </Modal>
  );
}

export default ThongKeThang_Export;