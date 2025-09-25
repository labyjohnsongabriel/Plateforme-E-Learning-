// ManageCourses.jsx - Gestion cours
import React, { useState, useEffect } from 'react';
//import { colors } from '../../styles/colors';

const ManageCourses = ({ theme = 'light' }) => {
  const [courses, setCourses] = useState([]);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les cours
    fetch('/api/instructor/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Gestion des Cours</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {courses.map(course => (
          <li key={course.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            {course.title} <a href={`/instructor/edit-course/${course.id}`}>Modifier</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageCourses;