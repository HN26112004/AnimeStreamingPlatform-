// src/pages/WatchAnimePage.js

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Container, Row, Col, Card, ListGroup, Button, Accordion, Spinner, Alert } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';

// Hàm để lưu lịch sử xem cục bộ (cho người dùng chưa đăng nhập) 
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

        history = history.filter(item => item._id !== newRecord._id);
        history.unshift(newRecord);

        if (history.length > MAX_LOCAL_HISTORY_ITEMS) {
            history = history.slice(0, MAX_LOCAL_HISTORY_ITEMS);
        }

        localStorage.setItem('localWatchHistory', JSON.stringify(history));
    } catch (err) {
        console.error("Lỗi khi lưu lịch sử xem cục bộ:", err);
    }
};

function WatchAnimePage() {
    const { isAuthenticated } = useContext(AuthContext);
    const [anime, setAnime] = useState(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { animeId, episodeId } = useParams(); 
 // id là animeId

    // HÀM XỬ LÝ KHI CHỌN TẬP PHIM
    const handleEpisodeClick = useCallback(async (episode) => {
  const normalizeYouTubeUrl = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const videoSource = episode.videoFile
    ? `http://localhost:5000${episode.videoFile}`
    : normalizeYouTubeUrl(episode.videoUrl);

  if (!videoSource) {
    toast.error("Tập phim này chưa có video nguồn!");
    setVideoSrc(null);
    return;
  }

  setVideoSrc(videoSource);

  if (anime) {
    if (isAuthenticated) {
      try {
        await axiosInstance.post(`/anime/${anime._id}/watch-history`, {
          episodeId: episode._id
        });
      } catch (err) {
        console.error("Lỗi khi ghi lịch sử xem:", err);
      }
    } else {
      saveLocalHistory(anime);
    }
  }
}, [anime, isAuthenticated]);



    // --- BỔ SUNG LOGIC FETCH DATA MỚI ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Lấy thông tin chi tiết Anime
                const animeRes = await axiosInstance.get(`/anime/${animeId}`);
                const animeData = animeRes.data;

                // 2. Lấy danh sách Episodes riêng biệt từ API mới
                // Endpoint mới: /api/episodes/:animeId
               const episodesRes = await axiosInstance.get(`/episodes/${animeId}`);
                const seasonsData = episodesRes.data?.seasons || [];


                // 3. Tái cấu trúc Episodes thành Seasons để phù hợp với component render cũ
                const allEpisodes = seasonsData.flatMap(season => season.episodes || []);

const seasonsMap = allEpisodes.reduce((acc, episode) => {
  const season = episode.seasonNumber || 1;
  const seasonTitle = `Mùa ${season}`;

  if (!acc[season]) {
    acc[season] = {
      seasonNumber: season,
      title: seasonTitle,
      episodes: []
    };
  }

  acc[season].episodes.push(episode);
  return acc;
}, {});



                // Chuyển map thành array và sắp xếp theo seasonNumber
                const sortedSeasons = Object.values(seasonsMap).sort((a, b) => a.seasonNumber - b.seasonNumber);


                
                // 4. CẬP NHẬT STATE
                setAnime({
                    ...animeData,
                    // THÊM seasons đã được xử lý vào state anime
                    seasons: sortedSeasons
                });
                
                // 5. Thiết lập video mặc định (Tập 1 của mùa 1)
                

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu Anime/Episodes:", err);
                setError("Không thể tải dữ liệu anime. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();


    }, [animeId]); 
    useEffect(() => {
  if (!anime || !anime.seasons) return;

  const allEpisodes = anime.seasons.flatMap(season => season.episodes || []);
  const selectedEpisode = allEpisodes.find(ep => ep._id === episodeId);

  if (selectedEpisode) {
    handleEpisodeClick(selectedEpisode);
  }
}, [anime, episodeId, handleEpisodeClick]);



    // --- CÁC LOGIC RENDER GIỮ NGUYÊN ---
    if (loading) {
        return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    }

    if (error || !anime) {
        return <Container className="text-center mt-5"><Alert variant="danger">{error || "Không tìm thấy bộ anime."}</Alert></Container>;
    }

    // Phần Render chính
    return (
        <Container className="mt-5">
            <Row>
                {/* Cột Video Player */}
                <Col md={8}>
                    <Card>
                        <Card.Header as="h2">{anime.name}</Card.Header>
                        <Card.Body>
                            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                                {videoSrc ? (
  videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be') ? (
    <iframe
      src={videoSrc}
      title="YouTube Video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  ) : (
    <video
      src={videoSrc}
      controls
      autoPlay
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      Trình duyệt của bạn không hỗ trợ thẻ video.
    </video>
  )
) : (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    Vui lòng chọn một tập phim để xem.
  </div>
)}

                            </div>
                        </Card.Body>
                    </Card>

                    {/* Thông tin Anime */}
                    <Card className="mt-4">
                        <Card.Header as="h4">Thông tin</Card.Header>
                        <Card.Body>
                            <p><strong>Mô tả:</strong> {anime.desc}</p>
                           <p><strong>Thể loại:</strong> {Array.isArray(anime.genres) ? anime.genres.join(', ') : 'Đang cập nhật'}</p>
                            <p><strong>Năm phát hành:</strong> {anime.year}</p>
                            <p><strong>Studio:</strong> {anime.studio}</p>
                        </Card.Body>
                    </Card>
                    
                    {/* Bổ sung: Khu vực bình luận, đánh giá (Nếu có) */}

                </Col>

                {/* Cột Danh sách Tập phim */}
                <Col md={4}>
                    <Card>
                        <Card.Header as="h4">Danh sách Tập phim</Card.Header>
                        <Card.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            {/* Kiểm tra anime.seasons trước khi render */}
                            {anime.seasons && anime.seasons.length > 0 ? (
                                <Accordion defaultActiveKey={anime.seasons[0].seasonNumber.toString()}>
                                    {anime.seasons.map((season) => (
                                        <Accordion.Item key={season.seasonNumber} eventKey={season.seasonNumber.toString()}>
                                            <Accordion.Header>
                                                {season.title || `Mùa ${season.seasonNumber}`} ({season.episodes.length} tập)
                                            </Accordion.Header>
                                            <Accordion.Body className="p-0">
                                                <ListGroup variant="flush">
                                                    {season.episodes
                                                        .sort((a, b) => a.episodeNumber - b.episodeNumber) // Sắp xếp lại theo episodeNumber
                                                        .map((episode) => (
                                                        <ListGroup.Item
                                                            key={episode._id} 
                                                            action 
                                                            onClick={() => handleEpisodeClick(episode)}
                                                            className="d-flex justify-content-between align-items-center"
                                                        >
                                                            <div>
                                                                <FaPlay className="me-2" />
                                                                Tập {episode.episodeNumber}: {episode.title}
                                                            </div>
                                                            <div>
                                                                {/* SỬ DỤNG 'videoUrl' MỚI CHO LINK EXTERNAL */}
                                                                {episode.videoUrl && (
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        href={episode.videoUrl}
                                                                        target="_blank"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        Xem thêm
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            ) : (
                                <p>Không có tập phim nào.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default WatchAnimePage;