import React, { useState, useRef } from 'react';
import { 
  Button, 
  Upload, 
  message, 
  Card, 
  Table, 
  Space, 
  Modal, 
  Spin, 
  Alert,
  Typography,
  Divider,
  Form
} from 'antd';
import { 
  UploadOutlined, 
  FileExcelOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ImportOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ImportProduct = () => {
  const [fileList, setFileList] = useState([]);
  const [importData, setImportData] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [importedCount, setImportedCount] = useState(0);
  const [form] = Form.useForm();
  
  // Reference to download template button
  const downloadTemplateRef = useRef(null);

  // Handle file upload
  const handleUpload = (info) => {
    const { status } = info.file;
    
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
    
    // Update fileList
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1); // Keep only the latest file
    setFileList(fileList);
  };

  // Pre-process file before upload
  const beforeUpload = (file) => {
    const isExcel = 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls');
    
    if (!isExcel) {
      message.error('You can only upload Excel files!');
      return Upload.LIST_IGNORE;
    }

    // Read Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const result = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Process data - assuming first row is header
        const headers = result[0];
        const rows = result.slice(1).filter(row => row.length > 0);
        
        // Map Excel data to the expected API format
        const processedData = rows.map((row, index) => {
          const item = {};
          headers.forEach((header, i) => {
            if (row[i] !== undefined) {
              item[header] = row[i];
            }
          });
          
          // Add defaults and index for display
          item.key = index;
          return item;
        });
        
        setImportData(processedData);
        setPreviewVisible(true);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        message.error('Failed to parse Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);

    // Prevent default upload behavior
    return false;
  };
  
  // Create an Excel template for download
  const generateTemplate = () => {
    // Define template headers based on expected API fields
    const headers = [
      'ma_san_pham', 'ten_san_pham', 'ma_loai_san_pham', 'ma_danh_muc', 
      'mo_ta', 'trang_thai', 'gia_nhap', 'gia_ban'
    ];
    
    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    
    // Add example row
    const exampleRow = [
      'SP001', 'Example Product', 'LSP001', 'DM001', 
      'Description here', 'Hoạt động', '1000000', '1500000'
    ];
    XLSX.utils.sheet_add_aoa(ws, [exampleRow], { origin: 'A2' });
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Submit import data to API
  const handleImport = async () => {
    if (importData.length === 0) {
      message.warning('No data to import!');
      return;
    }
    
    setLoading(true);
    setImportStatus('processing');
    setErrorMessages([]);
    
    try {
      // Send data to API
      const response = await axios.post(
        'https://dx.hoangphucthanh.vn:3000/warehouse/products', 
        { products: importData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setImportStatus('success');
        setImportedCount(response.data.data?.length || importData.length);
        message.success(`Successfully imported ${importData.length} products.`);
      } else {
        setImportStatus('error');
        setErrorMessages([response.data.message || 'Import failed with unknown error']);
        message.error('Failed to import products. Please check the error details.');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setErrorMessages([
        error.response?.data?.message || error.message || 'Network error occurred'
      ]);
      message.error('Failed to import products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Table columns for preview
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'key',
      render: (_, __, index) => index + 1,
      width: 60
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'ma_san_pham',
      key: 'ma_san_pham',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'ten_san_pham',
      key: 'ten_san_pham',
    },
    {
      title: 'Mã loại sản phẩm',
      dataIndex: 'ma_loai_san_pham',
      key: 'ma_loai_san_pham',
    },
    {
      title: 'Mã danh mục',
      dataIndex: 'ma_danh_muc',
      key: 'ma_danh_muc',
    },
    {
      title: 'Giá nhập',
      dataIndex: 'gia_nhap',
      key: 'gia_nhap',
      render: (value) => value ? `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ` : '-',
    },
    {
      title: 'Giá bán',
      dataIndex: 'gia_ban',
      key: 'gia_ban',
      render: (value) => value ? `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
    }
  ];

  // Reset the form and status
  const handleReset = () => {
    setFileList([]);
    setImportData([]);
    setPreviewVisible(false);
    setImportStatus(null);
    setErrorMessages([]);
    form.resetFields();
  };

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<Title level={3}>Nhập danh sách sản phẩm</Title>}
        style={{ maxWidth: 1200, margin: '0 auto', borderRadius: '8px' }}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 20 }}>
            <Text>Tải lên file Excel chứa dữ liệu sản phẩm để nhập vào hệ thống.</Text>
            <div style={{ marginTop: 8 }}>
              <Button 
                type="link" 
                icon={<DownloadOutlined />} 
                onClick={generateTemplate}
                ref={downloadTemplateRef}
              >
                Tải xuống file mẫu
              </Button>
            </div>
          </div>

          {!previewVisible && (
            <Dragger 
              name="file"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleUpload}
              multiple={false}
              showUploadList={{ showRemoveIcon: true }}
              accept=".xlsx,.xls"
            >
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ color: '#52c41a', fontSize: 48 }} />
              </p>
              <p className="ant-upload-text">Kéo thả hoặc nhấp vào để tải lên file Excel</p>
              <p className="ant-upload-hint">
                Chỉ hỗ trợ file Excel (.xlsx, .xls). Đảm bảo dữ liệu đúng định dạng.
              </p>
            </Dragger>
          )}

          {previewVisible && (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Xem trước dữ liệu ({importData.length} sản phẩm)</Text>
                <Space>
                  <Button 
                    type="default" 
                    onClick={() => {
                      setPreviewVisible(false);
                      setFileList([]);
                    }}
                  >
                    Chọn file khác
                  </Button>
                  <Button
                    type="primary"
                    icon={<ImportOutlined />}
                    onClick={handleImport}
                    loading={loading}
                    disabled={importData.length === 0}
                  >
                    Nhập dữ liệu
                  </Button>
                </Space>
              </div>

              <Table
                columns={columns}
                dataSource={importData}
                bordered
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                size="small"
              />
            </div>
          )}

          {importStatus && (
            <div style={{ marginTop: 20 }}>
              <Divider />
              
              {importStatus === 'processing' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text>Đang xử lý dữ liệu, vui lòng đợi...</Text>
                  </div>
                </div>
              )}
              
              {importStatus === 'success' && (
                <Alert
                  message="Nhập dữ liệu thành công"
                  description={`Đã nhập thành công ${importedCount} sản phẩm vào hệ thống.`}
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  action={
                    <Button size="small" type="primary" onClick={handleReset}>
                      Nhập tiếp
                    </Button>
                  }
                />
              )}
              
              {importStatus === 'error' && (
                <Alert
                  message="Nhập dữ liệu thất bại"
                  description={
                    <div>
                      <p>Đã xảy ra lỗi trong quá trình nhập dữ liệu:</p>
                      <ul>
                        {errorMessages.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  }
                  type="error"
                  showIcon
                  icon={<CloseCircleOutlined />}
                  action={
                    <Button size="small" type="primary" onClick={() => setPreviewVisible(true)}>
                      Thử lại
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default ImportProduct;