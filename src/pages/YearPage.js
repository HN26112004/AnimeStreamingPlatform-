// src/pages/YearPage.js
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function YearPage() {
  const { year } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimeByYear = async () => {
      try {
        const res = await axiosInstance.get(`/anime/year?year=${year}&page=1&limit=10`);
        setAnimeList(res.data.anime);
      } catch (err) {
        console.error('Lỗi khi lấy anime theo năm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeByYear();
  }, [year]);

  return (
    <Container className="mt-4">
      <h2>Anime phát hành năm: {year}</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : animeList.length > 0 ? (
        <Row>
          {animeList.map((anime) => (
            <Col key={anime._id} md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000${anime.image}`}
                  style={{ height: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x400?text=No+Image";
                  }}
                />
                <Card.Body>
                  <Card.Title className="text-truncate" title={anime.name}>
                    {anime.name}
                  </Card.Title>
                  <Link to={`/anime/${anime._id}`} className="btn btn-primary btn-sm">
                    Xem chi tiết
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>Không có anime nào phát hành trong năm này.</p>
      )}
    </Container>
  );
}

export default YearPage;