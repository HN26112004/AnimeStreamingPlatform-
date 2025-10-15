import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, Row, Col, Spinner, Button, Card, ListGroup } from 'react-bootstrap'; 

function AnimeList() {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [uniqueGenres, setUniqueGenres] = useState([]);
    const [uniqueYears, setUniqueYears] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State mới cho danh sách anime cập nhật gần đây
    const [recentlyUpdatedAnimes, setRecentlyUpdatedAnimes] = useState([]);
    const [loadingUpdated, setLoadingUpdated] = useState(true);

    const fetchAnimes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const genresQuery = selectedGenres.join(',');
            const params = new URLSearchParams();
            if (genresQuery) {
                params.append('genres', genresQuery);
            }
            if (selectedYear) {
                params.append('year', selectedYear);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await axiosInstance.get(`/anime?${params.toString()}`);
            setAnimes(response.data);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    }, [selectedGenres, selectedYear, searchTerm]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [genresRes, yearsRes] = await Promise.all([
                    axiosInstance.get('/anime/genres'),
                    axiosInstance.get('/anime/years')
                ]);
                setUniqueGenres(genresRes.data);
                setUniqueYears(yearsRes.data);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu lọc:", err);
            }
        };

        const fetchRecentlyUpdated = async () => {
            setLoadingUpdated(true);
            try {
                const { data } = await axiosInstance.get('/anime/recently-updated');
                setRecentlyUpdatedAnimes(data);
                setLoadingUpdated(false);
            } catch (err) {
                console.error("Lỗi khi lấy anime mới cập nhật:", err);
                setLoadingUpdated(false);
            }
        };

        fetchFilters();
        fetchRecentlyUpdated();
    }, []);

    useEffect(() => {
        fetchAnimes();
    }, [fetchAnimes]);

    const handleGenreChange = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };
    
    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleRandomAnimeClick = async () => {
        try {
            const response = await axiosInstance.get('/anime/random');
            const randomAnime = response.data;
            
            if (randomAnime) {
                navigate(`/anime/${randomAnime._id}`);
            } else {
                toast.info('Không tìm thấy anime ngẫu nhiên nào.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy anime ngẫu nhiên:', error);
            toast.error('Có lỗi xảy ra khi lấy anime ngẫu nhiên.');
        }
    };

    return (
        <div className="container-fluid mt-4">
            <h1 className="text-center mb-4" style={{ fontWeight: 'bold' }}>Kho Anime</h1>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ flex: 1, marginRight: '1rem' }}>
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm theo tên anime..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={handleRandomAnimeClick}
                    style={{ minWidth: '150px' }}
                >
                    Anime Ngẫu Nhiên
                </button>
            </div>

            {/* Phần giao diện lọc đã được chỉnh sửa */}
            <Row className="mb-4 g-2">
                <Col md={8}>
                    <h5 className="mb-2">Thể loại</h5>
                    <div className="d-flex flex-wrap gap-2">
                        {uniqueGenres.map(genre => (
                            <Button
                                key={genre}
                                variant={selectedGenres.includes(genre) ? 'primary' : 'outline-primary'}
                                onClick={() => handleGenreChange(genre)}
                                className="rounded-pill"
                                style={{ minWidth: '100px', transition: 'all 0.2s' }}
                            >
                                {genre}
                            </Button>
                        ))}
                    </div>
                </Col>
                <Col md={4}>
                    <h5 className="mb-2">Năm phát hành</h5>
                    <Form.Select value={selectedYear} onChange={handleYearChange}>
                        <option value="">Tất cả</option>
                        {uniqueYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {/* BOX ANIME MỚI CẬP NHẬT */}
            <Row className="mt-5">
                <Col md={12}>
                    <Card>
                        <Card.Header as="h5" style={{ backgroundColor: '#28a745', color: 'white' }}>
                            Anime Mới Cập Nhật
                        </Card.Header>
                        <Card.Body>
                            {loadingUpdated ? (
                                <div className="text-center">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {recentlyUpdatedAnimes.length > 0 ? (
                                        recentlyUpdatedAnimes.map(anime => (
                                            <ListGroup.Item key={anime._id} action as={Link} to={`/anime/${anime._id}`}>
                                                {anime.name}
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <p className="text-center mt-2">Không có anime nào được cập nhật gần đây.</p>
                                    )}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <hr className="my-5" />

            {loading ? (
                <div className="d-flex justify-content-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                </div>
            ) : error ? (
                <div className="text-center mt-5">
                    <p>Có lỗi xảy ra: {error.message}</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px',
                    padding: '20px 0'
                }}>
                    {animes.length > 0 ? (
                        animes.map(anime => (
                            <Link to={`/anime/${anime._id}`} key={anime._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                    <img
                                        src={`http://localhost:5000${anime.image}`}
                                        alt={anime.name}
                                        style={{ width: '100%', height: '350px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/250x350/CCCCCC/333333?text=No+Image"; }}
                                    />
                                    <div style={{ padding: '15px' }}>
                                        <h2 style={{ fontSize: '1.2em', margin: '0 0 5px', color: '#333' }}>{anime.name}</h2>
                                        <p style={{ margin: '0', color: '#666' }}>({anime.year})</p>
                                        <p style={{ margin: '0', color: '#666' }}>Thể loại: {anime.genres.join(', ')}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Không tìm thấy anime nào.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default AnimeList;