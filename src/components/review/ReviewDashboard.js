import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
    positive: '#0088FE', // Xanh dương
    negative: '#FF8042', // Màu gạch
    total: '#32CD32',    // Xanh lá cây
};
const API = process.env.REACT_APP_API_ENDPOINT;

const ReviewDashboard = () => {
    const [reviewStats, setReviewStats] = useState({
        totalReviews: 0,
        positiveReviews: 0,
        negativeReviews: 0,
    });
    const [monthlyReviews, setMonthlyReviews] = useState([]);

    useEffect(() => {
        const fetchReviewStats = async () => {
            try {
                const [reviewStatsRes, monthlyReviewsRes] = await Promise.all([
                    fetch(`${API}/api/reviews/statistics`),
                    fetch(`${API}/api/reviews/monthly-statistics`)
                ]);

                const reviewStatsData = await reviewStatsRes.json();
                const monthlyReviewsData = await monthlyReviewsRes.json();

                if (reviewStatsData.success) {
                    setReviewStats({
                        totalReviews: reviewStatsData.totalReviews,
                        positiveReviews: reviewStatsData.positiveReviews,
                        negativeReviews: reviewStatsData.negativeReviews,
                    });
                }

                if (monthlyReviewsData.success) {
                    setMonthlyReviews(monthlyReviewsData.monthlyReviews);
                }
            } catch (error) {
                console.error('Error fetching review statistics:', error);
            }
        };

        fetchReviewStats();
    }, []);

    const pieData = [
        { name: 'Tích cực', value: reviewStats.positiveReviews, color: COLORS.positive },
        { name: 'Tiêu cực', value: reviewStats.negativeReviews, color: COLORS.negative },
    ];

    const barData = [
        { name: 'Tổng số', value: reviewStats.totalReviews, color: COLORS.total },
        { name: 'Tích cực', value: reviewStats.positiveReviews, color: COLORS.positive },
        { name: 'Tiêu cực', value: reviewStats.negativeReviews, color: COLORS.negative },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p>{`Số lượng: ${payload[0].value.toLocaleString()}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Thống kê Đánh Giá Khách Hàng</h1>

            {/* Biểu đồ Pie cho tỷ lệ tích cực / tiêu cực */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Tỷ lệ đánh giá tích cực và tiêu cực</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={140}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ Bar cho tổng số lượng đánh giá */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Phân bổ số lượng đánh giá</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value">
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ lịch sử đánh giá theo tháng */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Lịch sử đánh giá theo tháng</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyReviews}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="positive" stroke={COLORS.positive} name="Tích cực" />
                        <Line type="monotone" dataKey="negative" stroke={COLORS.negative} name="Tiêu cực" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReviewDashboard;
