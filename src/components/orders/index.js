import React, { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import StatsCard from "../StatsCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart, Bar, PieChart, Pie } from "recharts";

import { formatPrice } from "../../utils/FormatPrice";
const ITEMS_PER_PAGE = 10;

const OrderManagementDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data to test
  const generateMockData = () => {
    const orders = [];
    for (let i = 1; i <= 100; i++) {
      orders.push({
        id: i,
        customerName: `Khách hàng ${i}`,
        status: [
          "Pending Confirmation",
          "Processing",
          "Shipped",
          "Delivered",
          "Returned",
        ][Math.floor(Math.random() * 5)],
        total: Math.floor(Math.random() * 1000000) + 100000,
        createdAt: new Date(
          2023,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28)
        ).toLocaleDateString(),
      });
    }
    return orders;
  };

  const sampleData = {
    orders: generateMockData(),
  };

  // Sorting handler
  const sortOrders = (orders) => {
    if (!sortConfig.key) return orders;
    return [...orders].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    return sortOrders(
      sampleData.orders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Order status statistics
  const orderStatusStats = useMemo(() => {
    const stats = {};
    filteredOrders.forEach((order) => {
      if (!stats[order.status]) {
        stats[order.status] = 0;
      }
      stats[order.status]++;
    });
    return Object.entries(stats).map(([status, count]) => ({ status, count }));
  }, [filteredOrders]);

  // Return rate
  const returnRate = useMemo(() => {
    const returnedOrders = filteredOrders.filter(
      (order) => order.status === "Returned"
    );
    return ((returnedOrders.length / filteredOrders.length) * 100).toFixed(2);
  }, [filteredOrders]);

  const formatValue = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const ordersNeedingAttention = useMemo(() => {
    return filteredOrders.filter(
      (order) =>
        order.status === "Returned" || order.status === "Pending Confirmation"
    );
  }, [filteredOrders]);

  const needAttentionTotalPages = Math.ceil(
    ordersNeedingAttention.length / ITEMS_PER_PAGE
  );
  const needAttentionPaginatedOrders = ordersNeedingAttention.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const revenueOverTime = useMemo(() => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(2023, i).toLocaleString("default", {
        month: "long",
      });
      const revenue = sampleData.orders
        .filter((order) => new Date(order.createdAt).getMonth() === i)
        .reduce((total, order) => total + order.total, 0);
      data.push({ month, revenue });
    }
    return data;
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn hàng mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex justify-between gap-10">
        <StatsCard
          title="Tổng doanh thu"
          value={`${formatValue(
            filteredOrders.reduce((total, order) => total + order.total, 0)
          )}đ`}
          color="bg-yellow-100"
        />
        <StatsCard
          title="Tỷ lệ hoàn trả"
          value={`${returnRate}%`}
          color="bg-red-100"
        />
        <StatsCard
          title="Đơn hàng chờ xác nhận"
          value={`${
            orderStatusStats.find(
              (item) => item.status === "Pending Confirmation"
            )?.count || 0
          }`}
          color="bg-red-100"
        />
        <StatsCard
          title="Tổng đơn hàng"
          value={`${filteredOrders.length.toLocaleString()}`}
          color="bg-green-100"
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Doanh thu theo thời gian</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueOverTime}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${formatPrice(value)}`} />
            <Tooltip formatter={(value) => `${formatPrice(value)}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between gap-6">
        {/* Revenue Over Time Line Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4">
            Biểu đồ tình trạng đơn hàng
          </h3>
          <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={[
                { name: "Online", value: 60 },
                { name: "Tiền mặt", value: 40 },
              ]}
              dataKey="value"
              nameKey="name"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            />
            <Legend />
          </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4">
            Phân bố trạng thái đơn hàng
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={orderStatusStats}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Orders Needing Attention */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">
            Các đơn hàng cần xử lý ({ordersNeedingAttention.length})
          </h3>
          {ordersNeedingAttention.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4 text-left">Khách hàng</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-left">Tổng tiền</th>
                    <th className="p-4 text-left">Ngày tạo</th>
                    <th className="p-4 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {needAttentionPaginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{order.customerName}</td>
                      <td
                        className={`p-4 font-semibold ${
                          order.status === "Returned"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </td>
                      <td className="p-4">{formatValue(order.total)}đ</td>
                      <td className="p-4">{order.createdAt}</td>
                      <td className="p-4">
                        <div className="flex space-x-4">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Không có đơn hàng cần xử lý.</p>
          )}
          {/* Pagination for orders needing attention */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-gray-600">
              Trang {currentPage} / {needAttentionTotalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, needAttentionTotalPages)
                )
              }
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* All Orders Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">
            Tất cả đơn hàng ({filteredOrders.length})
          </h3>
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4 text-left">Khách hàng</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-left">Tổng tiền</th>
                    <th className="p-4 text-left">Ngày tạo</th>
                    <th className="p-4 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{order.customerName}</td>
                      <td
                        className={`p-4 font-semibold ${
                          order.status === "Returned"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </td>
                      <td className="p-4">{formatValue(order.total)}đ</td>
                      <td className="p-4">{order.createdAt}</td>
                      <td className="p-4">
                        <div className="flex space-x-4">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Không có đơn hàng nào.</p>
          )}
          {/* Pagination for all orders */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementDashboard;
