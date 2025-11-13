import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import uploadVideoMiddleware from '../middlewares/uploadVideoMiddleware.js';

import {
  addEpisode,
  getEpisodesByAnimeId,
  getEpisodesByAnime,
  updateEpisode,
  deleteEpisode,
  addSeason,
  uploadVideo,
  downloadEpisode // ✅ thêm đúng vị trí
} from '../controllers/episodeController.js';

const router = express.Router(); // ✅ khai báo trước khi dùng

// Tải video có xác thực
router.get('/:id/download', protect, downloadEpisode);

// Thêm tập phim mới (có upload video)
router.route('/').post(protect, admin, uploadVideoMiddleware.single('video'), addEpisode);
router.post('/upload-video', protect, admin, uploadVideoMiddleware.single('video'), uploadVideo);

// Thêm mùa mới cho một anime
router.route('/add-season').post(protect, admin, addSeason);

// Lấy danh sách tập phim theo animeId
router.route('/:animeId').get(getEpisodesByAnimeId);
router.get('/by-anime/:animeId', getEpisodesByAnime);

// Cập nhật tập phim
router.route('/:id').put(protect, admin, updateEpisode);

// Xóa tập phim
router.route('/:id').delete(protect, admin, deleteEpisode);

export default router;

