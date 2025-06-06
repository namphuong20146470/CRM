import { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import Loading from './components/common/Loading';
import MainAppRoutes from './routes/MainAppRoutes';
import Login from './components/login/Login';
import Home from './components/Home/Home';
// import Home from './components/home/Home';
// Kiểm tra xem người dùng đã đăng nhập chưa
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  console.log("Token in ProtectedRoute:", token); // Debug
  return token ? children : <Navigate to="/login" replace />;
}

function RouteApp() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Nếu người dùng vào "/" => Chuyển hướng đến "/home" với HashRouter */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Route Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Route Home - Sử dụng HashRouter */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Các route chính của ứng dụng */}
        <Route path="*" element={<ProtectedRoute><MainAppRoutes /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}

export default RouteApp;
