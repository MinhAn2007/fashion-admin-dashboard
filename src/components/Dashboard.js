import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import Chart from "./Chart";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("Today");
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    productsSold: 0,
    newCustomers: 0,
    totalOrders: 0,
  });
  const [pendingOrders, setPendingOrders] = useState(5);

  useEffect(() => {
    fetch(`/api/dashboard?timePeriod=${timePeriod}`)
      .then((res) => res.json())
      .then((data) => {
        setDashboardData({
          totalSales: data.totalSales,
          productsSold: data.productsSold,
          newCustomers: data.newCustomers,
          totalOrders: data.totalOrders,
        });
        setPendingOrders((prev) => data.pendingOrders || prev);
      });
  }, [timePeriod]);

  // Sample data for recent activities
  const recentActivities = [
    { id: 1, text: "Đơn hàng #1234 đã được hoàn thành", time: "Hôm nay" },
    { id: 2, text: "Sản phẩm mới 'Áo thun mùa hè' đã được thêm", time: "Hôm qua" },
    { id: 3, text: "Khách hàng mới 'Nguyễn Văn A' đã đăng ký", time: "2 ngày trước" },
  ];

  // Sample data for pending orders
  const pendingOrdersList = [
    { id: 101, name: "Đơn hàng #101", status: "Chờ xử lý", date: "01/11/2024" },
    { id: 102, name: "Đơn hàng #102", status: "Chờ xử lý", date: "02/11/2024" },
    { id: 103, name: "Đơn hàng #103", status: "Chờ xử lý", date: "03/11/2024" },
  ];

  return (
    <div className="p-6 flex flex-col space-y-6">
      <div className="flex flex-wrap space-x-4 gap-10">
        <StatsCard title="Total Sales" value={`${dashboardData.totalSales}₫`} color="bg-blue-100" />
        <StatsCard title="Products Sold" value={dashboardData.productsSold} color="bg-green-100" />
        <StatsCard title="New Customers" value={dashboardData.newCustomers} color="bg-yellow-100" />
        <StatsCard title="Total Orders" value={dashboardData.totalOrders} color="bg-red-100" />

        <div className="flex h-1/2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="p-2 bg-white border border-gray-300 rounded-lg shadow focus:outline-none focus:border-blue-500"
          >
            <option value="Today">Hôm nay</option>
            <option value="This Week">Tuần này</option>
            <option value="This Month">Tháng này</option>
            <option value="This Year">Năm nay</option>
          </select>
        </div>
      </div>

      <Chart />

      <div className="flex space-x-12">
        {/* Left Column: Pending Orders */}
        <div className="w-1/2 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Danh sách đơn hàng cần xử lý</h3>
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

        {/* Right Column: Recent Activities Timeline */}
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
