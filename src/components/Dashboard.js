import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import Chart from "./Chart";
import { formatPrice } from "../utils/FormatPrice";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("Today");
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    productsSold: 0,
    newCustomers: 0,
    totalOrders: 0,
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const API = process.env.REACT_APP_API_ENDPOINT;
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API}/api/orders/dashboard/total`);
      const data = await response.json();
      console.log(data);

      setDashboardData(data.data);
      setPendingOrders(data.data.orderNeedAction);
      setActivities(data.data.activities);
      console.log("dashboardData", dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format relative time for activities
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return "Hôm nay";
    } else if (diffInHours < 48) {
      return "Hôm qua";
    } else {
      return `${Math.floor(diffInHours / 24)} ngày trước`;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  const mappingStatusName = (status) => {
    switch (status) {
      case "Pending Confirmation":
        return "Chờ xác nhận";
      case "Completed":
        return "Đã hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      case "Returned":
        return "Đã trả hàng";
      case "In Transit":
        return "Đang giao hàng";
      default:
        return "Đã giao hàng";
    }
  };

  return (
    <div className="p-6 flex flex-col space-y-6">
      <div className="flex flex-wrap space-x-4 justify-between">
        <StatsCard
          title="Doanh thu tổng"
          value={formatPrice(dashboardData.totalSales)}
          color="bg-blue-100"
        />
        <StatsCard
          title="Sản phẩm đã bán"
          value={dashboardData.productsSold}
          color="bg-green-100"
        />
        <StatsCard
          title="Khách hàng"
          value={dashboardData.newCustomers}
          color="bg-yellow-100"
        />
        <StatsCard
          title="Tổng số đơn hàng"
          value={dashboardData.totalOrders}
          color="bg-red-100"
        />
      </div>

      <Chart />

      <div className="flex space-x-12">
        <div className="w-1/2 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold mb-4">Đơn hàng chờ xử lý</h3>
            <button className="text-sm text-blue-500">
              <Link to="/order" className="flex items-center">
                Xem tất cả
              </Link>
            </button>
          </div>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Mã đơn hàng</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2">Đơn hàng #{order.id}</td>
                  <td className="px-4 py-2 text-orange-500">{mappingStatusName(order.status)}</td>
                  <td className="px-4 py-2">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-1/2 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 w-1 bg-gray-300 h-full"></div>
            <ul className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {getRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
