import Anime from '../models/Anime.js';
import User from '../models/User.js';
import Episode from '../models/Episode.js'; // <-- BỔ SUNG: Import model Episode
import NodeCache from 'node-cache';
import path from 'path';
import fs from 'fs';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

const animeCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// @desc      Thêm một bộ anime mới
// @route     POST /api/anime
// @access    Private/Admin
const createAnime = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { name, desc, genres, language, year, studio, animeType } = req.body;

  // Lấy đường dẫn từ multer nếu có file upload
  const imagePath = req.files?.image 
    ? `/uploads/${req.files.image[0].filename}` 
    : req.body.image;

  const titleImagePath = req.files?.titleImage 
    ? `/uploads/${req.files.titleImage[0].filename}` 
    : req.body.titleImage;

  const animeExists = await Anime.findOne({ name });
  if (animeExists) {
    res.status(400);
    throw new Error('Bộ anime với tên này đã tồn tại.');
  }

  let parsedGenres = genres;
  if (typeof genres === 'string') {
    try {
      parsedGenres = JSON.parse(genres);
    } catch (err) {
      parsedGenres = [genres]; // fallback: nếu chỉ là một chuỗi đơn
    }
  }

  const anime = await Anime.create({
    user: _id,
    name,
    desc,
    image: imagePath,
    titleImage: titleImagePath,
    genres: parsedGenres,
    language,
    year,
    studio,
    animeType,
    latestEpisode: 0,
  });

  if (anime) {
    res.status(201).json({
      message: 'Bộ anime đã được tạo thành công.',
      anime: {
        _id: anime._id,
        name: anime.name,
        image: anime.image,
        animeType: anime.animeType,
        latestEpisode: anime.latestEpisode,
      }
    });
  } else {
    res.status(400);
    throw new Error('Dữ liệu anime không hợp lệ.');
  }
});

// @desc      Lấy tất cả các bộ anime với phân trang, lọc và tìm kiếm (có cache)
// @route     GET /api/anime?pageNumber=<page>&pageSize=<limit>&name=<name>&genres=<genres>&year=<year>&castName=<castName>&studio=<studio>&type=<type>
// @access    Public
const getAnime = asyncHandler(async (req, res) => {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = animeCache.get(cacheKey);

    if (cachedData) {
        console.log('Phục vụ anime từ cache:', cacheKey);
        return res.json(cachedData);
    }

    const page = parseInt(req.query.pageNumber) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    if (req.query.name) {
        filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.genres) {
        const genres = req.query.genres.split(',').map(g => new RegExp(g.trim(), 'i'));
        filter.genres = { $in: genres };
    }
    if (req.query.year) {
        const years = req.query.year.split(',').map(y => parseInt(y.trim()));
        filter.year = { $in: years.filter(year => !isNaN(year)) };
    }
    if (req.query.castName) {
        filter['cast.name'] = { $regex: req.query.castName, $options: 'i' };
    }
    if (req.query.studio) {
        filter.studio = { $regex: req.query.studio, $options: 'i' };
    }
    if (req.query.type) {
        const types = req.query.type.split(',').map(t => t.trim());
        filter.animeType = { $in: types };
    }

    const totalAnime = await Anime.countDocuments(filter);
    const anime = await Anime.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalAnime / limit);

    const responseData = {
        anime,
        page,
        limit,
        totalAnime,
        totalPages,
    };

    animeCache.set(cacheKey, responseData);
    console.log('Lưu anime vào cache:', cacheKey);

    res.json(responseData);
});

