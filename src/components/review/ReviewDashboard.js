import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const ReviewDashboard = () => {
    const [reviewStats, setReviewStats] = useState({
        totalReviews: 0,
        positiveReviews: 0,
        negativeReviews: 0,
    });
    const API = process.env.REACT_APP_API_ENDPOINT;

    useEffect(() => {
        const fetchReviewStats = async () => {
            try {
                const response = await fetch(`${API}/api/reviews/statistics`);
                const data = await response.json();
                if (data.success) {
                    setReviewStats({
                        totalReviews: data.totalReviews,
                        positiveReviews: data.positiveReviews,
                        negativeReviews: data.negativeReviews,
                    });
                }
            } catch (error) {
                console.error('Error fetching review statistics:', error);
            }
        };

        fetchReviewStats();
    }, []);

    // Data cho Pie Chart
    const pieData = [
        { name: 'Tích cực', value: reviewStats.positiveReviews },
        { name: 'Tiêu cực', value: reviewStats.negativeReviews },
    ];

    // Data cho Bar Chart
    const barData = [
        { name: 'Tổng số', value: reviewStats.totalReviews },
        { name: 'Tích cực', value: reviewStats.positiveReviews },
        { name: 'Tiêu cực', value: reviewStats.negativeReviews },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Thống kê Đánh Giá Khách Hàng</h1>

            {/* Biểu đồ Pie cho tỷ lệ tích cực / tiêu cực */}




            {/* Biểu đồ Bar cho tổng số lượng đánh giá */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold">Phân bổ số lượng đánh giá</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReviewDashboard;
