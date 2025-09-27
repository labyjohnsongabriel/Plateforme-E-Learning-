// SystemConfig.jsx - Configuration
import React, { useState } from 'react';
import { colors } from '../../utils/colors';

const SystemConfig = ({ theme = 'light' }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  const handleSave = () => {
    // Placeholder pour sauvegarde des paramètres
    alert('Configuration sauvegardée.');
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Configuration Système</h1>
      <label>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={() => setNotificationsEnabled(!notificationsEnabled)}
        />
        Activer les notifications
      </label>
      <button onClick={handleSave} style={{ background: colors.primary, color: 'white', padding: '10px', marginTop: '10px' }}>Sauvegarder</button>
    </div>
  );
};

export default SystemConfig;