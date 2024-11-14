import React, { useState, useEffect, useCallback } from 'react';
import StatsCard from '../StatsCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const CustomerDashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [customerStats, setCustomerStats] = useState({
        totalUsers: 0,
        newUsersThisMonth: 0,
        monthlyNewUsers: [],
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const API = process.env.REACT_APP_API_ENDPOINT;

    // Hàm gọi API để lấy danh sách khách hàng
    const fetchCustomers = useCallback(async () => {
        try {
            setCustomers([]);
            const token = localStorage.getItem("adminToken"); // Lấy token từ localStorage
            if (!token) {
                console.error('Token không tồn tại');
                return;
            }
            const response = await fetch(
                `${API}/api/users?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
                    searchTerm
                )}&sortBy=${sortConfig.key}&sortOrder=${sortConfig.direction}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            if (response.ok && data.success) {
                setCustomers(data.users);
                setCustomerStats((prevStats) => ({
                    ...prevStats,
                    totalUsers: data.total,
                }));
            } else {
                console.error('Error fetching customers:', data.message);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }, [API, currentPage, searchTerm, sortConfig.key, sortConfig.direction]);

    // Hàm gọi API để lấy thống kê khách hàng
    const fetchCustomerStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("adminToken"); // Lấy token từ localStorage
            if (!token) {
                console.error('Token không tồn tại');
                return;
            }
            const response = await fetch(`${API}/api/users/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setCustomerStats({
                    totalUsers: data.totalUsers,
                    newUsersThisMonth: data.newUsersThisMonth,
                    monthlyNewUsers: data.monthlyNewUsers,
                });
            } else {
                console.error('Error fetching customer stats:', data.message);
            }
        } catch (error) {
            console.error('Error fetching customer stats:', error);
        }
    }, [API]);

    useEffect(() => {
        fetchCustomers();
        fetchCustomerStats();
    }, [fetchCustomers, fetchCustomerStats]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.ceil((customerStats.totalUsers || 0) / ITEMS_PER_PAGE);

    const formattedMonthlyData = customerStats.monthlyNewUsers.map(item => ({
        month: item.month,
        newUsers: item.newUsers,
    }));

    return (
        <div className="p-6 flex flex-col space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý Khách hàng</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                    title="Tổng số khách hàng"
                    value={customerStats.totalUsers}
                    color="bg-blue-100"
                />
                <StatsCard
                    title="Khách hàng mới tháng này"
                    value={customerStats.newUsersThisMonth}
                    color="bg-green-100"
                />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h6 className="font-semibold mb-4">Biểu đồ khách hàng mới theo tháng</h6>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={formattedMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar
                            dataKey="newUsers"
                            fill="#8884d8"
                            name="Khách hàng mới"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bảng khách hàng */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Danh sách khách hàng</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm khách hàng..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                                        onClick={() => handleSort('first_name')}
                                        className="flex items-center font-bold hover:text-blue-600"
                                    >
                                        Tên
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </button>
                                </th>
                                <th className="p-4 text-left">
                                    <button
                                        onClick={() => handleSort('email')}
                                        className="flex items-center font-bold hover:text-blue-600"
                                    >
                                        Email
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </button>
                                </th>
                                <th className="p-4 text-left">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="flex items-center font-bold hover:text-blue-600"
                                    >
                                        Ngày đăng ký
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{`${customer.first_name} ${customer.last_name}`}</td>
                                        <td className="p-4">{customer.email}</td>
                                        <td className="p-4">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="p-4" colSpan="3">
                                        Không có khách hàng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 flex items-center justify-between border-t">
                    <div className="text-sm text-gray-500">
                        Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} đến{' '}
                        {Math.min(currentPage * ITEMS_PER_PAGE, customerStats.totalUsers || 0)} trong
                        số {customerStats.totalUsers || 0} khách hàng
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
                            {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

export default CustomerDashboard;
