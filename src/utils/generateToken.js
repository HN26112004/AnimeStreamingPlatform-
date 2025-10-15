// src/utils/generateToken.js

import jwt from 'jsonwebtoken';

// Tạo một Secret Key ngẫu nhiên và an toàn:
//  có thể tạo một secret key ngẫu nhiên bằng cách chạy lệnh sau trong terminal (một lần duy nhất):
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Sao chép kết quả và dán vào file .env dưới dạng JWT_SECRET.

// Hàm tạo JWT Token
const generateToken = (id) => {
    // Ký token với ID của người dùng và SECRET KEY từ biến môi trường
    // Token sẽ hết hạn sau 30 ngày ( expiresIn: '30d' )
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export default generateToken;