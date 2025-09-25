// CreateCourse.jsx - Création cours
import React, { useState } from 'react';
//import { colors } from '../../styles/colors';

const CreateCourse = ({ theme = 'light' }) => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Alfa');
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Placeholder pour création de cours
    alert(`Cours "${title}" (Niveau: ${level}) créé.`);
    // À implémenter : fetch('/api/instructor/courses', { method: 'POST' });
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Créer un Cours</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: '100%', padding: '8px', margin: '8px 0' }}>
          <option value="Alfa">Alfa</option>
          <option value="Bêta">Bêta</option>
          <option value="Gamma">Gamma</option>
          <option value="Delta">Delta</option>
        </select>
        <button type="submit" style={{ background: colors.primary, color: 'white', padding: '10px' }}>Créer</button>
      </form>
    </div>
  );
};

export default CreateCourse;