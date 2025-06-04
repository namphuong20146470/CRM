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
  renderTenKhachHang,
  renderNguoiPhuTrach,
  isCustomerExisting,
  isAccountExisting
} from './KhachHang_ImportRender';
import renderPreview from '../../../utils/import/renderPreview';
import { createItem } from '../../../utils/api/requestHelpers';

const { Dragger } = Upload;

const KhachHang_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setAccounts, setExistingCustomers);
    resetState();
  }, [open]);

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã khách hàng': 'ma_khach_hang',
    'Khách hàng': 'ten_khach_hang',
    'Người phụ trách': 'nguoi_phu_trach',
    'Mã số thuế': 'ma_so_thue',
    'Địa chỉ cụ thể': 'dia_chi_cu_the',
    'Tỉnh thành': 'tinh_thanh',
    'Số điện thoại': 'so_dien_thoai',
    'Email': 'email',
    'Người liên hệ': 'nguoi_lien_he',
    'Tổng nợ phải thu': 'tong_no_phai_thu',
    'Ghi chú': 'ghi_chu'
  };

  // Các trường bắt buộc
  const requiredFields = ['ma_khach_hang', 'ten_khach_hang', 'nguoi_phu_trach'];
  const uniqueFields = ['ma_khach_hang', 'ten_khach_hang'];

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
      'ten_khach_hang', // nameField
      {
        ma_khach_hang: (value) => isCustomerExisting(value, existingCustomers),
        ten_khach_hang: (value) => isCustomerExisting(value, existingCustomers)
      },
      duplicates
    );
  };

  // Hàm chuẩn bị dữ liệu để gửi
  const prepareDataForImport = (data) => {
    return data.map(item => ({
      ...item,
      ngay_them_vao: item.ngay_them_vao
        ? moment(item.ngay_them_vao).format('YYYY-MM-DD')
        : undefined,
      tong_no_phai_thu:
        item.tong_no_phai_thu === undefined ||
        item.tong_no_phai_thu === null ||
        item.tong_no_phai_thu === ''
          ? 0
          : Number(item.tong_no_phai_thu),
    }));
  };

  // Hàm nhập từng dòng
  const importSingleItem = async (item) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/customers', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/customers', data);
      return result?.success;
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

      // Thử nhập toàn bộ dữ liệu
      const success = await importAllItems(dataToImport);

      if (success) {
        message.success(`Đã nhập ${dataToImport.length} khách hàng thành công!`);
        fetchPreviewData(setAccounts, setExistingCustomers);
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
      fetchPreviewData(setAccounts, setExistingCustomers);
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
      width: "6%",
      render: (text, record) => renderMaKhachHang(text, record, errorItems, existingCustomers)
    },
    { 
      title: 'Khách hàng', 
      dataIndex: 'ten_khach_hang', 
      key: 'ten_khach_hang', 
      width: "20%",
      render: (text, record) => renderTenKhachHang(text, record, errorItems, existingCustomers)
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'nguoi_phu_trach',
      key: 'nguoi_phu_trach',
      width: "8%",
      render: (maNguoiDung, record) => renderNguoiPhuTrach(maNguoiDung, record, accounts, errorItems)
    },
    { title: 'Mã số thuế', dataIndex: 'ma_so_thue', key: 'ma_so_thue', width: "4%" },
    { title: 'Địa chỉ cụ thể', dataIndex: 'dia_chi_cu_the', key: 'dia_chi_cu_the', width: "18%" },
    { title: 'Tỉnh thành', dataIndex: 'tinh_thanh', key: 'tinh_thanh', width: "5%" },
    { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai', width: "5%" },
    { title: 'Email', dataIndex: 'email', key: 'email', width: "5%" },
    { title: 'Người liên hệ', dataIndex: 'nguoi_lien_he', key: 'nguoi_lien_he', width: "10%" },
    { 
      title: 'Tổng nợ phải thu', 
      dataIndex: 'tong_no_phai_thu', 
      key: 'tong_no_phai_thu',
      width: "7%",
      render: (value) => value ? value.toLocaleString('vi-VN') : '0' 
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "10%" },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['BHT', 'CÔNG TNHH BỆNH VIỆN HOÀNG TUẤN', 'Hứa Tường Huy', '2200323097', '80A Lê Hồng Phong, Phường 3, TP. Sóc Trăng, Tỉnh Sóc Trăng', 
        'Sóc Trăng', '0937231074', 'hoangtuan@gmail.com', 'Chị Thuận - GĐ: 0937231074, Chị Thu: 0917717791', '0', ''],
      ['HBY', 'Hộ KD Cửa Hàng VT Y Tế Bảo Yến', 'Hứa Tường Huy', '8366462924', 'Số 111 Phương Mai, Quận Đống Đa, Hà Nội', 'Hà Nội', 
        '0987654321', 'baoyen@gmail.com', '', '0', '']
    ];
    downloadTemplate(columns, sampleData, 'Template_Khach_Hang');
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
        setParsedData,
        validateData: handleValidateData,
        setShowPreview,
        setFileList,
        accounts,
        defaultFields: { ngay_them_vao: moment().format('YYYY-MM-DD') },
        mode: 'khachhang'
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
      label: "Tổng số khách hàng",
      dataSource: parsedData,
      columns: previewColumns,
      errorItems,
      onCancel: resetState,
      onImport: handleImport,
      importLoading,
      hasErrors: errorItems.length > 0,
      scrollX: 2050, // Giá trị cuộn ngang
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
          <UploadOutlined /> Nhập danh sách khách hàng từ Excel
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
                  <li>Điền thông tin khách hàng vào file (mỗi dòng là một khách hàng).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã khách hàng, Khách hàng, Người phụ trách.</li>
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

export default KhachHang_Import;