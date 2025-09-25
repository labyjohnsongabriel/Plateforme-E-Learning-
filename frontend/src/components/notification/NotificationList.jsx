// NotificationList.jsx - Liste des notifications
import React, { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem';
import { colors } from '../styles/colors';

const NotificationList = ({ theme = 'light', onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data));
  }, []);

  return (
    <div style={{
      background: bg,
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '300px',
      position: 'absolute',
      top: '40px',
      right: '0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 1000,
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map((notif, index) => (
            <NotificationItem key={index} notification={notif} theme={theme} />
          ))}
        </ul>
      )}
      <button onClick={onClose} style={{ background: colors.secondary, color: 'white', padding: '8px', marginTop: '10px' }}>
        Fermer
      </button>
    </div>
  );
};

export default NotificationList;