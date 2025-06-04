import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Table, Modal, Alert, Divider, Spin } from 'antd';
import { FileExcelOutlined, UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx-js-style';
import { fetchDataList, updateItemById } from '../../../utils/api/requestHelpers';
import { downloadTemplate } from '../../../utils/import/templateHelpers';

const { Dragger } = Upload;

const TonKho_Import = ({ open, onClose, onSuccess, disabled }) => {
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [templateData, setTemplateData] = useState([]);

  // Lấy danh sách mã hàng tồn kho (không trùng lặp)
  useEffect(() => {
    if (open) {
      fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/inventory')
        .then(data => {
          // Lấy mã hàng duy nhất và tồn kho tối thiểu hiện có (ưu tiên năm mới nhất nếu có nhiều bản ghi)
          const maHangMap = {};
          data.forEach(item => {
            if (!maHangMap[item.ma_hang] || new Date(item.nam) > new Date(maHangMap[item.ma_hang].nam || 0)) {
              maHangMap[item.ma_hang] = item;
            }
          });
          setTemplateData(
            Object.values(maHangMap).map(item => ({
              'Mã hàng': item.ma_hang,
              'Tồn kho tối thiểu': item.muc_ton_toi_thieu ?? ''
            }))
          );
        });
      resetState();
    }
    // eslint-disable-next-line
  }, [open]);

  // Tạo file template Excel
  const handleDownloadTemplate = () => {
    if (!templateData.length) {
      message.warning('Không có dữ liệu để tạo template!');
      return;
    }
    const columns = ['Mã hàng', 'Tồn kho tối thiểu'];
    const sampleData = templateData.map(row => [row['Mã hàng'], row['Tồn kho tối thiểu']]);
    // Tìm các dòng cần highlight (index trong sampleData)
    const highlightRows = sampleData
      .map((row, idx) => (!row[1] || Number(row[1]) === 0 ? idx : -1))
      .filter(idx => idx !== -1);
    downloadTemplate(columns, sampleData, 'Template_TonKhoToiThieu', highlightRows);
  };

  // Xử lý file Excel sau khi upload
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        setParsedData(rows);
        validateData(rows);
        setShowPreview(true);
      } catch (err) {
        message.error('Không thể đọc file Excel!');
      }
    };
    reader.readAsBinaryString(file);
    return false; // Ngăn antd upload mặc định
  };

  // Validate dữ liệu
  const validateData = (rows) => {
    const errors = [];
    rows.forEach((row, idx) => {
      const errs = [];
      if (!row['Mã hàng'] || row['Mã hàng'].toString().trim() === '') {
        errs.push('Thiếu mã hàng');
      }
      if (row['Tồn kho tối thiểu'] !== '' && isNaN(Number(row['Tồn kho tối thiểu']))) {
        errs.push('Tồn kho tối thiểu phải là số');
      }
      if (errs.length > 0) errors.push({ index: idx, errors: errs });
    });
    setErrorItems(errors);
    return errors;
  };

  // Xử lý import
  const handleImport = async () => {
    if (errorItems.length > 0) {
      message.error('Vui lòng sửa lỗi trước khi nhập dữ liệu!');
      return;
    }
    if (!parsedData.length) {
      message.warning('Không có dữ liệu để nhập!');
      return;
    }
    setImportLoading(true);
    try {
      // Lấy toàn bộ inventory để update
      const allInventory = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/inventory');
      let updateCount = 0;
      for (const row of parsedData) {
        const ma_hang = row['Mã hàng'];
        const minValue = row['Tồn kho tối thiểu'] === '' ? null : Number(row['Tồn kho tối thiểu']);
        // Tìm tất cả inventory của mã hàng này
        const itemsToUpdate = allInventory.filter(item => item.ma_hang === ma_hang);
        for (const item of itemsToUpdate) {
          await updateItemById(
            `https://dx.hoangphucthanh.vn:3000/warehouse/inventory/${item.ma_inventory}`,
            { muc_ton_toi_thieu: minValue }
          );
          updateCount++;
        }
      }
      message.success(`Đã cập nhật tồn kho tối thiểu cho ${updateCount} bản ghi!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      message.error('Có lỗi khi cập nhật tồn kho tối thiểu!');
    } finally {
      setImportLoading(false);
    }
  };

  // Reset state khi đóng modal
  const resetState = () => {
    setFileList([]);
    setParsedData([]);
    setErrorItems([]);
    setShowPreview(false);
  };

  // Giao diện xem trước
  const renderPreview = () => (
    <div>
      <Alert
        message="Kiểm tra dữ liệu trước khi nhập"
        type={errorItems.length > 0 ? "error" : "info"}
        showIcon
        description={
          errorItems.length > 0
            ? errorItems.map(e => `Dòng ${e.index + 2}: ${e.errors.join(', ')}`).join('\n')
            : "Không có lỗi, bạn có thể nhập dữ liệu."
        }
      />
      <Divider />
      <Table
        dataSource={parsedData.map((row, idx) => ({ ...row, key: idx }))}
        columns={[
          { title: 'Mã hàng', dataIndex: 'Mã hàng', key: 'ma_hang',
            render: (val) => {
              const isRed = !val || Number(val) === 0;
              return <span style={isRed ? { color: '#d4380d', background: '#fff1f0' } : {}}>{val}</span>;
            }
          },
          { title: 'Tồn kho tối thiểu', dataIndex: 'Tồn kho tối thiểu', key: 'min',
            render: (val) => {
              const isRed = !val || Number(val) === 0;
              return isRed
                ? <span style={{ color: '#d4380d', background: '#fff1f0' }}>{val === '' ? <i style={{ color: '#aaa' }}>Trống</i> : val}</span>
                : val;
            }
          }
        ]}
        pagination={false}
        size="small"
        bordered
        style={{ marginBottom: 16, maxHeight: '35vh', overflowY: 'auto' }}
        className="preview-table"
      />
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={handleImport}
        loading={importLoading}
        disabled={importLoading || errorItems.length > 0 || disabled}
        block
      >
        Nhập dữ liệu
      </Button>
    </div>
  );

  // Giao diện hướng dẫn và upload file
  const renderGuideAndUploader = () => (
    <>
      <Alert
        message="Hướng dẫn nhập dữ liệu"
        description={
          <ol>
            <li>Tải xuống file Excel để lấy form sửa đổi tồn kho tối thiểu.</li>
            <li>Sửa các giá trị Tồn kho TT cho từng mã hàng.</li>
            <li>Tải lên file Excel đã sửa Tồn kho TT.</li>
            <li>Kiểm tra dữ liệu xem trước và sửa các lỗi nếu có.</li>
            <li>Nhấn "Sửa dữ liệu" để hoàn tất.</li>
          </ol>
        }
        type="info"
        showIcon
      />
      <div style={{ margin: '16px 0' }}>
        <Button
          icon={<FileExcelOutlined />}
          onClick={handleDownloadTemplate}
          disabled={importLoading}
          block
        >
          Tải file excel lấy dữ liệu tồn kho tối thiểu
        </Button>
      </div>
      <Dragger
        name="file"
        multiple={false}
        fileList={fileList}
        beforeUpload={handleFileUpload}
        onRemove={() => resetState()}
        accept=".xlsx,.xls"
        disabled={importLoading}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">Kéo thả file hoặc Click để chọn file Excel</p>
        <p className="ant-upload-hint">
          Chỉ hỗ trợ file Excel (.xlsx, .xls)
        </p>
      </Dragger>
    </>
  );

  return (
    <Modal
      open={open}
      onCancel={() => { resetState(); onClose(); }}
      footer={null}
      width={600}
      title="Import tồn kho tối thiểu theo mã hàng"
      destroyOnClose
    >
      <Spin spinning={importLoading}>
        <div className="import-container">
          {!showPreview ? (
            renderGuideAndUploader()
          ) : (
            renderPreview()
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default TonKho_Import;