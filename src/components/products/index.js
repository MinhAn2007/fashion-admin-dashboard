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
import ExcelJS from "exceljs";

import EditProductModal from "./EditModal";
const ITEMS_PER_PAGE = 10;

const ProductDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [chartFilter, setChartFilter] = useState("sales");
  const navigate = useNavigate();

  const [productStats, setProductStats] = useState({});
  const [revenueStats, setRevenueStats] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [salesByTime, setSalesByTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dateRange, setDateRange] = useState(
    moment.range(
      moment().subtract(1, "year").startOf("day"),
      moment().endOf("day")
    )
  );

  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const fetchData = async (startDate, endDate) => {
    try {
      setLoading(true);
      const [productRes, revenueRes] = await Promise.all([
        fetch(
          `${API_ENDPOINT}/api/productStats?startDate=${startDate.format(
            "YYYY-MM-DD"
          )}&endDate=${endDate.format("YYYY-MM-DD")}`
        ),
        fetch(
          `${API_ENDPOINT}/api/productRevenueStats?startDate=${startDate.format(
            "YYYY-MM-DD"
          )}&endDate=${endDate.format("YYYY-MM-DD")}`
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
      setInventory(revenueData.getInventory);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange.start, dateRange.end);
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
      setInventory(revenueData.getInventory);
    } catch (err) {
      setError(err.message);
    }
  };
  const exportToExcel = () => {
    if (!revenueStats || !productStats || !salesByTime) return;
  
    // Create a new workbook
    const wb = new ExcelJS.Workbook();
  
    // Utility function to create a styled header
    const createStyledHeader = (worksheet, title, dateRange) => {
      // Merge cells for main title and center
      worksheet.mergeCells('A1:F4');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = title;
      titleCell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle', 
        wrapText: true 
      };
      titleCell.font = { 
        bold: true, 
        size: 16, 
        color: { argb: 'FFFFFF' } 
      };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
  
      // Date range
      worksheet.mergeCells('A5:F5');
      const dateCell = worksheet.getCell('A5');
      dateCell.value = `Thời gian: ${dateRange || moment().format("DD/MM/YYYY")}`;
      dateCell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      dateCell.font = { italic: true };
    };
  
    // Utility function to create a styled data header
    const createDataHeader = (worksheet, headers) => {
      headers.forEach((header, index) => {
        const cell = worksheet.getCell(7, index + 1);
        cell.value = header;
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        cell.font = { 
          bold: true, 
          color: { argb: 'FFFFFF' } 
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    };
  
    // Utility function to add data rows with borders
    const addDataRows = (worksheet, data) => {
      data.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = worksheet.getCell(8 + rowIndex, colIndex + 1);
          cell.value = value;
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    };
  
    // Utility function to create footer
    const createFooter = (worksheet, startRow) => {
      const footerRows = [
        [],
        ["Người lập báo cáo:", "", "", "", "Người duyệt:"],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        [`Ngày lập: ${moment().format("DD/MM/YYYY")}`]
      ];
  
      footerRows.forEach((footerRow, index) => {
        footerRow.forEach((value, colIndex) => {
          const cell = worksheet.getCell(startRow + index, colIndex + 1);
          cell.value = value;
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
        });
      });
    };
  
    // 1. Tổng quan sản phẩm (Summary)
    const summarySheet = wb.addWorksheet('Tổng Quan');
    createStyledHeader(summarySheet, "TỔNG QUAN SẢN PHẨM");
  
    const summaryHeaders = ["Chỉ số", "Giá trị"];
    createDataHeader(summarySheet, summaryHeaders);
  
    const summaryData = [
      ["Tổng số sản phẩm", revenueStats.length.toString()],
      [
        "Tổng thành tiền",
        formatPrice(revenueStats.reduce((sum, item) => sum + item.revenue, 0)),
      ],
      [
        "Tổng số lượng bán",
        revenueStats
          .reduce((sum, item) => sum + item.sold_quantity, 0)
          .toString(),
      ],
      [
        "Tổng tồn kho",
        revenueStats
          .reduce((sum, item) => sum + item.stock_quantity, 0)
          .toString(),
      ],
    ];
    addDataRows(summarySheet, summaryData);
    createFooter(summarySheet, summaryData.length + 9);
  
    // 2. Top sản phẩm tồn kho (Stock)
    const stockSheet = wb.addWorksheet('Top Tồn Kho');
    createStyledHeader(stockSheet, "BÁO CÁO TOP SẢN PHẨM TỒN KHO");
  
    const stockHeaders = ["Xếp hạng", "Tên sản phẩm", "Số lượng tồn", "Giá trị tồn"];
    createDataHeader(stockSheet, stockHeaders);
  
    const stockData = mostStock.map((item, index) => [
      index + 1,
      item.name,
      item.stock_quantity,
      formatPrice(item.stock_quantity * item.price)
    ]);
    addDataRows(stockSheet, stockData);
    createFooter(stockSheet, stockData.length + 9);
  
    // 3. Top doanh thu (Revenue)
    const revenueSheet = wb.addWorksheet('Top Doanh Thu');
    createStyledHeader(revenueSheet, "BÁO CÁO TOP THÀNH TIỀN");
  
    const revenueHeaders = ["Xếp hạng", "Tên sản phẩm", "Số lượng bán", "Thành tiền"];
    createDataHeader(revenueSheet, revenueHeaders);
  
    const revenueData = mostRevenue.map((item, index) => [
      index + 1,
      item.name,
      item.sold_quantity,
      formatPrice(item.revenue)
    ]);
    addDataRows(revenueSheet, revenueData);
    createFooter(revenueSheet, revenueData.length + 9);
  
    // 4. Bán hàng theo thời gian (Sales by Time)
    const timeSheet = wb.addWorksheet('Bán Theo Thời Gian');
    createStyledHeader(timeSheet, "BÁO CÁO BÁN HÀNG THEO THỜI GIAN");
  
    const timeHeaders = ["Mã sản phẩm", "Tên sản phẩm", "Số lượng bán", "Ngày bán đầu", "Ngày bán cuối", "Doanh thu"];
    createDataHeader(timeSheet, timeHeaders);
  
    const timeData = salesByTime.map((item) => [
      item.product_id,
      item.product_name,
      item.total_sold_quantity,
      moment(item.first_sale_date).format("DD/MM/YYYY"),
      moment(item.last_sale_date).format("DD/MM/YYYY"),
      formatPrice(item.total_revenue)
    ]);
    addDataRows(timeSheet, timeData);
    createFooter(timeSheet, timeData.length + 9);
  
    // 5. Chi tiết sản phẩm (Product Details)
    const detailSheet = wb.addWorksheet('Chi Tiết Sản Phẩm');
    createStyledHeader(detailSheet, "CHI TIẾT SẢN PHẨM");
  
    const detailHeaders = ["Mã sản phẩm", "Tên sản phẩm", "Tồn kho", "Đã bán", "Doanh thu", "Trạng thái"];
    createDataHeader(detailSheet, detailHeaders);
  
    const detailData = revenueStats.map((product) => [
      product.id,
      product.name,
      product.stock_quantity,
      product.sold_quantity,
      formatPrice(product.revenue),
      product.status === 1 ? "Đang kinh doanh" : "Ngừng kinh doanh"
    ]);
    addDataRows(detailSheet, detailData);
    createFooter(detailSheet, detailData.length + 9);
  
    // 6. Báo cáo hàng đã nhập (Inventory)
    const inventorySheet = wb.addWorksheet('Hàng Đã Nhập');
    createStyledHeader(inventorySheet, "BÁO CÁO HÀNG ĐÃ NHẬP THEO THỜI GIAN");
  
    const inventoryHeaders = ["Mã sản phẩm", "Tên sản phẩm", "Số lượng nhập", "Ngày nhập"];
    createDataHeader(inventorySheet, inventoryHeaders);
  
    const inventoryData = inventory.map((item) => [
      item.id,
      item.name,
      item.total_stock,
      moment(item.created_at).format("DD/MM/YYYY")
    ]);
    addDataRows(inventorySheet, inventoryData);
    createFooter(inventorySheet, inventoryData.length + 9);
  
    // Auto-adjust column widths for readability
    [summarySheet, stockSheet, revenueSheet, timeSheet, detailSheet, inventorySheet].forEach(sheet => {
      sheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          maxLength = Math.max(maxLength, columnLength);
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });
    });
  
    // Save the workbook
    wb.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Bao_Cao_San_Pham_${moment().format("DD.MM.YYYY")}.xlsx`;
      link.click();
    });
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
      fetchData(dateRange.start, dateRange.end);
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
  console.log("inventory", inventory);

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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            Biểu đồ số lượng sản phẩm đã bán theo thời gian
          </h3>
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
