import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Table, Modal, Alert, Typography, Divider, Spin, Badge } from 'antd';
import { InboxOutlined, FileExcelOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { checkDuplicateInFile, validateData, getFieldLabel } from '../../../../utils/import/validationHelpers';
import TemplateDownloadSection from '../../../../utils/import/templateDownloadSection';
import {
  fetchPreviewData,
  renderMaHang, 
  renderTenHang,
  renderNguoiCapNhat,
  renderLoaiHang,
  renderNhaCungCap,
} from './HangHoa_ImportRender';
import renderPreview from '../../../../utils/import/renderPreview';
import { createItem } from '../../../../utils/api/requestHelpers';
import { getCountryName } from '../../../../utils/convert/countryCodes';
import { convertDateFields } from '../../../../utils/convert/convertDateFields';
import { renderDateField } from '../../../../utils/format/renderDateField';
import { handleHangHoaFileUpload } from './handleHangHoaFileUpload';
import { downloadHangHoaTemplate } from './templateHelpersHangHoa';

const { Dragger } = Upload;

const HangHoa_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [accounts, setAccounts] = useState([]);
  const [product_types, setProductTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setAccounts, setProductTypes, setSuppliers);
    resetState();
  }, [open]);

  // Các trường bắt buộc
  const requiredFields = ['ma_hang', 'ten_hang', 'ten_nha_cung_cap', 'nguoi_cap_nhat', 'trong_luong_tinh', 'gia_thuc', 'price_list', 'ngay_gia'];
  const dateFields = ['ngay_gia'];

  const handleAfterParse = (parsedRows) => {
    const dataWithDateFlags = parsedRows.map(item => convertDateFields(item, dateFields));
    setParsedData(dataWithDateFlags);
    handleValidateData(dataWithDateFlags);
    setShowPreview(true);
  };

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã hàng': 'ma_hang',
    'Tên hàng': 'ten_hang',
    'Loại hàng': 'ten_loai_hang',
    'Nhà cung cấp': 'ten_nha_cung_cap',
    'Nước xuất xứ': 'nuoc_xuat_xu',
    'Trọng lượng': 'trong_luong_tinh',
    'Giá thực': 'gia_thuc',
    'Đơn vị': 'don_vi_ban_hang',
    'Tình trạng': 'tinh_trang_hang_hoa',
    'Người cập nhật': 'nguoi_cap_nhat',
    'Ngày giá': 'ngay_gia',
    'Mô tả': 'mo_ta',
  };

  // Hàm xác thực dữ liệu
  const handleValidateData = (data) => {
    return validateData(
      data,
      requiredFields,
      (field) => getFieldLabel(field, columnMapping),
      setErrorItems,
      'ma_hang', // keyField
      'ten_hang', // nameField
      {},  
      {},
      dateFields,             // truyền mảng các trường ngày
      columnMapping  
    );
  };

  // Hàm chuẩn bị dữ liệu để gửi
  const prepareDataForImport = (data) => {
      const numberFields = [
        'trong_luong_tinh', 'gia_thuc'
      ];
      return data.map(item => {
        const converted = convertDateFields(item, [
          'ngay_gia'
        ]);
        // Gán mặc định 0 cho các trường số nếu bị trống
        numberFields.forEach(field => {
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
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/products', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/products', data);
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
        message.success(`Đã nhập ${dataToImport.length} hàng hóa thành công!`);
        fetchPreviewData(setAccounts, setProductTypes, setSuppliers);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng hàng hóa một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} hàng hóa thành công!`);
      } else {
        message.error('Không thể nhập được hàng hóa nào!');
      }
      fetchPreviewData(setAccounts, setProductTypes, setSuppliers);
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
      title: 'Mã hàng', 
      dataIndex: 'ma_hang', 
      key: 'ma_hang', 
      width: "6%",
      render: (text, record) => renderMaHang(text, record, errorItems)
    },
    { 
      title: 'Tên hàng', 
      dataIndex: 'ten_hang', 
      key: 'ten_hang', 
      width: "10%",
      render: (text, record) => renderTenHang(text, record, errorItems)
    },
    {
      title: 'Loại hàng',
      dataIndex: 'ten_loai_hang',
      key: 'ten_loai_hang',
      width: "8%",
      render: (maLoaiHang, record) => renderLoaiHang(maLoaiHang, record, product_types, errorItems)
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'ten_nha_cung_cap',
      key: 'ten_nha_cung_cap',
      width: "6%",
      render: (maNhaCungCap, record) => renderNhaCungCap(maNhaCungCap, record, suppliers, errorItems)
    },
    { title: 'Nước xuất xứ', dataIndex: 'nuoc_xuat_xu', key: 'nuoc_xuat_xu', render: (code) => getCountryName(code), width: "6%" },
    { title: 'Trọng lượng', dataIndex: 'trong_luong_tinh', key: 'trong_luong_tinh', render: (value) => value ? value.toLocaleString('vi-VN') : '0', width: "7%" },
    { title: 'Giá thực', dataIndex: 'gia_thuc', key: 'gia_thuc', render: (value) => value ? value.toLocaleString('vi-VN') : '0', width: "7%" },
    { title: 'Đơn vị', dataIndex: 'don_vi_ban_hang', key: 'don_vi_ban_hang', width: "3%" },
    { title: 'Tình trạng', dataIndex: 'tinh_trang_hang_hoa', key: 'tinh_trang_hang_hoa', width: "3%" },
    {
      title: 'Người cập nhật',
      dataIndex: 'nguoi_cap_nhat',
      key: 'nguoi_cap_nhat',
      width: "10%",
      render: (maNguoiDung, record) => renderNguoiCapNhat(maNguoiDung, record, accounts, errorItems)
    },
    { 
      title: 'Ngày cập nhật', 
      dataIndex: 'ngay_cap_nhat', 
      key: 'ngay_cap_nhat', 
      width: "5%",
    },
    { title: 'Price List', dataIndex: 'price_list', key: 'price_list', width: "7%" },
    { 
      title: 'Ngày giá', 
      dataIndex: 'ngay_gia', 
      key: 'ngay_gia', 
      width: "5%",
      render: (value, record) => renderDateField(value, record, errorItems, 'Ngày giá', 'ngay_gia'),
    },
    { title: 'Mô tả', dataIndex: 'mo_ta', key: 'mo_ta', width: "15%" },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const specialHeaders = ['Nhà cung cấp', 'Price List', , 'Người cập nhật'];
    const specialValues = ['Karl Storz', 'Price List 05.2025', 'Đỗ Thị Linh Phương'];
    const headers = [
      'Mã hàng', 'Tên hàng', 'Loại hàng', 'Nước xuất xứ', 'Trọng lượng', 'Giá thực',
      'Đơn vị', 'Tình trạng', 'Ngày giá', 'Mô tả'
    ];
    const sampleData = [
      ['WM200', 'OR1 SmartScreen', 'Màn Hình', 'TW', '1000', '2273,75', 'cái', 'O', 'Đỗ Thị Linh Phương', '01.05.2025', ''],
      ['WO10240', 'OR1 HIVE Router', 'Màn Hình', 'LT', '1382,6', '1058,86', 'cái', 'O', 'Đỗ Thị Linh Phương', '01.05.2025', '']
    ];
    downloadHangHoaTemplate(specialHeaders, specialValues, headers, sampleData, 'Template_Hang_Hoa');
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
      beforeUpload={(file) => handleHangHoaFileUpload(file, {
        columnMapping,
        setParsedData: handleAfterParse, // <-- dùng hàm này
        validateData: () => {},
        setShowPreview,
        setFileList,
        accounts,
        product_types,
        suppliers,
        defaultFields: { ngay_cap_nhat: moment().format('YYYY-MM-DD') },
        mode: 'hanghoa'
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
      label: "Tổng số hàng hóa",
      dataSource: parsedData,
      columns: previewColumns,
      errorItems,
      onCancel: resetState,
      onImport: handleImport,
      importLoading,
      hasErrors: errorItems.length > 0,
      scrollX: 2300, // Giá trị cuộn ngang
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
          <UploadOutlined /> Nhập danh sách hàng hóa từ Excel
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
                  <li>Điền thông tin hàng hóa vào file (mỗi dòng là một hàng hóa).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã hàng, Tên hàng, Nhà cung cấp, Người cập nhật, Trọng lượng tịnh, Giá thực, Price List, Ngày giá.</li>
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

export default HangHoa_Import;