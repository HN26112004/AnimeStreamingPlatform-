import express from 'express';
import { getStats, getErrorReports } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route thống kê tổng hợp (tích lũy theo tháng)
router.get('/stats/growth', protect, admin, getStats);

// Route lấy danh sách báo lỗi
router.get('/reports/errors', protect, admin, getErrorReports);

export default router;