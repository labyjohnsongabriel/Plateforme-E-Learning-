// notificationService.js - Service notifications
import { apiRequest } from './api';

export const getNotifications = () => apiRequest('/notifications');
export const getUnreadCount = () => apiRequest('/notifications/unread-count');