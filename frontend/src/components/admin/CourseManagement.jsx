// CourseManagement.jsx - Gestion des cours
import React, { useState, useEffect } from 'react';
import { colors } from '../styles/colors';

const CourseManagement = ({ theme = 'light' }) => {
  const [courses, setCourses] = useState([]);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API pour récupérer la liste des cours
    fetch('/api/admin/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Gestion des Cours</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {courses.map(course => (
          <li key={course.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            {course.title} (Niveau: {course.level}) - <button style={{ background: colors.error, color: 'white', padding: '4px' }}>Supprimer</button>
          </li>
        ))}
      </ul>
      <button style={{ background: colors.primary, color: 'white', padding: '10px', marginTop: '10px' }}>Ajouter un Cours</button>
    </div>
  );
};

export default CourseManagement;