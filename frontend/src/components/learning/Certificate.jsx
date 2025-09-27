// Certificate.jsx - Composant certificat avec génération simulée
import React from 'react';
import { colors } from "../../utils/colors";

const Certificate = ({ level, theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.levelBeta.gradient; // Bleu pour Bêta+

  const handleDownload = () => {
    // Placeholder pour génération PDF (ex. avec ReportLab)
    alert(`Téléchargement du certificat pour niveau ${level} initié.`);
    // À implémenter : fetch('/api/certificates/generate', { method: 'POST' });
  };

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '500px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <h2>Certificat</h2>
      <p>Félicitations ! Vous avez atteint le niveau {level}.</p>
      <button onClick={handleDownload} style={{ background: colors.success, color: 'white', padding: '10px' }}>
        Télécharger le certificat
      </button>
    </div>
  );
};

export default Certificate;