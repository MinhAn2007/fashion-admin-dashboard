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
  Cell,
} from "recharts";
import { BarChart, Bar, PieChart, Pie } from "recharts";
import { formatPrice } from "../../utils/FormatPrice";
import { ArrowUpDown } from "lucide-react";

const ITEMS_PER_PAGE = 10;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS = {
  "Pending Confirmation": "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Returned: "bg-red-100 text-red-800",
};

const OrderManagementDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showNeedAttention, setShowNeedAttention] = useState(false);

  // Mock data generation remains the same
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
    let orders = sortOrders(
      sampleData.orders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (showNeedAttention) {
      orders = orders.filter(
        (order) =>
          order.status === "Returned" || order.status === "Pending Confirmation"
      );
    }

    return orders;
  }, [searchTerm, sortConfig, showNeedAttention]);

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

  // Payment method data for pie chart
  const paymentData = [
    { name: "Thanh toán Online", value: 60, color: "#0088FE" },
    { name: "Tiền mặt", value: 40, color: "#00C49F" },
  ];
  const returnRate = useMemo(() => {
    const returnedOrders = filteredOrders.filter(
      (order) => order.status === "Returned"
    );
    return ((returnedOrders.length / filteredOrders.length) * 100).toFixed(2);
  }, [filteredOrders]);

  // Format functions remain the same
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

  // Revenue over time calculation remains the same
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

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

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Doanh thu theo thời gian</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueOverTime}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${formatPrice(value)}`} />
            <Tooltip formatter={(value) => `${formatPrice(value)}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Table Section */}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Danh sách đơn hàng ({filteredOrders.length})
            </h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                className="px-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setShowNeedAttention(!showNeedAttention)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showNeedAttention
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Đơn cần xử lý
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("customer")}
                      className="flex items-center font-bold hover:text-blue-600"
                    >
                      Khách hàng
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center font-bold hover:text-blue-600"
                    >
                      Trạng thái
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("total")}
                      className="flex items-center font-bold hover:text-blue-600"
                    >
                      Tổng tiền
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center font-bold hover:text-blue-600"
                    >
                      Ngày tạo
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="p-4 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          STATUS_COLORS[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
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

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Hiển thị {paginatedOrders.length} trong số {filteredOrders.length}{" "}
              đơn hàng
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 hover:text-blue-600 disabled:text-gray-400"
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
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 hover:text-blue-600 disabled:text-gray-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementDashboard;
