import React, { useState, useMemo } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import StatsCard from "../StatsCard";

const ITEMS_PER_PAGE = 10;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const CategoryManagementDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showInactiveCategories, setShowInactiveCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data generation
  const generateMockData = () => {
    const categories = [];
    const statuses = ["active", "inactive"];
    const types = [
      "Điện tử",
      "Thời trang",
      "Đồ gia dụng",
      "Mỹ phẩm",
      "Thực phẩm",
    ];

    for (let i = 1; i <= 50; i++) {
      categories.push({
        id: i,
        name: `${types[Math.floor(Math.random() * types.length)]} ${i}`,
        slug: `category-${i}`,
        description: `Mô tả cho danh mục ${i}`,
        totalProducts: Math.floor(Math.random() * 1000) + 50,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        revenue: Math.floor(Math.random() * 1000000000) + 1000000,
        created: new Date(
          2023,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28)
        ).toLocaleDateString(),
        parentCategory:
          Math.random() > 0.5
            ? `Parent ${Math.floor(Math.random() * 5) + 1}`
            : null,
      });
    }
    return categories;
  };

  const sampleData = {
    categories: generateMockData(),
  };

  // Sorting logic
  const sortCategories = (categories) => {
    if (!sortConfig.key) return categories;
    return [...categories].sort((a, b) => {
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

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let results = sampleData.categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!showInactiveCategories) {
      results = results.filter((category) => category.status === "active");
    }

    return sortCategories(results);
  }, [searchTerm, sortConfig, showInactiveCategories]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats calculations
  const stats = useMemo(() => {
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

    return {
      totalCategories: total,
      activeCategories: active,
      totalProducts,
      totalRevenue,
    };
  }, [filteredCategories]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Chart data
  const categoryDistributionData = useMemo(() => {
    const distribution = {};
    filteredCategories.forEach((category) => {
        const type = category.name.split(/\d+/)[0].trim();      
      if (distribution[type]) {
        distribution[type] += category.totalProducts;
      } else {
        distribution[type] = category.totalProducts;
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredCategories]);

  const revenueByCategory = useMemo(() => {
    return filteredCategories
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((category) => ({
        name: category.name,
        revenue: category.revenue,
      }));
  }, [filteredCategories]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{`Số lượng: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex justify-between gap-10">
        <StatsCard
          title="Tổng danh mục"
          value={stats.totalCategories}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Danh mục hoạt động"
          value={stats.activeCategories}
          color="bg-green-100"
        />
        <StatsCard
          title="Tổng sản phẩm"
          value={stats.totalProducts}
          color="bg-blue-100"
        />
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          color="bg-green-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            Phân bố sản phẩm theo danh mục
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false} // Ẩn đường kẻ nối nhãn với phần biểu đồ
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={140} // Tăng kích thước outerRadius để nhãn dễ hiển thị
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistributionData.map((entry, index) => (
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

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            Top 5 danh mục theo doanh thu
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#8884d8">
                {revenueByCategory.map((entry, index) => (
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
    </div>
  );
};

export default CategoryManagementDashboard;
