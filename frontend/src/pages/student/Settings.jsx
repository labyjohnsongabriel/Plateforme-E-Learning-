// Settings.jsx - Paramètres
import React, { useState } from 'react';
//import { colors } from '../../styles/colors';

const Settings = ({ theme = 'light' }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  const handleSave = () => {
    // Placeholder pour sauvegarde des paramètres
    alert('Paramètres sauvegardés.');
    // À implémenter : fetch('/api/users/settings', { method: 'POST' });
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Paramètres</h1>
      <label>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          style={{ marginRight: '8px' }}
        />
        Activer les notifications
      </label>
      <button onClick={handleSave} style={{ background: colors.primary, color: 'white', padding: '10px', marginTop: '10px' }}>Sauvegarder</button>
    </div>
  );
};

export default Settings;