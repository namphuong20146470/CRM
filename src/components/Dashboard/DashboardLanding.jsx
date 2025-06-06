import React from 'react';
import { Card, Row, Col } from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  ToolOutlined,
  DollarOutlined,
  UserOutlined,
  BranchesOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  ControlOutlined,
  LineChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

// Lấy user hiện tại từ localStorage
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('userData'));
  } catch {
    return null;
  }
}

const systemsRow1 = [
  { key: 'warehouse', label: 'Kho Hàng', icon: <AppstoreOutlined style={{ fontSize: 40 }} /> },
  { key: 'crm', label: 'CRM', icon: <TeamOutlined style={{ fontSize: 40 }} /> },
  { key: 'baotri', label: 'Bảo Trì - Bảo Hành', icon: <ToolOutlined style={{ fontSize: 40 }} /> },
  { key: 'congno', label: 'Công Nợ', icon: <DollarOutlined style={{ fontSize: 40 }} /> },
  { key: 'avatar', label: 'Tài khoản', icon: <UserOutlined style={{ fontSize: 40 }} /> },
];

const systemsRow2 = [
  { key: 'quytrinh', label: 'Quy Trình', icon: <BranchesOutlined style={{ fontSize: 40 }} /> },
  { key: 'duan', label: 'Dự Án', icon: <ProjectOutlined style={{ fontSize: 40 }} /> },
  { key: 'iso', label: 'Quản Lý ISO', icon: <SafetyCertificateOutlined style={{ fontSize: 40 }} /> },
  { key: 'dieu_hanh', label: 'Điều Hành', icon: <ControlOutlined style={{ fontSize: 40 }} /> },
  { key: 'phantich', label: 'Phân Tích Dự Báo', icon: <LineChartOutlined style={{ fontSize: 40 }} /> },
];

const systemAdmin = {
  key: 'admin',
  label: 'Quản Trị Hệ Thống',
  icon: <SettingOutlined style={{ fontSize: 40 }} />,
};

export default function DashboardLanding({ onSelectSystem }) {
  const user = getCurrentUser();
  const isSuperAdmin = user && (user.vai_tro === 'VT01' || user.role === 'VT01');

  return (
    <div style={{ padding: 32 }}>
      <Row gutter={[32, 32]} justify="center" style={{ marginBottom: 16 }}>
        {systemsRow1.map(sys => (
          <Col key={sys.key}>
            <Card
              hoverable
              style={{ width: 180, textAlign: 'center', borderRadius: 12 }}
              onClick={() => onSelectSystem(sys.key)}
            >
              {sys.icon}
              <div style={{ marginTop: 16, fontWeight: 600 }}>{sys.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[32, 32]} justify="center" style={{ marginBottom: 16 }}>
        {systemsRow2.map(sys => (
          <Col key={sys.key}>
            <Card
              hoverable
              style={{ width: 180, textAlign: 'center', borderRadius: 12 }}
              onClick={() => onSelectSystem(sys.key)}
            >
              {sys.icon}
              <div style={{ marginTop: 16, fontWeight: 600 }}>{sys.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
      {isSuperAdmin && (
        <Row gutter={[32, 32]} justify="center">
          <Col key={systemAdmin.key}>
            <Card
              hoverable
              style={{ width: 180, textAlign: 'center', borderRadius: 12 }}
              onClick={() => onSelectSystem(systemAdmin.key)}
            >
              {systemAdmin.icon}
              <div style={{ marginTop: 16, fontWeight: 600 }}>{systemAdmin.label}</div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}