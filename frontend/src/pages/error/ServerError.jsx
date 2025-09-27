// ServerError.jsx - Page 500
import React from 'react';
import { colors } from "../../utils/colors";

const ServerError = ({ theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <div>
        <h1>500 - Erreur Interne du Serveur</h1>
        <p>Une erreur s'est produite. Veuillez réessayer plus tard ou contactez le support.</p>
        <a href="/" style={{ background: colors.primary, color: 'white', padding: '10px', textDecoration: 'none' }}>Retour à l'accueil</a>
      </div>
    </div>
  );
};

export default ServerError;