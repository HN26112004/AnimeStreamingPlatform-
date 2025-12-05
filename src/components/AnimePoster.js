// src/components/AnimePoster.js
import React from 'react';
import './AnimePoster.css';

const AnimePoster = ({ posterUrl, rating, latestEpisode, title }) => {
  return (
    <div className="poster-container">
      <img src={posterUrl} alt={title} className="poster-image" />
      <div className="poster-overlay">
        <span className="rating">⭐ {rating}</span>
        <span className="episode">📺 TẬP {latestEpisode}</span>
      </div>
      <div className="poster-title">{title}</div>
    </div>
  );
};

export default AnimePoster;