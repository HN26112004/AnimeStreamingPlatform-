import Anime from '../models/Anime.js';
import Episode from '../models/Episode.js';
import User from '../models/User.js';
import Report from '../models/Report.js';

export const getErrorReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('anime', 'name')
      .populate('episode', 'episodeNumber')
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách báo lỗi' });
  }
};

// Hàm tính thống kê tích lũy theo tháng
export const getStats = async (req, res) => {
  try {
    // Lấy tất cả dữ liệu
    const animes = await Anime.find({}, 'createdAt views');
    const episodes = await Episode.find({}, 'createdAt');
    const users = await User.find({}, 'createdAt');
    const reports = await Report.find({}, 'createdAt');

    // Hàm tính mảng 12 tháng tích lũy theo số lượng
    const buildCumulative = (items) => {
      const monthly = Array(12).fill(0);
      items.forEach((item) => {
        const month = new Date(item.createdAt).getMonth(); // 0–11
        monthly[month] += 1;
      });
      return monthly.reduce((acc, val, i) => {
        acc.push((acc[i - 1] || 0) + val);
        return acc;
      }, []);
    };

    // Hàm tính mảng 12 tháng tích lũy theo tổng lượt xem
    const buildViewStats = (items) => {
      const monthly = Array(12).fill(0);
      items.forEach((item) => {
        const month = new Date(item.createdAt).getMonth(); // 0–11
        monthly[month] += item.views || 0;
      });
      return monthly.reduce((acc, val, i) => {
        acc.push((acc[i - 1] || 0) + val);
        return acc;
      }, []);
    };

    const animeStats = buildCumulative(animes);
    const episodeStats = buildCumulative(episodes);
    const userStats = buildCumulative(users);
    const reportStats = buildCumulative(reports);
    const viewStats = buildViewStats(animes);

    res.json({
      animeStats,
      episodeStats,
      userStats,
      reportStats,
      viewStats,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
  }
};