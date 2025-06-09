import React, { useEffect } from 'react';
import { Row, Col, Input, DatePicker, Select, Button, Space, ConfigProvider } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Component hiển thị bộ lọc dữ liệu lịch sử đăng nhập
 */
const LoginHistoryFilters = ({
  searchText,
  setSearchText,
  dateRange,
  setDateRange,
  userFilter,
  setUserFilter,
  userList,
  onReset,
  onRefresh,
  onExport,
  loading,
  canExport
}) => {
  // Thêm CSS trực tiếp vào head để ghi đè
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .force-dark-text input, 
      .force-dark-text .ant-select-selection-item,
      .force-dark-text .ant-picker-input input {
        color: #000000 !important;
      }
      .force-dark-text .ant-select-item-option-content {
        color: #000000 !important;
      }
      .force-dark-text .ant-select-item-option-active,
      .force-dark-text .ant-select-item-option-selected {
        color: #000000 !important;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorText: '#000000',
            colorTextPlaceholder: '#999999',
          },
          DatePicker: {
            colorText: '#000000',
            colorTextPlaceholder: '#999999',
          },
          Select: {
            colorText: '#000000',
            colorTextPlaceholder: '#999999',
            optionSelectedColor: '#000000',
          },
        },
        token: {
          colorText: '#000000',
          colorTextBase: '#000000',
        }
      }}
    >
      <div className="force-dark-text">
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên người dùng, họ tên, IP..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              style={{ 
                backgroundColor: "#ffffff" 
              }}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ 
                width: '100%',
                backgroundColor: "#ffffff"
              }}
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              style={{ 
                width: '100%',
                backgroundColor: "#ffffff"
              }}
              placeholder="Lọc theo người dùng"
              allowClear
              value={userFilter}
              onChange={setUserFilter}
              dropdownStyle={{ backgroundColor: "#ffffff" }}
            >
              {userList.map(user => (
                <Option key={user.username} value={user.username}>{user.displayName}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={onRefresh}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={onReset}
              >
                Xóa bộ lọc
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={onExport}
                disabled={!canExport}
              >
                Xuất CSV
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default LoginHistoryFilters;