import express from 'express';
import { getAnimeStats } from '../controllers/statsController.js';
import { optionalProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 📊 Route GET: Chỉ lấy thống kê lượt xem (nếu bạn vẫn muốn giữ)
router.get('/anime/:id', getAnimeStats);

// 🔄 Route POST: Ghi nhận lượt xem + trả về thống kê
router.post('/anime/:id/stats', optionalProtect, getAnimeStats);

export default router;

