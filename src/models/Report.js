// src/models/Report.js
import mongoose from 'mongoose';

const reportSchema = mongoose.Schema({
  anime: { type: mongoose.Schema.Types.ObjectId, ref: 'Anime', required: true },
  episode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);
export default Report;