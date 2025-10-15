// src/controllers/userController.js

import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Anime from '../models/Anime.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExistsByEmail = await User.findOne({ email });
        const userExistsByUsername = await User.findOne({ username });

        if (userExistsByEmail) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }
        if (userExistsByUsername) {
            return res.status(400).json({ message: 'Tên người dùng đã được sử dụng.' });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
        }
    } catch (error) {
        console.error('Lỗi khi đăng ký người dùng:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};


// @desc    Xác thực người dùng & lấy token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ.' });
        }
    } catch (error) {
        console.error('Lỗi khi xác thực người dùng:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};

// @desc    Tạo người dùng mới bởi Admin
// @route   POST /api/auth/users
// @access  Private/Admin
const createUserByAdmin = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const userExistsByEmail = await User.findOne({ email });
        const userExistsByUsername = await User.findOne({ username });

        if (userExistsByEmail) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }
        if (userExistsByUsername) {
            return res.status(400).json({ message: 'Tên người dùng đã được sử dụng.' });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: ['user', 'admin'].includes(role) ? role : 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
        }
    } catch (error) {
        console.error('Lỗi khi Admin tạo người dùng:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};


// @desc    Admin cập nhật vai trò người dùng
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRoleByAdmin = async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ. Chỉ được phép "user" hoặc "admin".' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: `Vai trò của người dùng ${user.username} đã được cập nhật thành ${user.role}.`,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Lỗi khi Admin cập nhật vai trò người dùng:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};

// @desc    Lấy lịch sử xem anime của người dùng đã đăng nhập
// @route   GET /api/auth/profile/watch-history
// @access  Private
const getWatchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('watchHistory').populate({
            path: 'watchHistory._id',
            model: 'Anime',
            select: 'name image genres year studio episodes.episodeNumber episodes.title episodes.video'
        });

        if (user) {
            const historyWithDetails = user.watchHistory.filter(item => item._id !== null);
            historyWithDetails.sort((a, b) => b.watchedAt - a.watchedAt);
            res.json(historyWithDetails);
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử xem anime:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};

// @desc    Lấy thống kê ứng dụng (tổng số người dùng, tổng số anime, tổng số đánh giá)
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getAppStatistics = async (_req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAnime = await Anime.countDocuments();
        const allAnime = await Anime.find({});
        let totalReviews = 0;
        allAnime.forEach(anime => {
            totalReviews += anime.reviews.length;
        });

        res.json({
            totalUsers,
            totalAnime,
            totalReviews,
        });

    } catch (error) {
        console.error('Lỗi khi lấy thống kê ứng dụng:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};

// @desc    Yêu cầu đặt lại mật khẩu (gửi email với token)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một liên kết đặt lại mật khẩu.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `
            <h1>Bạn đã yêu cầu đặt lại mật khẩu</h1>
            <p>Vui lòng truy cập liên kết này để đặt lại mật khẩu của bạn:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Yêu cầu đặt lại mật khẩu của bạn ',
                message,
            });

            res.status(200).json({ message: 'Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một liên kết đặt lại mật khẩu.' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            console.error('Lỗi gửi email đặt lại mật khẩu:', error);
            res.status(500).json({ message: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.' });
        }

    } catch (error) {
        console.error('Lỗi khi yêu cầu đặt lại mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};

// @desc    Đặt lại mật khẩu bằng token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const rawResetToken = req.params.token;
    const { password } = req.body;

    const hashedToken = crypto
        .createHash('sha256')
        .update(rawResetToken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.' });

    } catch (error) {
        console.error('Lỗi khi đặt lại mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};


// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    // req.user được gán từ middleware 'protect'
    if (req.user) {
        res.json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        });
    } else {
        res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
};

// Export tất cả các hàm
export { registerUser, authUser, createUserByAdmin, updateUserRoleByAdmin, getWatchHistory, getAppStatistics, forgotPassword, resetPassword, getMe };