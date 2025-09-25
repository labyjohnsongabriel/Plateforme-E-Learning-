// useProgress.js - Hook progression
import { useState, useEffect } from 'react';

export const useProgress = (userId) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch(`/api/users/${userId}/progress`)
      .then(res => res.json())
      .then(data => setProgress(data.progress));
  }, [userId]);

  return { progress };
};