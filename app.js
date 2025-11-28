// app.js

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import animeRoutes from './src/routes/animeRoutes.js';
import userRoutes from './src/routes/userRoutes.js'; 
import episodeRoutes from './src/routes/episodeRoutes.js'; 
import statsRoutes from './src/routes/statsRoutes.js'
import startCronJobs from './src/cronJobs.js'; 
import adminRoutes from './src/routes/adminRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';




import path from 'path';
import cors from 'cors';

dotenv.config();

// Kết nối Database
connectDB();

const app = express();

// Cấu hình CORS
app.use(cors());

// Middleware để parse JSON body
app.use(express.json());

// Định nghĩa các Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/episodes', episodeRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api', reportRoutes);




// Phục vụ các file tĩnh từ thư mục 'uploads'
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Kích hoạt tác vụ cron job
startCronJobs();

// Route mặc định
app.get('/', (_req, res) => {
    res.send('API đang chạy...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));