// src/routes/reportRoutes.js
import express from 'express';
import { reportPlaybackError } from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/report-error', protect, reportPlaybackError);

export default router;