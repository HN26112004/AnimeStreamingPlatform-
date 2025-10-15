// src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance'; // Đã import axiosInstance

function LoginPage() {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        // Thay thế axios.post bằng axiosInstance.post
        // Rút gọn URL vì baseURL đã được cấu hình sẵn trong axiosInstance
        // Xóa header thủ công vì đã được cấu hình trong axiosInstance
        const response = await axiosInstance.post('/auth/login', { username, password });

        
        login(response.data); 
        
        navigate('/'); 

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
};

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng nhập</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Tên đăng nhập:</label>
                    <input
                        type="text" 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Mật khẩu:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
                    />
                </div>
                <button
                    type="submit"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer' }}
                >
                    Đăng nhập
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng ký</Link>
            </p>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
                <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>Quên mật khẩu?</Link>
            </p>
        </div>
    );
}

export default LoginPage;
