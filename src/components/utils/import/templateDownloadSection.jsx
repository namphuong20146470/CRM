import React from 'react';
import { Button, Typography } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Render the template download section.
 * @param {Function} handleDownloadTemplate - Function to handle template download.
 * @returns {JSX.Element} - The rendered template download section.
 */
const TemplateDownloadSection = ({ handleDownloadTemplate }) => (
  <div className="template-section">
    <Title level={5}>
      <DownloadIcon /> Mẫu file Excel
    </Title>
    <Text>Tải xuống file mẫu để nhập dữ liệu:</Text>
    <div className="template-download">
      <Button
        icon={<FileExcelOutlined />}
        onClick={handleDownloadTemplate}
        type="primary"
        ghost
      >
        Tải xuống mẫu
      </Button>
    </div>
  </div>
);

// Simple Download icon component
const DownloadIcon = () => (
  <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
    <path d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z" />
  </svg>
);

export default TemplateDownloadSection;