// CourseCard.jsx - Carte cours avec fond gradient basé sur niveau
import React from 'react';
import { colors } from '../styles/colors';

const CourseCard = ({ course, theme = 'light' }) => {
  const levelGradient = colors[`level${course.level}`]?.gradient || colors.globalGradientLight;
  const bg = theme === 'dark' ? colors.globalGradientDark : levelGradient;

  return (
    <div style={{
      background: bg,
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      maxWidth: '300px',
      margin: '16px',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>{course.title}</h3>
      <p>Niveau: {course.level}</p>
      <p>Domaine: {course.domain}</p>
      <button style={{ background: colors.primary, color: 'white', padding: '8px' }}>
        Commencer
      </button>
    </div>
  );
};

export default CourseCard;