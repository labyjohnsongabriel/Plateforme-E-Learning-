// Dashboard.jsx - Dashboard étudiant
import React, { useState, useEffect } from 'react';
import Progress from './Progress';
import Certificates from './Certificates';
//import { colors } from '../../styles/colors';

const Dashboard = ({ userId, theme = 'light' }) => {
  const [progress, setProgress] = useState(0);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer la progression
    fetch(`/api/users/${userId}/progress`)
      .then(res => res.json())
      .then(data => setProgress(data.progress));
  }, [userId]);

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Tableau de Bord Étudiant</h1>
      <p>Bienvenue, gérez votre apprentissage ici.</p>
      <Progress userId={userId} theme={theme} />
      <Certificates userId={userId} theme={theme} />
    </div>
  );
};

export default Dashboard;