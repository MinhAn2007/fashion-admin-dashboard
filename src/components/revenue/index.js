import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatsCard from "../StatsCard";
import OrderDashboardFilter from "../../utils/Filter";
import { formatPrice } from "../../utils/FormatPrice";
import * as XLSX from "xlsx";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SalesDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(6, "months").startOf("month"),
    endDate: moment().endOf("month"),
  });

  const API = process.env.REACT_APP_API_ENDPOINT;

  const fetchDashboardData = async (startDate, endDate) => {
    try {
      const response = await fetch(
        `${API}/api/revenue/dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      const groupedByParentId = data.salesByCategory
        .filter((item) => ![1, 2, 3, 4].includes(item.id))
        .reduce((acc, item) => {
          const parentId = item.parent_id;
          if (parentId && [1, 2, 3, 4].includes(parentId)) {
            if (!acc[parentId]) {
              acc[parentId] = { total_quantity: 0 };
            }
            acc[parentId].total_quantity +=
              parseInt(item.total_quantity, 10) || 0;
          }
          return acc;
        }, {});

      const updatedData = data.salesByCategory.map((item) => {
        if (groupedByParentId[item.id]) {
          return {
            ...item,
            total_quantity:
              parseInt(item.total_quantity, 10) +
              groupedByParentId[item.id].total_quantity,
          };
        }
        return item;
      });
      console.log("data", updatedData);

      data.salesByCategory = updatedData.filter((item) =>
        [1, 2, 3, 4].includes(item.id)
      );

      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData(
      dateRange.startDate.format("YYYY-MM-DD"),
      dateRange.endDate.format("YYYY-MM-DD")
    );
  }, [dateRange]);

  const processMonthlyRevenueData = () => {
    return (
      dashboardData?.monthlyRevenue.map((item) => ({
        month: moment(item.month, "YYYY-MM").format("MMM"),
        revenue: parseFloat(item.revenue),
        growth:
          dashboardData.growthRates.find((g) => g.month === item.month)
            ?.growthRate || 0,
      })) || []
    );
  };

  const processSalesByCategoryData = () => {
    const totalSales = dashboardData?.salesByCategory.reduce(
      (acc, item) => acc + item.total_quantity,
      0
    );
    return (
      dashboardData?.salesByCategory.map((item) => ({
        name: item.name,
        value: totalSales
          ? Math.round((item.total_quantity / totalSales) * 100)
          : 0,
      })) || []
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  const exportToExcel = () => {
    if (!dashboardData) return;

    // Prepare Monthly Revenue Data
    const monthlyRevenueSheet = dashboardData.monthlyRevenue.map((item) => ({
      Tháng: moment(item.month, "YYYY-MM").format("MMM YYYY"),
      "Doanh thu (VNĐ)": parseFloat(item.revenue),
      "Tăng trưởng (%)":
        dashboardData.growthRates.find((g) => g.month === item.month)
          ?.growthRate || 0,
    }));

    // Prepare Sales by Category Data
    const totalSales = dashboardData.salesByCategory.reduce(
      (acc, item) => acc + item.total_quantity,
      0
    );

    const salesByCategorySheet = dashboardData.salesByCategory.map((item) => ({
      "Danh mục": item.name,
      "Số lượng": item.total_quantity,
      "Tỷ lệ (%)": totalSales
        ? Math.round((item.total_quantity / totalSales) * 100)
        : 0,
    }));

    const orderByStatus = dashboardData.ordersByStatusResult.map((item) => ({
      "Trạng thái": item.status,
      "Số lượng": item.total_orders,
      "Doanh thu": item.total_revenue,
      "Giá trị trung bình": item.average_order_value,
    }));


    // Prepare Summary Sheet
    const summarySheet = [
      {
        "Chỉ số": "Tổng doanh thu",
        "Giá trị": formatPrice(dashboardData.stats.totalRevenue),
      },
      {
        "Chỉ số": "Tổng đơn hàng",
        "Giá trị": dashboardData.stats.totalOrders,
      },
      {
        "Chỉ số": "Giá trị đơn hàng trung bình",
        "Giá trị": formatPrice(dashboardData.stats.averageOrderValue),
      },
      {
        "Chỉ số": "Tỷ lệ tăng trưởng",
        "Giá trị": `+${(
          dashboardData.growthRates.find(
            (g) => g.month === moment().format("YYYY-MM")
          )?.growthRate || 0
        ).toFixed(2)}%`,
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(monthlyRevenueSheet),
      "Doanh Thu Theo Tháng"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(salesByCategorySheet),
      "Doanh Thu Theo Danh Mục"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(summarySheet),
      "Tóm Tắt"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(orderByStatus),
      "Tình Trạng Đơn Hàng"
    );

    // Generate Excel file
    XLSX.writeFile(
      wb,
      `Bao_Cao_Doanh_Thu_tu_${dateRange.startDate.format(
        "DD-MM-YYYY"
      )}_den_${dateRange.endDate.format("DD-MM-YYYY")}.xlsx`
    );
  };
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <OrderDashboardFilter
          onDateRangeChange={({ startDate, endDate }) =>
            fetchDashboardData(startDate, endDate)
          }
        />
        <div className="flex items-center space-x-4">
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            disabled={loading}
          >
            Xuất Excel
          </button>
          <h1 className="text-2xl font-bold">Báo cáo doanh thu</h1>
        </div>{" "}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap justify-between gap-4">
        <StatsCard
          title="Tổng doanh thu"
          value={formatPrice(dashboardData.stats.totalRevenue)}
          color="bg-blue-100"
        />
        <StatsCard
          title="Đơn hàng"
          value={dashboardData.stats.totalOrders}
          color="bg-green-100"
        />
        <StatsCard
          title="Giá trị trung bình"
          value={formatPrice(dashboardData.stats.averageOrderValue)}
          color="bg-yellow-100"
        />
        <StatsCard
          title="Tỷ lệ tăng trưởng"
          value={`+${(
            dashboardData.growthRates.find(
              (g) => g.month === moment().format("YYYY-MM")
            )?.growthRate || 0
          ).toFixed(2)}%`}
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
            <LineChart data={processMonthlyRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatPrice} domain={["auto", "auto"]} />
              <Tooltip formatter={(value) => formatPrice(value)} />
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
                  data={processSalesByCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {processSalesByCategoryData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
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
              <BarChart data={processMonthlyRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="growth" fill="#0088FE" name="Tăng trưởng">
                  {processMonthlyRevenueData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.growth >= 0 ? "#00C49F" : "#FF8042"}
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
