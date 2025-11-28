import Anime from '../models/Anime.js';
import Episode from '../models/Episode.js';
import User from '../models/User.js';
import Report from '../models/Report.js';

export const getErrorReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('anime', 'title')
      .populate('episode', 'episodeNumber')
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách báo lỗi' });
  }
};



export const getGrowthStats = async (req, res) => {
  try {
    const animeGrowth = await Anime.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
    ]);

    const episodeGrowth = await Episode.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
    ]);

    const userGrowth = await User.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
    ]);

    

    res.json({
      animeGrowth,
      episodeGrowth,
      userGrowth,
      
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
  }
};