// @desc      Lấy một bộ anime theo ID VÀ POPULATE COMMENTS, EPISODES
// @route     GET /api/anime/:id
// @access    Public
const getAnimeById = asyncHandler(async (req, res) => {
    try {
        const anime = await Anime.findById(req.params.id)
            .populate({
                path: 'comments.user',
                select: 'username avatar'
            });

        if (anime) {
            const episodes = await Episode.find({ anime: req.params.id })
            .select('seasonNumber episodeNumber title desc videoFormats')
            .sort({ seasonNumber: 1, episodeNumber: 1 })
            .lean();
            
            // Tăng lượt xem khi người dùng xem chi tiết anime
            anime.totalViews = (anime.totalViews || 0) + 1;
            anime.viewsToday = (anime.viewsToday || 0) + 1;
            await anime.save();

            const animeWithEpisodes = {
                ...anime.toObject(),
                episodes: episodes
            };

            res.json(animeWithEpisodes);
        } else {
            res.status(404).json({ message: 'Không tìm thấy bộ anime.' });
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm anime theo ID:", error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'ID anime không hợp lệ.' });
        } else {
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
        }
    }
});

// @desc      Cập nhật thông tin một bộ anime
// @route     PUT /api/anime/:id
// @access    Private/Admin
const updateAnime = asyncHandler(async (req, res) => {
  const { name, desc, genres, language, year, studio, animeType } = req.body;

  // Lấy đường dẫn từ multer nếu có file upload
  const imagePath = req.files?.image 
    ? `/uploads/${req.files.image[0].filename}` 
    : req.body.image;

  const titleImagePath = req.files?.titleImage 
    ? `/uploads/${req.files.titleImage[0].filename}` 
    : req.body.titleImage;

  const anime = await Anime.findById(req.params.id);

  if (anime) {
    anime.name = name || anime.name;
    anime.desc = desc || anime.desc;
    anime.image = imagePath || anime.image;
    anime.titleImage = titleImagePath || anime.titleImage;
    anime.genres = genres || anime.genres;
    anime.language = language || anime.language;
    anime.year = year || anime.year;
    anime.studio = studio || anime.studio;
    anime.animeType = animeType || anime.animeType;

    const updatedAnime = await anime.save();

    res.json({
      message: 'Bộ anime đã được cập nhật thành công.',
      anime: updatedAnime
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy bộ anime để cập nhật.');
  }
});

// @desc      Xóa một bộ anime
// @route     DELETE /api/anime/:id
// @access    Private/Admin
const deleteAnime = asyncHandler(async (req, res) => {
    const anime = await Anime.findById(req.params.id);

    if (anime) {
        const imageToDelete = anime.image;
        if (imageToDelete && imageToDelete.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), imageToDelete);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Lỗi khi xóa file ảnh:', err);
                else console.log('Đã xóa file ảnh:', filePath);
            });
        }
        await anime.deleteOne();
        res.json({ message: 'Bộ anime đã được xóa thành công.' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy bộ anime để xóa.');
    }
});

// --- CÁC HÀM BỔ SUNG CHO CHỨC NĂNG BÌNH LUẬN & ĐÁNH GIÁ ---

// @desc      Tạo một bình luận mới
// @route     POST /api/anime/:id/comments
// @access    Private
const createAnimeComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const animeId = req.params.id;
    const userId = req.user._id;

    const anime = await Anime.findById(animeId);

    if (!anime) {
        res.status(404);
        throw new Error('Không tìm thấy bộ anime.');
    }

    const newComment = {
        user: userId,
        content,
        createdAt: new Date()
    };

    anime.comments.push(newComment);
    await anime.save();

    const savedComment = anime.comments[anime.comments.length - 1];

    await Anime.populate(savedComment, {
        path: 'user',
        select: 'username avatar'
    });

    res.status(201).json(savedComment);
});

// @desc      Tạo/Cập nhật đánh giá của user cho anime
// @route     POST /api/anime/:id/rating
// @access    Private
const createAnimeRating = asyncHandler(async (req, res) => {
    const { rating } = req.body;
    const animeId = req.params.id;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Điểm đánh giá không hợp lệ (phải từ 1 đến 5).');
    }

    const anime = await Anime.findById(animeId);

    if (!anime) {
        res.status(404);
        throw new Error('Không tìm thấy bộ anime.');
    }

    const existingRating = anime.reviews.find(
        (r) => r.user.toString() === userId.toString()
    );

    if (existingRating) {
        existingRating.rating = Number(rating);
    } else {
        const newReview = {
            user: userId,
            rating: Number(rating),
        };
        anime.reviews.push(newReview);
    }

    anime.numberOfReviews = anime.reviews.length;
    anime.rate = anime.reviews.reduce((acc, item) => item.rating + acc, 0) / anime.reviews.length;

    await anime.save();

    res.status(200).json({
        message: 'Đánh giá đã được ghi nhận.',
        newAverageRating: anime.rate,
        newNumberOfReviews: anime.numberOfReviews
    });
});

