// useCourses.js - Hook cours
import { useState, useEffect } from 'react';

export const useCourses = (userId) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch(`/api/users/${userId}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data));
  }, [userId]);

  return { courses };
};