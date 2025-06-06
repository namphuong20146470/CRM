import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Try the normal login endpoint
      const response = await fetch('https://dx.hoangphucthanh.vn:3000/warehouse/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ten_dang_nhap: values.username,
          mat_khau: values.password
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userData', JSON.stringify(result.data || {}));
        notification.success({
          message: 'Đăng nhập thành công!',
          description: result.message || 'Đăng nhập thành công',
          duration: 2
        });
        navigate('/');
        return;
      }

      // If login endpoint fails, try manual login with account list
      const accountsResponse = await fetch('https://dx.hoangphucthanh.vn:3000/warehouse/accounts', {
        method: 'GET'
      });

      const accountsData = await accountsResponse.json();

      if (accountsResponse.ok && accountsData.success) {
        const user = accountsData.data.find(account =>
          account.ten_dang_nhap === values.username &&
          account.mat_khau === values.password
        );

        if (user) {
          localStorage.setItem('token', 'manual-token-' + Math.random());
          localStorage.setItem('userData', JSON.stringify(user));
          notification.success({
            message: 'Đăng nhập thành công!',
            description: 'Đăng nhập bằng phương pháp dự phòng',
            duration: 2
          });
          navigate('/');
          return;
        }
      }

      throw new Error(result.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } catch (error) {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: error.message,
        duration: 3
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi click "Đây"
  const handleManualMaintenance = () => {
    window.open('https://dx.hoangphucthanh.vn:3000', '_blank');
  };

  const transparentStyle = {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    boxShadow: 'none'
  };
  const formStyle = {
    background: 'rgba(20, 20, 30, 0.85)', // nền đậm, trong suốt nhẹ
    padding: '40px',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 0 22px 0 #3a6cf6cc', // shadow xanh dương nhạt
    border: '1px solid #3a6cf6cc', // viền xanh dương nhạt (tùy chọn)
  };

  return (
    <div className="login-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: "url('/image/login2.jpg') center center/cover no-repeat"
    }}>
      <div className="login-container" style={formStyle}>
        <h2 className="login-title" style={{ color: '#fff', marginBottom: 24, fontWeight: 700, letterSpacing: 1 }}>Đăng nhập hệ thống</h2>
        <Form name="login_form" onFinish={onFinish} className="login-form">
          <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="Tên đăng nhập"
              className="login-input"
              size="large"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Mật khẩu"
              className="login-input"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item className="checkbox-item" style={{ textAlign: 'left', marginBottom: 8 }}>
            <Checkbox style={{ color: '#fff' }}>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="login-button"
              style={transparentStyle}
              loading={loading}
              size="large"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 18, color: '#fff', fontSize: 15, textAlign: 'center', lineHeight: 1.6 }}>
          Nếu không đăng nhập được khi nhập đúng thì vui lòng nhấn vào{' '}
          <span
            style={{
              color: '#40a9ff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 600
            }}
            onClick={handleManualMaintenance}
          >
            Đây
          </span>
          .
        </div>
      </div>
    </div>
  );
}

export default Login;