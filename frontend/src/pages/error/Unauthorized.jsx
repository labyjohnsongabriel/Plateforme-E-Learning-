// Unauthorized.jsx - Page 401
import React from 'react';
import { colors } from "../../utils/colors";

const Unauthorized = ({ theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <div>
        <h1>401 - Accès Non Autorisé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <a href="/login" style={{ background: colors.primary, color: 'white', padding: '10px', textDecoration: 'none' }}>Se connecter</a>
      </div>
    </div>
  );
};

export default Unauthorized;