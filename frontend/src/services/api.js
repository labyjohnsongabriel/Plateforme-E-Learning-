// api.js - Configuration API
const API_BASE_URL = '/api';

export const apiRequest = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error('Erreur API');
  return response.json();
};