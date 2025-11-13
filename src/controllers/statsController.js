import asyncHandler from 'express-async-handler';
import WatchHistory from '../models/WatchHistory.js';
import Anime from '../models/Anime.js';
import mongoose from 'mongoose';

export const getAnimeStats = asyncHandler(async (req, res) => {
  const animeId = req.params.id;
  const userId = req.user?._id || null;

  if (!mongoose.Types.ObjectId.isValid(animeId)) {
    return res.status(400).json({ message: 'ID anime không hợp lệ.' });
  }

  try {
    // Ghi nhận lượt xem nếu chưa ghi nhận gần đây
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const alreadyViewed = await WatchHistory.findOne({
      anime: animeId,
      user: userId,
      viewedAt: { $gte: oneHourAgo },
    });

    if (!alreadyViewed) {
      await WatchHistory.create({
        anime: animeId,
        user: userId,
        viewedAt: new Date(),
      });

      await Anime.findByIdAndUpdate(animeId, {
        $inc: { totalViews: 1 },
      });
    }

    // Thống kê lượt xem
    const registeredViews = await WatchHistory.countDocuments({
      anime: animeId,
      user: { $ne: null },
    });

    const anonymousViews = await WatchHistory.countDocuments({
      anime: animeId,
      user: null,
    });

    const uniqueViewers = await WatchHistory.distinct('user', {
      anime: animeId,
      user: { $ne: null },
    });

    const dailyViews = await WatchHistory.aggregate([
      { $match: { anime: new mongoose.Types.ObjectId(animeId) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      animeId,
      totalViews: registeredViews + anonymousViews,
      registeredViews,
      anonymousViews,
      totalUniqueViewers: uniqueViewers.length,
      dailyViews,
      message: alreadyViewed ? 'Đã ghi nhận trước đó' : 'Đã ghi nhận lượt xem mới',
    });
  } catch (error) {
    console.error('Lỗi khi thống kê lượt xem:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
});

