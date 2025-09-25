// CourseEditor.jsx - Éditeur de cours
import React, { useState } from 'react';
import { colors } from '../styles/colors';

const CourseEditor = ({ theme = 'light' }) => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Alfa');
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  const handleSave = () => {
    // Placeholder pour sauvegarde du cours
    alert(`Cours "${title}" (Niveau: ${level}) sauvegardé.`);
    // À implémenter : fetch('/api/instructor/courses', { method: 'POST' });
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
      <h3>Éditeur de Cours</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du cours"
        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
      />
      <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: '100%', padding: '8px', margin: '8px 0' }}>
        <option value="Alfa">Alfa</option>
        <option value="Bêta">Bêta</option>
        <option value="Gamma">Gamma</option>
        <option value="Delta">Delta</option>
      </select>
      <button onClick={handleSave} style={{ background: colors.primary, color: 'white', padding: '10px' }}>
        Sauvegarder
      </button>
    </div>
  );
};

export default CourseEditor;