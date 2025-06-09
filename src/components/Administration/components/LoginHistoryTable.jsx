import React, { useMemo } from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';

/**
 * Component hiển thị bảng lịch sử đăng nhập
 */
const LoginHistoryTable = ({ data, loading }) => {
  // Định nghĩa các cột của bảng
  const columns = useMemo(() => [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text) => <span><UserOutlined /> {text}</span>
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => {
        let color = 'blue';
        let label = 'Nhân viên';
        
        if (role === 'VT01') {
          color = 'red';
          label = 'Admin';
        } else if (role === 'VT02') {
          color = 'green';
          label = 'Quản lý';
        }
        
        return <Tag color={color}>{label}</Tag>;
      }
    },
// Sửa phần render thời gian
{
  title: 'Thời gian đăng nhập',
  dataIndex: 'loginTime',
  key: 'loginTime',
  width: 180,
  render: (text) => (
    text ? 
    <Tooltip title="Giờ Việt Nam (UTC+7)">
      <span>
        <ClockCircleOutlined /> {moment(text).utcOffset('+07:00').format('DD/MM/YYYY HH:mm:ss')}
      </span>
    </Tooltip> : 
    <Tag color="red">Không xác định</Tag>
  ),
},
    {
      title: 'Thời gian đăng xuất',
      dataIndex: 'logoutTime',
      key: 'logoutTime',
      width: 180,
      render: (text, record) => (
        text ? 
        <Tooltip title={`Giờ Việt Nam (UTC+7)`}>
          <span>
            <ClockCircleOutlined /> {moment(text).utcOffset('+07:00').format('DD/MM/YYYY HH:mm:ss')}
          </span>
        </Tooltip> : 
        record.abnormal ? 
        <Tag color="red">Bất thường</Tag> : 
        <Tag color="orange">Đang hoạt động</Tag>
      ),
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device',
      key: 'device',
      width: 120,
    },
    {
      title: 'Trình duyệt',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
    },
  ], []);

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      scroll={{ x: 1300, y: 'calc(100vh - 350px)' }}
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `Tổng ${total} bản ghi`,
        showQuickJumper: true
      }}
      loading={loading}
      locale={{
        emptyText: 'Không có dữ liệu',
        filterConfirm: 'Đồng ý',
        filterReset: 'Đặt lại',
        selectAll: 'Chọn tất cả dữ liệu trang này',
        selectInvert: 'Đảo ngược lựa chọn trang này'
      }}
    />
  );
};

export default LoginHistoryTable;