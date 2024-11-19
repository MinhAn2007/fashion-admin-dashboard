import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar } from 'lucide-react';
import StatsCard from '../StatsCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SalesDashboard = () => {
  const revenueData = [
    { month: 'Jan', revenue: 4000, growth: 0 },
    { month: 'Feb', revenue: 4500, growth: 12.5 },
    { month: 'Mar', revenue: 5100, growth: 13.3 },
    { month: 'Apr', revenue: 4800, growth: -5.9 },
    { month: 'May', revenue: 5500, growth: 14.6 },
    { month: 'Jun', revenue: 6000, growth: 9.1 }
  ];

  const salesByCategory = [
    { name: 'Electronics', value: 35 },
    { name: 'Clothing', value: 25 },
    { name: 'Food', value: 20 },
    { name: 'Others', value: 20 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value * 1000000);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Báo cáo doanh thu</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
          <Calendar className="w-4 h-4" />
          Chọn khoảng thời gian
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap justify-between gap-4">
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(6000)}
          color="bg-blue-100"
        />
        <StatsCard
          title="Đơn hàng"
          value="245"
          color="bg-green-100"
        />
        <StatsCard
          title="Giá trị trung bình"
          value={formatCurrency(24.5)}
          color="bg-yellow-100"
        />
        <StatsCard
          title="Tỷ lệ tăng trưởng"
          value="+12%"
          color="bg-pink-100"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Doanh thu theo thời gian</h2>
        </div>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={formatCurrency}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0088FE" 
                name="Doanh thu"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Doanh thu theo danh mục</h2>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Tăng trưởng theo tháng</h2>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="growth" fill="#0088FE" name="Tăng trưởng">
                  {revenueData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.growth >= 0 ? '#00C49F' : '#FF8042'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;