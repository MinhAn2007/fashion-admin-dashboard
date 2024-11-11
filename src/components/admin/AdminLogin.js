import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_ENDPOINT;

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                // Lưu token vào localStorage
                localStorage.setItem('token', data.token);
                // Chuyển hướng đến trang admin dashboard
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md" onSubmit={handleLogin}>
                <h2 className="text-2xl mb-4">Admin Login</h2>
                {error && <div className="mb-4 text-red-600">{error}</div>}
                <div className="mb-4">
                    <label>Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
                    Đăng nhập
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
