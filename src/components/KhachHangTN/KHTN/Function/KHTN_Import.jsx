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
  renderSoHopDong,
  renderNguoiTao,
  renderLoaiHopDong,
  isContractExisting,
} from './KHTN_ImportRender';
import renderPreview from '../../../utils/import/renderPreview';
import { createItem } from '../../../utils/api/requestHelpers';
import { convertDateFields } from '../../../utils/convert/convertDateFields';
import { renderDateField } from '../../../utils/format/renderDateField';

const { Dragger } = Upload;

const HopDong_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingContracts, setExistingContracts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contract_types, setContractTypes] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setAccounts, setContractTypes, setExistingContracts);
    resetState();
  }, [open]);

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Số hợp đồng': 'so_hop_dong',
    'Loại hợp đồng': 'loai_hop_dong',
    'Ngày ký hợp đồng': 'ngay_ky_hop_dong',
    'Ngày bắt đầu': 'ngay_bat_dau',
    'Ngày kết thúc': 'ngay_ket_thuc',
    'Trạng thái': 'trang_thai_hop_dong',
    'Giá trị hợp đồng': 'gia_tri_hop_dong',
    'Đối tác liên quan': 'doi_tac_lien_quan',
    'Điều khoản thanh toán': 'dieu_khoan_thanh_toan',
    'Tệp đính kèm': 'tep_dinh_kem',
    'Vị trí lưu trữ': 'vi_tri_luu_tru',
    'Người tạo': 'nguoi_tao',
    'Ghi chú': 'ghi_chu',
  };

  // Các trường bắt buộc
  const requiredFields = ['so_hop_dong', 'loai_hop_dong', 'ngay_ky_hop_dong', 'doi_tac_lien_quan', 'nguoi_tao'];
  const uniqueFields = ['so_hop_dong'];
  const dateFields = ['ngay_ky_hop_dong', 'ngay_bat_dau', 'ngay_ket_thuc'];
  
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
      'so_hop_dong', // keyField
      'so_hop_dong', // nameField
      {
        so_hop_dong: (value) => isContractExisting(value, existingContracts),
      },
      duplicates,
      dateFields,             // truyền mảng các trường ngày
      columnMapping 
    );
  };

  const prepareDataForImport = (data) => {
    const soLuongFields = [
      'gia_tri_hop_dong',
    ];
    return data.map(item => {
      const converted = convertDateFields(item, [
        'ngay_ky_hop_dong', 'ngay_bat_dau', 'ngay_ket_thuc'
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
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/contracts', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/contracts', data);
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
        message.success(`Đã nhập ${dataToImport.length} hợp đồng thành công!`);
        fetchPreviewData(setAccounts, setContractTypes, setExistingContracts);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng hợp đồng một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} hợp đồng thành công!`);
      } else {
        message.error('Không thể nhập được hợp đồng nào!');
      }

      // Cập nhật lại danh sách hợp đồng hiện có sau khi import từng dòng
      fetchPreviewData(setAccounts, setContractTypes, setExistingContracts);
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
      title: 'Số hợp đồng', 
      dataIndex: 'so_hop_dong', 
      key: 'so_hop_dong', 
      width: "10%",
      render: (text, record) => renderSoHopDong(text, record, errorItems, existingContracts)
    },
    {
      title: 'Loại hợp đồng',
      dataIndex: 'loai_hop_dong',
      key: 'loai_hop_dong',
      width: "8%",
      render: (maLoaiHopDong, record) => renderLoaiHopDong(maLoaiHopDong, record, contract_types, errorItems)
    },
    {
        title: 'Ngày ký hợp đồng',
        dataIndex: 'ngay_ky_hop_dong',
        key: 'ngay_ky_hop_dong',
        width: "5%",
        render: (value, record) => renderDateField(value, record, errorItems, 'Ngày ký hợp đồng', 'ngay_ky_hop_dong')
    },
    {
        title: 'Ngày bắt đầu',
        dataIndex: 'ngay_bat_dau',
        key: 'ngay_bat_dau',
        width: "5%",
        render: (value, record) => renderDateField(value, record, errorItems, 'Ngày bắt đầu', 'ngay_bat_dau')
    },
    {
        title: 'Ngày kết thúc',
        dataIndex: 'ngay_ket_thuc',
        key: 'ngay_ket_thuc',
        width: "5%",
        render: (value, record) => renderDateField(value, record, errorItems, 'Ngày kết thúc', 'ngay_ket_thuc')
    },
    { title: 'Trạng thái', dataIndex: 'trang_thai_hop_dong', key: 'trang_thai_hop_dong', width: "5%" },
    { title: 'Giá trị hợp đồng', dataIndex: 'gia_tri_hop_dong', key: 'gia_tri_hop_dong', width: "6%", render: (value) => value ? value.toLocaleString('vi-VN') : '0'  },
    { title: 'Đối tác liên quan', dataIndex: 'doi_tac_lien_quan', key: 'doi_tac_lien_quan', width: "12%" },
    { title: 'Điều khoản thanh toán', dataIndex: 'dieu_khoan_thanh_toan', key: 'dieu_khoan_thanh_toan', width: "10%" },
    { title: 'Tệp đính kèm', dataIndex: 'tep_dinh_kem', key: 'tep_dinh_kem', width: "6%" }, 
    { title: 'Vị trí lưu', dataIndex: 'vi_tri_luu_tru', key: 'vi_tri_luu_tru', width: "6%" },
    {
      title: 'Người tạo',
      dataIndex: 'nguoi_tao',
      key: 'nguoi_tao',
      width: "8%",
      render: (maNguoiDung, record) => renderNguoiTao(maNguoiDung, record, accounts, errorItems)
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "12%" },
  ];

  // Hàm tải xuống file mẫu
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['03/2024/HOPT-STORZ', 'Hợp đồng mua bán', '10.06.2025', '10.06.2025', '10.06.2026', 'Còn hiệu lực', '1525000000', 
        'Công ty THIÊN VƯƠNG', '', '', '', 'Võ Thị Trúc Phương', ''],
      ['04/2024/HOPT-STORZ', 'Hợp đồng mua bán', '05.07.2025', '', '', 'Hủy bỏ', '', 
        'Công ty HOA HỒNG ĐEN', 'Trả trước 40%, còn lại chia 2 đợt', '', '', 'Võ Thị Trúc Phương', '']
    ];
    downloadTemplate(columns, sampleData, 'Template_Hop_Dong');
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
        contract_types,
        mode: 'hopdong'
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
      label: "Tổng số hợp đồng",
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
          <UploadOutlined /> Nhập danh sách hợp đồng từ Excel
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
                  <li>Điền thông tin hợp đồng vào file (mỗi dòng là một hợp đồng).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Số hợp đồng, Loại hợp đồng, Ngày ký hợp đồng, Đối tác liên quan, Người tạo.</li>
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

export default HopDong_Import;