// @desc      Lấy đánh giá của user hiện tại cho một anime
// @route     GET /api/anime/:id/my-rating
// @access    Private
const getAnimeUserRating = asyncHandler(async (req, res) => {
    const animeId = req.params.id;
    const userId = req.user._id;

    const anime = await Anime.findById(animeId);
    if (!anime) {
        res.status(404);
        throw new Error('Không tìm thấy bộ anime.');
    }

    const userRating = anime.reviews.find(r => r.user.toString() === userId.toString());

    if (userRating) {
        res.json({ rating: userRating.rating });
    } else {
        res.json({ rating: 0 }); // Trả về 0 nếu chưa đánh giá
    }
});

// @desc      Lấy các bộ anime ngẫu nhiên
// @route     GET /api/anime/random
// @access    Public
const getRandomAnime = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 4;
    const anime = await Anime.aggregate([{ $sample: { size: limit } }]);
    res.json(anime);
});

// @desc      Ghi nhận một bộ anime đã được xem
// @route     POST /api/anime/:id/watch-history
// @access    Public (xử lý riêng nếu có token)
const recordWatchHistory = asyncHandler(async (req, res) => {
    const animeId = req.params.id;

    if (req.user && req.user._id) {
        const userId = req.user._id;

        const anime = await Anime.findById(animeId);
        if (!anime) {
            res.status(404);
            throw new Error('Không tìm thấy bộ anime để ghi nhận lịch sử xem.');
        }

        const watchHistoryItem = { anime: animeId, watchedAt: new Date() };

        await User.updateOne(
            { _id: userId },
            { "$pull": { "watchHistory": { "anime": animeId } } }
        );

        await User.updateOne(
            { _id: userId },
            { "$push": { "watchHistory": { "$each": [watchHistoryItem], "$position": 0 } } }
        );

        await User.updateOne(
            { _id: userId, "watchHistory": { "$size": 51 } },
            { "$pop": { "watchHistory": 1 } }
        );

        res.status(200).json({ message: `Đã ghi nhận xem anime: ${anime.name}.` });
    } else {
        res.status(200).json({ message: 'Ghi nhận lịch sử xem cục bộ.' });
    }
});

const getRelatedAnimes = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const currentAnime = await Anime.findById(id).select('genres');

        if (!currentAnime) {
            return res.status(404).json({ message: 'Không tìm thấy bộ anime.' });
        }

        const genreRegexes = currentAnime.genres.map(genre => new RegExp(genre, 'i'));

        const relatedAnimes = await Anime.aggregate([
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(id) },
                    genres: { $in: genreRegexes }
                }
            },
            {
                $sample: { size: 4 }
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    year: 1,
                    _id: 1,
                    animeType: 1
                }
            }
        ]);

        res.status(200).json(relatedAnimes);
    } catch (error) {
        console.error("Lỗi khi lấy anime liên quan:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy anime liên quan.' });
    }
});

// @desc      Lấy lịch sử xem của người dùng
// @route     GET /api/anime/watch-history
// @access    Private
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: 'watchHistory.anime',
        select: 'name image year animeType'
    });

    if (user) {
        const filteredHistory = user.watchHistory.filter(item => item.anime !== null);
        filteredHistory.sort((a, b) => b.watchedAt - a.watchedAt);
        res.json(filteredHistory);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy người dùng.');
    }
});

const clearWatchHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng.');
    }

    user.watchHistory = [];
    await user.save();

    res.status(200).json({ message: 'Lịch sử xem đã được xóa thành công.' });
});

// @desc      Lấy tất cả các thể loại anime duy nhất
// @route     GET /api/anime/genres
// @access    Public
const getUniqueGenres = asyncHandler(async (req, res) => {
    const genres = await Anime.aggregate([
        { $unwind: '$genres' },
        { $group: { _id: '$genres' } },
        { $project: { _id: 0, genre: '$_id' } },
        { $sort: { genre: 1 } }
    ]);
    res.json(genres.map(g => g.genre));
});

// @desc      Lấy tất cả các năm phát hành anime duy nhất
// @route     GET /api/anime/years
// @access    Public
const getUniqueYears = asyncHandler(async (req, res) => {
    const years = await Anime.aggregate([
        { $group: { _id: '$year' } },
        { $project: { _id: 0, year: '$_id' } },
        { $sort: { year: -1 } }
    ]);
    res.json(years.map(y => y.year));
});

// @desc      Lấy các bộ anime mới cập nhật
// @route     GET /api/anime/recently-updated
// @access    Public
const getRecentlyUpdatedAnimes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const recentlyUpdated = await Anime.find({})
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('name image year latestEpisode');

    res.json(recentlyUpdated);
});
// @desc    Lưu một anime vào danh sách xem sau của người dùng
// @route   POST /api/anime/save
// @access  Private
const saveAnimeForLater = asyncHandler(async (req, res) => {
    const { animeId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        if (!user.savedAnimes.includes(animeId)) {
            user.savedAnimes.push(animeId);
            await user.save();
        }
        res.json({ message: 'Đã thêm anime vào danh sách xem sau' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Lấy danh sách anime đã lưu của người dùng
// @route   GET /api/anime/saved
// @access  Private
const getSavedAnimes = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('savedAnimes');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json(user.savedAnimes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Xóa một anime khỏi danh sách xem sau của người dùng
// @route   DELETE /api/anime/save/:animeId
// @access  Private
const removeSavedAnime = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { animeId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        user.savedAnimes = user.savedAnimes.filter(
            (anime) => anime.toString() !== animeId
        );
        await user.save();

        res.status(200).json({ message: 'Anime đã được xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi xóa anime' });
    }
});
const followAnime = asyncHandler(async (req, res) => {
    const { animeId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(animeId)) {
        res.status(400);
        throw new Error('Anime ID không hợp lệ');
    }

    const user = await User.findById(userId);
    const anime = await Anime.findById(animeId);

    if (!user || !anime) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng hoặc anime');
    }

    const isFollowing = user.following.includes(animeId);

    if (isFollowing) {
        user.following = user.following.filter(id => id.toString() !== animeId);
        anime.followers = anime.followers.filter(id => id.toString() !== userId.toString());
        await user.save();
        await anime.save();
        res.status(200).json({ message: 'Đã bỏ theo dõi thành công', followed: false });
    } else {
        user.following.push(animeId);
        anime.followers.push(userId);
        await user.save();
        await anime.save();
        res.status(200).json({ message: 'Đã theo dõi thành công', followed: true });
    }
});

// @desc      Get animes followed by the user
// @route     GET /api/anime/following
// @access    Private
const getFollowingAnimes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('following');
    if (user) {
        res.json(user.following);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
    }
});

// @desc      Lấy danh sách anime được đánh giá cao nhất
// @route     GET /api/anime/top-rated
// @access    Public
const getTopRatedAnimes = asyncHandler(async (_req, res) => {
  try {
    const animes = await Anime.find({})
      .sort({ rating: -1, numberOfReviews: -1 }) // ✅ dùng "rating" thay vì "rate"
      .limit(20);
    res.status(200).json(animes);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách anime đánh giá cao nhất:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
});



// @desc      Lấy danh sách anime có nhiều lượt xem nhất
// @route     GET /api/anime/most-watched
// @access    Public
const getMostWatchedAnimes = asyncHandler(async (_req, res) => {
  try {
    const animes = await Anime.find({})
      .sort({ totalViews: -1 }) // ✅ dùng "totalViews" thay vì "viewCount"
      .limit(20);
    res.status(200).json(animes);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách anime nhiều lượt xem nhất:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
});



// @desc      Lấy danh sách anime xem nhiều hôm nay
// @route     GET /api/anime/trending-today
// @access    Public
const getTrendingAnimes = asyncHandler(async (_req, res) => {
  try {
    const animes = await Anime.find({})
      .sort({ viewsToday: -1 }) // ✅ dùng "viewsToday" thay vì "dailyViewCount"
      .limit(20);
    res.status(200).json(animes);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách anime xem nhiều hôm nay:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
});

// @desc    Lấy danh sách nội dung theo studio
// @route   GET /api/anime?studio=StudioName
// @access  Public
const getAnimeByStudio = async (req, res) => {
  try {
    const studio = req.query.studio?.trim();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Tạo query khớp mềm theo studio
    const query = studio
      ? { studio: new RegExp(`^${studio}$`, 'i') }
      : {};

    // Đếm tổng số anime khớp
    const totalAnime = await Anime.countDocuments(query);

    // Truy vấn danh sách anime theo trang
    const animeList = await Anime.find(query)
      .limit(limit)
      .skip(limit * (page - 1));

    // Trả về kết quả
    res.json({
      anime: animeList,
      page,
      limit,
      totalAnime,
      totalPages: Math.ceil(totalAnime / limit),
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách theo studio:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách nội dung theo studio' });
  }
};

// @desc    Lấy danh sách anime theo thể loại
// @route   GET /api/anime/genre
// @access  Public
const getAnimeByGenre = async (req, res) => {
  try {
    const genre = req.query.genre?.trim();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const query = genre ? { genres: new RegExp(`^${genre}$`, 'i') } : {};

    const totalAnime = await Anime.countDocuments(query);

    const animeList = await Anime.find(query)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      anime: animeList,
      page,
      limit,
      totalAnime,
      totalPages: Math.ceil(totalAnime / limit),
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách theo thể loại:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách theo thể loại' });
  }
};

// @desc    Lấy danh sách anime theo năm phát hành
// @route   GET /api/anime/year
// @access  Public
const getAnimeByYear = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const query = year ? { year } : {};

    const totalAnime = await Anime.countDocuments(query);

    const animeList = await Anime.find(query)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      anime: animeList,
      page,
      limit,
      totalAnime,
      totalPages: Math.ceil(totalAnime / limit),
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách theo năm:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách theo năm' });
  }
};

// @desc    Lấy danh sách anime theo loại
// @route   GET /api/anime/type
// @access  Public
const getAnimeByType = async (req, res) => {
  try {
    const typeName = req.query.type?.trim();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const query = typeName ? { animeType: new RegExp(`^${typeName}$`, 'i') } : {};

    const totalAnime = await Anime.countDocuments(query);

    const animeList = await Anime.find(query)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      anime: animeList,
      page,
      limit,
      totalAnime,
      totalPages: Math.ceil(totalAnime / limit),
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách theo loại:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách theo loại' });
  }
};







export {
    createAnime,
    getAnime,
    getAnimeById,
    updateAnime,
    deleteAnime,
    createAnimeComment,
    createAnimeRating,
    getAnimeUserRating,
    getRandomAnime,
    recordWatchHistory,
    getWatchHistory,
    clearWatchHistory,
    getUniqueGenres,
    getUniqueYears,
    getRecentlyUpdatedAnimes,
    saveAnimeForLater,
    getSavedAnimes,
    removeSavedAnime,
    getRelatedAnimes,
    followAnime,
    getFollowingAnimes,
    getTopRatedAnimes,
    getMostWatchedAnimes,
    getTrendingAnimes,
     getAnimeByStudio ,
     getAnimeByGenre,
     getAnimeByYear,
     getAnimeByType,
};