import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { Layout, Menu, Breadcrumb, Avatar, message } from 'antd';
import {
  AppstoreOutlined,
  InboxOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  ShopOutlined,
  DownloadOutlined,
  UploadOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  UserAddOutlined,
  DollarOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import {
  // Existing imports...
  SettingOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import './layout.css';

const showComingSoon = () => {
  message.info("🎉 Tính năng này đang được phát triển nha! Bạn quay lại sau nhé 😉");
};

const { Header, Content, Footer } = Layout;
const { SubMenu } = Menu;

function LayoutApp(props) {
  const { children, menuType } = props;
  const navigation = useNavigate();
  const [current, setCurrent] = useState('mail');

  const handleClick = (event) => {
    setCurrent(event.key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigation('/');
  };

  // Menu động theo menuType (phân hệ)
  let menuItems = [];
  if (menuType === "warehouse") {
    menuItems = [
      <Menu.Item key="dashboard" icon={<AppstoreOutlined />}>
        <NavLink to="/home">Trang chủ</NavLink>
      </Menu.Item>,
      <Menu.Item key="warehouse" icon={<InboxOutlined />} onClick={showComingSoon}>
        Kho hàng
      </Menu.Item>,
      <SubMenu
        key="suppliers"
        icon={<SolutionOutlined />}
        title="Nhà Cung Cấp"
        onTitleClick={() => navigation('/system/warehouse/suppliers')}
      >
        <Menu.Item key="/suppliers"><NavLink to="/system/warehouse/suppliers">Danh sách nhà cung cấp</NavLink></Menu.Item>
        <Menu.Item key="/new_supplier" onClick={showComingSoon}>Nhà cung cấp mới</Menu.Item>
      </SubMenu>,
      <SubMenu
        key="products"
        icon={<ShopOutlined />}
        title="Hàng Hóa"
        onTitleClick={() => navigation('/system/warehouse/products')}
      >
        <Menu.Item key="/product_types"><NavLink to="/system/warehouse/product_type">Loại hàng</NavLink></Menu.Item>
        <Menu.Item key="/products"><NavLink to="/system/warehouse/products">Danh mục hàng hóa</NavLink></Menu.Item>
        <Menu.Item key="/product_images" onClick={showComingSoon}>Ảnh hàng hóa</Menu.Item>
      </SubMenu>,
      <SubMenu
        key="stock_in"
        icon={<DownloadOutlined />}
        title="Nhập Kho"
        onTitleClick={() => navigation('/system/warehouse/stock_in')}
      >
        <Menu.Item key="/stock_in"><NavLink to="/system/warehouse/stock_in">Nhập hàng</NavLink></Menu.Item>
        <Menu.Item key="/stock_in_with_month"><NavLink to="/system/warehouse/stock_in_with_month">Thống kê hàng nhập theo tháng</NavLink></Menu.Item>
      </SubMenu>,
      <SubMenu
        key="stock_out"
        icon={<UploadOutlined />}
        title="Xuất Kho"
        onTitleClick={() => navigation('/system/warehouse/stock_out')}
      >
        <Menu.Item key="/stock_out"><NavLink to="/system/warehouse/stock_out">Xuất hàng</NavLink></Menu.Item>
        <Menu.Item key="/stock_out_with_month"><NavLink to="/system/warehouse/stock_out_with_month">Thống kê hàng xuất theo tháng</NavLink></Menu.Item>
        <Menu.Item key="/stock_out_with_customer"><NavLink to="/system/warehouse/stock_out_with_customer">Thống kê hàng xuất theo khách hàng</NavLink></Menu.Item>
      </SubMenu>,
      <SubMenu
        key="inventory"
        icon={<DatabaseOutlined />}
        title="Tồn Kho"
        onTitleClick={() => navigation('/system/warehouse/inventory')}
      >
        <Menu.Item key="/inventory_check" onClick={showComingSoon}>Kiểm kê kho</Menu.Item>
        <Menu.Item key="/inventory"><NavLink to="/system/warehouse/inventory">Tồn kho</NavLink></Menu.Item>
        <Menu.Item key="/inventory_with_month"><NavLink to="/system/warehouse/inventory_with_month">Thống kê hàng nhập và xuất theo tháng</NavLink></Menu.Item>
      </SubMenu>,
      <SubMenu
        key="order"
        icon={<ShoppingCartOutlined />}
        title="Đặt Hàng"
        onTitleClick={() => navigation('/system/warehouse/order_detail')}
      >
        <Menu.Item key="/order"><NavLink to="/system/warehouse/order">Đơn hàng</NavLink></Menu.Item>
        <Menu.Item key="/order_detail"><NavLink to="/system/warehouse/order_detail">Chi tiết đơn hàng</NavLink></Menu.Item>
        <Menu.Item key="/order_detail_with_month"><NavLink to="/system/warehouse/order_detail_with_month">Thống kê hàng đặt theo tháng</NavLink></Menu.Item>
        <Menu.Item key="/order_detail_with_customer"><NavLink to="/system/warehouse/order_detail_with_customer">Thống kê hàng đặt theo khách hàng</NavLink></Menu.Item>
      </SubMenu>,
      <Menu.Item key="/report_warehouse" icon={<BarChartOutlined />} onClick={showComingSoon}>
        Báo cáo Kho Hàng
      </Menu.Item>,
      <SubMenu
        key="user"
        icon={
          <IconButton aria-label="user">
            <Avatar size="large" icon={<UserOutlined />} />
          </IconButton>
        }
      >
        <Menu.Item key="logout" onClick={handleLogout}>Log out</Menu.Item>
      </SubMenu>
    ];
  }  else if (menuType === "admin") {
    menuItems = [
      <Menu.Item key="dashboard" icon={<AppstoreOutlined />}>
        <NavLink to="/home">Trang chủ</NavLink>
      </Menu.Item>,
      <Menu.Item key="/admin/login-history" icon={<TeamOutlined />}>
        <NavLink to="/system/admin/login-history">Lịch sử đăng nhập</NavLink>
      </Menu.Item>,
      <SubMenu
        key="system_settings"
        icon={<SettingOutlined />}
        title="Cài đặt hệ thống"
        onTitleClick={showComingSoon}
      >
        <Menu.Item key="/system_settings/users" onClick={showComingSoon}>Quản lý người dùng</Menu.Item>
        <Menu.Item key="/system_settings/roles" onClick={showComingSoon}>Quản lý vai trò</Menu.Item>
        <Menu.Item key="/system_settings/permissions" onClick={showComingSoon}>Phân quyền</Menu.Item>
      </SubMenu>,
      <SubMenu
        key="system_security"
        icon={<SafetyCertificateOutlined />}
        title="Bảo mật hệ thống"
        onTitleClick={showComingSoon}
      >
        <Menu.Item key="/system_security/password_policy" onClick={showComingSoon}>Chính sách mật khẩu</Menu.Item>
        <Menu.Item key="/system_security/access_control" onClick={showComingSoon}>Kiểm soát truy cập</Menu.Item>
        <Menu.Item key="/system_security/activity_logs" onClick={showComingSoon}>Nhật ký hoạt động</Menu.Item>
      </SubMenu>,
      <Menu.Item key="/system/backup" icon={<DatabaseOutlined />} onClick={showComingSoon}>
        Sao lưu & Phục hồi
      </Menu.Item>,
      <Menu.Item key="/system/monitoring" icon={<BarChartOutlined />} onClick={showComingSoon}>
        Giám sát hệ thống
      </Menu.Item>,
      <SubMenu
        key="user"
        icon={
          <IconButton aria-label="user">
            <Avatar size="large" icon={<UserOutlined />} />
          </IconButton>
        }
      >
        <Menu.Item key="logout" onClick={handleLogout}>Log out</Menu.Item>
      </SubMenu>
    ];
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="site-layout-background" style={{ padding: 0, position: 'sticky', top: 0, zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
          }}
        >
          <div className="logo" style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            <a href="https://hoangphucthanh.vn/" style={{ color: '#fff', textDecoration: 'none' }}>
              HOPT.DX
            </a>
          </div>
          <Menu
            onClick={handleClick}
            selectedKeys={[current]}
            mode="horizontal"
            className="header-menu"
          >
            {menuItems}
          </Menu>
        </div>
      </Header>
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '8px 0', color: '#fff' }}>
            <Breadcrumb.Item> </Breadcrumb.Item>
            <Breadcrumb.Item></Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <h3>Warehouse</h3>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default LayoutApp;