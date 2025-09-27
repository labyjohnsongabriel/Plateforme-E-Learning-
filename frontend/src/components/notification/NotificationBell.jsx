// NotificationBell.jsx - Cloche de notifications
import React, { useState, useEffect } from 'react';
import NotificationList from './NotificationList';
import { colors } from '../../utils/colors';

const NotificationBell = ({ theme = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  useEffect(() => {
    // Appel API pour récupérer le nombre de notifications non lues
    fetch('/api/notifications/unread-count')
      .then(res => res.json())
      .then(data => setUnreadCount(data.count));
  }, []);

  return (
    <div style={{
      background: bg,
      padding: '8px',
      borderRadius: '50%',
      position: 'relative',
      cursor: 'pointer',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <span onClick={() => setIsOpen(!isOpen)}>🔔</span>
      {unreadCount > 0 && (
        <span style={{
          background: colors.error,
          color: 'white',
          borderRadius: '50%',
          padding: '2px 6px',
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          fontSize: '12px',
        }}>{unreadCount}</span>
      )}
      {isOpen && <NotificationList theme={theme} onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationBell;