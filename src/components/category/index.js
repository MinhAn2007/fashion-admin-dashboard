import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { formatPrice } from "../../utils/FormatPrice";
import AddCategoryModal from "./addCategoryModal";
import EditCategoryModal from './editCategoryModal';

const ITEMS_PER_PAGE = 10;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const StatsCard = ({ title, value, color }) => (
  <div className={`${color} p-6 rounded-lg shadow-sm flex-1`}>
    <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const CategoryManagementDashboard = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showInactiveCategories, setShowInactiveCategories] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_ENDPOINT;
  const [chartMetric, setChartMetric] = useState("products");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState(null);

  const getAllCategoriesData = () => {
    const filteredCategories = getFilteredCategories();
    return filteredCategories
      .sort((a, b) =>
        chartMetric === "products"
          ? b.totalProducts - a.totalProducts
          : b.revenue - a.revenue
      )
      .map((category) => ({
        name:
          category.name.length > 30
            ? category.name.substring(0, 30) + "..."
            : category.name,
        products: category.totalProducts,
        revenue: category.revenue,
      }));
  };
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API}/api/categories/dashboard`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCategories(data.categories.categories);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort categories
  const sortCategories = (items) => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
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

  // Filter categories and update stats
  const getFilteredCategories = () => {
    let results = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!showInactiveCategories) {
      results = results.filter((category) => category.status === "active");
    }

    return sortCategories(results);
  };

  // Update stats whenever filtered categories change
  useEffect(() => {
    const filteredCategories = getFilteredCategories();
    const total = filteredCategories.length;
    const active = filteredCategories.filter(
      (c) => c.status === "active"
    ).length;
    const totalProducts = filteredCategories.reduce(
      (sum, c) => sum + c.totalProducts,
      0
    );
    const totalRevenue = filteredCategories.reduce(
      (sum, c) => sum + c.revenue,
      0
    );

    setStats({
      totalCategories: total,
      activeCategories: active,
      totalProducts,
      totalRevenue,
    });
  }, [categories, searchTerm, showInactiveCategories, sortConfig]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Pagination calculations
  const filteredCategories = getFilteredCategories();
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex justify-between gap-10">
        <StatsCard
          title="Tổng danh mục"
          value={stats.totalCategories}
          color="bg-yellow-100"
        />
        <StatsCard
          title="Danh mục hoạt động"
          value={stats.activeCategories}
          color="bg-green-100"
        />
        <StatsCard
          title="Tổng sản phẩm"
          value={stats.totalProducts.toLocaleString()}
          color="bg-blue-100"
        />
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          color="bg-green-100"
        />
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Phân bố theo danh mục</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setChartMetric("products")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                chartMetric === "products"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Số lượng sản phẩm
            </button>
            <button
              onClick={() => setChartMetric("revenue")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                chartMetric === "revenue"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Doanh thu
            </button>
          </div>
        </div>
        <div className="h-[calc(100vh-400px)] min-h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getAllCategoriesData()}
              margin={{ top: 20, right: 30, left: 30, bottom: 50 }}
            >
              <CartesianGrid />
              <XAxis
                dataKey="name"
                type="category"
                tick={{
                  fontSize: 12,
                  fill: "#374151",
                }}
                angle={-45} // Xoay tên danh mục để tránh chồng lấn
                textAnchor="end"
              />
              <YAxis
                type="number"
                tickFormatter={formatPrice(chartMetric === "revenue")}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    return (
                      <div className="bg-white p-4 shadow-lg rounded-lg border">
                        <p className="font-semibold">
                          {payload[0].payload.name}
                        </p>
                        <p>
                          {chartMetric === "revenue"
                            ? formatCurrency(value)
                            : `Số lượng: ${value.toLocaleString()}`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={chartMetric === "products" ? "products" : "revenue"}
                fill="#8884d8"
              >
                {getAllCategoriesData().map((entry, index) => (
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

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Danh sách danh mục ({filteredCategories.length})
            </h3>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() =>
                  setShowInactiveCategories(!showInactiveCategories)
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showInactiveCategories
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Hiện danh mục ẩn
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Tên danh mục
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="p-4 text-left">Danh mục cha</th>
                  <th className="p-4 text-left">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("totalProducts")}
                    >
                      Số sản phẩm
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="p-4 text-left">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("revenue")}
                    >
                      Doanh thu
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="p-4 text-left">Trạng thái</th>
                  <th className="p-4 text-left">Ngày tạo</th>
                  <th className="p-4 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{category.name}</td>
                    <td className="p-4">{category.parentCategory || "—"}</td>
                    <td className="p-4">
                      {category.totalProducts.toLocaleString()}
                    </td>
                    <td className="p-4">{formatCurrency(category.revenue)}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          category.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.status === "active"
                          ? "Đang hoạt động"
                          : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="p-4">{category.created}</td>
                    <td className="p-4">
                      <div className="flex space-x-4">
                      <button 
  className="text-blue-600 hover:text-blue-800"
  onClick={() => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  }}
>
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
              Hiển thị {paginatedCategories.length} trong số{" "}
              {filteredCategories.length} đơn hàng
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
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoryManagementDashboard;
