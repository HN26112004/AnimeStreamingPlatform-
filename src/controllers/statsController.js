import asyncHandler from 'express-async-handler';
import WatchHistory from '../models/WatchHistory.js';
import mongoose from 'mongoose';

export const getAnimeStats = asyncHandler(async (req, res) => {
  const animeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(animeId)) {
    return res.status(400).json({ message: 'ID anime không hợp lệ.' });
  }

  try {
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
    });
  } catch (error) {
    console.error('Lỗi khi thống kê lượt xem:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
});
