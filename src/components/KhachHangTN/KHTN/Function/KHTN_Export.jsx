import React, { useState } from 'react';
import { Modal, Button, Spin, Tabs } from 'antd';
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleExport } from '../../../utils/export/exportHandlers';
import ExportOptionsTab from '../../../utils/export/ExportOptionsTab';
import '../../../utils/css/Custom-Export.css';

const { TabPane } = Tabs;

function KhachHangTN_Export({ data, filteredData, sortedData, onClose, visible }) {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // Định nghĩa mapping giữa tên trường và tiêu đề cột trong file xuất
  const fieldMappings = {
    stt: 'STT',
    ma_khach_hang: 'Mã khách hàng',
    ten_khach_hang: 'Tên khách hàng',
    'customer_group.nhom_khach_hang': 'Nhóm khách hàng',
    'opportunity_source.nguon': 'Nguồn cơ hội',
    trang_thai: 'Trạng thái',
    so_dien_thoai: 'Số điện thoại',
    email: 'Email',
    dia_chi: 'Địa chỉ',
    ngay_tao: 'Ngày tạo',
    doanh_thu_du_kien: 'Doanh thu dự kiến',
    'accounts.ho_va_ten': 'Người phụ trách',
    ghi_chu: 'Ghi chú'
  };

  // Xử lý dữ liệu trước khi xuất để xử lý các trường lồng nhau
  const processRowForExport = (row) => {
    return {
      stt: row.stt,
      ma_khach_hang: row.ma_khach_hang,
      ten_khach_hang: row.ten_khach_hang,
      'customer_group.nhom_khach_hang': row.customer_group?.nhom_khach_hang || '',
      'opportunity_source.nguon': row.opportunity_source?.nguon || '',
      trang_thai: row.trang_thai,
      so_dien_thoai: row.so_dien_thoai,
      email: row.email,
      dia_chi: row.dia_chi,
      ngay_tao: row.ngay_tao,
      doanh_thu_du_kien: row.doanh_thu_du_kien,
      'accounts.ho_va_ten': row.accounts?.ho_va_ten || '',
      ghi_chu: row.ghi_chu
    };
  };

  const [exportOptions, setExportOptions] = useState({
    dataSource: 'sorted',
    fileFormat: 'xlsx',
    exportFields: Object.keys(fieldMappings),
    fileName: `khach_hang_tiem_nang_${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true
  });

  return (
    <Modal
      className="export-modal"
      title={<div className="export-modal-title"><FileExcelOutlined /> Xuất dữ liệu khách hàng tiềm năng</div>}
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

export default KhachHangTN_Export;