import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/SideBar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Product from "./components/products/index";
import CustomerDashboard from "./components/customers/CustomerDashboard";
import OrderManagementDashboard from "./components/orders";
import CategoryManagementDashboard from "./components/category";
import ReviewDashboard from "./components/review/ReviewDashboard";
import AdminLogin from "./components/admin/AdminLogin"; // Import trang đăng nhập admin

// Component bảo vệ các route cần đăng nhập
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  return isAuthenticated ? element : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar cố định bên trái với chiều cao đầy màn hình */}
        <Sidebar className="w-1/5 h-full" />

        {/* Phần nội dung chính */}
        <div className="flex flex-col flex-1 h-full">
          <Header className="h-[10%]" /> {/* Header chiếm 10% chiều cao màn hình */}
          <div className="flex-1 overflow-auto">
            {/* Phần chứa nội dung chính chiếm 90% còn lại */}
            <Routes>
              {/* Route điều hướng mặc định */}
              <Route path="/" element={<Navigate to="/dashboard" />} />

              {/* Route trang đăng nhập admin */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Các route được bảo vệ */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<Dashboard />} />}
              />
              <Route
                path="/product"
                element={<ProtectedRoute element={<Product />} />}
              />
              <Route
                path="/customers"
                element={<ProtectedRoute element={<CustomerDashboard />} />}
              />
              <Route
                path="/order"
                element={<ProtectedRoute element={<OrderManagementDashboard />} />}
              />
              <Route
                path="/category"
                element={<ProtectedRoute element={<CategoryManagementDashboard />} />}
              />
              <Route
                path="/reviews"
                element={<ProtectedRoute element={<ReviewDashboard />} />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
