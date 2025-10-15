// src/routes/testRoutes.js

import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js'; // Import middleware
import testRoutes from './routes/testRoutes.js'; 

const router = express.Router();

// Route này được bảo vệ, chỉ những người dùng đã đăng nhập mới truy cập được
router.get('/protected', protect, (req, res) => {
    res.json({ message: `Chào mừng ${req.user.username}, bạn đã truy cập thành công API được bảo vệ!` });
});

// Route này chỉ dành cho Admin
router.get('/admin-only', protect, admin, (req, res) => {
    res.json({ message: `Chào mừng Admin ${req.user.username}, bạn đã truy cập thành công API Admin!` });
});

app.use('/api/test', testRoutes);
export default router;