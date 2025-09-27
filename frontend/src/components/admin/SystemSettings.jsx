// SystemSettings.jsx - Paramètres système
import React, { useState } from 'react';
import { colors, gradients } from '../../utils/colors';

const SystemSettings = ({ theme = 'light' }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  const handleSave = () => {
    // Placeholder pour sauvegarde des paramètres
    alert('Paramètres sauvegardés.');
    // À implémenter : fetch('/api/admin/settings', { method: 'POST' });
  };

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Paramètres Système</h3>
      <label>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={() => setNotificationsEnabled(!notificationsEnabled)}
        />
        Activer les notifications
      </label>
      <button onClick={handleSave} style={{ background: colors.secondary, color: 'white', padding: '10px', marginTop: '10px' }}>
        Sauvegarder
      </button>
    </div>
  );
};

export default SystemSettings;