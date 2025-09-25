// Statistics.jsx - Statistiques de formation
import React, { useState, useEffect } from 'react';
import { colors } from '../styles/colors';

const Statistics = ({ userId, theme = 'light' }) => {
  const [stats, setStats] = useState({ completed: 0, total: 0 });
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API pour récupérer les statistiques
    fetch(`/api/users/${userId}/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [userId]);

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '300px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Statistiques</h3>
      <p>Cours complétés: {stats.completed}/{stats.total}</p>
      <p>Progression moyenne: {(stats.completed / stats.total * 100).toFixed(1)}%</p>
    </div>
  );
};

export default Statistics;