// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(() => {
        try {
            const storedAuthData = localStorage.getItem('authData');
            if (storedAuthData) {
                return JSON.parse(storedAuthData);
            }
            return null;
        } catch (error) {
            console.error("Lỗi khi parse authData từ localStorage:", error);
            return null;
        }
    });

    useEffect(() => {
        if (authData) {
            localStorage.setItem('authData', JSON.stringify(authData));
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
        } else {
            localStorage.removeItem('authData');
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }, [authData]);

    const login = (data) => {
        // Lấy role từ cấp cao nhất của đối tượng data
        const userRole = data.role;
        
        // Tạo một đối tượng user mới để lưu trữ trong authData
        const user = {
            ...data, // Sao chép tất cả các thuộc tính khác (id, username, email)
            isAdmin: userRole === 'admin' // Gán giá trị true/false dựa trên role
        };
        
        // Tạo đối tượng authData mới
        const newData = {
            ...data, // Lưu token và các thuộc tính cấp cao nhất
            user // Thay thế đối tượng user cũ bằng đối tượng user mới đã được xử lý
        };
        
        setAuthData(newData);
    };

    const logout = () => {
        setAuthData(null);
    };

    const authContextValue = {
        user: authData?.user || null,
        token: authData?.token || null,
        isAuthenticated: !!authData?.token,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};