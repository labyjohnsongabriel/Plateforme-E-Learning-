// StatisticsPanel.jsx - Panneau de statistiques
import React, { useState, useEffect } from 'react';
import { colors } from '../styles/colors';

const StatisticsPanel = ({ theme = 'light' }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0 });
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API pour récupérer les statistiques
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Statistiques</h3>
      <p>Utilisateurs totaux: {stats.totalUsers}</p>
      <p>Cours totaux: {stats.totalCourses}</p>
    </div>
  );
};

export default StatisticsPanel;