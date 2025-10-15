// src/routes/userRoutes.js

import express from 'express';
import { getMe } from '../controllers/userController.js'; // Import hàm getMe
import { protect } from '../middlewares/authMiddleware.js'; 


const router = express.Router();

router.route('/me').get(protect, getMe); // Route mới để lấy thông tin người dùng

export default router;