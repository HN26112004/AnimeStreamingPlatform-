// src/controllers/episodeController.js

import Anime from '../models/Anime.js';
import Episode from '../models/Episode.js';
import cloudinary from '../config/cloudinary.js';

import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// @desc      Tải lên file video
// @route     POST /api/episodes/upload-video
// @access    Private/Admin
const uploadVideo = asyncHandler(async (req, res) => {
  const { episodeId } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('Vui lòng chọn file video để tải lên.');
  }

  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'video' },
    async (error, result) => {
      if (error) {
        console.error('Lỗi Cloudinary:', error);
        res.status(500).json({ error: 'Lỗi khi upload lên Cloudinary' });
        return;
      }

      // Cập nhật episode với URL CDN
      const episode = await Episode.findByIdAndUpdate(
        episodeId,
        { videoFile: result.secure_url },
        { new: true }
      );

      res.status(200).json({
        message: 'Tải video lên Cloudinary thành công.',
        videoFile: result.secure_url,
        episode,
      });
    }
  );

  stream.end(req.file.buffer);
});
const downloadEpisode = asyncHandler(async (req, res) => {
  const episode = await Episode.findById(req.params.id);
  if (!episode || !episode.videoFile) {
    res.status(404);
    throw new Error('Không tìm thấy video để tải.');
  }

  // Kiểm tra quyền (đã đăng nhập)
  if (!req.user) {
    res.status(401);
    throw new Error('Bạn cần đăng nhập để tải video.');
  }

  // Nếu là Cloudinary URL → redirect để tải
  if (episode.videoFile.startsWith('https://res.cloudinary.com')) {
    return res.redirect(episode.videoFile);
  }

  // Nếu là file local
  const filePath = path.join(process.cwd(), episode.videoFile);
  res.download(filePath);
});



// @desc      Tạo mùa mới cho một Anime (placeholder hoặc logic mở rộng)
// @route     POST /api/episodes/add-season
// @access    Private/Admin
const addSeason = asyncHandler(async (req, res) => {
    const { animeId, seasonNumber } = req.body;

    if (!animeId || seasonNumber == null) {
        res.status(400);
        throw new Error('Thiếu animeId hoặc seasonNumber.');
    }

    // Kiểm tra anime tồn tại
    const anime = await Anime.findById(animeId);
    if (!anime) {
        res.status(404);
        throw new Error('Không tìm thấy Anime để thêm mùa.');
    }

    // Kiểm tra xem mùa đã tồn tại chưa (dựa trên tập phim có cùng seasonNumber)
    const seasonExists = await Episode.findOne({ anime: animeId, seasonNumber });
    if (seasonExists) {
        res.status(400);
        throw new Error(`Mùa ${seasonNumber} đã tồn tại. Vui lòng chọn số mùa khác.`);
    }

    // Tạo một tập phim placeholder để đánh dấu mùa mới (không có video)
    const placeholderEpisode = new Episode({
        anime: animeId,
        seasonNumber,
        episodeNumber: 0,
        title: `Mùa ${seasonNumber}`,
        desc: 'Placeholder mùa mới',
        videoUrl: '',
        videoFile: '',
    });

    const createdSeason = await placeholderEpisode.save();

    res.status(201).json({
        message: `Tạo mùa ${seasonNumber} thành công.`,
        season: createdSeason,
    });
});



// @desc      Thêm một tập phim mới
// @route     POST /api/episodes
// @access    Private/Admin
const addEpisode = asyncHandler(async (req, res) => {
    const { animeId, seasonNumber, episodeNumber, title, desc, videoUrl } = req.body;

    // Kiểm tra đầu vào
    if (!animeId || seasonNumber == null || episodeNumber == null || !title) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc để thêm tập phim.' });
    }

    if (!mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(400).json({ message: 'animeId không hợp lệ.' });
    }

    const anime = await Anime.findById(animeId);
    if (!anime) {
        return res.status(404).json({ message: 'Không tìm thấy Anime để thêm tập phim.' });
    }

    // Kiểm tra tập đã tồn tại chưa
    const episodeExists = await Episode.findOne({
        anime: animeId,
        seasonNumber,
        episodeNumber
    });

    if (episodeExists) {
        return res.status(400).json({ message: `Tập ${episodeNumber} đã tồn tại trong mùa ${seasonNumber}.` });
    }

    // Tạo tập phim mới
    const episode = new Episode({
        anime: animeId,
        seasonNumber,
        episodeNumber,
        title,
        desc: desc || '',
        videoUrl: videoUrl || '',
        videoFile:  ''
    });

    const createdEpisode = await episode.save();

    // Cập nhật latestEpisode nếu cần
    if (episodeNumber > anime.latestEpisode) {
        anime.latestEpisode = episodeNumber;
        anime.lastEpisodeUpdatedAt = new Date();
        await anime.save();
    }

    res.status(201).json({
        message: `Thêm Tập ${episodeNumber} thành công.`,
        episode: createdEpisode
    });
});






