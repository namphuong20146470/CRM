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
  renderMaHopDong,
  renderSoXacNhanDonHang,
  renderTenKhachHang,
  renderNguoiPhuTrach,
  renderHawb
} from './CTDH_ImportRender';
import renderPreview from '../../../utils/import/renderPreview';
import { createItem } from '../../../utils/api/requestHelpers';
import { convertDateFields } from '../../../utils/convert/convertDateFields';
import { renderDateField } from '../../../utils/format/renderDateField';

const { Dragger } = Upload;

const ChiTietDonHang_Import = ({ open, onClose, onSuccess, disabled }) => {
  // State quản lý dữ liệu
  const [existingOrderDetail, setExistingOrderDetail] = useState([]);
  const [products, setProducts] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bills, setBills] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPreviewData(setProducts, setContracts, setOrders, setCustomers, setAccounts, setBills, setExistingOrderDetail);
    resetState();
  }, [open]);

  // Hàm sinh mã chi tiết đơn hàng mới
  const generateMaChiTietDonHang = (() => {
    let base = null;
    return (index = 0) => {
      // Tìm số lớn nhất trong các mã chi tiết đơn hàng hiện có (XKxx)
      if (base === null) {
        let maxNumber = 0;
        existingOrderDetail.forEach(item => {
          if (item.ma_chi_tiet_don_hang) {
            const match = item.ma_chi_tiet_don_hang.match(/^CTDH(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNumber) maxNumber = num;
            }
          }
        });
        base = maxNumber;
      }
      return `CTDH${base + index + 1}`;
    };
  })();

  const dateFields = ['ngay_dat_hang', 'ngay_tam_ung', 'tu_ngay', 'den_ngay', 'hang_bao_ngay_du_kien_lan_1', 'hang_bao_ngay_du_kien_lan_2'];

  // Hàm xử lý sau khi parse file Excel
  const handleAfterParse = (parsedRows) => {
    // Gán mã chi tiết đơn hàng tự động cho từng dòng
    const dataWithMaCTDH = parsedRows.map((row, idx) => ({
      ...row,
      ma_chi_tiet_don_hang: generateMaChiTietDonHang(idx)
    }));

    const dataWithDateFlags = dataWithMaCTDH.map(item => convertDateFields(item, dateFields));

    setParsedData(dataWithDateFlags);
    handleValidateData(dataWithDateFlags);
    setShowPreview(true);
  };

  // Mapping giữa tiêu đề cột Excel và các trường API
  const columnMapping = {
    'Mã hàng': 'ma_hang',
    'Ngày đặt': 'ngay_dat_hang',
    'Số lượng': 'so_luong',
    'Hợp đồng': 'ma_hop_dong',
    'Số xác nhận đơn hàng': 'so_xac_nhan_don_hang',
    'Khách hàng': 'ten_khach_hang',
    'Người phụ trách': 'nguoi_phu_trach',
    'Ngày tạm ứng': 'ngay_tam_ung',
    'Từ ngày': 'tu_ngay',
    'Đến ngày': 'den_ngay',
    'Tình trạng đơn hàng': 'tinh_trang_don_hang',
    'Hãng báo ngày dự kiến lần 1': 'hang_bao_ngay_du_kien_lan_1',
    'Hãng báo ngày dự kiến lần 2': 'hang_bao_ngay_du_kien_lan_2',
    'INV 1': 'invoice_1',
    'PKL 1': 'packing_list_1',
    'Số lượng lô 1': 'so_luong_lo_1',
    'HAWB 1': 'hawb_1',
    'INV 2': 'invoice_2',
    'PKL 2': 'packing_list_2',
    'Số lượng lô 2': 'so_luong_lo_2',
    'HAWB 2': 'hawb_2',
    'INV 3': 'invoice_3',
    'PKL 3': 'packing_list_3',
    'Số lượng lô 3': 'so_luong_lo_3',
    'HAWB 3': 'hawb_3',
    'INV 4': 'invoice_4',
    'PKL 4': 'packing_list_4',
    'Số lượng lô 4': 'so_luong_lo_4',
    'HAWB 4': 'hawb_4',
    'INV 5': 'invoice_5',
    'PKL 5': 'packing_list_5',
    'Số lượng lô 5': 'so_luong_lo_5',
    'HAWB 5': 'hawb_5',
    'Số lượng hàng chưa về': 'so_luong_hang_chua_ve',
    'Ghi chú': 'ghi_chu',
  };

  // Các trường bắt buộc
  const requiredFields = ['ma_hang', 'ngay_dat_hang', 'so_luong', 'ma_hop_dong', 'so_xac_nhan_don_hang',
    'ten_khach_hang', 'nguoi_phu_trach', 'tinh_trang_don_hang',
  ];

  // Hàm xác thực dữ liệu
  const handleValidateData = (data) => {
    return validateData(
      data,
      requiredFields,
      (field) => getFieldLabel(field, columnMapping),
      setErrorItems,
      'ma_chi_tiet_don_hang', // keyField
      'ma_hang',              // nameField
      {},                     // validators (nếu có)
      {},                     // duplicates (nếu có)
      dateFields,             // truyền mảng các trường ngày
      columnMapping           // truyền mapping cột
    );
  };

  // Hàm chuẩn bị dữ liệu để gửi
  const prepareDataForImport = (data) => {
    const soLuongFields = [
      'so_luong_lo_1',
      'so_luong_lo_2',
      'so_luong_lo_3',
      'so_luong_lo_4',
      'so_luong_lo_5',
      'so_luong_hang_chua_ve'
    ];
    return data.map(item => {
      const converted = convertDateFields(item, [
        'ngay_dat_hang', 'ngay_tam_ung', 'tu_ngay', 'den_ngay',
        'hang_bao_ngay_du_kien_lan_1', 'hang_bao_ngay_du_kien_lan_2'
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
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/order-details', item);
      return result?.success;
    } catch (error) {
      console.error('Lỗi khi nhập từng item:', error);
      return false;
    }
  };

  // Hàm nhập toàn bộ dữ liệu
  const importAllItems = async (data) => {
    try {
      const result = await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/order-details', data);
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
        message.success(`Đã nhập ${dataToImport.length} dữ liệu chi tiết đơn hàng thành công!`);
        fetchPreviewData(setProducts, setContracts, setOrders, setCustomers, setAccounts, setBills, setExistingOrderDetail);
        resetState();
        onSuccess?.();
        onClose();
        return;
      }

      throw new Error('Có lỗi xảy ra khi nhập dữ liệu');
    } catch (error) {
      message.error(`Không thể nhập dữ liệu: ${error.message}`);
      message.info('Thử một cách khác - tạo từng dữ liệu chi tiết đơn hàng một...');

      // Thử nhập từng dòng
      let successCount = 0;
      for (const item of prepareDataForImport(parsedData)) {
        const success = await importSingleItem(item);
        if (success) successCount++;
      }

      if (successCount > 0) {
        message.success(`Đã nhập ${successCount}/${parsedData.length} dữ liệu chi tiết đơn hàng thành công!`);
      } else {
        message.error('Không thể nhập được dữ liệu chi tiết đơn hàng nào!');
      }

      // Cập nhật lại danh sách dữ liệu chi tiết đơn hàng hiện có sau khi import từng dòng
      fetchPreviewData(setProducts, setContracts, setOrders, setCustomers, setAccounts, setBills, setExistingOrderDetail);
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
    generateMaChiTietDonHang.base = null;
  };

  // Hàm đóng modal
  const handleClose = () => {
    resetState();
    onClose();
  };

  // Cấu hình cột cho bảng xem trước dữ liệu
  const previewColumns = [
    { title: 'STT', dataIndex: 'key', key: 'key', width: "1%",
      render: (text) => text + 1 
    },
    { 
      title: 'Mã chi tiết đơn hàng', 
      dataIndex: 'ma_chi_tiet_don_hang', 
      key: 'ma_chi_tiet_don_hang', 
      width: "3%",
    },
    {
      title: 'Mã hàng',
      dataIndex: 'ma_hang',
      key: 'ma_hang',
      width: "2%",
      render: (maHang, record) => renderMaHang(maHang, record, products, errorItems)
    },
    { title: 'Ngày đặt', dataIndex: 'ngay_dat_hang', key: 'ngay_dat_hang', width: "3%", 
      render: (value, record) => renderDateField(value, record, errorItems, 'Ngày đặt', 'ngay_dat_hang')
    },
    { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong', width: "2%" },
    {
      title: 'Hợp đồng',
      dataIndex: 'ma_hop_dong',
      key: 'ma_hop_dong',
      width: "3%",
      render: (soHopDong, record) => renderMaHopDong(soHopDong, record, contracts, errorItems)
    },
    {
      title: 'Số xác nhận đơn hàng',
      dataIndex: 'so_xac_nhan_don_hang',
      key: 'so_xac_nhan_don_hang',
      width: "3%",
      render: (soDonHang, record) => renderSoXacNhanDonHang(soDonHang, record, orders, errorItems)
    },
    {
      title: 'Khách hàng',
      dataIndex: 'ten_khach_hang',
      key: 'ten_khach_hang',
      width: "12%",
      render: (maKhachHang, record) => renderTenKhachHang(maKhachHang, record, customers, errorItems)
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'nguoi_phu_trach',
      key: 'nguoi_phu_trach',
      width: "4%",
      render: (maNguoiDung, record) => renderNguoiPhuTrach(maNguoiDung, record, accounts, errorItems)
    },
    { title: 'Ngày tạm ứng', dataIndex: 'ngay_tam_ung', key: 'ngay_tam_ung', width: "3%", 
      render: (value, record) => renderDateField(value, record, errorItems, 'Ngày tạm ứng', 'ngay_tam_ung')
    },
    { title: 'Từ ngày', dataIndex: 'tu_ngay', key: 'tu_ngay', width: "3%", 
      render: (value, record) => renderDateField(value, record, errorItems, 'Từ ngày', 'tu_ngay')
    },
    { title: 'Đến ngày', dataIndex: 'den_ngay', key: 'den_ngay', width: "3%", 
      render: (value, record) => renderDateField(value, record, errorItems, 'Đến ngày', 'den_ngay')
    },
    { title: 'Tình trạng đơn hàng', dataIndex: 'tinh_trang_don_hang', key: 'tinh_trang_don_hang', width: "4%" },
    { title: 'Hãng báo ngày dự kiến lần 1', dataIndex: 'hang_bao_ngay_du_kien_lan_1', key: 'hang_bao_ngay_du_kien_lan_1', width: "3%", 
      render: (value, record) => renderDateField(value, record, errorItems, 'Hãng báo ngày dự kiến lần 1', 'hang_bao_ngay_du_kien_lan_1')
    },
    { title: 'Hãng báo ngày dự kiến lần 2', dataIndex: 'hang_bao_ngay_du_kien_lan_2', key: 'hang_bao_ngay_du_kien_lan_2', width: "3%", 
      render: (value, record) => renderDateField(value, record, errorItems, 'Hãng báo ngày dự kiến lần 2', 'hang_bao_ngay_du_kien_lan_2')
    },
    { title: 'INV 1', dataIndex: 'invoice_1', key: 'invoice_1', width: "2%" },
    { title: 'PKL 1', dataIndex: 'packing_list_1', key: 'packing_list_1', width: "2%"},
    { title: 'Số lượng lô 1', dataIndex: 'so_luong_lo_1', key: 'so_luong_lo_1', width: "2%" },
    { title: 'HAWB 1', dataIndex: 'hawb_1', key: 'hawb_1', width: "2%",
      render: (hawb, record) => renderHawb(hawb, record, bills, errorItems, 'HAWB 1')
    },
    { title: 'INV 2', dataIndex: 'invoice_2', key: 'invoice_2', width: "2%" },
    { title: 'PKL 2', dataIndex: 'packing_list_2', key: 'packing_list_2', width: "2%"},
    { title: 'Số lượng lô 2', dataIndex: 'so_luong_lo_2', key: 'so_luong_lo_2', width: "2%" },
    { title: 'HAWB 2', dataIndex: 'hawb_2', key: 'hawb_2', width: "2%",
      render: (hawb, record) => renderHawb(hawb, record, bills, errorItems, 'HAWB 2')
    },
    { title: 'INV 3', dataIndex: 'invoice_3', key: 'invoice_3', width: "2%" },
    { title: 'PKL 3', dataIndex: 'packing_list_3', key: 'packing_list_3', width: "2%"},
    { title: 'Số lượng lô 3', dataIndex: 'so_luong_lo_3', key: 'so_luong_lo_3', width: "2%" },
    { title: 'HAWB 3', dataIndex: 'hawb_3', key: 'hawb_3', width: "2%",
      render: (hawb, record) => renderHawb(hawb, record, bills, errorItems, 'HAWB 3')
    },
    { title: 'INV 4', dataIndex: 'invoice_4', key: 'invoice_4', width: "2%" },
    { title: 'PKL 4', dataIndex: 'packing_list_4', key: 'packing_list_4', width: "2%"},
    { title: 'Số lượng lô 4', dataIndex: 'so_luong_lo_4', key: 'so_luong_lo_4', width: "2%" },
    { title: 'HAWB 4', dataIndex: 'hawb_4', key: 'hawb_4', width: "2%",
      render: (hawb, record) => renderHawb(hawb, record, bills, errorItems, 'HAWB 4')
    },
    { title: 'INV 5', dataIndex: 'invoice_5', key: 'invoice_5', width: "2%" },
    { title: 'PKL 5', dataIndex: 'packing_list_5', key: 'packing_list_5', width: "2%"},
    { title: 'Số lượng lô 5', dataIndex: 'so_luong_lo_5', key: 'so_luong_lo_5', width: "2%" },
    { title: 'HAWB 5', dataIndex: 'hawb_5', key: 'hawb_5', width: "2%",
      render: (hawb, record) => renderHawb(hawb, record, bills, errorItems, 'HAWB 5')
    },
    { title: 'Số lượng chưa về', dataIndex: 'so_luong_hang_chua_ve', key: 'so_luong_hang_chua_ve', width: "2%", sorter: (a, b) => (Number(a.so_luong_hang_chua_ve) || 0) - (Number(b.so_luong_hang_chua_ve) || 0) },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "8%" },
  ];

  // Hàm tải xuống file mẫu - làm tới đây
  const handleDownloadTemplate = () => {
    const columns = Object.keys(columnMapping);
    const sampleData = [
      ['26176HW', '28.05.2025', 5, '01/2024/HOPT-STORZ', '45637971', 
        'CÔNG TY TNHH THIẾT BỊ VÀ DỊCH VỤ Y TẾ AN KHANG', 'Hứa Tường Huy', 
        '28.05.2025', '28.05.2025', '20.05.2026', 'Đang xử lý', '01.07.2025', '', 
        '93489885', '2805927', 0, 'C017458', '', '', 0, '', '', '', 0, '', 
        '', '', 0, '', '', '', 0, '', 0, 'Ghi chú A'],
      ['34310MD', '28.05.2025', 3, '01/2024/HOPT-STORZ', '45637971', 
        'CÔNG TY TNHH THIẾT BỊ VÀ DỊCH VỤ Y TẾ AN KHANG', 'Hứa Tường Huy', 
        '', '', '', 'Hoàn thành', '01.07.2025', '', 
        '93489885', '2805927', 0, 'C017458', '', '', 0, '', '', '', 0, '', 
        '', '', 0, '', '', '', 0, '', 0, 'Ghi chú B']
    ];
    downloadTemplate(columns, sampleData, 'Template_Chi_Tiet_Don_Hang');
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
        contracts,
        orders,
        customers,
        accounts,
        bills,
        mode: 'chitietdonhang'
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
      label: "Tổng số dữ liệu chi tiết đơn hàng",
      dataSource: parsedData,
      columns: previewColumns,
      errorItems,
      onCancel: resetState,
      onImport: handleImport,
      importLoading,
      hasErrors: errorItems.length > 0,
      scrollX: 3500, // Giá trị cuộn ngang
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
          <UploadOutlined /> Nhập danh sách dữ liệu chi tiết đơn hàng từ Excel
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={showPreview ? 1200 : "60vw"}
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
                  <li>Điền thông tin dữ liệu chi tiết đơn hàng vào file (mỗi dòng là một dữ liệu chi tiết đơn hàng).</li>
                  <li>Tải lên file Excel đã điền thông tin.</li>
                  <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
                  <li>Nhấn "Nhập dữ liệu" để hoàn tất.</li>
                  <li>Các trường bắt buộc: Mã hàng, Ngày đặt, Số lượng, Hợp đồng, Số xác nhận đơn hàng, Khách hàng, Người phụ trách, Tình trạng đơn hàng.</li>
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

export default ChiTietDonHang_Import;