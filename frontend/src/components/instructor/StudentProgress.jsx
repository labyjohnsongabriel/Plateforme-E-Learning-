// StudentProgress.jsx - Suivi des étudiants
import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';

const StudentProgress = ({ theme = 'light' }) => {
  const [students, setStudents] = useState([]);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API pour récupérer la progression des étudiants
    fetch('/api/instructor/students')
      .then(res => res.json())
      .then(data => setStudents(data));
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
      <h3>Suivi des Étudiants</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {students.map(student => (
          <li key={student.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            {student.name} - Niveau: {student.level} - Progression: {student.progress}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentProgress;