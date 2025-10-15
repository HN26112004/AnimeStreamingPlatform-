// src/components/RelatedAnimes.js

import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';
import AnimeCard from './AnimeCard';

const RelatedAnimes = ({ animeId }) => {
    const [relatedAnimes, setRelatedAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRelatedAnimes = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/anime/${animeId}/related`);
                setRelatedAnimes(data);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải anime liên quan:", err);
                setError('Không thể tải các anime liên quan.');
                setLoading(false);
            }
        };

        if (animeId) {
            fetchRelatedAnimes();
        }
    }, [animeId]);

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger" className="text-center">{error}</Alert>;
    }

    if (relatedAnimes.length === 0) {
        return (
            <div className="text-center my-5">
                <p>Không tìm thấy anime liên quan.</p>
            </div>
        );
    }

    return (
        <div className="related-animes-section mt-5">
            <h4 className="mb-4">Anime có thể bạn thích</h4>
            <Row>
                {relatedAnimes.map(anime => (
                    <Col key={anime._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                        <AnimeCard anime={anime} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default RelatedAnimes;