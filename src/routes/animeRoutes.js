// src/routes/animeRoutes.js

import express from 'express';

// Import các hàm controller đã có và các hàm mới
import {
    createAnime,
    getAnime,
    getAnimeById,
    updateAnime,
    deleteAnime,
    createAnimeComment,
    createAnimeRating,
    getAnimeUserRating,
    getRandomAnime,
    recordWatchHistory,
    getWatchHistory,
    clearWatchHistory,
    getUniqueGenres,
    getUniqueYears,
    getRecentlyUpdatedAnimes,
    saveAnimeForLater,
    getSavedAnimes,
    removeSavedAnime,
    getRelatedAnimes,
    followAnime,
    getFollowingAnimes,
    getTopRatedAnimes,
    getMostWatchedAnimes,
    getTrendingAnimes,
    getAnimeByStudio,
} from '../controllers/animeController.js';

import { protect, admin, optionalProtect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// --- Các route cụ thể hơn cần được đặt lên trước các route chung ---
router.get('/random', getRandomAnime);
router.get('/genres', getUniqueGenres);
router.get('/years', getUniqueYears);
router.route('/recently-updated').get(getRecentlyUpdatedAnimes);
router.get('/studio/:studioName', getAnimeByStudio);


// <-- CÁC ROUTE CHO CHỨC NĂNG XẾP HẠNG  -->
router.get('/top-rated', getTopRatedAnimes);
router.get('/most-watched', getMostWatchedAnimes);
router.get('/trending-today', getTrendingAnimes);


// Các route yêu cầu bảo vệ (đã đăng nhập)
router.get('/following', protect, getFollowingAnimes);
router.get('/:id/my-rating', protect, getAnimeUserRating);
router.post('/:id/watch-history', optionalProtect, recordWatchHistory);
router.route('/watch-history').get(protect, getWatchHistory);
router.route('/watch-history/clear').delete(protect, clearWatchHistory);
router.post('/:id/comments', protect, createAnimeComment);
router.post('/:id/rating', protect, createAnimeRating);
router.put('/:id', protect, admin, upload.single('image'), updateAnime);
router.delete('/:id', protect, admin, deleteAnime);


// Route để lưu một anime vào danh sách xem sau của người dùng
router.post('/save', protect, saveAnimeForLater);

// Route để lấy danh sách anime đã lưu của người dùng
router.get('/saved', protect, getSavedAnimes);

// Thêm route mới cho chức năng theo dõi
router.route('/follow').post(protect, followAnime);

// <-- XÓA ANIME KHỎI DANH SÁCH ĐÃ LƯU -->
router.delete('/save/:animeId', protect, removeSavedAnime);

// Route đề xuất anime cùng thể loại đang xem
router.get('/:id/related', getRelatedAnimes);


// --- Các route chung chung cần đặt xuống cuối cùng ---
router.post('/', protect, admin, upload.single('image'), createAnime);
router.get('/', getAnime);
router.get('/:id', getAnimeById);


export default router;