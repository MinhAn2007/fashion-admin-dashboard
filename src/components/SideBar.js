import React from "react";
import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiBox } from "react-icons/fi";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-48 h-dvh min-h-screen bg-gray-800 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-6">A&L Admin</h1>
      <ul>
        <Link to="/" className="flex items-center mb-4">
          <li className="flex items-center">
            <FiHome className="mr-2" /> Trang chủ
          </li>
        </Link>

        <li className="flex items-center mb-4">
          <FiBox className="mr-2" /> Đơn hàng
        </li>
        <Link to="/product" className="flex items-center mb-4">
          <li className="flex items-center">
            <FiShoppingBag className="mr-2" /> Sản phẩm
          </li>
        </Link>
        <li className="flex items-center mb-4">
          <FiUsers className="mr-2" /> Khách hàng
        </li>
        <li className="flex items-center mb-4">
          <FiSettings className="mr-2" /> Cài đặt
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
