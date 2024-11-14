import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [logoutMessage, setLogoutMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const API = process.env.REACT_APP_API_ENDPOINT;

    useEffect(() => {
        if (location.state && location.state.message) {
            setLogoutMessage(location.state.message);
        }
    }, [location.state]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLogoutMessage('');
        try {
            const response = await fetch(`${API}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-lg transform transition duration-500 hover:shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-indigo-600">Admin Login</h2>
                {logoutMessage && (
                    <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-lg text-center">
                        {logoutMessage}
                    </div>
                )}
                {error && (
                    <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500 transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500 transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300"
                    >
                        Đăng nhập
                    </button>
                </form>
                <div className="flex items-center justify-center mt-6">
                    <p className="text-sm text-gray-600">Quên mật khẩu?</p>
                    <a href="#" className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm">Khôi phục tại đây</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
