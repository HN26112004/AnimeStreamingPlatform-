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
  downloadEpisode
} from '../controllers/episodeController.js';

import { uploadAndConvertVideo } from '../controllers/videoController.js'; // ✅ dùng controller chuẩn

const router = express.Router();

// Tải video có xác thực
router.get('/:id/download', protect, downloadEpisode);

// Thêm tập phim mới (chỉ JSON, không upload file ở đây)
router.route('/').post(protect, admin, addEpisode);

// ✅ Upload video cho tập phim (FormData với field "video")
router.post(
  '/upload-video',
  protect,
  admin,
  uploadVideoMiddleware.single('video'), // phải khớp với FE append("video", ...)
  uploadAndConvertVideo // dùng controller videoController để convert + upload Cloudinary
);

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