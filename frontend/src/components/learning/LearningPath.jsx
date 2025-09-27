// LearningPath.jsx - Parcours d'apprentissage avec niveaux
import React from 'react';
import { colors } from '../../utils/colors';

const LearningPath = ({ level, theme = 'light' }) => {
  const levels = ['Alfa', 'Bêta', 'Gamma', 'Delta'];
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Parcours d'Apprentissage</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {levels.map(lvl => (
          <li key={lvl} style={{
            padding: '8px',
            background: lvl <= level ? colors[`level${lvl}`]?.gradient : '#E0E0E0',
            borderRadius: '4px',
            margin: '4px 0',
          }}>
            {lvl} {lvl <= level ? '✓' : ''}
          </li>
        ))}
      </ul>
      <p>Prochain niveau: {levels[levels.indexOf(level) + 1] || 'Terminé'}</p>
    </div>
  );
};

export default LearningPath;