import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ src, format, poster = '', title = '' }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Hủy player cũ nếu có
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Tạo player mới
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      poster,
      sources: [
        {
          src,
          type: format === 'hls' ? 'application/x-mpegURL' : `video/${format}`
        }
      ]
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, format, poster]);

  return (
    <div className="video-player-container">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </div>
  );
};

export default VideoPlayer;

