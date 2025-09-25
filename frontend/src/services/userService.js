// userService.js - Service utilisateurs
import { apiRequest } from './api';

export const getUser = (userId) => apiRequest(`/users/${userId}`);
export const getProgress = (userId) => apiRequest(`/users/${userId}/progress`);
export const getCertificates = (userId) => apiRequest(`/users/${userId}/certificates`);