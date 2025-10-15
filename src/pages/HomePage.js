// src/pages/HomePage.js

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { Card, ListGroup, Spinner, Alert, Container } from 'react-bootstrap';


function HomePage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // States chính cho danh sách anime
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // --- STATES CHO BỘ LỌC TẠM THỜI  ---
    const [searchTerm_filter, setSearchTerm_filter] = useState('');
    const [selectedGenres_filter, setSelectedGenres_filter] = useState([]);
    const [selectedYears_filter, setSelectedYears_filter] = useState([]);
    const [selectedAnimeTypes_filter, setSelectedAnimeTypes_filter] = useState([]);

    // --- STATES CHO BỘ LỌC ĐÃ ÁP DỤNG  ---
    const [appliedFilters, setAppliedFilters] = useState({
        searchTerm: '',
        genres: [],
        years: [],
        animeTypes: [],
    });

    // States để lưu trữ các tùy chọn lọc từ Backend
    const [availableGenres, setAvailableGenres] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const animeTypesOptions = ['TV/Series', 'Movie/OVA'];

    // --- STATES VÀ LOGIC MỚI CHO ANIME MỚI CẬP NHẬT ---
    const [recentlyUpdatedAnimes, setRecentlyUpdatedAnimes] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [errorRecent, setErrorRecent] = useState(null);

    // Lấy danh sách anime dựa trên các filters ĐÃ ÁP DỤNG
    useEffect(() => {
        const fetchAnime = async () => {
            setLoading(true);
            setError(null);

            try {
                const queryParams = new URLSearchParams();
                queryParams.append('pageNumber', currentPage);
                queryParams.append('pageSize', pageSize);

                if (appliedFilters.searchTerm) {
                    queryParams.append('name', appliedFilters.searchTerm);
                }
                if (appliedFilters.genres.length > 0) {
                    queryParams.append('genres', appliedFilters.genres.join(','));
                }
                if (appliedFilters.years.length > 0) {
                    queryParams.append('year', appliedFilters.years.join(','));
                }
                if (appliedFilters.animeTypes.length > 0) {
                    queryParams.append('type', appliedFilters.animeTypes.join(','));
                }

                // Sử dụng axiosInstance để fetch data
                const response = await axiosInstance.get(`/anime?${queryParams.toString()}`);

                setAnimeList(response.data.anime);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Lỗi khi fetch anime:", err);
            }
        };

        fetchAnime();
    }, [currentPage, appliedFilters]);

    // Fetch các tùy chọn thể loại và năm khi component mount 
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const genresResponse = await axiosInstance.get('/anime/genres');
                setAvailableGenres(genresResponse.data);

                const yearsResponse = await axiosInstance.get('/anime/years');
                setAvailableYears(yearsResponse.data);
            } catch (err) {
                console.error('Lỗi khi fetch filter options:', err);
            }
        };
        fetchFilterOptions();
    }, []);

    // Effect mới để lấy danh sách anime mới cập nhật
    useEffect(() => {
        const fetchRecentlyUpdated = async () => {
            try {
                const { data } = await axiosInstance.get('/anime/recently-updated?limit=10'); // Giới hạn 10 anime
                setRecentlyUpdatedAnimes(data);
                setLoadingRecent(false);
            } catch (err) {
                setErrorRecent('Không thể tải danh sách anime mới cập nhật. Vui lòng thử lại sau.');
                setLoadingRecent(false);
            }
        };
        fetchRecentlyUpdated();
    }, []); // Chỉ chạy một lần khi component được mount

    // --- HÀM XỬ LÝ NÚT XEM ANIME NGẪU NHIÊN ---
    const handleRandomAnimeClick = async () => {
        try {
            const response = await axiosInstance.get('/anime/random');
            const randomAnime = response.data[0];
            
            if (randomAnime) {
                navigate(`/anime/${randomAnime._id}`);
            } else {
                alert("Không tìm thấy bộ anime ngẫu nhiên nào. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error("Lỗi khi lấy anime ngẫu nhiên:", err);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    // --- CÁC HÀM XỬ LÝ LỌC VÀ PHÂN TRANG  ---
    const handleSearchChange = (e) => setSearchTerm_filter(e.target.value);
    const handleGenreChange = (e) => setSelectedGenres_filter([...e.target.selectedOptions].map(option => option.value));
    const handleYearChange = (e) => setSelectedYears_filter([...e.target.selectedOptions].map(option => parseInt(option.value)));
    const handleAnimeTypeChange = (e) => setSelectedAnimeTypes_filter([...e.target.selectedOptions].map(option => option.value));
    const handleApplyFilters = () => {
        setCurrentPage(1);
        setAppliedFilters({
            searchTerm: searchTerm_filter,
            genres: selectedGenres_filter,
            years: selectedYears_filter,
            animeTypes: selectedAnimeTypes_filter,
        });
    };
    const handleResetFilters = () => {
        setSearchTerm_filter('');
        setSelectedGenres_filter([]);
        setSelectedYears_filter([]);
        setSelectedAnimeTypes_filter([]);
        setAppliedFilters({ searchTerm: '', genres: [], years: [], animeTypes: [] });
        setCurrentPage(1);
    };
    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prevPage => prevPage + 1);
    };
    const handleDeleteAnime = async (animeId) => {
        if (!user || user.isAdmin !== true) {
            alert("Bạn không có quyền thực hiện thao tác này.");
            return;
        }
        if (!window.confirm("Bạn có chắc chắn muốn xóa bộ anime này không?")) return;
        try {
            const response = await axiosInstance.delete(`/anime/${animeId}`);
            if (response.status === 200) {
                alert("Anime đã được xóa thành công!");
                setAnimeList(prevList => prevList.filter(anime => anime._id !== animeId));
            } else {
                alert(`Lỗi khi xóa anime: ${response.data.message || 'Lỗi không xác định.'}`);
            }
        } catch (err) {
            console.error("Lỗi khi xóa anime:", err.response || err);
            if (err.response && err.response.status === 403) {
                alert("Bạn không có quyền xóa anime này. Vui lòng đăng nhập với tài khoản admin.");
            } else if (err.response && err.response.status === 404) {
                alert("Không tìm thấy anime để xóa.");
            } else {
                alert("Đã xảy ra lỗi khi kết nối đến server.");
            }
        }
    };

    if (loading && animeList.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải anime...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Lỗi: {error.message}</div>;
    }

    return (
        <Container className="my-5">
            {/* BOX ANIME MỚI CẬP NHẬT */}
            <Card>
                <Card.Header as="h5" style={{ backgroundColor: '#28a745', color: 'white' }}>
                    Anime Mới Cập Nhật
                </Card.Header>
                <Card.Body>
                    {loadingRecent ? (
                        <div className="text-center">
                            <Spinner animation="border" size="sm" />
                        </div>
                    ) : errorRecent ? (
                        <Alert variant="danger">{errorRecent}</Alert>
                    ) : (
                        <ListGroup variant="flush">
                            {recentlyUpdatedAnimes.length > 0 ? (
                                recentlyUpdatedAnimes.map(anime => (
                                    <ListGroup.Item 
                                        key={anime._id} 
                                        action 
                                        as={Link} 
                                        to={`/anime/${anime._id}`}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            {anime.name}
                                            {/* DÒNG CODE MỚI ĐƯỢC THÊM VÀO DƯỚI ĐÂY */}
                                            {anime.latestEpisode > 0 && 
                                                <span className="badge bg-primary ms-2">
                                                    Tập mới: {anime.latestEpisode}
                                                </span>
                                            }
                                        </div>
                                        {anime.year && <small className="text-muted ms-auto">({anime.year})</small>}
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <p className="text-center mt-2">Không có anime nào được cập nhật gần đây.</p>
                            )}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>
            
            <hr className="my-5" />
            
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Danh sách Anime</h1>
            
            {/* NÚT XEM ANIME NGẪU NHIÊN */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <button
                    onClick={handleRandomAnimeClick}
                    style={{
                        padding: '12px 25px',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    🎬 Xem Anime Ngẫu Nhiên
                </button>
            </div>

            {/* ... (phần tìm kiếm và lọc) ... */}
            <div style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
                        value={searchTerm_filter}
                        onChange={handleSearchChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
                    />
                </div>

                <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '150px' }}>
                    <select
                        multiple
                        value={selectedGenres_filter}
                        onChange={handleGenreChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', minHeight: '40px' }}
                    >
                        <option value="" disabled>Chọn thể loại</option>
                        {availableGenres.map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                    {selectedGenres_filter.length > 0 && (
                        <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                            Đã chọn: {selectedGenres_filter.join(', ')}
                        </div>
                    )}
                </div>

                <div style={{ position: 'relative', flex: '1 1 150px', minWidth: '120px' }}>
                    <select
                        multiple
                        value={selectedYears_filter}
                        onChange={handleYearChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', minHeight: '40px' }}
                    >
                        <option value="" disabled>Chọn năm</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    {selectedYears_filter.length > 0 && (
                        <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                            Đã chọn: {selectedYears_filter.join(', ')}
                        </div>
                    )}
                </div>

                <div style={{ position: 'relative', flex: '1 1 150px', minWidth: '120px' }}>
                    <select
                        multiple
                        value={selectedAnimeTypes_filter}
                        onChange={handleAnimeTypeChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', minHeight: '40px' }}
                    >
                        <option value="" disabled>Chọn dạng</option>
                        {animeTypesOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    {selectedAnimeTypes_filter.length > 0 && (
                        <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                            Đã chọn: {selectedAnimeTypes_filter.join(', ')}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleApplyFilters}
                    style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #007bff', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', transition: 'background-color 0.3s, color 0.3s', alignSelf: 'flex-start' }}
                > Lọc </button>

                <button
                    onClick={handleResetFilters}
                    style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #dc3545', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', transition: 'background-color 0.3s, color 0.3s', alignSelf: 'flex-start' }}
                > Reset </button>
            </div>

            {/* Danh sách Anime */}
            {animeList.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {animeList.map((anime) => (
                        <div key={anime._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                            {anime.image && (
                                <img
                                    src={`http://localhost:5000${anime.image}`}
                                    alt={anime.name}
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '10px' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x300/CCCCCC/333333?text=No+Image"; }}
                                />
                            )}
                            <h2 style={{ fontSize: '1.2em', margin: '10px 0' }}>{anime.name} ({anime.year})</h2>
                            <p style={{ fontSize: '0.9em', color: '#555' }}>Thể loại: {anime.genres.join(', ')}</p>
                            <p style={{ fontSize: '0.9em', color: '#555' }}>Dạng: {anime.type}</p>
                            <p style={{ fontSize: '0.9em', color: '#555' }}>Studio: {anime.studio}</p>
                            
                            {/* THÊM CÁC NÚT SỬA VÀ XOÁ NẾU NGƯỜI DÙNG LÀ ADMIN */}
                            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <Link to={`/anime/${anime._id}`} style={{ display: 'inline-block', padding: '8px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                                    Xem chi tiết
                                </Link>
                                {user && user.isAdmin && (
                                    <>
                                        <Link to={`/admin/edit-anime/${anime._id}`} style={{ display: 'inline-block', padding: '8px 15px', backgroundColor: '#ffc107', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                                            Sửa
                                        </Link>
                                        <button onClick={() => handleDeleteAnime(anime._id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                            Xoá
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center' }}>Không tìm thấy anime nào phù hợp với tiêu chí của bạn.</p>
            )}

            {/* Phần điều khiển phân trang */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', gap: '15px' }}>
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '5px',
                        border: '1px solid #007bff',
                        backgroundColor: currentPage === 1 ? '#e9ecef' : '#007bff',
                        color: currentPage === 1 ? '#6c757d' : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '1em',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s, color 0.3s'
                    }}
                >
                    Trang trước
                </button>
                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                    Trang {currentPage} / {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '5px',
                        border: '1px solid #007bff',
                        backgroundColor: currentPage === totalPages ? '#e9ecef' : '#007bff',
                        color: currentPage === totalPages ? '#6c757d' : 'white',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '1em',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s, color 0.3s'
                    }}
                >
                    Trang sau
                </button>
            </div>
        </Container>
    );
}

export default HomePage;