// src/pages/WatchLaterPage.js

import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import AnimeCard from '../components/AnimeCard';

const WatchLaterPage = () => {
    const [savedAnimes, setSavedAnimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedAnimes = async () => {
            try {
                const { data } = await axiosInstance.get('/anime/saved');
                setSavedAnimes(data);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải danh sách anime đã lưu:", err);
                toast.error("Vui lòng đăng nhập để xem danh sách của bạn.");
                setLoading(false);
            }
        };
        fetchSavedAnimes();
    }, []);

    // Hàm mới để xử lý việc xóa một anime khỏi danh sách
    const handleDelete = async (animeId) => {
        try {
            await axiosInstance.delete(`/anime/save/${animeId}`);
            // Cập nhật state bằng cách lọc bỏ anime vừa xóa
            setSavedAnimes(savedAnimes.filter(anime => anime._id !== animeId));
            toast.success("Đã xóa anime khỏi danh sách xem sau!");
        } catch (err) {
            console.error("Lỗi khi xóa anime:", err);
            toast.error("Có lỗi xảy ra khi xóa anime.");
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (savedAnimes.length === 0) {
        return (
            <Container className="text-center mt-5">
                <h2>Danh sách Anime Xem Sau</h2>
                <p>Bạn chưa có anime nào trong danh sách. Hãy thêm vào nhé!</p>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h2>Danh sách Anime Xem Sau</h2>
            <Row className="mt-4">
                {savedAnimes.map(anime => (
                    <Col key={anime._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                        <AnimeCard anime={anime} onDelete={handleDelete} /> {/* Truyền hàm handleDelete vào đây */}
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default WatchLaterPage;