// src/middlewares/uploadMiddleware.js

    import multer from 'multer';
    import path from 'path'; // Module 'path' để làm việc với đường dẫn file
    import fs from 'fs'; // Module 'fs' để làm việc với hệ thống file

    // Đảm bảo thư mục 'uploads' tồn tại
    const uploadDir = path.join(process.cwd(), 'uploads'); // Đường dẫn tuyệt đối đến thư mục uploads
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Cấu hình lưu trữ cho Multer
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Lưu file vào thư mục 'uploads'
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            // Tạo tên file duy nhất: tên_file_gốc-timestamp.đuôi_mở_rộng
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

    // Lọc loại file (chỉ cho phép ảnh)
    const fileFilter = (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Các loại file ảnh cho phép
        const mimetype = filetypes.test(file.mimetype); // Kiểm tra mimetype
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Kiểm tra đuôi file

        if (mimetype && extname) {
            return cb(null, true); // Cho phép tải lên
        } else {
            cb(new Error('Chỉ cho phép tải lên file ảnh (JPEG, JPG, PNG, GIF)!')); // Từ chối tải lên
        }
    };

    // Khởi tạo Multer upload middleware
    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn kích thước file 5MB
    });

    export default upload;