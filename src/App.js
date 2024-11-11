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
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/product" element={<Product />} />
              <Route path="/customers" element={<CustomerDashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
