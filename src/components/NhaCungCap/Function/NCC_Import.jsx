import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Table, Modal, Alert, Typography, Divider, Spin, Badge } from 'antd';
import { InboxOutlined, FileExcelOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { handleFileUpload } from '../../utils/import/handleFileUpload';
import { checkDuplicateInFile, validateData, getFieldLabel } from '../../utils/import/validationHelpers';
import { downloadTemplate } from '../../utils/import/templateHelpers';
import TemplateDownloadSection from '../../utils/import/templateDownloadSection';
import {
  fetchPreviewData,
  renderMaNhaCungCap,
  renderTenNhaCungCap,
  isSupplierExisting,
} from './NCC_ImportRender';
import renderPreview from '../../utils/import/renderPreview';
import { createItem } from '../../utils/api/requestHelpers';

const { Dragger } = Upload;

const NhaCungCap_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingSuppliers, setExistingSuppliers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setExistingSuppliers);
    resetState();
  }, [open]);

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã nhà cung cấp': 'ma_nha_cung_cap',
    'Nhà cung cấp': 'ten_nha_cung_cap',
    'Số điện thoại': 'so_dien_thoai',
    'Email': 'email',
    'Địa chỉ': 'dia_chi',
    'Quốc gia': 'quoc_gia',
    'Mã số thuế': 'ma_so_thue',
    'Trang website': 'trang_website',
    'Tổng nợ phải trả': 'tong_no_phai_tra',
    'Ghi chú': 'ghi_chu'
  };

  // Các trường bắt buộc
  const requiredFields = ['ma_nha_cung_cap', 'ten_nha_cung_cap'];
  const uniqueFields = ['ma_nha_cung_cap', 'ten_nha_cung_cap'];

  // Hàm xác thực dữ liệu
  const handleValidateData = (data) => {
    // Kiểm tra trùng trong file Excel
    const duplicates = checkDuplicateInFile(data, uniqueFields);

    return validateData(
      data,
      requiredFields,
      (field) => getFieldLabel(field, columnMapping),
      setErrorItems,
      'ma_nha_cung_cap', // keyField
      'ten_nha_cung_cap', // nameField
      {
        ma_nha_cung_cap: (value) => isSupplierExisting(value, existingSuppliers),
        ten_nha_cung_cap: (value) => isSupplierExisting(value, existingSuppliers)
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
      tong_no_phai_tra:
        item.tong_no_phai_tra === undefined ||
        item.tong_no_phai_tra === null ||
        item.tong_no_phai_tra === ''
          ? 0
          : Number(item.tong_no_phai_tra),
    }));
  };

  // Hàm nhập từng dòng
  const importSingleItem = async (item) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/suppliers', data);
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
        message.success(`Đã nhập ${dataToImport.length} nhà cung cấp thành công!`);
        fetchPreviewData(setExistingSuppliers);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng nhà cung cấp một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} nhà cung cấp thành công!`);
      } else {
        message.error('Không thể nhập được nhà cung cấp nào!');
      }
      fetchPreviewData(setExistingSuppliers);
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
    { title: 'STT', dataIndex: 'key', key: 'key', width: "3%",
      render: (text) => text + 1 
    },
    { 
      title: 'Mã NCC', 
      dataIndex: 'ma_nha_cung_cap', 
      key: 'ma_nha_cung_cap', 
      width: "7%",
      render: (text, record) => renderMaNhaCungCap(text, record, errorItems, existingSuppliers)
    },
    { 
      title: 'Nhà cung cấp', 
      dataIndex: 'ten_nha_cung_cap', 
      key: 'ten_nha_cung_cap', 
      width: "13%",
      render: (text, record) => renderTenNhaCungCap(text, record, errorItems, existingSuppliers)
    },
    { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai', width: "7%" },
    { title: 'Email', dataIndex: 'email', key: 'email', width: "12%" },
    { title: 'Địa chỉ', dataIndex: 'dia_chi', key: 'dia_chi', width: "20%" },
    { 
      title: 'Quốc gia', 
      dataIndex: 'quoc_gia', 
      key: 'quoc_gia', 
      width: "7%",
    },
    { title: 'Mã số thuế', dataIndex: 'ma_so_thue', key: 'ma_so_thue', width: "7%" },
    { title: 'Trang website', dataIndex: 'trang_website', key: 'trang_website', width: "10%" },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trang_thai', 
      key: 'trang_thai',
      width: "7%"
    },
    { 
      title: 'Tổng nợ phải trả', 
      dataIndex: 'tong_no_phai_tra', 
      key: 'tong_no_phai_tra',
      width: "7%",
      render: (value) => value ? value.toLocaleString('vi-VN') : '0' 
    },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['NCC001', 'Công ty ABC', '0123456789', 'contact@abc.com', '123 Đường ABC, Quận 1, TP.HCM', 
       'Việt Nam', '0123456789', 'www.abc.com', '0', 'Nhà cung cấp mẫu'],
      ['NCC002', 'Công ty XYZ', '', '', '456 Đường XYZ, Quận 2, TP.HCM', 
       'Việt Nam', '', 'www.xyz.com', '1000000', '']
    ];
    downloadTemplate(columns, sampleData, 'Template_Nha_Cung_Cap');
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
        defaultFields: { trang_thai: 'Đang hợp tác', ngay_them_vao: moment().format('YYYY-MM-DD') },
        mode: 'nhacungcap'
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
      label: "Tổng số nhà cung cấp",
      dataSource: parsedData,
      columns: previewColumns,
      errorItems,
      onCancel: resetState,
      onImport: handleImport,
      importLoading,
      hasErrors: errorItems.length > 0,
      scrollX: 1440, // Giá trị cuộn ngang
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
          <UploadOutlined /> Nhập danh sách nhà cung cấp từ Excel
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
                  <li>Điền thông tin nhà cung cấp vào file (mỗi dòng là một nhà cung cấp).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã NCC, Nhà cung cấp, Quốc gia.</li>
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

export default NhaCungCap_Import;