// src/routes/authRoutes.js

import express from 'express';
// Import cả hai hàm từ userController
import { registerUser, authUser, createUserByAdmin, updateUserRoleByAdmin, getWatchHistory, getAppStatistics, forgotPassword, resetPassword } from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
const router = express.Router();

// Route cho việc đăng ký người dùng
router.post('/register', registerUser);

// Route cho việc đăng nhập người dùng
router.post('/login', authUser); // <-- Thêm route này
// Route để Admin tạo người dùng mới (chỉ admin)
// URL: POST /api/auth/users
router.post('/users', protect, admin, createUserByAdmin);

// Route để Admin cập nhật vai trò của người dùng (chỉ admin)
// URL: PUT /api/auth/users/:id/role
router.put('/users/:id/role', protect, admin, updateUserRoleByAdmin);

// Route để lấy lịch sử xem phim của người dùng đã đăng nhập (Private)
router.get('/profile/watch-history', protect, getWatchHistory);

// Route để lấy thống kê ứng dụng (Chỉ Admin)
router.get('/admin/statistics', protect, admin, getAppStatistics);

// Route cho yêu cầu quên mật khẩu
router.post('/forgot-password', forgotPassword);

// Route để đặt lại mật khẩu bằng token
router.put('/reset-password/:token', resetPassword); 
export default router;