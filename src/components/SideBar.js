import React from 'react';
import { FiHome, FiShoppingBag, FiUsers, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  return (
    <div className="w-64 max-h-full min-h-full bg-gray-800 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-6">A&L Admin</h1>
      <ul>
        <li className="flex items-center mb-4">
          <FiHome className="mr-2" /> Trang chủ
        </li>
        <li className="flex items-center mb-4">
          <FiShoppingBag className="mr-2" /> Đơn hàng
        </li>
        <li className="flex items-center mb-4">
          <FiShoppingBag className="mr-2" /> Sản phẩm
        </li>
        <li className="flex items-center mb-4">
          <FiUsers className="mr-2" /> Khách hàng
        </li>
        <li className="flex items-center mb-4">
          <FiSettings className="mr-2" /> Cài đặt
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
