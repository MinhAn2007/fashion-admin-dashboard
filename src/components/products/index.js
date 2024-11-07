import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Search, Plus, Edit2, Trash2, ArrowUpDown, TrendingUp, DollarSign, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const ITEMS_PER_PAGE = 10;
const CHART_ITEMS = 10;

const ProductDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [chartFilter, setChartFilter] = useState('sales'); // 'sales' hoặc 'revenue'
  const [chartTimeRange, setChartTimeRange] = useState('all'); // 'week', 'month', 'year', 'all'

  // Mock data generator để test với nhiều dữ liệu
  const generateMockData = () => {
    const products = [];
    for (let i = 1; i <= 100; i++) {
      products.push({
        id: i,
        name: `Sản phẩm ${i}`,
        price: Math.floor(Math.random() * 20000000) + 1000000,
        stock: Math.floor(Math.random() * 200),
        sales: Math.floor(Math.random() * 500),
        revenue: 0, // Sẽ được tính toán
      });
    }
    // Tính revenue
    return products.map(product => ({
      ...product,
      revenue: product.price * product.sales
    }));
  };

  const sampleData = {
    products: generateMockData()
  };

  // Xử lý sắp xếp
  const sortProducts = (products) => {
    if (!sortConfig.key) return products;
    return [...products].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    return sortProducts(sampleData.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [searchTerm, sortConfig]);

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (chartFilter === 'sales') {
        return b.sales - a.sales;
      }
      return b.revenue - a.revenue;
    });

    return sortedProducts.slice(0, CHART_ITEMS).reverse();
  }, [filteredProducts, chartFilter]);

  // Top sản phẩm
  const topProducts = useMemo(() => {
    return [...filteredProducts]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredProducts]);

  const topSellingProducts = useMemo(() => {
    return [...filteredProducts]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);
  });

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
    return value.toString();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top sản phẩm tồn kho nhiều</h3>
            <ArrowUpDown className="text-gray-500" />
          </div>
          <div className="space-y-4">
            {topSellingProducts.map((product, index) => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <span className="text-gray-600">#{index + 1}</span>
                  <span className="ml-2 font-medium">{product.name}</span>
                </div>
                <span className="text-blue-600 font-semibold">{product.stock} sản phẩm</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top doanh thu</h3>
            <DollarSign className="text-yellow-500" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <span className="text-gray-600">#{index + 1}</span>
                  <span className="ml-2 font-medium">{product.name}</span>
                </div>
                <span className="text-green-600 font-semibold">
                  {formatValue(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biểu đồ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Biểu đồ {chartFilter === 'sales' ? 'doanh số' : 'doanh thu'}</h3>
            <div className="flex gap-4">
              <select 
                className="border rounded-lg px-3 py-2"
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
              >
                <option value="sales">Doanh số</option>
                <option value="revenue">Doanh thu</option>
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
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name"
                width={100}
              />
              <Tooltip 
                formatter={(value) => [formatValue(value), chartFilter === 'sales' ? 'Số lượng' : 'Doanh thu']}
              />
              <Legend />
              <Bar 
                dataKey={chartFilter}
                fill={chartFilter === 'sales' ? "#82ca9d" : "#8884d8"}
                name={chartFilter === 'sales' ? "Số lượng bán" : "Doanh thu"}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Biểu đồ tồn kho</h3>
            <div className="flex gap-4">
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
            {filteredProducts.length > 0 ? (
              <LineChart
                data={filteredProducts.slice(0, 10)} // Hiển thị 10 sản phẩm tồn kho nhiều nhất
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  type="number"
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip 
                  formatter={(value) => [formatValue(value), 'Tồn kho']}
                />
                <Legend />
                <Line 
                  dataKey="stock"
                  stroke="#82ca9d"
                  name="Tồn kho"
                />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">Không có dữ liệu để hiển thị</span>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Danh sách sản phẩm</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <button onClick={() => handleSort('name')} className="flex items-center font-bold hover:text-blue-600">
                    Tên sản phẩm
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button onClick={() => handleSort('price')} className="flex items-center font-bold hover:text-blue-600">
                    Giá
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button onClick={() => handleSort('stock')} className="flex items-center font-bold hover:text-blue-600">
                    Tồn kho
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button onClick={() => handleSort('sales')} className="flex items-center font-bold hover:text-blue-600">
                    Đã bán
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button onClick={() => handleSort('revenue')} className="flex items-center font-bold hover:text-blue-600">
                    Doanh thu
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
                  <td className="p-4">{product.price.toLocaleString()}đ</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">{product.sales}</td>
                  <td className="p-4">{product.revenue.toLocaleString()}đ</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-1 hover:text-blue-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        {/* Phân trang */}
        <div className="p-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} đến {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} trong số {filteredProducts.length} sản phẩm
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 py-2 rounded-lg bg-gray-100">
              {currentPage} / {totalPages}
            </span>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;