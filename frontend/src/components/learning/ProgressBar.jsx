// ProgressBar.jsx - Barre de progression avec gradient personnalisé
import React from 'react';
import { colors } from '../../utils/colors';

const ProgressBar = ({ progress, level, theme = 'light' }) => {
  const levelColor = colors[`level${level}`]?.color || colors.primary;
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  return (
    <div style={{
      background: bg,
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Progression: {progress}%</h3>
      <div style={{
        background: '#E0E0E0',
        borderRadius: '4px',
        height: '20px',
      }}>
        <div style={{
          background: `linear-gradient(to right, ${levelColor}, ${colors.success})`,
          width: `${progress}%`,
          height: '100%',
          borderRadius: '4px',
        }} />
      </div>
      <p>Niveau actuel: {level}</p>
    </div>
  );
};

export default ProgressBar;