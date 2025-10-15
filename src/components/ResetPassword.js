// src/components/ResetPassword.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(true);

    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError('Không tìm thấy token đặt lại mật khẩu trong URL.');
            setIsTokenValid(false);
        }
    }, [token]);

    const submitHandler = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        try {
            setIsLoading(true);
            
            // Thay thế axios.put bằng axiosInstance.put
            // Loại bỏ object "config" vì headers đã được cấu hình trong axiosInstance
            const { data } = await axiosInstance.put(
                `/auth/reset-password/${token}`,
                { password }
            );

            setMessage(data.message);
            setPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.response && err.response.data.message 
                    ? err.response.data.message 
                    : 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.');
            console.error('Lỗi khi đặt lại mật khẩu:', err);
            setIsTokenValid(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTokenValid) {
        return (
            <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Lỗi</h2>
                <p style={{ color: 'red' }}>{error || "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}</p>
                <p>Vui lòng quay lại trang <a href="/forgot-password">Quên mật khẩu</a> để yêu cầu liên kết mới.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Đặt lại Mật khẩu</h2>
            {message && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={submitHandler}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mật khẩu mới:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Xác nhận mật khẩu:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu mới"
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: isLoading ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    {isLoading ? 'Đang đặt lại...' : 'Đặt lại Mật khẩu'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;