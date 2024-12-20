import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');

  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [bestSellingProductsData, setBestSellingProductsData] = useState([]);
  const API = process.env.REACT_APP_API_ENDPOINT;

  useEffect(() => {
    fetchDashboardDetails();
  }, []);

  const fetchDashboardDetails = async () => {
    try {
      const response = await fetch(`${API}/api/orders/dashboard/details`);
      const result = await response.json();
      if (result.success) {
        const filteredData = result.data.monthlyQuantity.filter(item => [1, 2, 3, 4].includes(item.id));
        
        const groupedByParentId = result.data.monthlyQuantity
          .filter(item => ![1, 2, 3, 4].includes(item.id)) 
          .reduce((acc, item) => {
            const parentId = item.parent_id;
            if (parentId && [1, 2, 3, 4].includes(parentId)) {
              if (!acc[parentId]) {
                acc[parentId] = { total_sold: 0 };
              }
              acc[parentId].total_sold += parseInt(item.total_sold, 10) || 0;
            }
            return acc;
          }, {});
      
        const updatedData = filteredData.map(item => {
          if (groupedByParentId[item.id]) {
            return {
              ...item,
              total_sold: parseInt(item.total_sold, 10) + groupedByParentId[item.id].total_sold,
            };
          }
          return item;
        });
      
        setBarData(
          updatedData.map(item => ({
            category: item.category_name,
            total_quantity_sold: parseInt(item.total_sold, 10),
            // Add Vietnamese label for tooltip
            Số_lượng: parseInt(item.total_sold, 10),
          }))
        );
      
        setLineData(
          result.data.monthlyRevenue.map(item => ({
            month: item.month,
            total_revenue: parseFloat(item.total_revenue),
            // Add Vietnamese label for tooltip
            Doanh_thu: parseFloat(item.total_revenue),
          }))
        );
      
        setBestSellingProductsData(result.data.bestSellingProducts);
      }
      
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Custom tooltip để hiển thị đơn vị tiền tệ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="text-sm">{`Tháng: ${label}`}</p>
          <p className="text-sm text-green-600">
            {`Doanh thu: ${new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex w-full space-x-6 mt-10">
        {/* Biểu đồ doanh thu theo tháng (bên trái 50%) */}
        <div className="bg-white p-4 rounded-lg shadow-md w-1/2">
          <ResponsiveContainer width="100%" height={550}>
            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('vi-VN', { 
                    notation: 'compact',
                    compactDisplay: 'short',
                    maximumFractionDigits: 1
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={() => 'Doanh thu'} />
              <Line 
                type="monotone" 
                dataKey="total_revenue" 
                name="Doanh thu"
                stroke="#22c55e" 
                fill="#22c55e" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 flex flex-col space-y-6">
          {/* Biểu đồ số lượng bán hàng */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="101%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} sản phẩm`, 'Số lượng']} />
                <Legend formatter={() => 'Số lượng bán ra'} />
                <Bar 
                  dataKey="total_quantity_sold" 
                  name="Số lượng" 
                  fill="#8884d8" 
                  width={20} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bảng sản phẩm bán chạy nhất */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h6 className="font-semibold mb-4">Sản phẩm bán chạy nhất</h6>
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                  <th className="px-4 py-2 text-left">Số lượng đã bán</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingProductsData.map((product) => (
                  <tr key={product.product_name} className="border-b">
                    <td className="px-4 py-2">{product.product_name}</td>
                    <td className="px-4 py-2">{product.total_quantity_sold}</td>
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