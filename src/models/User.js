// src/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Định nghĩa Schema cho một mục trong lịch sử xem
const watchHistorySchema = mongoose.Schema({
    anime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime',
        required: true,
    },
    watchedAt: {
        type: Date,
        default: Date.now,
    },
});

// Định nghĩa Schema chính cho User
const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        savedAnimes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Anime'
        }],
        // Sử dụng sub-schema mới cho lịch sử xem
        watchHistory: [watchHistorySchema],
        // THÊM TRƯỜNG MỚI CHO CHỨC NĂNG THEO DÕI
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Anime'
        }],
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true
    }
);

// Middleware của Mongoose: Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Phương thức của Mongoose: So sánh mật khẩu đã nhập với mật khẩu đã mã hóa
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo Model từ Schema
const User = mongoose.model('User', userSchema);

export default User;