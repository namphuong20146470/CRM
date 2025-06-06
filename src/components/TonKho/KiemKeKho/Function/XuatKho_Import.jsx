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
  renderTenKho,
  renderTenKhachHang,
  renderNguoiPhuTrach,
  renderSoLuongXuat
} from './XuatKho_ImportRender';
import renderPreview from '../../../utils/import/renderPreview';
import { createItem } from '../../../utils/api/requestHelpers';
import { convertDateFields } from '../../../utils/convert/convertDateFields';
import { renderDateField } from '../../../utils/format/renderDateField';

const { Dragger } = Upload;

const XuatKho_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingStockIn, setExistingStockIn] = useState([]);
  const [existingStockOut, setExistingStockOut] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setProducts, setWarehouses, setCustomers, setAccounts, setExistingStockIn ,setExistingStockOut);
    resetState();
  }, [open]);

  // Hàm tính số lượng hiện có của mã hàng tại kho
  const getCurrentStock = (maHang, maKho) => {
    if (!maHang || !maKho) return 0;
    // Tổng nhập
    const stockIn = existingStockIn.filter(item => item.ma_hang === maHang && item.ten_kho === maKho)
      .reduce((sum, item) => sum + Number(item.so_luong_nhap || 0), 0);
    // Tổng xuất
    const stockOut = existingStockOut.filter(item => item.ma_hang === maHang && item.ten_kho === maKho)
      .reduce((sum, item) => sum + Number(item.so_luong_xuat || 0), 0);
    return stockIn - stockOut;
  };

  // Hàm sinh mã xuất kho mới
  const generateMaXuatKho = (() => {
    let base = null;
    return (index = 0) => {
      // Tìm số lớn nhất trong các mã xuất kho hiện có (XKxx)
      if (base === null) {
        let maxNumber = 0;
        existingStockOut.forEach(item => {
          if (item.ma_stock_out) {
            const match = item.ma_stock_out.match(/^XK(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNumber) maxNumber = num;
            }
          }
        });
        base = maxNumber;
      }
      return `XK${base + index + 1}`;
    };
  })();

  const dateFields = ['ngay_xuat_hang'];

  // Hàm xử lý sau khi parse file Excel
  const handleAfterParse = (parsedRows) => {
    const dataWithMaXK = parsedRows.map((row, idx) => ({
      ...row,
      ma_stock_out: generateMaXuatKho(idx)
    }));
    const dataWithDateFlags = dataWithMaXK.map(item => convertDateFields(item, dateFields));
    setParsedData(dataWithDateFlags);
    handleValidateData(dataWithDateFlags);
    setShowPreview(true);
  };

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã hàng': 'ma_hang',
    'Ngày xuất': 'ngay_xuat_hang',
    'Số lượng': 'so_luong_xuat',
    'Kho': 'ten_kho',
    'Khách hàng': 'ten_khach_hang',
    'Người phụ trách': 'nguoi_phu_trach',
  };

  // Các trường bắt buộc
  const requiredFields = ['ma_hang', 'ngay_xuat_hang', 'so_luong_xuat', 'ten_kho', 'ten_khach_hang', 'nguoi_phu_trach'];

  // Hàm xác thực dữ liệu
  const handleValidateData = (data) => {
    return validateData(
      data,
      requiredFields,
      (field) => getFieldLabel(field, columnMapping),
      setErrorItems,
      'ma_stock_out', // keyField
      'ma_hang', // nameField
      {},                     // validators (nếu có)
      {},                     // duplicates (nếu có)
      dateFields,             // truyền mảng các trường ngày
      columnMapping,          // truyền mapping cột
      { getCurrentStock }
    );
  };

  // Hàm chuẩn bị dữ liệu để gửi
  const prepareDataForImport = (data) => {
    return data.map(item => {
      const converted = convertDateFields(item, ['ngay_xuat_hang']);
      return {
        ...converted,
      };
    });
  };

  // Hàm nhập từng dòng
  const importSingleItem = async (item) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out', data);
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
        message.success(`Đã nhập ${dataToImport.length} dữ liệu xuất kho thành công!`);
        fetchPreviewData(setProducts, setWarehouses, setCustomers, setAccounts, setExistingStockIn ,setExistingStockOut);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng dữ liệu xuất kho một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} dữ liệu xuất kho thành công!`);
      } else {
        message.error('Không thể nhập được dữ liệu xuất kho nào!');
      }

      // Cập nhật lại danh sách dữ liệu xuất kho hiện có sau khi import từng dòng
      fetchPreviewData(setProducts, setWarehouses, setCustomers, setAccounts, setExistingStockIn ,setExistingStockOut);
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
    generateMaXuatKho.base = null;
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
      title: 'Mã xuất kho', 
      dataIndex: 'ma_stock_out', 
      key: 'ma_stock_out', 
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
      title: 'Ngày xuất',
      dataIndex: 'ngay_xuat_hang',
      key: 'ngay_xuat_hang',
      width: "10%",
      render: (value, record) => renderDateField(value, record, errorItems, 'Ngày xuất', 'ngay_xuat_hang')
    },
    {
      title: 'Số lượng',
      dataIndex: 'so_luong_xuat',
      key: 'so_luong_xuat',
      width: "10%",
      render: (soLuong, record) => renderSoLuongXuat(soLuong, record, errorItems)
    },
    {
      title: 'Kho',
      dataIndex: 'ten_kho',
      key: 'ten_kho',
      width: "10%",
      render: (maKho, record) => renderTenKho(maKho, record, warehouses, errorItems)
    },
    {
      title: 'Khách hàng',
      dataIndex: 'ten_khach_hang',
      key: 'ten_khach_hang',
      width: "25%",
      render: (maKhachHang, record) => renderTenKhachHang(maKhachHang, record, customers, errorItems)
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'nguoi_phu_trach',
      key: 'nguoi_phu_trach',
      width: "15%",
      render: (maNguoiDung, record) => renderNguoiPhuTrach(maNguoiDung, record, accounts, errorItems)
    },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['UH302E12', '28.06.2025', '8', 'Kho HOPT', 'BỆNH VIỆN II LÂM ĐỒNG', 'Hứa Tường Huy'],
      ['26176HW', '28.06.2025', '12', 'Kho HOPT', 'BỆNH VIỆN II LÂM ĐỒNG', 'Hứa Tường Huy']
    ];
    downloadTemplate(columns, sampleData, 'Template_Xuat_Kho');
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
        warehouses,
        customers,
        accounts,
        mode: 'xuatkho'
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
      label: "Tổng số dữ liệu xuất kho",
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
          <UploadOutlined /> Nhập danh sách dữ liệu xuất kho từ Excel
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
                  <li>Điền thông tin dữ liệu xuất kho vào file (mỗi dòng là một dữ liệu xuất kho).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã hàng, Ngày xuất, Số lượng, Kho, Tên khách hàng, Người phụ trách.</li>
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

export default XuatKho_Import;