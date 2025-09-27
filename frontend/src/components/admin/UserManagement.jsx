// UserManagement.jsx - Gestion des utilisateurs
import React, { useState, useEffect } from 'react';
import { colors, gradients } from "../../utils/colors";

const UserManagement = ({ theme = 'light' }) => {
  const [users, setUsers] = useState([]);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API pour récupérer la liste des utilisateurs
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Gestion des Utilisateurs</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map(user => (
          <li key={user.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            {user.name} ({user.email}) - <button style={{ background: colors.error, color: 'white', padding: '4px' }}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;