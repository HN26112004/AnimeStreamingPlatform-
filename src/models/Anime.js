// src/models/Anime.js
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Định nghĩa Schema cho các bình luận (Comment) - GIỮ NGUYÊN
const commentSchema = mongoose.Schema(
    {
        user: { // Người dùng đã bình luận
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: { // Nội dung bình luận
            type: String,
            required: true,
        },
    },
    {
        timestamps: true // Tự động thêm createdAt và updatedAt cho mỗi bình luận
    }
);

// Định nghĩa Schema cho các đánh giá (Review) - ĐÃ BỔ SUNG TRƯỜNG 'comment'
const reviewSchema = mongoose.Schema(
    {
        user: { // Người dùng đã đánh giá
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: { // Điểm đánh giá (từ 1 đến 5)
            type: Number,
            required: true,
        },
        comment: { // BỔ SUNG: Thêm trường 'comment' cho nội dung đánh giá
            type: String,
        },
    },
    {
        timestamps: true // Tự động thêm createdAt và updatedAt cho mỗi đánh giá
    }
);

const animeSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        desc: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: 'https://placehold.co/600x400/000000/FFFFFF?text=Anime+Poster',
        },
        titleImage: {
            type: String,
            default: 'https://placehold.co/600x200/000000/FFFFFF?text=Anime+Title',
        },
        genres: {
            type: [String],
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        studio: {
            type: String,
            required: true
        },
        animeType: {
            type: String,
            enum: ['TV/Series', 'Movie/OVA'],
            required: true,
            default: 'TV/Series'
        },
        
        // GIỮ NGUYÊN: Số tập mới nhất (Được cập nhật từ Episode model)
        latestEpisode: {
            type: Number,
            default: 0,
        },
        
        // BỔ SUNG: Trường này cần cho logic Cron Job (kiểm tra tập mới)
        lastEpisodeUpdatedAt: { 
            type: Date,
            default: Date.now,
        },

        comments: [commentSchema],
        reviews: [reviewSchema],

        // ... (Giữ nguyên các trường thống kê)
        rate: {
            type: Number,
            default: 0,
        },
        numberOfReviews: {
            type: Number,
            default: 0,
        },
        viewsToday: {
  type: Number,
  default: 0,
},

totalViews: {
  type: Number,
  default: 0,
},

rating: {
  type: Number,
  default: 0,
},


        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true
    }
);

// BỔ SUNG: Middleware XÓA LIÊN KẾT (Cascading Delete)
// Đảm bảo rằng khi Anime bị xóa, tất cả các Episode liên quan cũng bị xóa
animeSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        // LƯU Ý: Phải sử dụng model('Episode') vì Episode là một model riêng
        await this.model('Episode').deleteMany({ anime: this._id });
        console.log(`Đã xóa tất cả Episodes liên kết với Anime ID: ${this._id}`);
        next();
    } catch (error) {
        // Lỗi này có thể xảy ra nếu chưa định nghĩa Episode Model, nhưng trong trường hợp này ta đã định nghĩa
        console.error('Lỗi khi thực hiện Cascading Delete cho Episodes:', error);
        next(error);
    }
});


animeSchema.plugin(mongoosePaginate);

const Anime = mongoose.model('Anime', animeSchema);

export default Anime;