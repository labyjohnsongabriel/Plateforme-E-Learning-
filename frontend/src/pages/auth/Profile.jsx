// Profile.jsx - Page profil
import React, { useState, useEffect } from 'react';
//import { colors } from '../../styles/colors';

const Profile = ({ userId, theme = 'light' }) => {
  const [user, setUser] = useState({ name: '', email: '' });
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les données du profil
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '400px', padding: '32px', borderRadius: '8px', background: theme === 'dark' ? colors.backgroundDark : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: theme === 'dark' ? colors.textDark : colors.textLight }}>Profil</h2>
        <p>Nom: {user.name}</p>
        <p>Email: {user.email}</p>
        <button style={{ background: colors.primary, color: 'white', padding: '10px' }}>Modifier</button>
      </div>
    </div>
  );
};

export default Profile;