// @desc      Lấy tất cả tập phim theo ID Anime
// @route     GET /api/episodes/:animeId/all
// @access    Public
const getEpisodesByAnimeId = asyncHandler(async (req, res) => {
    const { animeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(400).json({ message: 'animeId không hợp lệ.' });
    }

    const anime = await Anime.findById(animeId).select('name').lean();
    if (!anime) {
        return res.status(404).json({ message: 'Không tìm thấy Anime.' });
    }

    const episodes = await Episode.find({ anime: animeId })
        .sort({ seasonNumber: 1, episodeNumber: 1 })
        .lean();

    const seasonsMap = new Map();
    episodes.forEach(episode => {
        const season = episode.seasonNumber || 1;
        if (!seasonsMap.has(season)) {
            seasonsMap.set(season, {
                seasonNumber: season,
                episodes: []
            });
        }
        seasonsMap.get(season).episodes.push(episode);
    });

    const seasons = Array.from(seasonsMap.values());

    res.status(200).json({
        animeName: anime.name,
        seasons: seasons
    });
});
// @desc      Lấy danh sách mùa và tập theo animeId
// @route     GET /api/episodes/by-anime/:animeId
// @access    Public
const getEpisodesByAnime = asyncHandler(async (req, res) => {
  const { animeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(animeId)) {
    return res.status(400).json({ message: 'animeId không hợp lệ.' });
  }

  const episodes = await Episode.find({ anime: animeId })
    .sort({ seasonNumber: 1, episodeNumber: 1 })
    .lean();

  const seasonsMap = new Map();
  episodes.forEach(episode => {
    const season = episode.seasonNumber || 1;
    if (!seasonsMap.has(season)) {
      seasonsMap.set(season, {
        seasonNumber: season,
        episodes: []
      });
    }
    seasonsMap.get(season).episodes.push(episode);
  });

  const seasons = Array.from(seasonsMap.values());

  res.status(200).json({ seasons });
});





const updateEpisode = asyncHandler(async (req, res) => {
    const { seasonNumber, episodeNumber, title, desc, videoUrl, videoFile } = req.body;
    
    const episode = await Episode.findById(req.params.id);

    if (!episode) {
        res.status(404);
        throw new Error('Không tìm thấy tập phim.');
    }

    const oldEpisodeNumber = episode.episodeNumber;
    const animeId = episode.anime;
    
    episode.seasonNumber = seasonNumber !== undefined ? seasonNumber : episode.seasonNumber;
    episode.episodeNumber = episodeNumber !== undefined ? episodeNumber : episode.episodeNumber;
    episode.title = title !== undefined ? title : episode.title;
    episode.desc = desc !== undefined ? desc : episode.desc;
    episode.videoUrl = videoUrl !== undefined ? videoUrl : episode.videoUrl;
    episode.videoFile = videoFile !== undefined ? videoFile : episode.videoFile;

    const updatedEpisode = await episode.save();

    // Cập nhật lại latestEpisode của Anime nếu số tập thay đổi
    if (episodeNumber !== undefined || oldEpisodeNumber !== updatedEpisode.episodeNumber) {
        const anime = await Anime.findById(animeId);
        
        // Tìm số tập lớn nhất trong collection Episode cho anime này
        const latestEpisodeData = await Episode.findOne({ anime: animeId })
            .sort({ episodeNumber: -1 })
            .select('episodeNumber')
            .lean();

        const newLatest = latestEpisodeData ? latestEpisodeData.episodeNumber : 0;
        
        if (anime) {
            if (newLatest !== anime.latestEpisode) {
                anime.latestEpisode = newLatest;
                anime.lastEpisodeUpdatedAt = new Date(); // Đánh dấu là có cập nhật
                await anime.save();
            } else if (newLatest === anime.latestEpisode && newLatest === updatedEpisode.episodeNumber) {
                // Trường hợp chỉ sửa nội dung/video của tập mới nhất
                anime.lastEpisodeUpdatedAt = new Date();
                await anime.save();
            }
        }
    }

    res.json({
        message: 'Tập phim đã được cập nhật thành công.',
        episode: updatedEpisode
    });
});


// @desc      Xóa một tập phim
// @route     DELETE /api/episodes/:id
// @access    Private/Admin
const deleteEpisode = asyncHandler(async (req, res) => {
    const episode = await Episode.findById(req.params.id);
    if (!episode) {
        res.status(404);
        throw new Error('Không tìm thấy tập phim để xóa.');
    }

    const animeId = episode.anime;
    
    // 1. Xóa file video nếu có
    if (episode.videoFile && episode.videoFile.startsWith('https://res.cloudinary.com')) {
  
} else if (episode.videoFile) {
  const filePath = path.join(process.cwd(), episode.videoFile);
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Lỗi khi xóa file video ${episode.videoFile}:`, err);
  });
}



    // 2. Xóa tài liệu Episode
    await episode.deleteOne();
    
    // 3. Cập nhật lại Model Anime
    const anime = await Anime.findById(animeId);
    if (anime) {
        // Tìm số tập lớn nhất còn lại
        const latestEpisodeData = await Episode.findOne({ anime: animeId })
            .sort({ episodeNumber: -1 })
            .select('episodeNumber')
            .lean();

        const newLatest = latestEpisodeData ? latestEpisodeData.episodeNumber : 0;

        if (newLatest !== anime.latestEpisode) {
            anime.latestEpisode = newLatest;
            anime.lastEpisodeUpdatedAt = new Date(); 
            await anime.save();
        }
    }

    res.json({ message: 'Tập phim đã được xóa thành công.' });
});

export {
    uploadVideo,
    addSeason,
    addEpisode,
    getEpisodesByAnimeId,
     getEpisodesByAnime,
    updateEpisode,
    deleteEpisode,
     downloadEpisode 
};