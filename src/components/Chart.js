import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedOrderMonth, setSelectedOrderMonth] = useState('All');

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleOrderMonthChange = (e) => {
    setSelectedOrderMonth(e.target.value);
  };

  // Sample data for line chart (monthly revenue)
  const lineData = [
    { month: 'January', revenue: 3000 },
    { month: 'February', revenue: 2500 },
    { month: 'March', revenue: 2000 },
    { month: 'April', revenue: 4000 },
    { month: 'May', revenue: 3500 },
    { month: 'June', revenue: 5000 },
    { month: 'July', revenue: 4500 },
  ];

  // Sample data for bar chart (products sold)
  const barData = [
    { product: 'Áo', sales: 500 },
    { product: 'Quần', sales: 300 },
    { product: 'Giày', sales: 200 },
    { product: 'Phụ kiện', sales: 150 },
  ];

  // Sample data for order count chart
  const orderData = [
    { month: 'January', orders: 120 },
    { month: 'February', orders: 110 },
    { month: 'March', orders: 95 },
    { month: 'April', orders: 130 },
    { month: 'May', orders: 140 },
    { month: 'June', orders: 160 },
    { month: 'July', orders: 150 },
  ];

  // Sample data for best-selling products with ratings
  const bestSellingProducts = [
    { name: 'Áo', sold: 500, avgRating: 4.5 },
    { name: 'Quần', sold: 300, avgRating: 4.0 },
    { name: 'Giày', sold: 200, avgRating: 3.8 },
    { name: 'Phụ kiện', sold: 150, avgRating: 4.2 },
  ];

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex w-full space-x-6 mt-10">

        {/* Doanh Thu (left side 50%) */}
        <div className="bg-white p-4 rounded-lg shadow-md w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Doanh Thu Hàng Tháng</h3>
            <select
              className="p-2 border rounded"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              <option value="All">Tất cả các tháng</option>
              {lineData.map((item) => (
                <option key={item.month} value={item.month}>
                  {item.month}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={600}>
            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 flex flex-col space-y-6">
          <div className="flex justify-between">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Số Lượng Sản Phẩm Bán Ra</h3>
                <select
                  className="p-2 border rounded"
                  value={selectedProduct}
                  onChange={handleProductChange}
                >
                  <option value="All">Tất cả sản phẩm</option>
                  {barData.map((item) => (
                    <option key={item.product} value={item.product}>
                      {item.product}
                    </option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="101%" height={300}>
                <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Số Lượng Đơn Hàng Hàng Tháng</h3>
                <select
                  className="p-2 border rounded"
                  value={selectedOrderMonth}
                  onChange={handleOrderMonthChange}
                >
                  <option value="All">Tất cả các tháng</option>
                  {orderData.map((item) => (
                    <option key={item.month} value={item.month}>
                      {item.month}
                    </option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="101%" height={300}>
                <BarChart data={orderData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom section: Best Selling Products Table */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4">Sản Phẩm Bán Chạy</h3>
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Sản Phẩm</th>
                  <th className="px-4 py-2 text-left">Số Lượng Đã Bán</th>
                  <th className="px-4 py-2 text-left">Đánh Giá Trung Bình</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingProducts.map((product) => (
                  <tr key={product.name} className="border-b">
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.sold}</td>
                    <td className="px-4 py-2">{product.avgRating} ⭐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
