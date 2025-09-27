// AdminDashboard.jsx - Tableau de bord administrateur
import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import StatisticsPanel from './StatisticsPanel';
import SystemSettings from './SystemSettings';
import { colors, gradients } from '../../utils/colors';

const AdminDashboard = ({ theme = 'light' }) => {
  const [usersCount, setUsersCount] = useState(0);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer le nombre d'utilisateurs
    fetch('/api/admin/users/count')
      .then(res => res.json())
      .then(data => setUsersCount(data.count));
  }, []);

  return (
    <div style={{
      background: bg,
      padding: '32px',
      minHeight: '100vh',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h1>Tableau de Bord Administrateur</h1>
      <p>Utilisateurs inscrits: {usersCount}</p>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <UserManagement theme={theme} />
        <CourseManagement theme={theme} />
        <StatisticsPanel theme={theme} />
        <SystemSettings theme={theme} />
      </div>
    </div>
  );
};

export default AdminDashboard;