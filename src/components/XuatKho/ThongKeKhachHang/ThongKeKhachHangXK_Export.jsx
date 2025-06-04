import React, { useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleExport } from '../../utils/export/exportHandlers';
import '../../utils/css/Custom-Export.css';

function ThongKeKhachHangXK_Export({ data, filteredData, onClose, visible, allMaKhach, matchedCustomer }) {
  const [exporting, setExporting] = useState(false);

  // Nếu có matchedCustomer, chỉ export 2 cột: mã hàng và mã khách hàng đó
  let fieldMappings, exportFields;
  if (matchedCustomer) {
    fieldMappings = {
      ma_hang: 'Mã hàng',
      [matchedCustomer.ma_khach_hang]: matchedCustomer.ma_khach_hang,
    };
    exportFields = ['ma_hang', matchedCustomer.ma_khach_hang];
  } else {
    fieldMappings = {
      ma_hang: 'Mã hàng',
      ...Object.fromEntries(allMaKhach.map(maKhach => [maKhach, maKhach])),
      total: 'Tổng cả năm'
    };
    exportFields = Object.keys(fieldMappings);
  }

  const exportOptions = {
    dataSource: 'filtered',
    fileFormat: 'xlsx',
    exportFields,
    fileName: `thong_ke_xuat_kho_theo_khach_hang_${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true
  };

  return (
    <Modal
      title={<div className="export-modal-title"><FileExcelOutlined /> Xuất thống kê xuất kho theo khách hàng</div>}
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

export default ThongKeKhachHangXK_Export;