// src/pages/HistoryPage.js

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { IoTimeOutline } from "react-icons/io5";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HistoryPage = () => {
    // Lấy `isAuthenticated` và `user` từ AuthContext
    const { isAuthenticated, user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);

            // Kiểm tra bằng `isAuthenticated`
            if (isAuthenticated) {
                // Lấy lịch sử xem từ server
                try {
                    const response = await axiosInstance.get('/anime/watch-history');
                    // Kiểm tra xem dữ liệu trả về có đúng định dạng không
                    if (Array.isArray(response.data.history)) {
                        setHistory(response.data.history);
                    } else {
                        // Sửa lỗi ở đây: nếu response.data là mảng, sử dụng nó
                        setHistory(response.data);
                    }
                } catch (err) {
                    console.error("Lỗi khi lấy lịch sử xem từ server:", err);
                    setError("Không thể tải lịch sử xem từ tài khoản của bạn.");
                    setHistory([]);
                }
            } else {
                // Lấy lịch sử xem từ localStorage
                try {
                    const localHistory = JSON.parse(localStorage.getItem('localWatchHistory')) || [];
                    setHistory(localHistory);
                } catch (err) {
                    console.error("Lỗi khi lấy lịch sử xem từ localStorage:", err);
                    setError('Lỗi khi đọc lịch sử xem cục bộ của bạn.');
                    setHistory([]);
                }
            }
            setLoading(false);
        };

        fetchHistory();
    }, [isAuthenticated, user]);

    const clearLocalHistory = () => {
  localStorage.removeItem('localWatchHistory');
};


   const handleClearHistory = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem không? Hành động này không thể hoàn tác.')) {
            try {
                if (isAuthenticated) {
                    // Xóa lịch sử trên Server (cho người dùng đã đăng nhập)
                    await axiosInstance.delete('/anime/watch-history/clear');
                    toast.success('Đã xóa toàn bộ lịch sử xem trên máy chủ!');
                } else {
                    // Xóa lịch sử cục bộ (cho người dùng chưa đăng nhập)
                    clearLocalHistory();
                    toast.success('Đã xóa toàn bộ lịch sử xem cục bộ!');
                }
                
                // Cập nhật lại danh sách sau khi xóa
                setHistory([]);
            } catch (err) {
                console.error('Lỗi khi xóa lịch sử xem:', err);
                const message = err.response?.data?.message || 'Có lỗi xảy ra khi xóa lịch sử xem.';
                toast.error(message);
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải lịch sử...</div>;
    }

    if (error) {
        return <div className="alert alert-danger" style={{ textAlign: 'center', marginTop: '50px' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                <IoTimeOutline style={{ marginRight: '10px' }} />
                Lịch Sử Xem
            </h1>
            {history.length > 0 && (
                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                    <button onClick={handleClearHistory} className="btn btn-outline-danger">Xóa Lịch Sử</button>
                </div>
            )}
            {history.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {history.map(item => {
                        const animeData = item.anime || item;
                        return (
                            // Sử dụng ID của bản ghi lịch sử làm key, đảm bảo duy nhất
                            <Link to={`/anime/${animeData._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                    <img
                                        src={`http://localhost:5000${animeData.image}`}
                                        alt={animeData.name}
                                        style={{ width: '100%', height: '350px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/250x350/CCCCCC/333333?text=No+Image"; }}
                                    />
                                    <div style={{ padding: '15px' }}>
                                        <h3 style={{ margin: '0 0 5px', fontSize: '1.2em' }}>
                                            {animeData.name} ({animeData.year})
                                        </h3>
                                        <p style={{ margin: '0', color: '#666', fontSize: '0.9em' }}>
                                            {new Date(item.watchedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#777', fontSize: '1.2em', marginTop: '50px' }}>
                    Chưa có bộ anime nào trong lịch sử xem.
                </p>
            )}
        </div>
    );
};

export default HistoryPage;