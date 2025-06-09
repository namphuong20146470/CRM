import React from 'react';
import { Card, Typography, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useLoginHistory } from './hooks/useLoginHistory';
import LoginHistoryTable from './components/LoginHistoryTable';
import LoginHistoryFilters from './components/LoginHistoryFilters';
import { exportLoginHistoryToCSV } from './utils/csvExport';

const { Title } = Typography;

/**
 * Component chính quản lý lịch sử đăng nhập của người dùng
 */
const Administration = () => {
  const {
    filteredData,
    loading,
    searchText,
    setSearchText,
    dateRange,
    setDateRange,
    userFilter,
    setUserFilter,
    userList,
    errorMessage,
    fetchLoginData,
    handleReset
  } = useLoginHistory();

  // Xử lý xuất CSV
  const handleExportCSV = () => {
    try {
      const result = exportLoginHistoryToCSV(filteredData);
      message.success(result);
    } catch (error) {
      message.error('Lỗi khi xuất file CSV: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 120px)', overflow: 'auto' }}>
      <Card style={{ height: '100%' }}>
        <Title level={3}>Quản trị hệ thống - Lịch sử đăng nhập</Title>
        
        {errorMessage && (
          <div style={{ marginBottom: 16, color: 'red' }}>
            <InfoCircleOutlined /> {errorMessage}
          </div>
        )}
        
        <LoginHistoryFilters
          searchText={searchText}
          setSearchText={setSearchText}
          dateRange={dateRange}
          setDateRange={setDateRange}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          userList={userList}
          onReset={handleReset}
          onRefresh={fetchLoginData}
          onExport={handleExportCSV}
          loading={loading}
          canExport={filteredData.length > 0}
        />
        
        <LoginHistoryTable 
          data={filteredData} 
          loading={loading} 
        />
      </Card>
    </div>
  );
};

export default Administration;