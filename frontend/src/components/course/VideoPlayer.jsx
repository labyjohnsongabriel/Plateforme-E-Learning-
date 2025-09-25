// VideoPlayer.jsx - Lecteur vidéo avec fond dark pour immersion
import React from 'react';
import { colors } from '../styles/colors';

const VideoPlayer = ({ url, theme = 'light' }) => {
  const bg = theme === 'dark' ? '#000000' : colors.backgroundLight; // Fond dark pour vidéo

  return (
    <div style={{
      background: bg,
      borderRadius: '8px',
      overflow: 'hidden',
      maxWidth: '800px',
      margin: 'auto',
    }}>
      <video controls style={{ width: '100%' }}>
        <source src={url} type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>
    </div>
  );
};

export default VideoPlayer;