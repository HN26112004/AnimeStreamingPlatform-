// src/components/ForgotPassword.js
import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');

        if (!email) {
            setError('Vui lòng nhập địa chỉ email của bạn.');
            return;
        }

        try {
            setIsLoading(true);
            
            // Thay thế axios.post bằng axiosInstance.post
            // Loại bỏ object "config" vì headers đã được cấu hình trong axiosInstance
            const { data } = await axiosInstance.post(
                '/auth/forgot-password',
                { email }
            );

            setMessage(data.message);
            setEmail('');
        } catch (err) {
            setError(err.response && err.response.data.message 
                    ? err.response.data.message 
                    : 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.');
            console.error('Lỗi khi yêu cầu đặt lại mật khẩu:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Quên Mật khẩu</h2>
            {message && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={submitHandler}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Địa chỉ Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
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
                        backgroundColor: isLoading ? '#6c757d' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    {isLoading ? 'Đang gửi...' : 'Gửi Yêu cầu Đặt lại Mật khẩu'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;