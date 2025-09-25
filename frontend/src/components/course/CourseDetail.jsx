// CourseDetail.jsx - Détail cours avec fond gradient niveau
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { colors } from '../styles/colors';

const CourseDetail = ({ theme = 'light' }) => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour détail cours
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => setCourse(data));
  }, [id]);

  if (!course) return <p>Chargement...</p>;

  return (
    <div style={{
      background: bg,
      padding: '32px',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: 'auto',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h1>{course.title}</h1>
      <p>Description: {course.description}</p>
      <p>Niveau: {course.level}</p>
      <button style={{ background: colors.secondary, color: 'white', padding: '10px' }}>
        S'inscrire
      </button>
    </div>
  );
};

export default CourseDetail;