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
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Eye,
} from "lucide-react";

import { formatPrice } from "../../utils/FormatPrice";
import { Link, useNavigate } from "react-router-dom";
import OrderDashboardFilter from "../../utils/Filter";
import moment from "moment";
import * as XLSX from "xlsx";

import EditProductModal from "./EditModal";
const ITEMS_PER_PAGE = 10;

const ProductDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [chartFilter, setChartFilter] = useState("sales");
  const [chartTimeRange, setChartTimeRange] = useState("all");
  const navigate = useNavigate();

  const [productStats, setProductStats] = useState({});
  const [revenueStats, setRevenueStats] = useState([]);
  const [salesByTime, setSalesByTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productRes, revenueRes] = await Promise.all([
        fetch(`${API_ENDPOINT}/api/productStats`),
        fetch(`${API_ENDPOINT}/api/productRevenueStats`),
      ]);

      if (!productRes.ok || !revenueRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const productData = await productRes.json();
      const revenueData = await revenueRes.json();

      setProductStats(productData);
      setRevenueStats(revenueData.productRevenueStats);
      setSalesByTime(revenueData.salesByTimeQuery);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchDashboardData = async (startDate, endDate) => {
    try {
      const [productRes, revenueRes] = await Promise.all([
        fetch(
          `${API_ENDPOINT}/api/productStats?startDate=${startDate}&endDate=${endDate}`
        ),
        fetch(
          `${API_ENDPOINT}/api/productRevenueStats?startDate=${startDate}&endDate=${endDate}`
        ),
      ]);

      if (!productRes.ok || !revenueRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const productData = await productRes.json();
      const revenueData = await revenueRes.json();

      setProductStats(productData);
      setRevenueStats(revenueData.productRevenueStats);
      setSalesByTime(revenueData.salesByTimeQuery);
    } catch (err) {
      setError(err.message);
    }
  };
  const exportToExcel = () => {
    if (!revenueStats.length) return;

    // Prepare Product Data Sheet
    const productSheet = revenueStats.map((product) => ({
      "Tên sản phẩm": product.name,
      "Tồn kho": product.stock_quantity,
      "Đã bán": product.sold_quantity,
      "Thành tiền": product.revenue,
      "Trạng thái":
        product.status === 1 ? "Đang kinh doanh" : "Ngừng kinh doanh",
    }));

    // Prepare Top Stock Products Sheet
    const topStockSheet = mostStock.map((product, index) => ({
      "Xếp hạng": index + 1,
      "Tên sản phẩm": product.name,
      "Số lượng tồn": product.stock_quantity,
    }));

    // Prepare Top Revenue Products Sheet
    const topRevenueSheet = mostRevenue.map((product, index) => ({
      "Xếp hạng": index + 1,
      "Tên sản phẩm": product.name,
      "Doanh thu": product.revenue,
    }));

    const salesByTimeSheet = salesByTime.map((item) => ({
      "Mã sản phẩm": item.product_id,
      "Tên sản phẩm": item.product_name,
      "Số lượng bán": item.total_sold_quantity,
      "Ngày bán đầu": moment(item.first_sale_date).format("DD/MM/YYYY"),
      "Ngày bán cuối": moment(item.last_sale_date).format("DD/MM/YYYY"),
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(productSheet),
      "Danh Sách Sản Phẩm"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(topStockSheet),
      "Top Sản Phẩm Tồn Kho"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(topRevenueSheet),
      "Top Sản Phẩm Doanh Thu"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(salesByTimeSheet),
      "Sản Phẩm Bán Theo Thời Gian"
    );

    // Generate Excel file
    XLSX.writeFile(
      wb,
      `Bao_Cao_San_Pham_${moment().format("DD-MM-YYYY")}.xlsx`
    );
  };

  const filterProducts = (items) => {
    if (!searchTerm.trim()) return items;

    const searchTermLower = searchTerm.toLowerCase().trim();
    return items.filter((product) =>
      product.name.toLowerCase().includes(searchTermLower)
    );
  };

  const sortProducts = (items) => {
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

  // Apply filters, sorting, and pagination in sequence
  const filteredProducts = filterProducts(revenueStats);
  const sortedProducts = sortProducts(filteredProducts);
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const mostStock = revenueStats
    .sort((a, b) => b.stock_quantity - a.stock_quantity)
    .slice(0, 5);

  const mostRevenue = revenueStats
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const openEditProduct = (product) => {
    setSelectedProduct(product);
    setIsOpenEditModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenEditModal(false);
    setSelectedProduct(null);
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/api/product/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Xóa sản phẩm thất bại");
        throw new Error("Failed to delete product");
      }
      alert("Xóa sản phẩm thành công");
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <OrderDashboardFilter
          onDateRangeChange={({ startDate, endDate }) =>
            fetchDashboardData(startDate, endDate)
          }
        />
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            disabled={loading}
          >
            Xuất Excel
          </button>
          <Link to="/new-product">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Top sản phẩm tồn kho nhiều
            </h3>
            <Warehouse className="text-gray-500" />
          </div>
          <div className="space-y-4">
            {mostStock.map((product, index) => (
              <div
                key={product.id}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="text-gray-600">#{index + 1}</span>
                  <span className="ml-2 font-medium">{product.name}</span>
                </div>
                <span className="text-blue-600 font-semibold">
                  {product.stock_quantity} sản phẩm
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Thành tiền</h3>
            <DollarSign className="text-yellow-500" />
          </div>
          <div className="space-y-4">
            {mostRevenue.map((product, index) => (
              <div
                key={product.id}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="text-gray-600">#{index + 1}</span>
                  <span className="ml-2 font-medium">{product.name}</span>
                </div>
                <span className="text-green-600 font-semibold">
                  {formatPrice(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            Biểu đồ {chartFilter === "sales" ? "doanh số" : "Thành tiền"}
          </h3>
          <div className="flex gap-4">
            <select
              className="border rounded-lg px-3 py-2"
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
            >
              <option value="sales">Doanh số</option>
              <option value="revenue">Thành tiền</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2"
              value={chartTimeRange}
              onChange={(e) => setChartTimeRange(e.target.value)}
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={productStats.salesByTime}
            layout="vertical"
            margin={{ top: 6, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid />
            <XAxis
              type="number"
              tickFormatter={(value) => formatPrice(value)}
            />
            <YAxis dataKey="period" type="category" />
            <Tooltip
              formatter={(value) => [
                formatPrice(value),
                chartFilter !== "revenue" ? "Quantity" : "Revenue",
              ]}
            />
            <Legend />
            <Bar
              dataKey={
                chartFilter !== "revenue" ? "total_quantity" : "total_revenue"
              }
              fill={chartFilter !== "revenue" ? "#82ca9d" : "#8884d8"}
              name={chartFilter !== "revenue" ? "Quantity" : "Revenue"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Danh sách sản phẩm</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm kiếm sản phẩm"
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
                    onClick={() => handleSort("name")}
                    className="flex items-center font-bold hover:text-blue-600"
                  >
                    Tên sản phẩm
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort("stock_quantity")}
                    className="flex items-center font-bold hover:text-blue-600"
                  >
                    Tồn kho
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort("sold_quantity")}
                    className="flex items-center font-bold hover:text-blue-600"
                  >
                    Đã bán
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort("revenue")}
                    className="flex items-center font-bold hover:text-blue-600"
                  >
                    Thành tiền
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
                <th className="p-4 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{product.name}</td>
                  <td
                    className={`p-4 ${
                      product.stock_quantity > 500
                        ? "text-red-600 font-bold"
                        : ""
                    }`}
                  >
                    {product.stock_quantity}
                  </td>
                  <td className="p-4">{product.sold_quantity}</td>
                  <td className="p-4">{formatPrice(product.revenue)}</td>
                  <td className="p-4">
                    {product.status === 1
                      ? "Đang kinh doanh"
                      : "Ngừng kinh doanh"}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="p-1 hover:text-blue-600"
                        onClick={() => openEditProduct(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 hover:text-red-600"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 hover:text-green-600"
                        onClick={() => navigate(`/detail/${product.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} đến{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)}{" "}
            trong số {sortedProducts.length} sản phẩm
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 py-2 rounded-lg bg-gray-100">
              {currentPage} / {totalPages}
            </span>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <EditProductModal
        isOpen={isOpenEditModal}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductDashboard;
