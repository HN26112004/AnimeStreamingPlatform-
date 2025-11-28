// src/controllers/reportController.js
import Report from '../models/Report.js';

export const reportPlaybackError = async (req, res) => {
  const { animeId, episodeId } = req.body;
  const userId = req.user._id;

  try {
    const report = new Report({ anime: animeId, episode: episodeId, user: userId });
    await report.save();
    res.status(201).json({ message: 'Đã ghi nhận báo lỗi' });
  } catch (error) {
    console.error("Lỗi khi lưu báo lỗi:", error);
    res.status(500).json({ message: 'Lỗi server khi báo lỗi' });
  }
};