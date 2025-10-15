import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Thêm import icons cho chức năng theo dõi
import { BsBookmarkPlus, BsBookmarkFill, BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';

import RelatedAnimes from '../components/RelatedAnimes';

// --- HÀM MỚI ĐỂ LƯU LỊCH SỬ XEM CỤC BỘ ---
const saveLocalHistory = (animeData) => {
    try {
        const MAX_LOCAL_HISTORY_ITEMS = 50;
        let history = JSON.parse(localStorage.getItem('localWatchHistory')) || [];

        const newRecord = {
            _id: animeData._id,
            name: animeData.name,
            image: animeData.image,
            year: animeData.year,
            watchedAt: new Date().toISOString()
        };

        // Lọc bỏ bản ghi cũ nếu đã tồn tại
        history = history.filter(item => item._id !== newRecord._id);

        // Thêm bản ghi mới vào đầu danh sách
        history.unshift(newRecord);

        // Giới hạn số lượng bản ghi
        if (history.length > MAX_LOCAL_HISTORY_ITEMS) {
            history = history.slice(0, MAX_LOCAL_HISTORY_ITEMS);
        }

        localStorage.setItem('localWatchHistory', JSON.stringify(history));
    } catch (error) {
        console.error("Lỗi khi lưu lịch sử xem cục bộ:", error);
    }
};

function AnimeDetailPage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    
    // --- BỔ SUNG STATE MỚI CHO TẬP PHIM ---
    const [episodes, setEpisodes] = useState([]);
    const [episodesLoading, setEpisodesLoading] = useState(true);
    const [episodesError, setEpisodesError] = useState(null);


    // --- HÀM MỚI: KIỂM TRA TRẠNG THÁI THEO DÕI ---
    const checkFollowingStatus = useCallback(async () => {
        if (!user) {
            setIsFollowing(false);
            return;
        }
        try {
            const { data } = await axiosInstance.get('/anime/following');
            const followingIds = data.map(animeItem => animeItem._id);
            setIsFollowing(followingIds.includes(id));
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái theo dõi:', error);
            setIsFollowing(false);
        }
    }, [user, id]);

    // --- HÀM MỚI: XỬ LÝ SỰ KIỆN THEO DÕI/BỎ THEO DÕI ---
    const handleFollowAnime = async () => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để theo dõi anime!');
            return;
        }
        try {
            const { data } = await axiosInstance.post('/anime/follow', { animeId: id });
            setIsFollowing(data.followed);
            toast.success(data.message);
        } catch (error) {
            console.error('Lỗi khi theo dõi anime:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    // Hàm kiểm tra xem anime đã được lưu hay chưa
    const checkSavedStatus = useCallback(async () => {
        if (!user) {
            setIsSaved(false);
            return;
        }
        try {
            const { data } = await axiosInstance.get('/anime/saved');
            const savedIds = data.map(animeItem => animeItem._id);
            setIsSaved(savedIds.includes(id));
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái lưu:', error);
            setIsSaved(false);
        }
    }, [user, id]);

    // Hàm xử lý khi người dùng nhấn nút lưu
    const handleSaveAnime = async () => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để lưu anime!');
            return;
        }
        try {
            await axiosInstance.post('/anime/save', { animeId: id });
            toast.success('Đã thêm anime vào danh sách xem sau!');
            setIsSaved(true);
        } catch (error) {
            console.error('Lỗi khi lưu anime:', error);
            toast.error('Có lỗi xảy ra, vui lòng đăng nhập để lưu anime.');
        }
    };
    
    // --- HÀM MỚI: TẢI DANH SÁCH TẬP PHIM ---
    const fetchEpisodes = useCallback(async () => {
  setEpisodesLoading(true);
  setEpisodesError(null);
  try {
    const response = await axiosInstance.get(`/episodes/by-anime/${id}`);
    const seasons = response.data.seasons;

    // Gộp tất cả tập phim từ các mùa thành một mảng
    const allEpisodes = Array.isArray(seasons)
      ? seasons.flatMap(season => season.episodes || [])
      : [];

    setEpisodes(allEpisodes);
    setEpisodesLoading(false);
  } catch (err) {
    console.error("Lỗi khi tải tập phim:", err);
    setEpisodesError('Không thể tải danh sách tập phim.');
    setEpisodesLoading(false);
  }
}, [id]);




    const fetchAnime = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get(`/anime/${id}`);
            setAnime(data);
            setLoading(false);
            // Lưu vào lịch sử xem cục bộ
            saveLocalHistory(data);
            checkSavedStatus(); // Gọi hàm kiểm tra trạng thái lưu ngay khi tải anime
            checkFollowingStatus(); // Gọi hàm kiểm tra trạng thái theo dõi
        } catch (err) {
            setError('Không thể tải dữ liệu anime.');
            setLoading(false);
        }
    }, [id, checkSavedStatus, checkFollowingStatus]);


    useEffect(() => {
        fetchAnime();
        fetchEpisodes(); // Gọi hàm tải tập phim khi component mount
    }, [fetchAnime, fetchEpisodes]);

    useEffect(() => {
        const fetchUserRating = async () => {
            if (user) {
                try {
                    const { data } = await axiosInstance.get(`/anime/${id}/my-rating`);
                    if (data) {
                        setUserRating(data.rating);
                        setCurrentReview(data.review);
                        setUserReview(data.review?.review || '');
                    }
                } catch (err) {
                    console.error("Lỗi khi lấy đánh giá của người dùng:", err);
                    setUserRating(0);
                    setCurrentReview(null);
                    setUserReview('');
                }
            }
        };

        fetchUserRating();
    }, [user, id]);

    const handleRatingSubmit = async (ratingValue) => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để đánh giá!');
            return;
        }
        try {
            const { data } = await axiosInstance.post(`/anime/${id}/rating`, {
                rating: ratingValue,
                review: userReview
            });
            setUserRating(data.rating);
            setCurrentReview(data.review);
            toast.success('Đánh giá của bạn đã được lưu thành công!');
        } catch (err) {
            console.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu đánh giá.');
            toast.error(err.response?.data?.message || 'Lỗi khi lưu đánh giá.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.warn('Vui lòng đăng nhập để bình luận!');
            return;
        }
        if (!newComment.trim()) {
            toast.error('Bình luận không được để trống.');
            return;
        }

        try {
            const { data } = await axiosInstance.post(`/anime/${id}/comments`, { content: newComment });
            toast.success('Bình luận đã được thêm thành công!');
            setNewComment('');
            setAnime(prev => ({
                ...prev,
                comments: [...prev.comments, { ...data, user: { username: user.username, avatar: user.avatar } }]
            }));
        } catch (err) {
            console.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi bình luận.');
            toast.error(err.response?.data?.message || 'Lỗi khi gửi bình luận.');
        }
    };
    
    // --- SỬ DỤNG useMemo ĐỂ NHÓM VÀ SẮP XẾP TẬP PHIM THEO MÙA ---
    const groupedEpisodes = useMemo(() => {
  if (!Array.isArray(episodes)) return {};

  const groups = episodes.reduce((acc, episode) => {
    const season = episode.seasonNumber || 1;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(episode);
    return acc;
  }, {});

  for (const season in groups) {
    groups[season].sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  return groups;
}, [episodes]);


    // --- XÁC ĐỊNH TẬP ĐẦU TIÊN ĐỂ GẮN VÀO NÚT "XEM NGAY" ---
   const firstEpisode = useMemo(() => {
  const seasonNumbers = Object.keys(groupedEpisodes).sort((a, b) => a - b);
  if (seasonNumbers.length > 0) {
    const firstSeason = groupedEpisodes[seasonNumbers[0]];
    if (Array.isArray(firstSeason) && firstSeason.length > 0) {
      const sortedEpisodes = [...firstSeason].sort((a, b) => a.episodeNumber - b.episodeNumber);
      return sortedEpisodes[0];
    }
  }
  return null;
}, [groupedEpisodes]);




    if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!anime) return <div className="text-center mt-5">Không tìm thấy anime.</div>;

    const imagePath = `http://localhost:5000${anime.image}`;

    return (
        <div className="anime-detail-container">
            <div className="row">
                {/* Phần thông tin cơ bản */}
                <div className="col-md-4">
                    <img
                        src={imagePath}
                        alt={anime.name}
                        className="img-fluid rounded shadow"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x600/CCCCCC/333333?text=No+Image"; }}
                    />
                </div>
                <div className="col-md-8">
                    <div className="detail-info">
                        <h1>{anime.name}</h1>
                        <div className="d-flex align-items-center my-3">
                            <span className="me-2">Đánh giá: </span>
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    onClick={() => handleRatingSubmit(i + 1)}
                                    onMouseEnter={() => setHoverRating(i + 1)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '1.5rem',
                                        color: (i + 1 <= (hoverRating || userRating)) ? '#ffc107' : '#e4e5e9'
                                    }}
                                >
                                    &#9733;
                                </span>
                            ))}
                            <span className="ms-2">{userRating > 0 ? `(${userRating}/5)` : 'Chưa có đánh giá'}</span>
                        </div>
                        {user && (
                            <Button
                                variant="outline-primary"
                                className="mb-3"
                                onClick={() => setShowReviewForm(!showReviewForm)}
                            >
                                {currentReview ? "Chỉnh sửa đánh giá" : "Thêm đánh giá"}
                            </Button>
                        )}
                        {showReviewForm && (
                            <div className="mt-3">
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Viết đánh giá của bạn..."
                                    value={userReview}
                                    onChange={(e) => setUserReview(e.target.value)}
                                ></textarea>
                                <Button className="mt-2" onClick={() => handleRatingSubmit(userRating)}>Lưu</Button>
                            </div>
                        )}
                        <p className="genres mt-3">Thể loại: {anime.genres.join(', ')}</p>
                        <p>Năm phát hành: {anime.year}</p>
                        <p>Studio: {anime.studio}</p>
                        <p>Loại: {anime.animeType}</p>
                        <p className="description">{anime.desc}</p>

                        {/* CẬP NHẬT NÚT "XEM NGAY" */}
                        {firstEpisode ? (
                            <Link to={`/watch/${anime._id}/${firstEpisode._id}`}>
                                <Button variant="danger" size="lg" className="mt-3">
                                    Xem Ngay
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="danger" size="lg" className="mt-3" disabled>
                                Chưa có tập phim
                            </Button>
                        )}

                        {/* NÚT "LƯU ANIME" */}
                        <Button
                            variant={isSaved ? "secondary" : "primary"}
                            size="lg"
                            className="mt-3 ms-3"
                            onClick={handleSaveAnime}
                            disabled={isSaved}
                        >
                            {isSaved ? <BsBookmarkFill /> : <BsBookmarkPlus />}
                            <span className="ms-2">
                                {isSaved ? 'Đã thêm vào Xem Sau' : 'Thêm vào Xem Sau'}
                            </span>
                        </Button>

                        {/* THÊM NÚT "THEO DÕI" MỚI NÀY */}
                        <Button
                            variant={isFollowing ? "success" : "outline-success"}
                            size="lg"
                            className="mt-3 ms-3"
                            onClick={handleFollowAnime}
                        >
                            {isFollowing ? <BsEyeFill /> : <BsEyeSlashFill />}
                            <span className="ms-2">
                                {isFollowing ? 'Đang Theo Dõi' : 'Theo Dõi'}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
            
            <hr />

            {/* --- BỔ SUNG PHẦN DANH SÁCH TẬP PHIM VÀ CÁC MÙA --- */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="episodes-section">
                        <h4>Danh sách Tập phim</h4>
                        {episodesLoading ? (
                            <div className="text-center mt-3">Đang tải tập phim...</div>
                        ) : episodesError ? (
                            <div className="text-center mt-3 text-danger">{episodesError}</div>
                        ) : Object.keys(groupedEpisodes).length > 0 ? (
                            Object.keys(groupedEpisodes).sort((a, b) => a - b).map(seasonNumber => (
                                <div key={seasonNumber} className="season-group mb-4">
                                    <h5 className="mt-4">Mùa {seasonNumber}</h5>
                                    <ul className="list-group">
                                        {groupedEpisodes[seasonNumber].map(episode => (
                                            <li key={episode._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <Link to={`/watch/${anime._id}/${episode._id}`} className="flex-grow-1">
                                                    Tập {episode.episodeNumber}: {episode.title}
                                                </Link>
                                                <span className="text-muted">{episode.duration ? `${episode.duration} phút` : ''}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted">Bộ phim này chưa có tập nào được thêm.</p>
                        )}
                    </div>
                </div>
            </div>

            <hr />

            <div className="row mt-5">
                <div className="col-md-12">
                    {/* Phần bình luận */}
                    <div className="comments-section">
                        <h4>Bình Luận</h4>
                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="mb-4">
                                <div className="mb-3">
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Viết bình luận của bạn..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    ></textarea>
                                </div>
                                <Button type="submit" variant="primary">Gửi Bình Luận</Button>
                            </form>
                        ) : (
                            <p className="text-center text-muted">Vui lòng <Link to="/login">đăng nhập</Link> để bình luận.</p>
                        )}
                        <div className="comment-list">
                            {anime.comments && anime.comments.length > 0 ? (
                                anime.comments.map(comment => (
                                    <div key={comment._id} className="comment-item">
                                        <div className="comment-header">
                                            <img
                                                src={comment.user.avatar || "https://placehold.co/50x50/cccccc/333333?text=User"}
                                                alt={comment.user.username}
                                                className="comment-avatar"
                                            />
                                            <div>
                                                <h5 className="comment-username">{comment.user.username}</h5>
                                                <p className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* THÊM COMPONENT MỚI VÀO ĐÂY */}
            <div className="row mt-5">
                <div className="col-12">
                    <RelatedAnimes animeId={anime._id} />
                </div>
            </div>
        </div>
    );
}

export default AnimeDetailPage;