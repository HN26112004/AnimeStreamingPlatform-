// src/components/AnimeCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs'; // Import icon thùng rác

const AnimeCard = ({ anime, onDelete }) => {
  return (
    <Card className="h-100 shadow-sm rounded">
      {/* Container cho ảnh và nút xóa */}
      <div style={{ position: 'relative' }}>
        <Link to={`/anime/${anime._id}`}>
          <Card.Img
            variant="top"
            src={anime.image}
            alt={anime.name}
            style={{ height: '250px', objectFit: 'cover' }}
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x600/CCCCCC/333333?text=No+Image"; }}
          />
        </Link>
        {/* Nút xóa chỉ hiển thị nếu có hàm onDelete được truyền vào */}
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={() => onDelete(anime._id)}
          >
            <BsTrash />
          </Button>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate">
          <Link to={`/anime/${anime._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {anime.name}
          </Link>
        </Card.Title>
        <Card.Text className="text-muted mt-auto">
          Năm: {anime.year}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default AnimeCard;