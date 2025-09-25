// courseService.js - Service cours
import { apiRequest } from './api';

export const getCourses = (userId) => apiRequest(`/users/${userId}/courses`);
export const getCourse = (id) => apiRequest(`/courses/${id}`);
export const createCourse = (courseData) => apiRequest('/instructor/courses', { method: 'POST', body: JSON.stringify(courseData) });