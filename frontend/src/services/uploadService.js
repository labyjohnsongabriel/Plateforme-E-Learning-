// uploadService.js - Service upload
import { apiRequest } from './api';

export const uploadContent = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch('/api/instructor/upload', { method: 'POST', body: formData });
};