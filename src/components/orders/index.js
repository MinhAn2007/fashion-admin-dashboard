import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import StatsCard from "../StatsCard";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ComposedChart,
} from "recharts";
import { BarChart, Bar, PieChart, Pie } from "recharts";
import { formatPrice } from "../../utils/FormatPrice";
import { Link } from "react-router-dom";
import OrderDashboardFilter from "../../utils/Filter";
import moment from "moment";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 10;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const STATUS_DISPLAY_MAP = {
  "Pending Confirmation": "Chờ xác nhận",
  "In Transit": "Đang giao hàng",
  Cancelled: "Đã hủy",
  Completed: "Hoàn thành",
  Delivered: "Đã giao hàng",
  Returned: "Đã trả hàng",
};

const STATUS_COLORS = {
  "Pending Confirmation": "bg-yellow-100",
  "In Transit": "bg-blue-100",
  Cancelled: "bg-red-100",
  Completed: "bg-green-100",
  Delivered: "bg-green-100",
  Returned: "bg-red-100",
};

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

const OrderManagementDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showNeedAttention, setShowNeedAttention] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_ENDPOINT;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${API}/api/orders/dashboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const filteredOrders = useMemo(() => {
    if (!dashboardData?.orders) return [];

    let orders = sortOrders(
      dashboardData.orders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (STATUS_DISPLAY_MAP[order.status] || order.status)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm.toLowerCase())
      )
    );

    if (showNeedAttention) {
      console.log(orders);

      orders = orders.filter(
        (order) =>
          order.status === "Returned" || order.status === "Pending Confirmation"
      );
    }
    console.log("orders", orders);

    return orders;
  }, [dashboardData?.orders, searchTerm, sortConfig, showNeedAttention]);

  const fetchDashboardData = async (startDate, endDate) => {
    try {
      const response = await fetch(
        `${API}/api/orders/dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const processedData = useMemo(() => {
    if (!dashboardData?.monthlyRevenue) return [];
    return dashboardData.monthlyRevenue.map((item, index) => {
      if (index === 0) return { ...item, growth: 0 };
      const prevRevenue = dashboardData.monthlyRevenue[index - 1].total_revenue;
      const growth = ((item.total_revenue - prevRevenue) / prevRevenue) * 100;
      return { ...item, growth };
    });
  }, [dashboardData?.monthlyRevenue]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  console.log("Paginated Orders", paginatedOrders);

  const orderStatusStats = useMemo(() => {
    if (!filteredOrders.length) return [];
    const stats = {};
    filteredOrders.forEach((order) => {
      const displayStatus = STATUS_DISPLAY_MAP[order.status] || order.status;
      if (!stats[displayStatus]) {
        stats[displayStatus] = 0;
      }
      stats[displayStatus]++;
    });
    return Object.entries(stats).map(([status, count]) => ({ status, count }));
  }, [filteredOrders]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Lỗi: {error}</div>
      </div>
    );
  }
  const exportToExcel = () => {
    if (!dashboardData) return;
  
    const wb = XLSX.utils.book_new();
  
    const createHeader = (title, dateRange) => [
      ["BÁO CÁO QUẢN LÝ ĐƠN HÀNG"],
      [`${title}`],
      [`Thời gian: ${dateRange || moment().format('DD/MM/YYYY')}`],
      [],
    ];
  
    const createFooter = () => [
      [],
      ["Người lập báo cáo:", "", "", "Người duyệt:"],
      ["", "", "", ""],
      ["", "", "", ""],
      [`Ngày lập: ${moment().format("DD/MM/YYYY")}`],
    ];
  
    // 1. Báo cáo doanh số theo thời gian
    const revenueHeader = createHeader(
      "BÁO CÁO DOANH SỐ THEO THỜI GIAN"
    );
  
    const revenueData = processedData.map((item) => ({
      "Tháng": item.month,
      "Doanh thu (VNĐ)": formatPrice(item.total_revenue),
      "Tăng trưởng (%)": `${item.growth.toFixed(1)}%`
    }));
  
    const revenueSheet = [
      ...revenueHeader,
      ["Tháng", "Doanh thu (VNĐ)", "Tăng trưởng (%)"],
      ...revenueData.map(Object.values),
      ...createFooter()
    ];
  
    // 2. Báo cáo phương thức thanh toán
    const paymentHeader = createHeader(
      "BÁO CÁO PHƯƠNG THỨC THANH TOÁN"
    );
  
    const paymentData = dashboardData.paymentStats.map((item) => ({
      "Phương thức": item.name,
      "Tỷ lệ (%)": `${item.value}%`,
      "Số lượng đơn": item.count || 0
    }));
  
    const paymentSheet = [
      ...paymentHeader,
      ["Phương thức", "Tỷ lệ (%)", "Số lượng đơn"],
      ...paymentData.map(Object.values),
      ...createFooter()
    ];
  
    // 3. Báo cáo trạng thái đơn hàng
    const statusHeader = createHeader(
      "BÁO CÁO TRẠNG THÁI ĐƠN HÀNG"
    );
  
    const statusData = orderStatusStats.map((item) => ({
      "Trạng thái": item.status,
      "Số lượng": item.count,
      "Tỷ lệ (%)": `${((item.count / filteredOrders.length) * 100).toFixed(1)}%`
    }));
  
    const statusSheet = [
      ...statusHeader,
      ["Trạng thái", "Số lượng", "Tỷ lệ (%)"],
      ...statusData.map(Object.values),
      ...createFooter()
    ];
  
    // 4. Tổng kết báo cáo
    const summaryHeader = createHeader(
      "TỔNG KẾT BÁO CÁO"
    );
  
    const summaryData = [
      ["Chỉ số", "Giá trị"],
      ["Tổng doanh số", formatPrice(dashboardData.stats.totalRevenue)],
      ["Tỷ lệ hoàn trả", `${dashboardData.stats.returnRate}%`],
      ["Đơn hàng chờ xác nhận", dashboardData.stats.pendingOrders.toString()],
      ["Tổng số đơn hàng", dashboardData.stats.totalOrders.toString()]
    ];
  
    const summarySheet = [
      ...summaryHeader,
      ...summaryData,
      ...createFooter()
    ];
  
    // 5. Chi tiết đơn hàng
    const orderHeader = createHeader(
      "CHI TIẾT ĐƠN HÀNG"
    );
  
    const orderData = filteredOrders.map(order => ({
      "Mã đơn hàng": order.id,
      "Khách hàng": order.customerName,
      "Trạng thái": STATUS_DISPLAY_MAP[order.status] || order.status,
      "Tổng tiền": formatPrice(order.total),
      "Ngày tạo": moment(order.createdAt).format("DD/MM/YYYY")
    }));
  
    const orderSheet = [
      ...orderHeader,
      ["Mã đơn hàng", "Khách hàng", "Trạng thái", "Tổng tiền", "Ngày tạo"],
      ...orderData.map(Object.values),
      ...createFooter()
    ];
  
    // Thêm các sheet vào workbook
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(summarySheet),
      "Tổng Kết"
    );
    
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(revenueSheet),
      "Doanh Số"
    );
    
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(paymentSheet),
      "Phương Thức Thanh Toán"
    );
    
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(statusSheet),
      "Trạng Thái Đơn Hàng"
    );
    
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(orderSheet),
      "Chi Tiết Đơn Hàng"
    );
  
    XLSX.writeFile(wb, `Bao_Cao_Don_Hang_${moment().format("DD.MM.YYYY")}.xlsx`);
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <OrderDashboardFilter
          onDateRangeChange={({ startDate, endDate }) =>
            fetchDashboardData(startDate, endDate)
          }
        />
        <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
      </div>
      {/* Stats Cards */}
      <div className="flex justify-between gap-10">
        <StatsCard
          title="Tổng doanh số bán hàng"
          value={`${formatPrice(dashboardData.stats.totalRevenue)}`}
          color="bg-yellow-100"
        />
        <StatsCard
          title="Tỷ lệ hoàn trả"
          value={`${dashboardData.stats.returnRate}%`}
          color="bg-red-100"
        />
        <StatsCard
          title="Đơn hàng chờ xác nhận"
          value={dashboardData.stats.pendingOrders}
          color="bg-red-100"
        />
        <StatsCard
          title="Tổng đơn hàng"
          value={dashboardData.stats.totalOrders}
          color="bg-green-100"
        />
      </div>
      {/* Revenue Chart Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Doanh số đơn hàng bán được theo thời gian</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#E5E7EB" }}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              axisLine={{ stroke: "#E5E7EB" }}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => formatPrice(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: "#E5E7EB" }}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              formatter={(value, name) => {
                if (name === "Thành tiền") return formatPrice(value);
                if (name === "% Tăng trưởng") return `${value.toFixed(1)}%`;
                return value;
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="total_revenue"
              name="Thành tiền"
              fill="#2563eb"
              barSize={40}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growth"
              name="% Tăng trưởng"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Charts Section */}
      <div className="flex justify-between gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dashboardData.paymentStats}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.paymentStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

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
              <Bar dataKey="count" fill="#8884d8">
                {orderStatusStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Orders Table Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Danh sách đơn hàng ({filteredOrders.length})
            </h3>
            <div className="flex gap-4">
              <button
                onClick={exportToExcel}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Xuất Excel
              </button>
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
                      onClick={() => handleSort("id")}
                      className="flex items-center font-bold hover:text-blue-600"
                    >
                      Mã đơn hàng
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("customerName")}
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
                    <td className="p-4">{order.id}</td>
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          STATUS_COLORS[order.status]
                        }`}
                      >
                        {STATUS_DISPLAY_MAP[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-4">
                        <Link to={`/order-detail/${order.id}`}>
                          <button className="text-green-600 hover:text-green-800">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
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
