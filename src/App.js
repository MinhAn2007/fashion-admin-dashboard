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
import AdminLogin from "./components/admin/AdminLogin"; 
import ProductDetails from "./components/products/details/index";
import AddProductForm from "./components/products/NewProduct";
import OrderDetail from "./components/orders/details";
import SalesDashboard from "./components/revenue";

// Component bảo vệ các route cần đăng nhập
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  return isAuthenticated ? element : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập admin là trang mặc định */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="*"
          element={
            <ProtectedRoute
              element={
                <div className="flex h-screen">
                  {/* Sidebar cố định bên trái với chiều cao đầy màn hình */}
                  <Sidebar className="w-1/5 h-full" />
                  {/* Phần nội dung chính */}
                  <div className="flex flex-col flex-1 h-full">
                    <Header className="h-[10%]" /> {/* Header chiếm 10% chiều cao màn hình */}
                    <div className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/detail/:id" element={<ProductDetails />} />
                        <Route path="/new-product" element={<AddProductForm />} />
                        <Route path="/customers" element={<CustomerDashboard />} />
                        <Route path="/order" element={<OrderManagementDashboard />} />
                        <Route path="/order-detail/:id" element={<OrderDetail />} />
                        <Route path="/revenue" element={<SalesDashboard />} />
                        <Route path="/category" element={<CategoryManagementDashboard />} />
                        <Route path="/reviews" element={<ReviewDashboard />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
