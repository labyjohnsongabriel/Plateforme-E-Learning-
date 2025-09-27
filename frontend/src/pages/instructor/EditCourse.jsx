// EditCourse.jsx - Édition cours
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { colors } from '../../utils/colors';

const EditCourse = ({ theme = 'light' }) => {
  const { id } = useParams();
  const [course, setCourse] = useState({ title: '', level: 'Alfa' });
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les détails du cours
    fetch(`/api/instructor/courses/${id}`)
      .then(res => res.json())
      .then(data => setCourse(data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Placeholder pour mise à jour du cours
    alert(`Cours "${course.title}" (Niveau: ${course.level}) mis à jour.`);
    // À implémenter : fetch(`/api/instructor/courses/${id}`, { method: 'PUT' });
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Éditer un Cours</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        <select value={course.level} onChange={(e) => setCourse({ ...course, level: e.target.value })} style={{ width: '100%', padding: '8px', margin: '8px 0' }}>
          <option value="Alfa">Alfa</option>
          <option value="Bêta">Bêta</option>
          <option value="Gamma">Gamma</option>
          <option value="Delta">Delta</option>
        </select>
        <button type="submit" style={{ background: colors.primary, color: 'white', padding: '10px' }}>Sauvegarder</button>
      </form>
    </div>
  );
};

export default EditCourse;