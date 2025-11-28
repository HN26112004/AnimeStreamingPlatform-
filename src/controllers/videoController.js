import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import Episode from '../models/Episode.js';
import { convertToWebm, convertToHLS } from '../utils/convertVideo.js';

export const uploadAndConvertVideo = async (req, res) => {
  try {
    console.log(' req.body:', req.body);
    console.log(' req.file:', req.file);

    console.log(' Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'
    });

    const { episodeId } = req.body;
    console.log(' Nhận yêu cầu upload video cho episodeId:', episodeId);

    if (!episodeId) {
      console.warn(' Thiếu episodeId trong req.body');
      return res.status(400).json({ message: 'Thiếu episodeId trong yêu cầu.' });
    }

    if (!req.file || !req.file.path) {
      console.warn(' Không có file video được upload.');
      return res.status(400).json({ message: 'Thiếu file video trong yêu cầu.' });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      console.warn(' Không tìm thấy tập phim với ID:', episodeId);
      return res.status(404).json({ message: 'Không tìm thấy tập phim.' });
    }

    console.log(' Tìm thấy tập phim:', episode.title);

    const inputPath = req.file.path.replace(/\\/g, '/');
    const absolutePath = path.resolve(req.file.path);
    const baseName = path.parse(inputPath).name;

    const webmPath = `uploads/videos/${baseName}.webm`;
    const hlsDir = `uploads/videos/${baseName}_hls`;
    const hlsPath = `${hlsDir}/index.m3u8`;

    console.log(' Đường dẫn video gốc:', inputPath);
    console.log(' Đường dẫn tuyệt đối:', absolutePath);
    console.log(' Đường dẫn WebM:', webmPath);
    console.log(' Thư mục HLS:', hlsDir);

    // Kiểm tra file tồn tại trước khi convert
    const fileExists = fs.existsSync(absolutePath);
    const fileSize = fileExists ? fs.statSync(absolutePath).size : 0;
    console.log(' File tồn tại:', fileExists);
    console.log(' Kích thước file (bytes):', fileSize);

    if (!fileExists || fileSize === 0) {
      console.error('File không tồn tại hoặc rỗng trước khi chuyển đổi.');
      return res.status(400).json({ message: 'File không tồn tại hoặc rỗng.' });
    }

    //  Chuyển đổi video
    console.log(' Bắt đầu convert sang WebM...');
    await convertToWebm(inputPath, webmPath);
    console.log(' Convert WebM xong.');

    console.log(' Bắt đầu convert sang HLS...');
    await convertToHLS(inputPath, hlsDir);
    console.log(' Convert HLS xong.');

    //  Upload lên Cloudinary
    console.log(' Bắt đầu upload lên Cloudinary...');
    const cloudResult = await cloudinary.uploader.upload_large(absolutePath, {
      resource_type: 'video',
      folder: 'anime-videos'
    });

    console.log(' Cloudinary upload thành công:', cloudResult.secure_url);

    const formats = {
      mp4: `/uploads/videos/${baseName}.mp4`,

      webm: `/uploads/videos/${baseName}.webm`,

      hls: `/uploads/videos/${baseName}_hls/index.m3u8`
    };

    console.log(' Gán videoFormats:', formats);

    const updatedEpisode = await Episode.findByIdAndUpdate(
      episodeId,
      {
        $set: {
          videoFile: formats.webm,
          videoFormats: formats,
          cloudVideoUrl: cloudResult.secure_url
        }
      },
      { new: true }
    );

    console.log(' Đã lưu episode thành công:', updatedEpisode.videoFormats);

    res.json({
      message: 'Chuyển đổi và lưu video thành công.',
       episodeId: updatedEpisode._id,
  videoFile: updatedEpisode.videoFile,   // dùng giá trị đã lưu trong DB
  formats: updatedEpisode.videoFormats,
  cloudVideoUrl: updatedEpisode.cloudVideoUrl


    });
  } catch (err) {
    console.error(' Lỗi Cloudinary:', err);
    console.error(' err.message:', err?.message);
    console.error(' err.name:', err?.name);
    console.error(' err.http_code:', err?.http_code);
    console.error(' err.stack:', err?.stack);
    res.status(500).json({
      error: 'Lỗi khi upload lên Cloudinary',
      message: err?.message,
      name: err?.name,
      http_code: err?.http_code,
      stack: err?.stack
    });
  }
};