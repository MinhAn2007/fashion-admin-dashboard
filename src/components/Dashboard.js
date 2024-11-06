import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import Chart from "./Chart";
import { formatPrice } from "../utils/FormatPrice";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("Today");
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    productsSold: 0,
    newCustomers: 0,
    totalOrders: 0,
  });
  const [pendingOrders, setPendingOrders] = useState(5);
  const API = process.env.REACT_APP_API_ENDPOINT;
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API}/api/orders/dashboard`);
      const data = await response.json();  
      console.log(data);

      setDashboardData(data.data);
      console.log("dashboardData", dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  const recentActivities = [
    { id: 1, text: "Đơn hàng #1234 đã được hoàn thành", time: "Hôm nay" },
    {
      id: 2,
      text: "Sản phẩm mới 'Áo thun mùa hè' đã được thêm",
      time: "Hôm qua",
    },
    {
      id: 3,
      text: "Khách hàng mới 'Nguyễn Văn A' đã đăng ký",
      time: "2 ngày trước",
    },
  ];

  const pendingOrdersList = [
    { id: 101, name: "Đơn hàng #101", status: "Chờ xử lý", date: "01/11/2024" },
    { id: 102, name: "Đơn hàng #102", status: "Chờ xử lý", date: "02/11/2024" },
    { id: 103, name: "Đơn hàng #103", status: "Chờ xử lý", date: "03/11/2024" },
  ];

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
          <h3 className="text-lg font-semibold mb-4">
            Danh sách đơn hàng cần xử lý
          </h3>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Mã đơn hàng</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrdersList.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2">{order.name}</td>
                  <td className="px-4 py-2 text-orange-500">{order.status}</td>
                  <td className="px-4 py-2">{order.date}</td>
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
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold">{activity.text}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
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
