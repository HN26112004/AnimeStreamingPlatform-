// src/utils/sendEmail.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Đảm bảo dotenv được cấu hình để đọc biến môi trường

const sendEmail = async (options) => {
    try {
    // 1. Tạo transporter (cấu hình dịch vụ email)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465 ? true : false, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
              rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false 
        }
    });

    // 2. Định nghĩa tùy chọn email
    const mailOptions = {
        from: process.env.EMAIL_FROM_NAME 
                  ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>` 
                  : process.env.EMAIL_USER,  // Địa chỉ email gửi đi
        to: options.email, // Địa chỉ email nhận
        subject: options.subject, // Tiêu đề email
        html: options.message, // Nội dung email (HTML)
    };

    // 3. Gửi email
    await transporter.sendMail(mailOptions);
        console.log(`Email đã được gửi thành công đến ${options.email}`);
        return true; // Trả về true nếu gửi thành công
    } catch (error) {
        console.error(`Lỗi khi gửi email đến ${options.email}:`, error);
        // Ném lại lỗi để hàm gọi (ví dụ: userController) có thể bắt và xử lý nó
        throw new Error('Không thể gửi email. Vui lòng kiểm tra nhật ký máy chủ và cấu hình email.'); 
    }
};


export default sendEmail;