// authService.js - Service auth
import { apiRequest } from './api';

export const login = (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (name, email, password) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
export const forgotPassword = (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });