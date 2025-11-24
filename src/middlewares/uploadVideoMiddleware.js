import multer from 'multer';
import path from 'path';
import fs from 'fs';

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    const error = new Error('Chỉ cho phép tải lên file video!');
    error.code = 'INVALID_VIDEO_FILE';
    cb(error, false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/videos';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}-video${ext}`);
  }
});

const uploadVideoMiddleware = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});

export default uploadVideoMiddleware;