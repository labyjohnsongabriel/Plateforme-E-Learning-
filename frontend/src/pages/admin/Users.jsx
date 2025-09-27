// Users.jsx - Gestion utilisateurs
import React, { useState, useEffect } from 'react';
import { colors } from "../../utils/colors";

const Users = ({ theme = 'light' }) => {
  const [users, setUsers] = useState([]);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer la liste des utilisateurs
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Gestion des Utilisateurs</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map(user => (
          <li key={user.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            {user.name} ({user.email}) <button style={{ background: colors.error, color: 'white', padding: '4px' }}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;