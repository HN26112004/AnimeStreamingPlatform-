// src/components/AppHeader.js

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AppHeader = () => {
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
        }}>
            <div className="logo">
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
                    Anime App
                </Link>
            </div>

            <nav>
                <ul style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <li style={{ marginRight: '15px' }}>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                            Trang chủ
                        </Link>
                    </li>
                    {/* 🌟 Nút "Anime đã xem" - hiển thị cho mọi người dùng */}
                    <li style={{ marginRight: '15px' }}>
                        <Link to="/history" style={{ color: 'white', textDecoration: 'none' }}>
                            Anime đã xem
                        </Link>
                    </li>
                    {/* Thêm nút "Anime đã lưu" - chỉ hiển thị khi đã đăng nhập */}
                    {isAuthenticated && (
                        <li style={{ marginRight: '15px' }}>
                            <Link to="/watch-later" style={{ color: 'white', textDecoration: 'none' }}>
                                Anime đã lưu
                            </Link>
                        </li>
                    )}
                    {isAuthenticated ? (
                        <>
                            {/* Logic kiểm tra vai trò admin */}
                            {user?.role === 'admin' && (
                                <li style={{ marginRight: '15px' }}>
                                    <Link to="/admin/add-anime" style={{ color: '#ffcc00', textDecoration: 'none' }}>
                                        Thêm Anime
                                    </Link>
                                </li>
                            )}
                            <li style={{ marginRight: '15px' }}>
                                <span style={{ color: '#00ccff' }}>Chào mừng, {user?.username}</span>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Đăng xuất
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li style={{ marginRight: '15px' }}>
                                <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                                    Đăng nhập
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                                    Đăng ký
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default AppHeader;