import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AnimeCard from '../components/AnimeCard';

const TopRatedAnimePage = () => {
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/anime/top-rated')
      .then((res) => setAnimes(res.data))
      .catch((err) => console.error('Lỗi khi lấy anime đánh giá cao:', err));
  }, []);

  return (
    <div>
      <h2>🔥 Anime được đánh giá cao nhất</h2>
      <div className="anime-grid">
        {animes.map((anime) => (
          <AnimeCard key={anime._id} anime={anime} />
        ))}
      </div>
    </div>
  );
};

export default TopRatedAnimePage;

