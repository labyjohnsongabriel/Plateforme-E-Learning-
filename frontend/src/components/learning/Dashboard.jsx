// Dashboard.jsx - Tableau de bord apprenant/admin
import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import Certificate from './Certificate';
import Statistics from './Statistics';
import LearningPath from './LearningPath';
import { colors } from '../../utils/colors';

const Dashboard = ({ user, theme = 'light' }) => {
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState('Alfa');
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les données de l'utilisateur
    fetch(`/api/users/${user.id}/progress`)
      .then(res => res.json())
      .then(data => {
        setProgress(data.progress);
        setLevel(data.level);
      });
  }, [user.id]);

  return (
    <div style={{
      background: bg,
      padding: '32px',
      minHeight: '100vh',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h1>Bienvenue, {user.name}!</h1>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <ProgressBar progress={progress} level={level} theme={theme} />
        {level >= 'Bêta' && <Certificate level={level} theme={theme} />}
        <Statistics userId={user.id} theme={theme} />
        <LearningPath level={level} theme={theme} />
      </div>
    </div>
  );
};

export default Dashboard;