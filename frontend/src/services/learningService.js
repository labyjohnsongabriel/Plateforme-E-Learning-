// learningService.js - Service apprentissage
import { apiRequest } from './api';

export const getLearningPath = (userId) => apiRequest(`/users/${userId}/learning-path`);