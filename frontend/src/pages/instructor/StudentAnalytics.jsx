// StudentAnalytics.jsx - Analytics étudiants
import React, { useState, useEffect } from 'react';
//import { colors } from '../../styles/colors';

const StudentAnalytics = ({ theme = 'light' }) => {
  const [analytics, setAnalytics] = useState([]);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les analytics
    fetch('/api/instructor/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data));
  }, []);

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Analytics Étudiants</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {analytics.map((item, index) => (
          <li key={index} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            {item.name}: {item.progress}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentAnalytics;