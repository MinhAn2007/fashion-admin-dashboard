import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const Chart = () => {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Sample line chart data for monthly revenue
  const lineData = [
    { month: 'January', revenue: 3000 },
    { month: 'February', revenue: 2500 },
    { month: 'March', revenue: 2000 },
    { month: 'April', revenue: 4000 },
    { month: 'May', revenue: 3500 },
    { month: 'June', revenue: 5000 },
    { month: 'July', revenue: 4500 },
  ];

  // Sample bar chart data for products sold
  const barData = [
    { product: 'Áo', sales: 500 },
    { product: 'Quần', sales: 300 },
    { product: 'Giày', sales: 200 },
    { product: 'Phụ kiện', sales: 150 },
  ];

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Filters */}
      <div className="flex gap-4">
        <select
          className="p-2 border rounded"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          <option value="All">Tất cả các tháng</option>
          <option value="January">Tháng 1</option>
          <option value="February">Tháng 2</option>
          <option value="March">Tháng 3</option>
          <option value="April">Tháng 4</option>
          <option value="May">Tháng 5</option>
          <option value="June">Tháng 6</option>
          <option value="July">Tháng 7</option>
        </select>

        <select
          className="p-2 border rounded"
          value={selectedProduct}
          onChange={handleProductChange}
        >
          <option value="All">Tất cả sản phẩm</option>
          <option value="Áo">Áo</option>
          <option value="Quần">Quần</option>
          <option value="Giày">Giày</option>
          <option value="Phụ kiện">Phụ kiện</option>
        </select>
      </div>

      {/* Charts */}
      <div className="space-y-6 flex w-full justify-center">
        <div className="bg-white p-4 rounded-lg shadow-md w-2/5">
          <h3 className="text-center mb-4 font-semibold">Doanh Thu Hàng Tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
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

        <div className="bg-white p-4 rounded-lg shadow-md w-2/5">
          <h3 className="text-center mb-4 font-semibold">Số Lượng Sản Phẩm Bán Ra</h3>
          <ResponsiveContainer width="100%" height={300}>
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
      </div>
    </div>
  );
}

export default Chart;
