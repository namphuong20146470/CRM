import React from 'react';
import { Table, Typography, Alert } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import PreviewActions from './PreviewActions';

const { Title } = Typography;

/**
 * Render the error list.
 * @param {Object} props - Props for the component.
 * @param {Array} errorItems - List of error items.
 * @param {Function} getErrorTitle - Function to get the title of an error item.
 * @param {Function} getErrorDescription - Function to get the description of an error item.
 * @returns {JSX.Element|null} - The rendered error list or null if no errors.
 */
const renderErrorList = ({ errorItems, getErrorTitle, getErrorDescription }) => {
  if (errorItems.length === 0) return null;

  return (
    <div className="error-list">
      <Alert
        message={`Có ${errorItems.length} dòng dữ liệu có lỗi`}
        description={
          <ul className="error-items">
            {errorItems.map((item, index) => (
              <li key={index}>
                <strong>{getErrorTitle(item)}</strong> - {getErrorDescription(item)}
              </li>
            ))}
          </ul>
        }
        type="error"
        showIcon
      />
    </div>
  );
};

/**
 * Render a preview section with a table and actions.
 * @param {Object} props - Props for the component.
 * @param {string} label - Label for the total count (e.g., "Tổng số nhà cung cấp").
 * @param {Array} dataSource - Data source for the table.
 * @param {Array} columns - Columns configuration for the table.
 * @param {Array} errorItems - List of error items for row highlighting.
 * @param {Function} onCancel - Function to handle cancel action.
 * @param {Function} onImport - Function to handle import action.
 * @param {boolean} importLoading - Whether the import is loading.
 * @param {boolean} hasErrors - Whether there are errors in the data.
 * @param {number} scrollX - Horizontal scroll size for the table.
 * @param {number} pageSize - Number of items per page for pagination.
 * @param {Function} getErrorTitle - Function to get the title of an error item.
 * @param {Function} getErrorDescription - Function to get the description of an error item.
 * @returns {JSX.Element} - The rendered preview section.
 */
const renderPreview = ({
  label,
  dataSource,
  columns,
  errorItems,
  onCancel,
  onImport,
  importLoading,
  hasErrors,
  scrollX = 1440, // Default value for scrollX
  pageSize = 5, // Default value for pageSize
  getErrorTitle,
  getErrorDescription
}) => {
  if (!dataSource || dataSource.length === 0) return null;

  return (
    <div className="preview-section">
      <Title level={4} className="preview-title">
        <CheckCircleOutlined style={{ color: '#52c41a' }} /> Xem trước dữ liệu
      </Title>

      {/* Render error list */}
      {renderErrorList({ errorItems, getErrorTitle, getErrorDescription })}

      {/* Render table */}
      <Table
        dataSource={dataSource}
        columns={columns}
        size="small"
        pagination={{ pageSize: pageSize }}
        scroll={{ x: scrollX }} // Use dynamic scrollX
        className="preview-table"
        rowClassName={(record) => {
          const hasError = errorItems.some(item => item.index === record.key);
          return hasError ? 'error-row' : '';
        }}
      />

      {/* Render actions */}
      <PreviewActions
        label={label}
        totalCount={dataSource.length}
        onCancel={onCancel}
        onImport={onImport}
        importLoading={importLoading}
        hasErrors={hasErrors}
      />
    </div>
  );
};

export default renderPreview;