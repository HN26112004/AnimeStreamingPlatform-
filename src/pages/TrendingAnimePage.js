import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AnimeCard from '../components/AnimeCard';

const TrendingAnimePage = () => {
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/anime/trending-today')
      .then((res) => setAnimes(res.data))
      .catch((err) => console.error('Lỗi khi lấy anime hot hôm nay:', err));
  }, []);

  return (
    <div>
      <h2>📈 Anime hot hôm nay</h2>
      <div className="anime-grid">
        {animes.map((anime) => (
          <AnimeCard key={anime._id} anime={anime} />
        ))}
      </div>
    </div>
  );
};

export default TrendingAnimePage;

