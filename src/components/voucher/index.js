import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  Tag,
  Percent,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "../../utils/FormatPrice";
import AddVoucherModal from "./NewVoucher";
import EditVoucherModal from "./EditVoucher";

const API = process.env.REACT_APP_API_ENDPOINT;
const ITEMS_PER_PAGE = 10;

export default function PromotionDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [chartFilter, setChartFilter] = useState("discount");
  const [dashboardData, setDashboardData] = useState({
    promotions: [],
    chartData: [],
    mostUsedPromotions: [],
    highestDiscountPromotions: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API}/api/voucher/dashboard`);
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu dashboard");
        }
        const data = await response.json();
        setDashboardData(data); // Now setting the complete dashboard data object
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const filterPromotions = (items) => {
    if (!searchTerm.trim()) return items;
    const searchTermLower = searchTerm.toLowerCase().trim();
    return items.filter((promotion) =>
      promotion.coupon_code.toLowerCase().includes(searchTermLower)
    );
  };

  const sortPromotions = (items) => {
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

  const filteredPromotions = filterPromotions(dashboardData.promotions);
  const sortedPromotions = sortPromotions(filteredPromotions);
  const totalPages = Math.ceil(sortedPromotions.length / ITEMS_PER_PAGE);
  const paginatedPromotions = sortedPromotions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddVoucherSuccess = async () => {
    try {
      const response = await fetch(`${API}/api/voucher/dashboard`);
      if (!response.ok) {
        throw new Error("Không thể tải lại dữ liệu dashboard");
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
    }
  };

  const handleEditClick = (voucher) => {
    setSelectedVoucher(voucher);
    setIsEditModalOpen(true);
  };

  const deleteVoucher = async (id) => {
    try {
      const response = await fetch(`${API}/api/voucher/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete voucher");
      }
      alert("Xóa voucher thành công");
      handleAddVoucherSuccess();
    } catch (error) {
      console.error("Error deleting voucher:", error);
      alert("Xóa voucher thất bại");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Khuyến mãi</h1>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm khuyến mãi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Top mã giảm giá được sử dụng
            </h3>
            <Tag className="text-blue-500" />
          </div>
          <div className="space-y-4">
            {dashboardData.mostUsedPromotions.map((promotion, index) => (
              <div
                key={promotion.id}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="text-gray-600">#{index + 1}</span>
                  <span className="ml-2 font-medium">
                    {promotion.coupon_code}
                  </span>
                </div>
                <span className="text-blue-600 font-semibold">
                  {promotion.total_uses} lượt dùng
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top giá trị giảm giá</h3>
            <Percent className="text-yellow-500" />
          </div>
          <div className="space-y-4">
            {dashboardData.highestDiscountPromotions.map((promotion, index) => (
              <div
                key={promotion.id}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="text-gray-600">#{index + 1}</span>
                  <span className="ml-2 font-medium">
                    {promotion.coupon_code}
                  </span>
                </div>
                <span className="text-green-600 font-semibold">
                  {formatPrice(promotion.total_discount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            Biểu đồ{" "}
            {chartFilter === "discount" ? "giá trị giảm giá" : "lượt sử dụng"}
          </h3>
          <select
            className="border rounded-lg px-3 py-2"
            value={chartFilter}
            onChange={(e) => setChartFilter(e.target.value)}
          >
            <option value="discount">Giá trị giảm giá</option>
            <option value="uses">Lượt sử dụng</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dashboardData.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Giá trị giảm giá") {
                  return formatPrice(value);
                }
                return `${value} lượt`;
              }}
            />
            <Legend />
            <Bar
              dataKey={
                chartFilter === "discount" ? "total_discount" : "total_uses"
              }
              fill={chartFilter === "discount" ? "#8884d8" : "#82ca9d"}
              name={
                chartFilter === "discount" ? "Giá trị giảm giá" : "Lượt sử dụng"
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Danh sách khuyến mãi</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm kiếm mã giảm giá"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort("coupon_code")}
                    className="flex items-center font-bold hover:text-blue-600"
                  >
                    Mã giảm giá
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">Loại</th>
                <th className="p-4 text-left">Giá trị</th>
                <th className="p-4 text-left">Thời gian</th>
                <th className="p-4 text-left">Điều kiện</th>
                <th className="p-4 text-left">Lượt dùng</th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center font-bold hover:text-blue-600"
                  >
                    Trạng thái
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPromotions.map((promotion) => (
                <tr key={promotion.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{promotion.coupon_code}</td>
                  <td className="p-4">
                    {promotion.coupon_type === "percent"
                      ? "Phần trăm"
                      : "Số tiền cố định"}
                  </td>
                  <td className="p-4">
                    {promotion.coupon_type === "percent"
                      ? `${promotion.coupon_value}%`
                      : formatPrice(promotion.coupon_value)}
                  </td>
                  <td className="p-4">
                    {new Date(promotion.coupon_start_date).toLocaleDateString()}{" "}
                    - {new Date(promotion.coupon_end_date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {promotion.coupon_min_spend > 0 && (
                      <div>
                        Tối thiểu: {formatPrice(promotion.coupon_min_spend)}
                      </div>
                    )}
                    {promotion.coupon_max_spend > 0 && (
                      <div>
                        Tối đa: {formatPrice(promotion.coupon_max_spend)}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div>{promotion.total_uses} lượt</div>
                    {promotion.coupon_uses_per_coupon > 0 && (
                      <div className="text-sm text-gray-500">
                        Còn lại:{" "}
                        {promotion.coupon_uses_per_coupon -
                          promotion.total_uses}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        promotion.status === "active"
                          ? "bg-green-100 text-green-800"
                          : promotion.status === "expired"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {promotion.status === "active"
                        ? "Đang hoạt động"
                        : promotion.status === "expired"
                        ? "Hết hạn"
                        : "Vô hiệu"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="p-1 hover:text-blue-600"
                        onClick={() => handleEditClick(promotion)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:text-red-600"
                        onClick={() => deleteVoucher(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} đến{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedPromotions.length)}{" "}
            trong số {sortedPromotions.length} khuyến mãi
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <AddVoucherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVoucherSuccess}
      />
      <EditVoucherModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleAddVoucherSuccess}
        voucherData={selectedVoucher}
      />
    </div>
  );
}
