import cron from 'node-cron';
import Anime from './models/Anime.js'; 
import User from './models/User.js';   
import Episode from './models/Episode.js';
import sendEmail from './utils/sendEmail.js';

const checkNewEpisodes = async () => {
  console.log(`\n[CRON] Đang chạy tác vụ kiểm tra tập phim mới.`);
  const currentTime = new Date();
  const tenMinutesAgo = new Date(currentTime.getTime() - 1000 * 60 * 10);
  console.log(`[CRON] Thời điểm hiện tại: ${currentTime.toISOString()}`);
  console.log(`[CRON] Lọc các anime cập nhật sau: ${tenMinutesAgo.toISOString()}`);

  try {
    const animes = await Anime.find({
      lastEpisodeUpdatedAt: { $gte: tenMinutesAgo },
      'followers.0': { $exists: true }
    }).populate('followers', 'email');

    console.log(`[CRON] Tìm thấy ${animes.length} anime được cập nhật gần đây và có người theo dõi.`);

    if (animes.length === 0) {
      console.log("[CRON] Không có anime nào được cập nhật gần đây hoặc không có người theo dõi.");
      return;
    }

    for (const anime of animes) {
      console.log(`\n[CRON] → Anime: ${anime.name}`);
      console.log(`[CRON] → lastEpisodeUpdatedAt: ${anime.lastEpisodeUpdatedAt.toISOString()}`);
      console.log(`[CRON] → Số người theo dõi: ${anime.followers.length}`);
      console.log(`[CRON] → latestEpisode hiện tại: ${anime.latestEpisode}`);

      const latestEpisode = await Episode.findOne({ anime: anime._id }).sort({ episodeNumber: -1 });

      if (!latestEpisode) {
        console.log(`[CRON] → Không tìm thấy tập nào cho anime này.`);
        continue;
      }

      console.log(`[CRON] → Tập mới nhất: ${latestEpisode.episodeNumber}`);

      if (latestEpisode.createdAt >= tenMinutesAgo) {
        console.log(`[CRON] ✅ Phát hiện tập mới cho anime: ${anime.name}`);

        for (const follower of anime.followers) {
          console.log(`[CRON] → Gửi email tới: ${follower.email}`);

          const emailHtml = `
            <h2>Tập mới đã ra mắt cho ${anime.name}!</h2>
            <p>Tập ${latestEpisode.episodeNumber} của anime đã có trên AnimeHub.</p>
            <p>Hãy truy cập ngay để xem: <a href="${process.env.FRONTEND_URL}/anime/${anime._id}">Xem Ngay</a></p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          `;

          await sendEmail({
            email: follower.email,
            subject: `AnimeHub: Tập mới của ${anime.name} đã ra mắt!`,
            html: emailHtml,
          });

          console.log(`[CRON] ✅ Đã gửi email thông báo tới: ${follower.email}`);
        }

        anime.latestEpisode = latestEpisode.episodeNumber;
        await anime.save();
        console.log(`[CRON] → Đã cập nhật latestEpisode thành ${anime.latestEpisode}`);
      } else {
        console.log(`[CRON] ❌ Tập mới không lớn hơn latestEpisode. Không gửi email.`);
      }
    }
  } catch (error) {
    console.error('[CRON] ❌ Lỗi khi chạy tác vụ cron:', error);
  }
};

const startCronJobs = () => {
  cron.schedule('*/01 * * * *', checkNewEpisodes);
};

export default startCronJobs;

