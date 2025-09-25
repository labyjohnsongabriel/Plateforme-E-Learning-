// CourseView.jsx - Vue cours
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
//import { colors } from '../../styles/colors';

const CourseView = ({ theme = 'light' }) => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les détails du cours
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => setCourse(data));
  }, [id]);

  if (!course) return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <p>Chargement...</p>
    </div>
  );

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>{course.title}</h1>
      <p>Description: {course.description}</p>
      <p>Niveau: {course.level}</p>
      <a href={`/student/progress`} style={{ background: colors.primary, color: 'white', padding: '10px', textDecoration: 'none' }}>Voir ma progression</a>
    </div>
  );
};

export default CourseView;