import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  Checkbox, 
  Space, 
  Radio, 
  Input, 
  message, 
  Spin, 
  Table,
  Form,
  Typography,
  Popconfirm,
  Tabs,
  Tooltip
} from 'antd';
import { 
  DownloadOutlined, 
  FileExcelOutlined, 
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UndoOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './Export.Supplier.css';

const { Text } = Typography;
const { TabPane } = Tabs;

const EditableCell = ({ 
  editing, 
  dataIndex, 
  title, 
  inputType, 
  record, 
  index, 
  children, 
  ...restProps 
}) => {
  let inputNode = <Input />;
  
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: title === 'Mã Nhà Cung Cấp' || 
                        title === 'Tên nhà cung cấp' || 
                        title === 'Số điện thoại' || 
                        title === 'Email',
              message: `Vui lòng nhập ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

function ExportSupplier({ data, filteredData, onClose, visible }) {
  // State for export options
  const [exportOptions, setExportOptions] = useState({
    dataSource: 'filtered', // 'all' or 'filtered'
    fileFormat: 'xlsx',     // 'xlsx' or 'csv'
    exportFields: [
      'stt', 'ma_nha_cung_cap', 'ten_nha_cung_cap', 'so_dien_thoai', 'email',
      'dia_chi', 'quoc_gia', 'ma_so_thue', 'trang_website', 'trang_thai',
      'ngay_them_vao', 'tong_no_phai_tra', 'ghi_chu'
    ],
    fileName: `danh_sach_nha_cung_cap_${new Date().toISOString().split('T')[0]}`,
    includeHeaderRow: true,
    allowDataEditing: false // New option to enable data editing
  });
  
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [editableData, setEditableData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  
  // Set up editable data when component mounts or data/options change
  useEffect(() => {
    const sourceData = exportOptions.dataSource === 'all' ? data : filteredData;
    setEditableData([...sourceData]);
  }, [data, filteredData, exportOptions.dataSource]);

  // Field mapping for export
  const fieldMappings = {
    stt: 'STT',
    ma_nha_cung_cap: 'Mã Nhà Cung Cấp',
    ten_nha_cung_cap: 'Tên nhà cung cấp',
    so_dien_thoai: 'Số điện thoại',
    email: 'Email',
    dia_chi: 'Địa chỉ', 
    quoc_gia: 'Quốc gia',
    ma_so_thue: 'Mã số thuế',
    trang_website: 'Trang website',
    trang_thai: 'Trạng thái',
    ngay_them_vao: 'Ngày thêm vào',
    tong_no_phai_tra: 'Tổng nợ phải trả',
    ghi_chu: 'Ghi chú'
  };

  // Handle change in export options
  const handleOptionChange = (field, value) => {
    setExportOptions(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If changing data source, reset editable data
    if (field === 'dataSource') {
      const sourceData = value === 'all' ? data : filteredData;
      setEditableData([...sourceData]);
      setEditingKey('');
    }
    
    // If toggling data editing, switch to appropriate tab
    if (field === 'allowDataEditing') {
      setActiveTab(value ? '2' : '1');
    }
  };

  // Toggle field selection for export
  const toggleExportField = (field) => {
    const currentFields = [...exportOptions.exportFields];
    const fieldIndex = currentFields.indexOf(field);
    
    if (fieldIndex > -1) {
      currentFields.splice(fieldIndex, 1);
    } else {
      currentFields.push(field);
    }
    
    setExportOptions(prev => ({
      ...prev,
      exportFields: currentFields
    }));
  };

  // Select all fields for export
  const selectAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      exportFields: Object.keys(fieldMappings)
    }));
  };

  // Clear all selected fields
  const clearAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      exportFields: []
    }));
  };

  // Format date for export
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  };

  // Format currency for export
  const formatCurrency = (value) => {
    if (value === 0) return 'Không nợ';
    if (!value && value !== 0) return '';
    return value.toLocaleString('vi-VN');
  };
  
  // Editable table functions
  const isEditing = (record) => record.stt === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      ma_nha_cung_cap: record.ma_nha_cung_cap || '',
      ten_nha_cung_cap: record.ten_nha_cung_cap || '',
      so_dien_thoai: record.so_dien_thoai || '',
      email: record.email || '',
      dia_chi: record.dia_chi || '',
      quoc_gia: record.quoc_gia || '',
      ma_so_thue: record.ma_so_thue || '',
      trang_website: record.trang_website || '',
      trang_thai: record.trang_thai || '',
      ghi_chu: record.ghi_chu || '',
    });
    setEditingKey(record.stt);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...editableData];
      const index = newData.findIndex(item => key === item.stt);
      
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setEditableData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.error('Validate Failed:', errInfo);
    }
  };
  
  // Reset all edited data
  const resetAllData = () => {
    const sourceData = exportOptions.dataSource === 'all' ? data : filteredData;
    setEditableData([...sourceData]);
    setEditingKey('');
    message.success('Đã khôi phục dữ liệu về ban đầu');
  };

  // Main export function
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Choose data source based on option
      const sourceData = exportOptions.allowDataEditing ? editableData : 
                        (exportOptions.dataSource === 'all' ? data : filteredData);
      
      if (sourceData.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        setExporting(false);
        return;
      }

      // Map data for export with selected fields only
      const exportData = sourceData.map(item => {
        const mapped = {};
        
        exportOptions.exportFields.forEach(field => {
          let value = item[field];
          
          // Apply formatting based on field type
          if (field === 'ngay_them_vao') {
            value = formatDate(value);
          } else if (field === 'tong_no_phai_tra') {
            value = formatCurrency(value);
          }
          
          mapped[fieldMappings[field] || field] = value;
        });
        
        return mapped;
      });

      // Create and configure workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData, { 
        header: exportOptions.includeHeaderRow ? 
          exportOptions.exportFields.map(field => fieldMappings[field] || field) : 
          undefined
      });
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Nhà cung cấp');
      
      // Set column widths - auto size columns
      const colWidths = [];
      for (let i = 0; i < exportOptions.exportFields.length; i++) {
        colWidths.push({ wch: 20 }); // default width
      }
      ws['!cols'] = colWidths;

      // Generate filename with extension
      const fileName = `${exportOptions.fileName}.${exportOptions.fileFormat}`;
      
      // Write file and trigger download
      XLSX.writeFile(wb, fileName);
      
      message.success('Xuất file thành công!');
      onClose(); // Close modal after successful export
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('Lỗi khi xuất file: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Create columns for editable table
  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      width: '4%',
      editable: false,
    },
    {
      title: 'Mã Nhà Cung Cấp',
      dataIndex: 'ma_nha_cung_cap',
      width: '10%',
      editable: true,
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'ten_nha_cung_cap',
      width: '15%',
      editable: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'so_dien_thoai',
      width: '10%',
      editable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '12%',
      editable: true,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'dia_chi',
      width: '15%',
      editable: true,
    },
    {
      title: 'Quốc gia',
      dataIndex: 'quoc_gia',
      width: '8%',
      editable: true,
    },
    {
      title: 'Hành động',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              onClick={() => save(record.stt)}
              type="primary"
              size="small"
              icon={<SaveOutlined />}
            >
              Lưu
            </Button>
            <Popconfirm title="Bạn có chắc muốn hủy?" onConfirm={cancel}>
              <Button size="small" icon={<CloseOutlined />}>Hủy</Button>
            </Popconfirm>
          </Space>
        ) : (
          <Button 
            disabled={editingKey !== ''} 
            onClick={() => edit(record)}
            type="primary"
            size="small"
            icon={<EditOutlined />}
          >
            Sửa
          </Button>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // Render export options tab
  const renderOptionsTab = () => (
    <div className="export-options-container">
      <div className="export-section">
        <h3>Nguồn dữ liệu</h3>
        <Radio.Group 
          value={exportOptions.dataSource}
          onChange={e => handleOptionChange('dataSource', e.target.value)}
        >
          <Radio value="all">Tất cả dữ liệu ({data.length} bản ghi)</Radio>
          <Radio value="filtered">Dữ liệu đã lọc ({filteredData.length} bản ghi)</Radio>
        </Radio.Group>
      </div>

      <div className="export-section">
        <h3>Tùy chọn nâng cao</h3>
        <Checkbox
          checked={exportOptions.allowDataEditing}
          onChange={e => handleOptionChange('allowDataEditing', e.target.checked)}
        >
          Chỉnh sửa dữ liệu trước khi xuất
        </Checkbox>
        <Text type="secondary" style={{ display: 'block', marginLeft: 24 }}>
          (Chỉnh sửa chỉ ảnh hưởng đến file xuất ra, không thay đổi dữ liệu gốc trong hệ thống)
        </Text>
      </div>

      <div className="export-section">
        <h3>Định dạng file</h3>
        <Radio.Group 
          value={exportOptions.fileFormat}
          onChange={e => handleOptionChange('fileFormat', e.target.value)}
        >
          <Radio value="xlsx">Excel (.xlsx)</Radio>
          <Radio value="csv">CSV (.csv)</Radio>
        </Radio.Group>
      </div>

      <div className="export-section">
        <h3>Tên file</h3>
        <Input 
          value={exportOptions.fileName}
          onChange={e => handleOptionChange('fileName', e.target.value)}
          addonAfter={`.${exportOptions.fileFormat}`}
        />
      </div>

      <div className="export-section">
        <div className="export-field-header">
          <h3>Chọn các trường để xuất</h3>
          <Space>
            <Button size="small" onClick={selectAllFields}>Chọn tất cả</Button>
            <Button size="small" onClick={clearAllFields}>Bỏ chọn tất cả</Button>
          </Space>
        </div>
        <div className="export-fields-container">
          {Object.entries(fieldMappings).map(([field, label]) => (
            <Checkbox 
              key={field}
              checked={exportOptions.exportFields.includes(field)}
              onChange={() => toggleExportField(field)}
            >
              {label}
            </Checkbox>
          ))}
        </div>
      </div>

      <div className="export-section">
        <Checkbox 
          checked={exportOptions.includeHeaderRow}
          onChange={e => handleOptionChange('includeHeaderRow', e.target.checked)}
        >
          Bao gồm hàng tiêu đề
        </Checkbox>
      </div>

      <div className="export-summary">
        <p>
          Bạn sẽ xuất <strong>{exportOptions.exportFields.length}</strong> trường từ <strong>
          {exportOptions.dataSource === 'all' ? data.length : filteredData.length}</strong> bản ghi 
          sang file <strong>{exportOptions.fileName}.{exportOptions.fileFormat}</strong>
        </p>
      </div>
    </div>
  );

  // Render edit data tab
  const renderEditDataTab = () => (
    <div className="edit-data-container">
      <div className="edit-data-header">
        <Text type="secondary">
          Chỉnh sửa dữ liệu trước khi xuất. Các thay đổi sẽ chỉ ảnh hưởng đến dữ liệu xuất ra, không thay đổi dữ liệu gốc.
        </Text>
        <Tooltip title="Khôi phục dữ liệu về ban đầu">
          <Button 
            icon={<UndoOutlined />} 
            onClick={resetAllData}
            disabled={editingKey !== ''}
          >
            Khôi phục
          </Button>
        </Tooltip>
      </div>
      
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={editableData}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
            pageSize: 10,
          }}
          rowKey="stt"
          size="small"
          scroll={{ x: 'max-content', y: 400 }}
        />
      </Form>
    </div>
  );

  return (
    <Modal
      title={
        <div className="export-modal-title">
          <FileExcelOutlined /> Xuất dữ liệu nhà cung cấp
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={exportOptions.allowDataEditing ? 1000 : 700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button 
          key="export" 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={handleExport}
          loading={exporting}
          disabled={exportOptions.exportFields.length === 0 || editingKey !== ''}
        >
          Xuất File
        </Button>
      ]}
    >
      {exporting ? (
        <div className="export-loading">
          <Spin tip="Đang xuất dữ liệu..." />
        </div>
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tùy chọn xuất" key="1">
            {renderOptionsTab()}
          </TabPane>
          {exportOptions.allowDataEditing && (
            <TabPane tab="Chỉnh sửa dữ liệu" key="2">
              {renderEditDataTab()}
            </TabPane>
          )}
        </Tabs>
      )}
    </Modal>
  );
}

export default ExportSupplier;