// AdminDashboard.jsx - Dashboard admin
import React, { useState, useEffect } from 'react';
//import { colors } from '../../styles/colors';

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
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Tableau de Bord Admin</h1>
      <p>Utilisateurs inscrits: {usersCount}</p>
    </div>
  );
};

export default AdminDashboard;