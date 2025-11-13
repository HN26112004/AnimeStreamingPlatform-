import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AnimeCard from '../components/AnimeCard';

const MostWatchedAnimePage = () => {
  const [animes, setAnimes] = useState([]);

 useEffect(() => {
  axios.get('http://localhost:5000/api/anime/most-watched')
    .then((res) => {
      console.log('Dữ liệu trả về:', res.data);
      setAnimes(res.data);
    })
    .catch((err) => console.error('Lỗi khi lấy anime xem nhiều nhất:', err));
}, []);



  return (
    <div>
      <h2>👀 Anime được xem nhiều nhất</h2>
      <div className="anime-grid">
        {animes.map((anime) => (
          <AnimeCard key={anime._id} anime={anime} />
        ))}
      </div>
    </div>
  );
};

export default MostWatchedAnimePage;

