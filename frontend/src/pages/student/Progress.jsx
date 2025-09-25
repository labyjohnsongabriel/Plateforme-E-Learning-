// Progress.jsx - Ma progression
import React, { useState, useEffect } from 'react';
//import { colors } from '../../styles/colors';

const Progress = ({ userId, theme = 'light' }) => {
  const [progress, setProgress] = useState(0);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API pour récupérer la progression
    fetch(`/api/users/${userId}/progress`)
      .then(res => res.json())
      .then(data => setProgress(data.progress));
  }, [userId]);

  return (
    <div style={{ background: bg, padding: '24px', borderRadius: '8px', maxWidth: '400px', margin: '16px 0', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h3>Ma Progression</h3>
      <div style={{ background: '#E0E0E0', borderRadius: '4px', height: '20px' }}>
        <div style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.success})`, width: `${progress}%`, height: '100%', borderRadius: '4px' }} />
      </div>
      <p>Complété : {progress}%</p>
    </div>
  );
};

export default Progress;