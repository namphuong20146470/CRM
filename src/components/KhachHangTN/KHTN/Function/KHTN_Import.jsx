import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Table, Modal, Alert, Typography, Divider, Spin, Badge } from 'antd';
import { InboxOutlined, FileExcelOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { handleFileUpload } from '../../../utils/import/handleFileUpload';
import { checkDuplicateInFile, validateData, getFieldLabel } from '../../../utils/import/validationHelpers';
import { downloadTemplate } from '../../../utils/import/templateHelpers';
import TemplateDownloadSection from '../../../utils/import/templateDownloadSection';
import {
  fetchPreviewData,
  renderMaKhachHang,
  renderNguoiPhuTrach,
  renderNhomKhachHang,
  renderNguonCoHoi,
  isKhachHangExisting,
} from './KHTN_ImportRender';
import renderPreview from '../../../utils/import/renderPreview';
import { crmInstance } from '../../../utils/api/axiosConfig';
import { convertDateFields } from '../../../utils/convert/convertDateFields';
import { renderDateField } from '../../../utils/format/renderDateField';

const { Dragger } = Upload;

const KhachHangTN_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingKhachHang, setExistingKhachHang] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [nhomKhachHang, setNhomKhachHang] = useState([]);
  const [nguonCoHoi, setNguonCoHoi] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setAccounts, setNhomKhachHang, setNguonCoHoi, setExistingKhachHang);
    resetState();
  }, [open]);

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã khách hàng': 'ma_khach_hang',
    'Tên khách hàng': 'ten_khach_hang',
    'Nhóm khách hàng': 'ma_nhom_khach_hang',
    'Nguồn cơ hội': 'ma_nguon',
    'Số điện thoại': 'so_dien_thoai',
    'Email': 'email',
    'Địa chỉ': 'dia_chi',
    'Trạng thái': 'trang_thai',
    'Doanh thu dự kiến': 'doanh_thu_du_kien',
    'Ngày tạo': 'ngay_tao',
    'Người phụ trách': 'nguoi_phu_trach',
    'Ghi chú': 'ghi_chu',
  };

  // Các trường bắt buộc
  const requiredFields = ['ma_khach_hang', 'ten_khach_hang', 'ma_nhom_khach_hang', 'ma_nguon', 'nguoi_phu_trach'];
  const uniqueFields = ['ma_khach_hang'];
  const dateFields = ['ngay_tao'];
  
  const handleAfterParse = (parsedRows) => {
    const dataWithDateFlags = parsedRows.map(item => convertDateFields(item, dateFields));
    setParsedData(dataWithDateFlags);
    handleValidateData(dataWithDateFlags);
    setShowPreview(true);
  };

  // Hàm xác thực dữ liệu
  const handleValidateData = (data) => {
    // Kiểm tra trùng trong file Excel
    const duplicates = checkDuplicateInFile(data, uniqueFields);

    return validateData(
      data,
      requiredFields,
      (field) => getFieldLabel(field, columnMapping),
      setErrorItems,
      'ma_khach_hang', // keyField
      'ma_khach_hang', // nameField
      {
        ma_khach_hang: (value) => isKhachHangExisting(value, existingKhachHang),
      },
      duplicates,
      dateFields,            
      columnMapping 
    );
  };

  const prepareDataForImport = (data) => {
    const soLuongFields = [
      'doanh_thu_du_kien',
    ];
    return data.map(item => {
      const converted = convertDateFields(item, [
        'ngay_tao'
      ]);
      // Gán mặc định 0 cho các trường số lượng nếu bị trống
      soLuongFields.forEach(field => {
        converted[field] =
          item[field] === undefined ||
          item[field] === null ||
          item[field] === ''
            ? 0
            : Number(item[field]);
      });
      return converted;
    });
  };

  // Hàm nhập từng dòng
  const importSingleItem = async (item) => {
    try {
      const response = await crmInstance.post('/potential-customers', item);
      return response.status < 400;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const response = await crmInstance.post('/potential-customers/batch', data);
      return response.status < 400;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  // Hàm xử lý nhập dữ liệu
  const handleImport = async () => {
    if (errorItems.length > 0) {
      message.error('Vui lòng sửa lỗi trước khi nhập dữ liệu!');
      return;
    }

    if (parsedData.length === 0) {
      message.warning('Không có dữ liệu để nhập!');
      return;
    }

    setImportLoading(true);

    try {
      const dataToImport = prepareDataForImport(parsedData);
      console.log('Data gửi lên:', dataToImport);

      // Thử nhập toàn bộ dữ liệu
      const success = await importAllItems(dataToImport);

      if (success) {
        message.success(`Đã nhập ${dataToImport.length} khách hàng thành công!`);
        fetchPreviewData(setAccounts, setNhomKhachHang, setNguonCoHoi, setExistingKhachHang);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng khách hàng một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} khách hàng thành công!`);
      } else {
        message.error('Không thể nhập được khách hàng nào!');
      }

      fetchPreviewData(setAccounts, setNhomKhachHang, setNguonCoHoi, setExistingKhachHang);
      resetState();
      onSuccess?.();
      onClose();
    } finally {
      setImportLoading(false);
    }
  };

  // Hàm reset state
  const resetState = () => {
    setFileList([]);
    setParsedData([]);
    setErrorItems([]);
    setShowPreview(false);
  };

  // Hàm đóng modal
  const handleClose = () => {
    resetState();
    onClose();
  };

  // Cấu hình cột cho bảng xem trước dữ liệu
  const previewColumns = [
    { title: 'STT', dataIndex: 'key', key: 'key', width: "2%",
      render: (text) => text + 1 
    },
    { 
      title: 'Mã khách hàng', 
      dataIndex: 'ma_khach_hang', 
      key: 'ma_khach_hang', 
      width: "8%",
      render: (text, record) => renderMaKhachHang(text, record, errorItems, existingKhachHang)
    },
    { 
      title: 'Tên khách hàng', 
      dataIndex: 'ten_khach_hang', 
      key: 'ten_khach_hang', 
      width: "12%",
    },
    {
      title: 'Nhóm khách hàng',
      dataIndex: 'ma_nhom_khach_hang',
      key: 'ma_nhom_khach_hang',
      width: "10%",
      render: (maNhom, record) => renderNhomKhachHang(maNhom, record, nhomKhachHang, errorItems)
    },
    {
      title: 'Nguồn cơ hội',
      dataIndex: 'ma_nguon',
      key: 'ma_nguon',
      width: "10%",
      render: (maNguon, record) => renderNguonCoHoi(maNguon, record, nguonCoHoi, errorItems)
    },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "7%" },
    { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai', width: "8%" },
    { title: 'Email', dataIndex: 'email', key: 'email', width: "10%" },
    { title: 'Địa chỉ', dataIndex: 'dia_chi', key: 'dia_chi', width: "12%" },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngay_tao',
      key: 'ngay_tao',
      width: "7%",
      render: (value, record) => renderDateField(value, record, errorItems, 'Ngày tạo', 'ngay_tao')
    },
    { 
      title: 'Doanh thu dự kiến', 
      dataIndex: 'doanh_thu_du_kien', 
      key: 'doanh_thu_du_kien', 
      width: "8%", 
      render: (value) => value ? value.toLocaleString('vi-VN') : '0'  
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'nguoi_phu_trach',
      key: 'nguoi_phu_trach',
      width: "10%",
      render: (maNguoiDung, record) => renderNguoiPhuTrach(maNguoiDung, record, accounts, errorItems)
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "10%" },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['KH001', 'Công ty ABC', 'NKH01', 'CH01', '0987654321', 'abc@example.com', 'Hà Nội', 'Tiềm năng', '15000000', '10.06.2025', 'VTTphuong', 'Ghi chú mẫu 1'],
      ['KH002', 'Công ty XYZ', 'NKH02', 'CH02', '0123456789', 'xyz@example.com', 'TP.HCM', 'Quan tâm', '25000000', '05.07.2025', 'PPcuong', 'Ghi chú mẫu 2']
    ];
    downloadTemplate(columns, sampleData, 'Template_Khach_Hang_Tiem_Nang');
  };

  // Hàm render phần tải xuống file mẫu
  const renderTemplateSection = () => (
    <TemplateDownloadSection handleDownloadTemplate={handleDownloadTemplate} />
  );

  // Hàm render uploader
  const renderUploader = () => (
    <Dragger
      name="file"
      multiple={false}
      fileList={fileList}
      beforeUpload={(file) => handleFileUpload(file, {
        columnMapping,
        setParsedData: handleAfterParse,
        validateData: () => {},
        setShowPreview,
        setFileList,
        accounts,
        nhomKhachHang,
        nguonCoHoi,
        mode: 'khachHangTN'
      })}
      onRemove={() => resetState()}
      accept=".xlsx,.xls"
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Kéo thả file hoặc Click để chọn file Excel</p>
      <p className="ant-upload-hint">
        Chỉ hỗ trợ file Excel (.xlsx, .xls)
      </p>
    </Dragger>
  );

  // Hàm để lấy tiêu đề lỗi
  const getErrorTitle = (item) => `Hàng ${item.index + 1}`;

  // Hàm để lấy mô tả lỗi
  const getErrorDescription = (item) => item.errors.join(', ');

  // Sử dụng renderPreview
  const renderPreviewSection = () => {
    return renderPreview({
      label: "Tổng số khách hàng tiềm năng",
      dataSource: parsedData,
      columns: previewColumns,
      errorItems,
      onCancel: resetState,
      onImport: handleImport,
      importLoading,
      hasErrors: errorItems.length > 0,
      scrollX: 2000, // Giá trị cuộn ngang
      pageSize: 20, // Số lượng hàng trên mỗi trang
      getErrorTitle, // Truyền hàm lấy tiêu đề lỗi
      getErrorDescription, // Truyền hàm lấy mô tả lỗi
      disabled,
    });
  };

  return (
    <Modal
      className="import-modal"
      title={
        <div className="import-modal-title">
          <UploadOutlined /> Nhập danh sách khách hàng tiềm năng từ Excel
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <Spin spinning={importLoading} tip="Đang nhập dữ liệu...">
        <div className="import-container">
          {!showPreview && (
            <Alert
              message="Hướng dẫn nhập dữ liệu"
              description={
                <ol>
                  <li>Tải xuống file mẫu Excel hoặc sử dụng file có cấu trúc tương tự.</li>
                  <li>Điền thông tin khách hàng tiềm năng vào file (mỗi dòng là một khách hàng).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã khách hàng, Tên khách hàng, Nhóm khách hàng, Nguồn cơ hội, Người phụ trách.</li>
                </ol>
              }
              type="info"
              showIcon
            />
          )}

          <div className="import-content">
            {!showPreview ? (
              <>
                {renderTemplateSection()}
                <Divider />
                {renderUploader()}
              </>
            ) : (
              renderPreviewSection()
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default KhachHangTN_Import;