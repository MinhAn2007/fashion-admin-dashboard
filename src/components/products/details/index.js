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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const ITEMS_PER_PAGE = 10;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "Sample Product",
    stock_quantity: 100,
  });
  const [skuStats, setSkuStats] = useState({
    sizeDistribution: [],
    colorDistribution: [],
    salesBySize: [],
    salesByColor: [],
    priceDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

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

  const mockProductData = [
    {
      id: "1",
      name: "Product 1",
      stock_quantity: 100,
      sold_quantity: 20,
      revenue: 5000,
      price: 100,
    },
    {
      id: "2",
      name: "Product 2",
      stock_quantity: 200,
      sold_quantity: 50,
      revenue: 10000,
      price: 200,
    },
  ];

  const filteredProducts = filterProducts(mockProductData);
  const sortedProducts = sortProducts(filteredProducts);
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    // Mock SKU data
    const mockSkuData = [
      {
        size_attribute_id: "S",
        color_attribute_id: "Red",
        quantity: 50,
        sold: 30,
        price: 200,
      },
      {
        size_attribute_id: "M",
        color_attribute_id: "Blue",
        quantity: 30,
        sold: 20,
        price: 250,
      },
      {
        size_attribute_id: "L",
        color_attribute_id: "Green",
        quantity: 20,
        sold: 10,
        price: 300,
      },
    ];

    const processSizeStats = (skus) => {
      const sizeQuantity = {};
      const sizeSales = {};

      skus.forEach((sku) => {
        if (!sizeQuantity[sku.size_attribute_id]) {
          sizeQuantity[sku.size_attribute_id] = 0;
          sizeSales[sku.size_attribute_id] = 0;
        }
        sizeQuantity[sku.size_attribute_id] += sku.quantity;
        sizeSales[sku.size_attribute_id] += sku.sold;
      });

      return {
        quantity: Object.entries(sizeQuantity).map(([size, value]) => ({
          name: size,
          value,
        })),
        sales: Object.entries(sizeSales).map(([size, value]) => ({
          name: size,
          value,
        })),
      };
    };

    const processColorStats = (skus) => {
      const colorQuantity = {};
      const colorSales = {};

      skus.forEach((sku) => {
        if (!colorQuantity[sku.color_attribute_id]) {
          colorQuantity[sku.color_attribute_id] = 0;
          colorSales[sku.color_attribute_id] = 0;
        }
        colorQuantity[sku.color_attribute_id] += sku.quantity;
        colorSales[sku.color_attribute_id] += sku.sold;
      });

      return {
        quantity: Object.entries(colorQuantity).map(([color, value]) => ({
          name: color,
          value,
        })),
        sales: Object.entries(colorSales).map(([color, value]) => ({
          name: color,
          value,
        })),
      };
    };

    const processPriceStats = (skus) => {
      return skus.map((sku, index) => ({
        name: `SKU ${index + 1}`,
        value: sku.price,
      }));
    };

    const sizeStats = processSizeStats(mockSkuData);
    const colorStats = processColorStats(mockSkuData);
    const priceStats = processPriceStats(mockSkuData);

    setSkuStats({
      sizeDistribution: sizeStats.quantity,
      colorDistribution: colorStats.quantity,
      salesBySize: sizeStats.sales,
      salesByColor: colorStats.sales,
      priceDistribution: priceStats,
    });

    setLoading(false);
  }, [id]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">{product.name}</h1>
      <Tab>
        <Tab.List className="flex justify-between mb-4">
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Size Distribution
          </Tab.ListItem>
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Color Distribution
          </Tab.ListItem>
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Sales by Size
          </Tab.ListItem>
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Sales by Color
          </Tab.ListItem>
          <Tab.ListItem
            activeClassName="bg-gray-500 text-white"
            className="p-3 cursor-pointer hover:text-blue-500 transition-colors"
          >
            Price Distribution
          </Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={skuStats.sizeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {skuStats.sizeDistribution.map((entry, index) => (
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
              <PieChart>
                <Pie
                  data={skuStats.colorDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#82ca9d"
                  label
                >
                  {skuStats.colorDistribution.map((entry, index) => (
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
              <BarChart data={skuStats.salesBySize}>
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
              <BarChart data={skuStats.salesByColor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Tab.Panel>
          <Tab.Panel className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={skuStats.priceDistribution}>
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
          <h2 className="text-xl font-bold mb-4">SKU List</h2>
          <div className="flex">
            <Search className="mr-2 text-gray-500 my-auto" />
            <input
              type="text"
              placeholder="Search Products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 ">
          <div className="flex items-center mb-4 "></div>
          <table className="min-w-full">
            <thead className="bg-gray-100 text-left mx-auto">
              <tr>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  SKU
                  <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  Giá
                  <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("stock_quantity")}
                >
                  Stock Quantity
                  <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("sold_quantity")}
                >
                  Sold Quantity
                  <ArrowUpDown className="inline ml-2" />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("revenue")}
                >
                  Revenue
                  <ArrowUpDown className="inline ml-2" />
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.price}</td>
                  <td className="px-4 py-2">{product.stock_quantity}</td>
                  <td className="px-4 py-2">{product.sold_quantity}</td>
                  <td className="px-4 py-2">{product.revenue}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-500 p-1 mr-2"
                      onClick={() => navigate(`/product/${product.id}/edit`)}
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
        </div>{" "}
      </div>
    </div>
  );
};

export default ProductDetails;
