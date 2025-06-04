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
  renderMaHang,
  renderTenNhaCungCap,
  renderTenKho,
  renderMaBill,
  renderMaHopDong,
} from './NhapKho_ImportRender';
import renderPreview from '../../../utils/import/renderPreview';
import { createItem } from '../../../utils/api/requestHelpers';
import { convertDateFields } from '../../../utils/convert/convertDateFields';
import { renderDateField } from '../../../utils/format/renderDateField';

const { Dragger } = Upload;

const NhapKho_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingStockIn, setExistingStockIn] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [bills, setBills] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setProducts, setSuppliers, setWarehouses, setBills, setContracts, setExistingStockIn);
    resetState();
  }, [open]);

  // Hàm sinh mã nhập kho mới
  const generateMaNhapKho = (() => {
    let base = null;
    return (index = 0) => {
      // Tìm số lớn nhất trong các mã nhập kho hiện có (NKxx)
      if (base === null) {
        let maxNumber = 0;
        existingStockIn.forEach(item => {
          if (item.ma_stock_in) {
            const match = item.ma_stock_in.match(/^NK(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNumber) maxNumber = num;
            }
          }
        });
        base = maxNumber;
      }
      return `NK${base + index + 1}`;
    };
  })();

  const dateFields = ['ngay_nhap_hang'];

  // Hàm xử lý sau khi parse file Excel
  const handleAfterParse = (parsedRows) => {
    const dataWithMaNK = parsedRows.map((row, idx) => ({
      ...row,
      ma_stock_in: generateMaNhapKho(idx)
    }));
    const dataWithDateFlags = dataWithMaNK.map(item => convertDateFields(item, dateFields));
    setParsedData(dataWithDateFlags);
    handleValidateData(dataWithDateFlags);
    setShowPreview(true);
  };

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã hàng': 'ma_hang',
    'Ngày nhập': 'ngay_nhap_hang',
    'Số lượng': 'so_luong_nhap',
    'Kho': 'ten_kho',
    'Bill': 'ma_bill',
    'Hợp đồng': 'ma_hop_dong',
  };

  // Các trường bắt buộc
  const requiredFields = ['ma_hang', 'ngay_nhap_hang', 'so_luong_nhap', 'ten_kho', 'ma_bill', 'ma_hop_dong'];

  // Hàm xác thực dữ liệu
  const handleValidateData = (data) => {
    return validateData(
      data,
      requiredFields,
      (field) => getFieldLabel(field, columnMapping),
      setErrorItems,
      'ma_stock_in', // keyField
      'ma_hang', // nameField
      {},                     // validators (nếu có)
      {},                     // duplicates (nếu có)
      dateFields,             // truyền mảng các trường ngày
      columnMapping 
    );
  };

  // Hàm chuẩn bị dữ liệu để gửi
  const prepareDataForImport = (data) => {
    return data.map(item => {
      const converted = convertDateFields(item, ['ngay_nhap_hang']);
      return {
        ...converted,
      };
    });
  };

  // Hàm nhập từng dòng
  const importSingleItem = async (item) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/stock-in', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/stock-in', data);
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
      console.log('Data gửi lên:', dataToImport);

      // Thử nhập toàn bộ dữ liệu
      const success = await importAllItems(dataToImport);

      if (success) {
        message.success(`Đã nhập ${dataToImport.length} dữ liệu nhập kho thành công!`);
        fetchPreviewData(setProducts, setSuppliers, setWarehouses, setBills, setContracts, setExistingStockIn);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng dữ liệu nhập kho một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} dữ liệu nhập kho thành công!`);
      } else {
        message.error('Không thể nhập được dữ liệu nhập kho nào!');
      }

      // Cập nhật lại danh sách dữ liệu nhập kho hiện có sau khi import từng dòng
      fetchPreviewData(setProducts, setSuppliers, setWarehouses, setBills, setContracts, setExistingStockIn);
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
    generateMaNhapKho.base = null;
  };

  // Hàm đóng modal
  const handleClose = () => {
    resetState();
    onClose();
  };

  // Cấu hình cột cho bảng xem trước dữ liệu
  const previewColumns = [
    { title: 'STT', dataIndex: 'key', key: 'key', width: "5%",
      render: (text) => text + 1 
    },
    { 
      title: 'Mã nhập kho', 
      dataIndex: 'ma_stock_in', 
      key: 'ma_stock_in', 
      width: "10%",
    },
    {
      title: 'Mã hàng',
      dataIndex: 'ma_hang',
      key: 'ma_hang',
      width: "15%",
      render: (maHang, record) => renderMaHang(maHang, record, products, errorItems)
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'ngay_nhap_hang',
      key: 'ngay_nhap_hang',
      width: "10%",
      render: (value, record) => renderDateField(value, record, errorItems, 'Ngày nhập', 'ngay_nhap_hang')
    },
    {
      title: 'Số lượng',
      dataIndex: 'so_luong_nhap',
      key: 'so_luong_nhap',
      width: "10%",
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'ten_nha_cung_cap',
      key: 'ten_nha_cung_cap',
      width: "15%",
      render: (maNhaCungCap, record) => renderTenNhaCungCap(maNhaCungCap, record, suppliers, errorItems)
    },
    {
      title: 'Kho',
      dataIndex: 'ten_kho',
      key: 'ten_kho',
      width: "10%",
      render: (maKho, record) => renderTenKho(maKho, record, warehouses, errorItems)
    },
    {
      title: 'Bill',
      dataIndex: 'ma_bill',
      key: 'ma_bill',
      width: "10%",
      render: (maBill, record) => renderMaBill(maBill, record, bills, errorItems)
    },
    {
      title: 'Hợp đồng',
      dataIndex: 'ma_hop_dong',
      key: 'ma_hop_dong',
      width: "15%",
      render: (soHopDong, record) => renderMaHopDong(soHopDong, record, contracts, errorItems)
    },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['UH302E12', '27.05.2025', '10', 'Kho HOPT', 'C173294', '01/2024/HOPT-STORZ'],
      ['26176HW', '27.05.2025', '15', 'Kho HOPT', 'C173294', '01/2024/HOPT-STORZ']
    ];
    downloadTemplate(columns, sampleData, 'Template_Nhap_Kho');
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
        products,
        suppliers,
        warehouses,
        bills,
        contracts,
        mode: 'nhapkho'
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
      label: "Tổng số dữ liệu nhập kho",
      dataSource: parsedData,
      columns: previewColumns,
      errorItems,
      onCancel: resetState,
      onImport: handleImport,
      importLoading,
      hasErrors: errorItems.length > 0,
      scrollX: 1200, // Giá trị cuộn ngang
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
          <UploadOutlined /> Nhập danh sách dữ liệu nhập kho từ Excel
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
                  <li>Điền thông tin dữ liệu nhập kho vào file (mỗi dòng là một dữ liệu nhập kho).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã hàng, Ngày nhập, Số lượng, Kho, Bill, Hợp đồng.</li>
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

export default NhapKho_Import;