import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function StudioPage() {
  const { studioName } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimeByStudio = async () => {
      try {
        const res = await axiosInstance.get(`/anime?studio=${studioName}&page=1&limit=10`);
        setAnimeList(res.data.anime);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeByStudio();
  }, [studioName]);

  return (
    <Container className="mt-4">
      <h2>Nội dung từ studio: {studioName}</h2>
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
        <p>Không có nội dung nào từ studio này.</p>
      )}
    </Container>
  );
}

export default StudioPage;

