import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Backdrop, CircularProgress, Alert, Snackbar, Typography } from '@mui/material';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

// Role constants for frontend consistency
const Roles = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

/**
 * CourseContext for managing courses in the e-learning platform
 */
export const CourseContext = createContext({
  courses: [],
  domaines: [],
  fetchCourses: async () => {},
  fetchDomaines: async () => {},
  addCourse: async () => {},
  updateCourse: async () => {},
  deleteCourse: async () => {},
  isLoading: false,
  isDomainesLoading: false,
  error: null,
  isAuthLoading: false,
});

/**
 * CourseProvider component to wrap the application and provide course context
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components
 */
export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDomainesLoading, setIsDomainesLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  /**
   * Fetch domaines from the API
   */
  const fetchDomaines = useCallback(async () => {
    if (!user?.token) {
      console.log('No user or token, skipping domaines fetch');
      setDomaines([]);
      return;
    }

    setIsDomainesLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses/domaine`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 200 && response.status < 300) {
        const data = Array.isArray(response.data) ? response.data : [];
        setDomaines(data);
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Fetch domaines error:', err);
      const errorMessage = handleApiError(err, navigate);
      setError(errorMessage);
      setDomaines([]);
    } finally {
      setIsDomainesLoading(false);
    }
  }, [user, navigate, API_BASE_URL]);

  /**
   * Fetch courses from the API
   */
  const fetchCourses = useCallback(async () => {
    if (!user?.token || user.role === Roles.ETUDIANT) {
      console.log('No user, token, or student role, skipping courses fetch');
      setCourses([]);
      localStorage.setItem('courses', JSON.stringify([]));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        params: { role: user.role },
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 200 && response.status < 300) {
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
        setCourses(data);
        localStorage.setItem('courses', JSON.stringify(data));
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
      const errorMessage = handleApiError(err, navigate);
      setError(errorMessage);
      setCourses([]);
      localStorage.setItem('courses', JSON.stringify([]));
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, API_BASE_URL]);

  /**
   * Handle API errors consistently
   */
  const handleApiError = (err, navigate) => {
    if (err.response) {
      switch (err.response.status) {
        case 401:
          navigate('/login');
          return 'Session expirée, veuillez vous reconnecter';
        case 403:
          setCourses([]);
          localStorage.setItem('courses', JSON.stringify([]));
          return 'Accès non autorisé';
        case 404:
          return 'Service non disponible';
        default:
          return err.response.data?.message || 'Erreur serveur';
      }
    }
    return 'Impossible de se connecter au serveur';
  };

  /**
   * Initialize courses and domaines
   */
  useEffect(() => {
    if (isAuthLoading) {
      console.log('Authentication still loading, waiting...');
      return;
    }

    if (!user?.token) {
      console.log('No user or token, resetting courses and domaines');
      setCourses([]);
      setDomaines([]);
      localStorage.setItem('courses', JSON.stringify([]));
      setError('Veuillez vous connecter pour voir les cours et domaines');
      return;
    }

    // Load courses from localStorage
    const storedCourses = localStorage.getItem('courses');
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses);
        if (Array.isArray(parsedCourses)) {
          setCourses(parsedCourses);
        } else {
          console.warn('Stored courses is not an array, clearing localStorage');
          localStorage.removeItem('courses');
        }
      } catch (err) {
        console.error('Failed to parse stored courses:', err);
        localStorage.removeItem('courses');
      }
    }

    // Fetch data for non-student roles
    if (user.role !== Roles.ETUDIANT) {
      fetchCourses();
      fetchDomaines();
    }
  }, [user, isAuthLoading, fetchCourses, fetchDomaines]);

  /**
   * Add a new course
   */
  const addCourse = useCallback(
    async (course) => {
      if (!user?.token || ![Roles.ENSEIGNANT, Roles.ADMIN].includes(user.role)) {
        const errorMessage =
          "Vous devez être connecté et avoir le rôle d'instructeur ou d'administrateur";
        setError(errorMessage);
        navigate(user?.role ? '/unauthorized' : '/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      const newCourse = {
        ...course,
        _id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createur: user._id,
      };

      try {
        setCourses((prev) => {
          const updatedCourses = [...prev, newCourse];
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          return updatedCourses;
        });

        const response = await axios.post(`${API_BASE_URL}/api/courses`, newCourse, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });

        const savedCourse = response.data.data || response.data;
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c._id === newCourse._id ? savedCourse : c));
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } catch (err) {
        console.error('Add course error:', err);
        const errorMessage = handleApiError(err, navigate);
        setError(errorMessage);
        setCourses((prev) => {
          const updatedCourses = prev.filter((c) => c._id !== newCourse._id);
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, navigate, API_BASE_URL]
  );

  /**
   * Update an existing course
   */
  const updateCourse = useCallback(
    async (id, updates) => {
      if (!user?.token || ![Roles.ENSEIGNANT, Roles.ADMIN].includes(user.role)) {
        const errorMessage =
          "Vous devez être connecté et avoir le rôle d'instructeur ou d'administrateur";
        setError(errorMessage);
        navigate(user?.role ? '/unauthorized' : '/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c._id === id ? { ...c, ...updates } : c));
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          return updatedCourses;
        });

        const response = await axios.put(`${API_BASE_URL}/api/courses/${id}`, updates, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });

        const updatedCourse = response.data.data || response.data;
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c._id === id ? updatedCourse : c));
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } catch (err) {
        console.error('Update course error:', err);
        const errorMessage = handleApiError(err, navigate);
        setError(errorMessage);
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c._id === id ? { ...c } : c));
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, navigate, API_BASE_URL]
  );

  /**
   * Delete a course
   */
  const deleteCourse = useCallback(
    async (id) => {
      if (!user?.token || ![Roles.ENSEIGNANT, Roles.ADMIN].includes(user.role)) {
        const errorMessage =
          "Vous devez être connecté et avoir le rôle d'instructeur ou d'administrateur";
        setError(errorMessage);
        navigate(user?.role ? '/unauthorized' : '/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        setCourses((prev) => {
          const updatedCourses = prev.filter((c) => c._id !== id);
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          return updatedCourses;
        });

        const response = await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.status !== 204 && response.status !== 200) {
          throw new Error('Erreur lors de la suppression du cours');
        }
      } catch (err) {
        console.error('Delete course error:', err);
        const errorMessage = handleApiError(err, navigate);
        setError(errorMessage);
        fetchCourses();
      } finally {
        setIsLoading(false);
      }
    },
    [user, fetchCourses, navigate, API_BASE_URL]
  );

  const contextValue = {
    courses,
    domaines,
    fetchCourses,
    fetchDomaines,
    addCourse,
    updateCourse,
    deleteCourse,
    isLoading,
    isDomainesLoading,
    error,
    isAuthLoading,
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
      <Backdrop
        open={isLoading || isAuthLoading || isDomainesLoading}
        sx={{
          zIndex: 9999,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #010b40 0%, #1a237e 100%)',
        }}
      >
        <img
          src='/assets/images/Youth Computing.png'
          alt='Youth Computing Logo'
          style={{ width: '100px', height: '100px', marginBottom: '20px' }}
        />
        <CircularProgress
          color='inherit'
          size={40}
          thickness={5}
          sx={{ '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
        />
        <Typography variant='h6' sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif', fontWeight: 500 }}>
          {isAuthLoading
            ? "Vérification de l'authentification..."
            : isDomainesLoading
              ? 'Chargement des domaines...'
              : 'Chargement des cours...'}
        </Typography>
      </Backdrop>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity='error'
          onClose={() => setError(null)}
          sx={{ width: '100%', maxWidth: '600px' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </CourseContext.Provider>
  );
};
