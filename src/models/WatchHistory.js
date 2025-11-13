import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // ✅ Cho phép null để ghi lượt xem ẩn danh
  },
  anime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('WatchHistory', watchHistorySchema);

