import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tab } from "rizzui";
import {
  Search,
  ArrowUpDown,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { formatPrice } from "../../../utils/FormatPrice";

const COLOR_MAP = {
  xám: "#808080",
  đen: "#000000",
  trắng: "#FFFFFF",
  đỏ: "#FF0000",
  vàng: "#FFFF00",
  xanh: "#0000FF",
  hồng: "#FFC0CB",
  tím: "#800080",
  cam: "#FFA500",
  nâu: "#A52A2A",
  "xanh lá": "#008000",
  "xanh dương": "#00FFFF",
};
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const ITEMS_PER_PAGE = 10;
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "revenue",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINT}/api/product/sku/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProductData(data.skus);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const filterProducts = (items) => {
    if (!searchTerm.trim() || !items) return items;

    const searchTermLower = searchTerm.toLowerCase().trim();
    return items.filter((product) =>
      product.name.toLowerCase().includes(searchTermLower)
    );
  };

  const sortProducts = (items) => {
    if (!sortConfig.key || !items) return items;

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

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!productData)
    return <div className="text-center py-4">No data available</div>;

  const filteredProducts = filterProducts(productData.skuList);
  const sortedProducts = sortProducts(filteredProducts);
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {productData.product.name}
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold">Tổng hàng tồn</h3>
          <p className="text-xl">{productData.product.total_stock}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold">Tổng đã bán</h3>
          <p className="text-xl">{productData.product.total_sold}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold">Tổng doanh thu</h3>
          <p className="text-xl">
            {formatPrice(productData.product.total_revenue)}
          </p>
        </div>
      </div>

      <Tab>
        <Tab.List className="flex justify-between mb-4">
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Phân bố kích thước
          </Tab.ListItem>
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Phân bố màu sắc
          </Tab.ListItem>
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Doanh số theo kích thước
          </Tab.ListItem>
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Doanh số theo màu sắc
          </Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={productData.stats.sizeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {productData.stats.sizeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Tab.Panel>
          <Tab.Panel className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart
                className="bg-gray"
              >
                <Pie
                  data={productData.stats.colorDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#82ca9d"
                  label
                >
                  {productData.stats.colorDistribution.map((entry, index) => (
                    <Cell
                      stroke="#333333" // Thêm viền màu đậm
                      strokeWidth={1} // Độ dày của viền
                      key={`cell-${entry.name}`}
                      fill={COLOR_MAP[entry.name.toLowerCase()] || "#CCCCCC"} // fallback to gray if color not found
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Tab.Panel>
          <Tab.Panel className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productData.stats.salesBySize}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Tab.Panel>
          <Tab.Panel className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productData.stats.salesByColor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Tab.Panel>
        </Tab.Panels>
      </Tab>

      <div className="mt-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">SKU List</h2>
          <div className="flex">
            <Search className="mr-2 text-gray-500 my-auto" />
            <input
              type="text"
              placeholder="Search SKUs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  SKU <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  Giá
                  <ArrowUpDown className="inline ml-2" />
                </th>{" "}
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  Màu <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("stock_quantity")}
                >
                  Size <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("sold_quantity")}
                >
                  Hàng tồn <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("sold_quantity")}
                >
                  Đã bán <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("revenue")}
                >
                  Doanh thu <ArrowUpDown className="inline ml-2" />
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((sku) => (
                <tr key={sku.id}>
                  <td className="px-4 py-2">{sku.name}</td>
                  <td className="px-4 py-2">{formatPrice(sku.price)}</td>
                  <td className="px-4 py-2">{sku.color}</td>
                  <td className="px-4 py-2">{sku.size}</td>
                  <td className="px-4 py-2">{sku.stock_quantity}</td>
                  <td className="px-4 py-2">{sku.sold_quantity}</td>
                  <td className="px-4 py-2">{formatPrice(sku.revenue)}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-500 p-1 mr-2"
                      onClick={() => navigate(`/sku/${sku.id}/edit`)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-500">
            Xem {(currentPage - 1) * ITEMS_PER_PAGE + 1} tới{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)}{" "}
            trong {sortedProducts.length} SKUs
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
    </div>
  );
};

export default ProductDetails;
