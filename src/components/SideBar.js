import React from "react";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiBox,
  FiLogOut,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { TbCategoryPlus, TbMessage } from "react-icons/tb";

const Sidebar = () => {
  //logout


  return (
    <div className="w-48 h-dvh min-h-screen bg-gray-800 text-white flex flex-col p-4">
      <Link to="/" className="flex items-center mb-4">
        <h1 className="text-2xl font-bold mb-6">A&L Admin</h1>
      </Link>
      <ul>
        <Link to="/" className="flex items-center mb-4">
          <li className="flex items-center">
            <FiHome className="mr-2" /> Trang chủ
          </li>
        </Link>
        <Link to="/order" className="flex items-center">
          <li className="flex items-center mb-4">
            <FiBox className="mr-2" /> Đơn hàng
          </li>
        </Link>
        <Link to="/category" className="flex items-center">
          <li className="flex items-center mb-4">
            <TbCategoryPlus className="mr-2" /> Danh mục
          </li>
        </Link>
        <Link to="/product" className="flex items-center mb-4">
          <li className="flex items-center">
            <FiShoppingBag className="mr-2" /> Sản phẩm
          </li>
        </Link>
        <Link to="/customers" className="flex items-center mb-4">
          <li className="flex items-center">
            <FiUsers className="mr-2" /> Khách hàng
          </li>
        </Link>
        <Link to="/reviews" className="flex items-center mb-4">
          <li className="flex items-center">
            <TbMessage className="mr-2" /> Ý kiến khách hàng
          </li>
        </Link>
        <li className="flex items-center mb-4">
          <FiSettings className="mr-2" /> Cài đặt
        </li>
      </ul>


    </div>
  );
};

export default Sidebar;
