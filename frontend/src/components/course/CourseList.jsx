// CourseList.jsx - Liste de cours avec fond global gradient
import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { colors } from '../styles/colors';

const CourseList = ({ domain, theme = 'light' }) => {
  const [courses, setCourses] = useState([]);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API exemple pour liste cours
    fetch(`/api/courses?domain=${domain}`)
      .then(res => res.json())
      .then(data => setCourses(data));
  }, [domain]);

  return (
    <div style={{
      background: bg,
      padding: '24px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      <h2>Catalogue de Cours - {domain}</h2>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} theme={theme} />
      ))}
    </div>
  );
};

export default CourseList;