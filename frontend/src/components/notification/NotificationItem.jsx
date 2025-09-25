// NotificationItem.jsx - Item de notification
import React from 'react';
import { colors } from '../styles/colors';

const NotificationItem = ({ notification, theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;
  const isNew = !notification.read;

  return (
    <div style={{
      background: isNew ? colors.levelAlfa.gradient : bg,
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '8px',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <p>{notification.message}</p>
      <small>{new Date(notification.date).toLocaleString()}</small>
    </div>
  );
};

export default NotificationItem;