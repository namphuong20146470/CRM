import React from 'react';
import { Button, Checkbox, Input, Radio, Space } from 'antd';
import { toggleExportField, selectAllFields, clearAllFields } from './exportHandlers';
import '../css/Custom-Export.css';

function ExportOptionsTab({ 
  exportOptions, 
  setExportOptions, 
  data, 
  filteredData, 
  sortedData,
  fieldMappings 
}) {
  return (
    <div className="export-options-container">
      <div className="export-section">
        <h3>Nguồn dữ liệu</h3>
        <Radio.Group
          value={exportOptions.dataSource}
          onChange={e => setExportOptions({ ...exportOptions, dataSource: e.target.value })}
        >
          <Radio value="all">Tất cả ({data.length} bản ghi)</Radio>
          <Radio value="filtered">Đã lọc ({filteredData.length} bản ghi)</Radio>
          <Radio value="sorted">Đã lọc và Sắp xếp ({sortedData.length} bản ghi)</Radio>
        </Radio.Group>
      </div>

      <div className="export-section">
        <h3>Định dạng file</h3>
        <Radio.Group
          value={exportOptions.fileFormat}
          onChange={e => setExportOptions({ ...exportOptions, fileFormat: e.target.value })}
        >
          <Radio value="xlsx">Excel (.xlsx)</Radio>
          <Radio value="csv">CSV (.csv)</Radio>
        </Radio.Group>
      </div>

      <div className="export-section">
        <h3>Tên file</h3>
        <Input
          value={exportOptions.fileName}
          onChange={e => setExportOptions({ ...exportOptions, fileName: e.target.value })}
          addonAfter={`.${exportOptions.fileFormat}`}
        />
      </div>

      <div className="export-section">
        <div className="export-field-header">
          <h3>Chọn các trường để xuất</h3>
          <Space>
            <Button size="small" onClick={() => selectAllFields(Object.keys(fieldMappings), setExportOptions)}>Chọn tất cả</Button>
            <Button size="small" onClick={() => clearAllFields(setExportOptions)}>Bỏ chọn tất cả</Button>
          </Space>
        </div>
        <div className="export-fields-container">
          {Object.entries(fieldMappings).map(([field, label]) => (
            <Checkbox
              key={field}
              checked={exportOptions.exportFields.includes(field)}
              onChange={() => toggleExportField(field, exportOptions.exportFields, setExportOptions)}
            >
              {label}
            </Checkbox>
          ))}
        </div>
      </div>

      <div className="export-section">
        <Checkbox
          checked={exportOptions.includeHeaderRow}
          onChange={e => setExportOptions({ ...exportOptions, includeHeaderRow: e.target.checked })}
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
}

export default ExportOptionsTab;
