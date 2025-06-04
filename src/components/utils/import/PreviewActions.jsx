import React from 'react';
import { Button, Space, Typography } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import '../css/Custom-Import.css';

/**
 * Render preview actions.
 * @param {Object} props - Props for the component.
 * @param {string} label - Label to display before the total count.
 * @param {number} totalCount - Total count of items (e.g., suppliers, customers, etc.).
 * @param {Function} onCancel - Function to handle cancel action.
 * @param {Function} onImport - Function to handle import action.
 * @param {boolean} importLoading - Whether the import is loading.
 * @param {boolean} hasErrors - Whether there are errors in the data.
 * @returns {JSX.Element} - The rendered preview actions.
 */
const PreviewActions = ({ label, totalCount, onCancel, onImport, importLoading, hasErrors }) => (
  <div className="preview-actions">
    <Space>
      <Typography.Text>{label}: {totalCount}</Typography.Text>
      <Button 
        type="default" 
        onClick={onCancel}
        icon={<DeleteOutlined />}
        danger
      >
        Hủy
      </Button>
      <Button 
        type="primary" 
        onClick={onImport}
        disabled={hasErrors}
        loading={importLoading}
        icon={<UploadOutlined />}
      >
        {importLoading ? 'Đang nhập dữ liệu...' : 'Nhập dữ liệu'}
      </Button>
    </Space>
  </div>
);

export default PreviewActions;