import React, { lazy, Suspense, useState } from "react";
import { Route, Routes, useNavigate, useLocation, Navigate } from "react-router-dom";

import LayoutApp from "../components/layout/Layout";
import Loading from "../components/common/Loading";
import DashboardLanding from "../components/Dashboard/DashboardLanding";

const Home = lazy(() => import("../components/Home/Home"));
// Fix: Use correct file name and component name
const HangHoa = lazy(() => import("../components/HangHoa/HangHoa/HangHoa_Main"));
const LoaiHang = lazy(() => import("../components/HangHoa/LoaiHang/LoaiHang_Main"));
const NhaCungCap = lazy(() => import("../components/NhaCungCap/NCC_Main"));
const KhachHang = lazy(() => import("../components/KhachHang/KhachHang/KhachHang_Main"));
const HopDong = lazy(() => import("../components/ChungTu/HopDong/HopDong_Main"));
const LoaiHopDong = lazy(() => import("../components/ChungTu/LoaiHopDong/LoaiHopDong_Main"));
const Bill = lazy(() => import("../components/ChungTu/Bill/Bill_Main"));
const NhapKho = lazy(() => import("../components/NhapKho/NhapKho/NhapKho_Main"));
const NhapKhoThang = lazy(() => import("../components/NhapKho/ThongKeThang/ThongKeThangNK_Main"));
const XuatKho = lazy(() => import("../components/XuatKho/XuatKho/XuatKho_Main"));
const XuatKhoThang = lazy(() => import("../components/XuatKho/ThongKeThang/ThongKeThangXK_Main"));
const XuatKhoKhachHang = lazy(() => import("../components/XuatKho/ThongKeKhachHang/ThongKeKhachHangXK_Main"));
const TonKho = lazy(() => import("../components/TonKho/TonKho/TonKho_Main"));
const TonKhoThang = lazy(() => import("../components/TonKho/ThongKeThang/ThongKeThangTK_Main"));
const DonHang = lazy(() => import("../components/DatHang/DonHang/DonHang_Main"));
const ChiTietDonHang = lazy(() => import("../components/DatHang/ChiTietDonHang/CTDH_Main"));
const CTDHThang = lazy(() => import("../components/DatHang/ThongKeThang/ThongKeThangCTDH_Main"));
const CTDHKhachHang = lazy(() => import("../components/DatHang/ThongKeKhachHang/ThongKeKhachHangCTDH_Main"));
const ProductsDetail = lazy(() => import("../components/Products/productTypes/productType"));
const Profile = lazy(() => import("../components/profile/Profile"));
const LineChart = lazy(() => import("../components/Chart/LineChart"));
const Suppliers = lazy(() => import("../components/Suppliers/Suppliers"));
const AddSupplier = lazy(() => import("../components/Suppliers/AddSupplier"));
const Explain = lazy(() => import("../components/Explain/Explain"));

function MainAppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nếu đang ở / hoặc /home thì show dashboard landing
  if (location.pathname === "/" || location.pathname === "/home") {
    return (
      <DashboardLanding
        onSelectSystem={(key) => {
          if (key === 'warehouse') navigate('/system/warehouse');
          else if (key === 'crm') navigate('/system/crm');
          // ... các phân hệ khác
        }}
      />
    );
  }

  // Menu con theo phân hệ
  let menuType = null;
  if (location.pathname.startsWith("/system/warehouse")) menuType = "warehouse";
  if (location.pathname.startsWith("/system/crm")) menuType = "crm";
  // ...các phân hệ khác...

  // Điều hướng mặc định vào menu con đầu tiên
  if (location.pathname === "/system/warehouse") {
    return <Navigate to="/system/warehouse/products" replace />;
  }
  if (location.pathname === "/system/crm") {
    return <Navigate to="/system/crm/customers" replace />;
  }

  return (
    <LayoutApp menuType={menuType}>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Route chính, redirect từ "/" đến "/home" */}
          <Route path="/" element={<Home />} />
          {/* Route Home */}
          <Route path="/home" element={<Home />} />
          {/* Route Suppliers */}
          <Route path="/system/warehouse/suppliers" element={<NhaCungCap />} />
          <Route path="/system/warehouse/suppliers1" element={<Suppliers />} />
          <Route path="/system/warehouse/suppliers/add" element={<AddSupplier />} />

          {/* Route Customers */}
          <Route path="/system/crm/customers" element={<KhachHang />} />

          {/* Route Contracts */}
          <Route path="/system/crm/contracts" element={<HopDong />} />
          <Route path="/system/crm/contract_type" element={<LoaiHopDong />} />
          <Route path="/system/crm/bill" element={<Bill />} />
      
          {/* Route Products */}
          <Route path="/system/warehouse/product_type" element={<LoaiHang />} />
          <Route path="/system/warehouse/products" element={<HangHoa />} />
          <Route path="/system/warehouse/test_product_type" element={<ProductsDetail />} />

          {/* Route Stock In */}
          <Route path="/system/warehouse/stock_in" element={<NhapKho />} />
          <Route path="/system/warehouse/stock_in_with_month" element={<NhapKhoThang />} />

          {/* Route Stock Out */}
          <Route path="/system/warehouse/stock_out" element={<XuatKho />} />
          <Route path="/system/warehouse/stock_out_with_month" element={<XuatKhoThang />} />
          <Route path="/system/warehouse/stock_out_with_customer" element={<XuatKhoKhachHang />} />

          {/* Route Inventory */}
          <Route path="/system/warehouse/inventory" element={<TonKho />} />
          <Route path="/system/warehouse/inventory_with_month" element={<TonKhoThang />} />

          {/* Route Order */}
          <Route path="/system/warehouse/order" element={<DonHang />} />
          <Route path="/system/warehouse/order_detail" element={<ChiTietDonHang />} />
          <Route path="/system/warehouse/order_detail_with_month" element={<CTDHThang />} />
          <Route path="/system/warehouse/order_detail_with_customer" element={<CTDHKhachHang />} />
          
          {/* Route Profile */}
          <Route path="/profile" element={<Profile />} />
          {/* Route Statistic */}
          <Route path="/statistic" element={<LineChart />} />
          {/* Route Explain */}
          <Route path="/bao_gia" element={<Explain />} />
          {/* Route 404 hoặc catch-all (tùy chọn) */}
          <Route path="*" element={<Home />} /> {/* Hoặc redirect đến trang 404 */}
        </Routes>
      </Suspense>
    </LayoutApp>
  );
}

export default MainAppRoutes;