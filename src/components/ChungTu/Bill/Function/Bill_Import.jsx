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
  renderMaBill,
  renderNguoiCapNhat,
  isBillExisting,
} from './Bill_ImportRender';
import renderPreview from '../../../utils/import/renderPreview';
import { createItem } from '../../../utils/api/requestHelpers';

const { Dragger } = Upload;

const Bill_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingBills, setExistingBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setAccounts, setExistingBills);
    resetState();
  }, [open]);

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã bill': 'ma_bill',
    'Người cập nhật': 'nguoi_cap_nhat',
    'Ghi chú': 'ghi_chu',
  };

  // Các trường bắt buộc
  const requiredFields = ['ma_bill', 'nguoi_cap_nhat'];
  const uniqueFields = ['ma_bill'];

  // Hàm xác thực dữ liệu
  const handleValidateData = (data) => {
    // Kiểm tra trùng trong file
    const duplicates = checkDuplicateInFile(data, uniqueFields);

    return validateData(
      data,
      requiredFields,
      (field) => getFieldLabel(field, columnMapping),
      setErrorItems,
      'ma_bill',
      'ma_bill',
      {
        ma_bill: (value) => isBillExisting(value, existingBills),
      },
      duplicates // truyền vào validateData
    );
  };

  // Hàm chuẩn bị dữ liệu để gửi
  const prepareDataForImport = (data) => {
    return data.map(item => ({
      ...item,
      ngay_cap_nhat: item.ngay_cap_nhat
        ? moment(item.ngay_cap_nhat).format('YYYY-MM-DD')
        : undefined,
    }));
  };

  // Hàm nhập từng dòng
  const importSingleItem = async (item) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/bills', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/bills', data);
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
        message.success(`Đã nhập ${dataToImport.length} bill thành công!`);
        fetchPreviewData(setAccounts, setExistingBills);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng bill một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} bill thành công!`);
      } else {
        message.error('Không thể nhập được bill nào!');
      }
      fetchPreviewData(setAccounts, setExistingBills);
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
      title: 'Mã bill', 
      dataIndex: 'ma_bill', 
      key: 'ma_bill', 
      width: "15%",
      render: (text, record) => renderMaBill(text, record, errorItems, existingBills)
    },
    {
      title: 'Người cập nhật',
      dataIndex: 'nguoi_cap_nhat',
      key: 'nguoi_cap_nhat',
      width: "25%",
      render: (maNguoiDung, record) => renderNguoiCapNhat(maNguoiDung, record, accounts, errorItems)
    },
    { title: 'Ngày cập nhật', dataIndex: 'ngay_cap_nhat', key: 'ngay_cap_nhat', width: "10%" },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "28%" },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['D172194', 'Phạm Phú Cường', ''],
      ['E549810', 'Phạm Phú Cường', '']
    ];
    downloadTemplate(columns, sampleData, 'Template_Bill');
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
        defaultFields: { ngay_cap_nhat: moment().format('YYYY-MM-DD') },
        mode: 'bill'
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
      label: "Tổng số bill",
      dataSource: parsedData,
      columns: previewColumns,
      errorItems,
      onCancel: resetState,
      onImport: handleImport,
      importLoading,
      hasErrors: errorItems.length > 0,
      scrollX: 720, // Giá trị cuộn ngang
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
          <UploadOutlined /> Nhập danh sách bill từ Excel
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1000}
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
                  <li>Điền thông tin bill vào file (mỗi dòng là một bill).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã bill, Người cập nhật.</li>
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

export default Bill_Import;