import multer from 'multer';

// Bộ lọc file: chỉ cho phép video
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    const error = new Error('Chỉ cho phép tải lên file video!');
    error.code = 'INVALID_VIDEO_FILE';
    cb(error, false);
  }
};

// Dùng bộ nhớ RAM thay vì lưu vào thư mục
const storage = multer.memoryStorage();

const uploadVideoMiddleware = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // Giới hạn 100MB, bạn có thể tăng nếu cần
});

export default uploadVideoMiddleware;

