// src/config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Lấy chuỗi kết nối từ biến môi trường
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Thoát ứng dụng nếu không kết nối được database
    }
};

export default connectDB;