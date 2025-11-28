import express from 'express';
import { getGrowthStats } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js'; // chú ý: đúng tên folder "middlewares"

const router = express.Router();

router.get('/stats/growth', protect, admin, getGrowthStats);

export default router;