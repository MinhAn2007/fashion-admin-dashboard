import React, { useState, useEffect } from 'react';
import StatsCard from '../StatsCard';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomerDashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [customerStats, setCustomerStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const API = process.env.REACT_APP_API_ENDPOINT;

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, sortConfig, searchTerm]);

    useEffect(() => {
        fetchCustomerStats();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch(
                `${API}/api/users?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(searchTerm)}&sortBy=${sortConfig.key}&sortOrder=${sortConfig.direction}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            const data = await response.json();
            if (data.success) {
                setCustomers(data.data);
                setTotalPages(data.totalPages);
            } else {
                console.error('Error fetching customers:', data.message);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchCustomerStats = async () => {
        try {
            const response = await fetch(`${API}/api/users/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setCustomerStats(data.data);
            } else {
                console.error('Error fetching customer stats:', data.message);
            }
        } catch (error) {
            console.error('Error fetching customer stats:', error);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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
        <div className="p-6 flex flex-col space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý Khách hàng</h1>
            </div>

            {/* Thống kê */}
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

            {/* Biểu đồ khách hàng mới theo tháng */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h6 className="font-semibold mb-4">Biểu đồ khách hàng mới theo tháng</h6>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={customerStats.monthlyNewUsers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="Khách hàng mới" />
                    </LineChart>
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
                                    setCurrentPage(1); // Reset về trang đầu khi thay đổi tìm kiếm
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
                                    <button onClick={() => handleSort('firstName')} className="flex items-center font-bold hover:text-blue-600">
                                        Tên
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </button>
                                </th>
                                <th className="p-4 text-left">
                                    <button onClick={() => handleSort('email')} className="flex items-center font-bold hover:text-blue-600">
                                        Email
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </button>
                                </th>
                                <th className="p-4 text-left">
                                    <button onClick={() => handleSort('createdAt')} className="flex items-center font-bold hover:text-blue-600">
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
                                        <td className="p-4">{`${customer.firstName} ${customer.lastName}`}</td>
                                        <td className="p-4">{customer.email}</td>
                                        <td className="p-4">{new Date(customer.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="p-4" colSpan="3">Không có khách hàng nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                <div className="p-4 flex items-center justify-between border-t">
                    <div className="text-sm text-gray-500">
                        Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} đến {Math.min(currentPage * ITEMS_PER_PAGE, customerStats.totalUsers || 0)} trong số {customerStats.totalUsers || 0} khách hàng
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

export default CustomerDashboard;
