// src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Cần User Model để tìm user từ ID trong token

// Middleware để bảo vệ routes
const protect = async (req, res, next) => {
    let token;

    // Kiểm tra xem có token trong header Authorization không
    // Format: Bearer <TOKEN>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ header (bỏ đi phần "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token để lấy ID của người dùng
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tìm người dùng trong database bằng ID và gán vào req.user
            // .select('-password') để không trả về mật khẩu
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Cho phép request đi tiếp đến route handler
        } catch (error) {
            console.error('Lỗi xác thực token:', error);
            res.status(401).json({ message: 'Không được ủy quyền, token không hợp lệ.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không được ủy quyền, không có token.' });
    }
};

// Middleware để kiểm tra vai trò admin
const admin = (req, res, next) => {
    // req.user được gán từ middleware 'protect'
    if (req.user && req.user.role === 'admin') {
        next(); // Nếu là admin, cho phép đi tiếp
    } else {
        res.status(403).json({ message: 'Không được ủy quyền, chỉ dành cho Admin.' }); // 403 Forbidden
    }
};
const optionalProtect = async (req, _res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.error('Lỗi xác thực token tùy chọn:', error);
            // Không trả về lỗi 401 ở đây, chỉ log lỗi và không gán req.user
        }
    }
    next(); // Luôn cho phép request đi tiếp
};

export { protect, admin, optionalProtect };