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
import ExcelJS from "exceljs";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SalesDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(1, "year").startOf("day"),
    endDate: moment().endOf("day"),
  });
  const API = process.env.REACT_APP_API_ENDPOINT;

  // Hàm xử lý dữ liệu chung
  const processDashboardData = (data) => {
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

    data.salesByCategory = updatedData.filter((item) =>
      [1, 2, 3, 4].includes(item.id)
    );

    return data;
  };

  // Hàm load dữ liệu lần đầu
  const initialFetchDashboardData = async (startDate, endDate) => {
    try {
      const response = await fetch(
        `${API}/api/revenue/dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      const processedData = processDashboardData(data);
      setDashboardData(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm update dữ liệu khi filter (không có loading)
  const updateDashboardData = async (startDate, endDate) => {
    try {
      const response = await fetch(
        `${API}/api/revenue/dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      const processedData = processDashboardData(data);
      setDashboardData(processedData);
    } catch (err) {
      setError(err.message);
    }
  };

  // useEffect cho lần load đầu tiên
  useEffect(() => {
    initialFetchDashboardData(
      dateRange.startDate.format("YYYY-MM-DD"),
      dateRange.endDate.format("YYYY-MM-DD")
    );
  }, []); // Chỉ chạy một lần khi component mount

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

  if (error) return <div>Error: {error}</div>;
  const exportToExcel = () => {
    if (!dashboardData) return;
  
    // Create a new workbook
    const wb = new ExcelJS.Workbook();
  
    // Utility function to create a styled header
    const createStyledHeader = (worksheet, title, dateRange) => {
      // Merge cells for title and center
      worksheet.mergeCells('A1:D4');
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
      worksheet.mergeCells('A5:D5');
      const dateCell = worksheet.getCell('A5');
      dateCell.value = `Thời gian: ${dateRange.startDate.format("DD/MM/YYYY")} - ${dateRange.endDate.format("DD/MM/YYYY")}`;
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
        ["Người lập báo cáo:", "", "", "Người duyệt:"],
        ["", "", "", ""],
        ["", "", "", ""],
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
  
    // 1. Monthly Revenue Sheet
    const monthlyRevenueSheet = wb.addWorksheet('Doanh Thu Theo Tháng');
    createStyledHeader(
      monthlyRevenueSheet, 
      "BÁO CÁO DOANH THU THEO THÁNG", 
      dateRange
    );
  
    const monthlyRevenueHeaders = ["Tháng", "Doanh thu (VNĐ)", "Tăng trưởng (%)"];
    createDataHeader(monthlyRevenueSheet, monthlyRevenueHeaders);
  
    const monthlyRevenueData = dashboardData.monthlyRevenue.map((item) => [
      moment(item.month, "YYYY-MM").format("MM/YYYY"),
      parseFloat(item.revenue).toLocaleString("vi-VN"),
      `${(
        dashboardData.growthRates.find((g) => g.month === item.month)
          ?.growthRate || 0
      ).toFixed(2)}%`
    ]);
    addDataRows(monthlyRevenueSheet, monthlyRevenueData);
    createFooter(monthlyRevenueSheet, monthlyRevenueData.length + 9);
  
    // 2. Sales by Category Sheet
    const totalSales = dashboardData.salesByCategory.reduce(
      (acc, item) => acc + item.total_quantity,
      0
    );
  
    const categorySheet = wb.addWorksheet('Doanh Thu Theo Danh Mục');
    createStyledHeader(
      categorySheet, 
      "BÁO CÁO DOANH THU THEO DANH MỤC", 
      dateRange
    );
  
    const categoryHeaders = ["Danh mục", "Số lượng", "Tỷ lệ (%)", "Doanh thu (VNĐ)"];
    createDataHeader(categorySheet, categoryHeaders);
  
    const categoryData = dashboardData.salesByCategory.map((item) => [
      item.name,
      item.total_quantity.toLocaleString("vi-VN"),
      `${
        totalSales ? Math.round((item.total_quantity / totalSales) * 100) : 0
      }%`,
      parseFloat(item.total_revenue || 0).toLocaleString("vi-VN")
    ]);
    addDataRows(categorySheet, categoryData);
    createFooter(categorySheet, categoryData.length + 9);
  
    // 3. Order Status Sheet
    const statusSheet = wb.addWorksheet('Tình Trạng Đơn Hàng');
    createStyledHeader(
      statusSheet, 
      "BÁO CÁO TÌNH TRẠNG ĐƠN HÀNG", 
      dateRange
    );
  
    const statusHeaders = ["Trạng thái", "Số lượng đơn", "Doanh thu (VNĐ)", "Giá trị TB/đơn"];
    createDataHeader(statusSheet, statusHeaders);
  
    const orderStatusData = dashboardData.ordersByStatusResult.map((item) => [
      item.status,
      item.total_orders.toLocaleString("vi-VN"),
      parseFloat(item.total_revenue).toLocaleString("vi-VN"),
      parseFloat(item.average_order_value).toLocaleString("vi-VN")
    ]);
    addDataRows(statusSheet, orderStatusData);
    createFooter(statusSheet, orderStatusData.length + 9);
  
    // 4. Summary Sheet
    const summarySheet = wb.addWorksheet('Tổng Kết');
    createStyledHeader(
      summarySheet, 
      "TỔNG KẾT BÁO CÁO", 
      dateRange
    );
  
    const summaryHeaders = ["Chỉ số", "Giá trị"];
    createDataHeader(summarySheet, summaryHeaders);
  
    const summaryData = [
      ["Tổng doanh thu", formatPrice(dashboardData.stats.totalRevenue)],
      [
        "Tổng đơn hàng",
        dashboardData.stats.totalOrders.toLocaleString("vi-VN"),
      ],
      [
        "Giá trị đơn hàng trung bình",
        formatPrice(dashboardData.stats.averageOrderValue),
      ],
      [
        "Tỷ lệ tăng trưởng",
        `${(
          dashboardData.growthRates.find(
            (g) => g.month === moment().format("YYYY-MM")
          )?.growthRate || 0
        ).toFixed(2)}%`,
      ]
    ];
    addDataRows(summarySheet, summaryData);
    createFooter(summarySheet, summaryData.length + 9);
  
    // Auto-adjust column widths for readability
    [monthlyRevenueSheet, categorySheet, statusSheet, summarySheet].forEach(sheet => {
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
      link.download = `Bao_Cao_Doanh_Thu_${dateRange.startDate.format(
        "DD.MM.YYYY"
      )}_${dateRange.endDate.format("DD.MM.YYYY")}.xlsx`;
      link.click();
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!dashboardData) return null;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <OrderDashboardFilter
          onDateRangeChange={({ startDate, endDate }) =>
            updateDashboardData(startDate, endDate)
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
