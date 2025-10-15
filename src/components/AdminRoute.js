// src/components/AdminRoute.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useContext(AuthContext);

    // Chưa đăng nhập thì chuyển hướng về trang login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Đã đăng nhập nhưng không phải admin thì chuyển hướng về trang chủ
    // Cần kiểm tra user và user.role một cách an toàn
    if (isAuthenticated && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Nếu là admin, cho phép truy cập
    return children;
};

export default AdminRoute;