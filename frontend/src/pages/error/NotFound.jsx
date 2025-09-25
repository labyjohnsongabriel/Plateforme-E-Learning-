// NotFound.jsx - Page 404
import React from 'react';
//import { colors } from '../../styles/colors';

const NotFound = ({ theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <div>
        <h1>404 - Page Non Trouvée</h1>
        <p>La page que vous recherchez n'existe pas.</p>
        <a href="/" style={{ background: colors.primary, color: 'white', padding: '10px', textDecoration: 'none' }}>Retour à l'accueil</a>
      </div>
    </div>
  );
};

export default NotFound;