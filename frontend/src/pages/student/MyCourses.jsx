// MyCourses.jsx - Mes cours
import React, { useState, useEffect } from 'react';
//import { colors } from '../../styles/colors';

const MyCourses = ({ userId, theme = 'light' }) => {
  const [courses, setCourses] = useState([]);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les cours de l'utilisateur
    fetch(`/api/users/${userId}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data));
  }, [userId]);

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Mes Cours</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {courses.map(course => (
          <li key={course.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            <a href={`/student/course-view/${course.id}`} style={{ color: theme === 'dark' ? colors.textDark : colors.textLight, textDecoration: 'underline' }}>
              {course.title}
            </a>
          </li>
        ))}
      </ul>
      {courses.length === 0 && <p>Aucun cours inscrit pour le moment.</p>}
    </div>
  );
};

export default MyCourses;