import multer from 'multer';
import path from 'path';

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos'); 
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(null, false);
        const error = new Error('Chỉ cho phép tải lên file video!');
        error.code = 'INVALID_VIDEO_FILE';
        cb(error, false);
    }
};

const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

export default uploadVideo;