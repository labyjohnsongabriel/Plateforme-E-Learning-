// ContentUpload.jsx - Upload de contenu
import React, { useState } from 'react';
import { colors } from '../styles/colors';

const ContentUpload = ({ theme = 'light' }) => {
  const [file, setFile] = useState(null);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  const handleUpload = () => {
    // Placeholder pour upload
    if (file) {
      alert(`Fichier ${file.name} uploadé.`);
      // À implémenter : fetch('/api/instructor/upload', { method: 'POST', body: file });
    }
  };

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Upload de Contenu</h3>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ margin: '8px 0' }}
      />
      <button onClick={handleUpload} style={{ background: colors.secondary, color: 'white', padding: '10px' }}>
        Télécharger
      </button>
    </div>
  );
};

export default ContentUpload;