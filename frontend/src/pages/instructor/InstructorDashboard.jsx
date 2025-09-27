// InstructorDashboard.jsx - Dashboard instructeur
import React from 'react';
import { colors } from "../../utils/colors";
const InstructorDashboard = ({ theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Tableau de Bord Instructeur</h1>
      <p>Bienvenue, gérez vos cours et suivez vos étudiants.</p>
    </div>
  );
};

export default InstructorDashboard;