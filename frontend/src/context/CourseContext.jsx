// CourseContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Backdrop, CircularProgress, Alert, Snackbar, Typography } from '@mui/material';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Role constants for frontend consistency (aligned with French backend naming)
const Roles = {
  ETUDIANT: 'ETUDIANT',
  ENSEIGNANT: 'ENSEIGNANT',
  ADMIN: 'ADMIN',
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
  const [dataInitialized, setDataInitialized] = useState(false);
  const { user, isLoading: isAuthLoading, logout, refreshToken } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  const isTokenExpired = (token) => {
    try {
      if (!token || typeof token !== 'string') {
        console.error('Invalid token format:', token);
        return true;
      }
      const decoded = jwtDecode(token);
      console.log('🔍 Decoded token:', decoded); // Debug token payload
      if (!decoded.exp) {
        console.error('Token has no expiration field');
        return true;
      }
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Token decoding error:', error.message);
      return true;
    }
  };

  /**
   * Validate token before making API calls
   */
  const validateToken = useCallback(async () => {
    const token = user?.token;
    if (!token) {
      console.warn('⚠️ No token found, user may not be authenticated');
      return false;
    }
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.warn('⚠️ No user in localStorage, clearing token');
      localStorage.removeItem('token');
      return false;
    }
    try {
      const userData = JSON.parse(storedUser);
      if (isTokenExpired(userData.token)) {
        console.log('🔄 Token expired, attempting refresh');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          const success = await refreshToken();
          if (success) {
            console.log('✅ Token refreshed successfully');
            return true;
          }
        }
        console.warn('⚠️ No refresh token or refresh failed');
        return false;
      }
      return true;
    } catch (err) {
      console.error('❌ Token validation error:', err);
      return false;
    }
  }, [user, refreshToken]);

  /**
   * Fetch domaines from the API
   */
  const fetchDomaines = useCallback(async () => {
    if (!user || !user.token) {
      console.log('🚫 No user or token, skipping domaines fetch');
      return;
    }

    if (!(await validateToken())) {
      setError('Veuillez vous connecter pour accéder aux domaines');
      setDomaines([]);
      navigate('/login', { replace: true });
      return;
    }

    setIsDomainesLoading(true);
    setError(null);
    try {
      console.log('📥 Fetching domaines from:', `${API_BASE_URL}/api/courses/domaine`);
      const response = await axios.get(`${API_BASE_URL}/api/courses/domaine`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        validateStatus: (status) => status < 500,
        timeout: 10000,
      });

      console.log('📊 Domaines response:', response.data);
      if (response.status >= 200 && response.status < 300) {
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setDomaines(data);
      } else if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const retryResponse = await axios.get(`${API_BASE_URL}/api/courses/domaine`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            validateStatus: (status) => status < 500,
            timeout: 10000,
          });
          const retryData = Array.isArray(retryResponse.data)
            ? retryResponse.data
            : retryResponse.data?.data || [];
          setDomaines(retryData);
        } else {
          throw new Error('Session expirée');
        }
      } else if (response.status === 404) {
        setDomaines([]);
        setError('Aucun domaine trouvé');
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Fetch domaines error:', err);
      const errorMessage = handleApiError(err, navigate, 'domaines');
      setError(errorMessage);
      setDomaines([]);
    } finally {
      setIsDomainesLoading(false);
    }
  }, [user, navigate, API_BASE_URL, validateToken, refreshToken]);

  /**
   * Fetch courses from the API
   */
  const fetchCourses = useCallback(async () => {
    if (!user || !user.token) {
      console.log('🚫 No user or token, skipping courses fetch');
      setCourses([]);
      try {
        localStorage.setItem('courses', JSON.stringify([]));
      } catch (err) {
        console.warn('⚠️ Failed to update localStorage:', err.message);
      }
      setError('Veuillez vous connecter pour accéder aux cours');
      navigate('/login', { replace: true });
      return;
    }

    if (!(await validateToken())) {
      console.log('🚫 No valid token, skipping courses fetch');
      setCourses([]);
      try {
        localStorage.setItem('courses', JSON.stringify([]));
      } catch (err) {
        console.warn('⚠️ Failed to update localStorage:', err.message);
      }
      setError('Veuillez vous connecter pour accéder aux cours');
      navigate('/login', { replace: true });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let url =
        user.role === Roles.ETUDIANT
          ? `${API_BASE_URL}/api/learning/enrollments`
          : `${API_BASE_URL}/api/courses`;
      console.log('📥 Fetching courses with:', {
        url,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        validateStatus: (status) => status < 500,
        timeout: 10000,
      });

      console.log('📊 Courses response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      if (response.status >= 200 && response.status < 300) {
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
        const normalizedData =
          user.role === Roles.ETUDIANT
            ? data.map((enrollment) => ({
                ...enrollment.cours,
                enrollmentId: enrollment._id,
                statut: enrollment.statut,
              }))
            : data;
        setCourses(normalizedData);
        try {
          localStorage.setItem('courses', JSON.stringify(normalizedData));
        } catch (err) {
          console.warn('⚠️ Failed to update localStorage:', err.message);
        }
      } else if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const retryResponse = await axios.get(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            validateStatus: (status) => status < 500,
            timeout: 10000,
          });
          const retryData = Array.isArray(retryResponse.data)
            ? retryResponse.data
            : Array.isArray(retryResponse.data?.data)
              ? retryResponse.data.data
              : [];
          const normalizedRetryData =
            user.role === Roles.ETUDIANT
              ? retryData.map((enrollment) => ({
                  ...enrollment.cours,
                  enrollmentId: enrollment._id,
                  statut: enrollment.statut,
                }))
              : retryData;
          setCourses(normalizedRetryData);
          try {
            localStorage.setItem('courses', JSON.stringify(normalizedRetryData));
          } catch (err) {
            console.warn('⚠️ Failed to update localStorage:', err.message);
          }
        } else {
          throw new Error('Session expirée');
        }
      } else if (response.status === 403) {
        setCourses([]);
        try {
          localStorage.setItem('courses', JSON.stringify([]));
        } catch (err) {
          console.warn('⚠️ Failed to update localStorage:', err.message);
        }
        throw new Error('Accès non autorisé : vous n’avez pas les permissions nécessaires');
      } else if (response.status === 404) {
        setCourses([]);
        setError('Aucun cours trouvé');
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Fetch courses error:', err);
      const errorMessage = handleApiError(err, navigate, 'courses');
      setError(errorMessage);
      setCourses([]);
      try {
        localStorage.setItem('courses', JSON.stringify([]));
      } catch (err) {
        console.warn('⚠️ Failed to update localStorage:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, API_BASE_URL, validateToken, refreshToken]);

  /**
   * Handle API errors consistently
   */
  const handleApiError = (err, navigate, context = 'generic') => {
    if (err.response) {
      switch (err.response.status) {
        case 401:
          console.warn('⚠️ Unauthorized access, logging out');
          logout();
          navigate('/login', { replace: true });
          return 'Session expirée, veuillez vous reconnecter';
        case 403:
          return 'Accès non autorisé : vous n’avez pas les permissions nécessaires';
        case 404:
          return context === 'domaines' ? 'Aucun domaine trouvé' : 'Aucun cours trouvé';
        default:
          return err.response.data?.message || `Erreur lors de la récupération des ${context}`;
      }
    }
    return 'Impossible de se connecter au serveur';
  };

  /**
   * Initialize courses and domaines
   */
  useEffect(() => {
    if (dataInitialized) {
      console.log('⏳ Courses data already initialized, skipping...');
      return;
    }

    if (isAuthLoading) {
      console.log('⏳ Authentication still loading, waiting...');
      return;
    }

    if (!user || !user.token) {
      console.log('🚫 No user or token, resetting courses and domaines');
      setCourses([]);
      setDomaines([]);
      try {
        localStorage.setItem('courses', JSON.stringify([]));
      } catch (err) {
        console.warn('⚠️ Failed to update localStorage:', err.message);
      }
      setError('Veuillez vous connecter pour voir les cours et domaines');
      navigate('/login', { replace: true });
      setDataInitialized(true);
      return;
    }

    try {
      const storedCourses = localStorage.getItem('courses');
      if (storedCourses) {
        const parsedCourses = JSON.parse(storedCourses);
        if (Array.isArray(parsedCourses)) {
          setCourses(parsedCourses);
        } else {
          console.warn('⚠️ Stored courses is not an array, clearing localStorage');
          localStorage.removeItem('courses');
        }
      }
    } catch (err) {
      console.error('❌ Failed to parse stored courses:', err);
      localStorage.removeItem('courses');
    }

    if (user && user.token) {
      console.log('📚 Fetching data for user:', user.email);
      if (user.role !== Roles.ETUDIANT) {
        fetchCourses();
        fetchDomaines();
      } else {
        fetchCourses();
      }
      setDataInitialized(true);
    }
  }, [user, isAuthLoading, fetchCourses, fetchDomaines, navigate, dataInitialized]);

  /**
   * Add a new course
   */
  const addCourse = useCallback(
    async (course) => {
      if (!user || !user.token) {
        const errorMessage = 'Veuillez vous connecter pour ajouter un cours';
        setError(errorMessage);
        navigate('/login', { replace: true });
        return;
      }

      if (!(await validateToken()) || ![Roles.ENSEIGNANT, Roles.ADMIN].includes(user?.role)) {
        const errorMessage =
          "Vous devez être connecté et avoir le rôle d'instructeur ou d'administrateur";
        setError(errorMessage);
        navigate(user?.role ? '/unauthorized' : '/login', { replace: true });
        return;
      }

      setIsLoading(true);
      setError(null);
      const newCourse = {
        ...course,
        _id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createur: user.id,
      };

      try {
        setCourses((prev) => {
          const updatedCourses = [...prev, newCourse];
          try {
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
          } catch (err) {
            console.warn('⚠️ Failed to update localStorage:', err.message);
          }
          return updatedCourses;
        });

        console.log('📤 Adding course:', newCourse);
        const response = await axios.post(`${API_BASE_URL}/api/courses`, newCourse, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          timeout: 15000,
        });

        console.log('✅ Course added:', response.data);
        const savedCourse = response.data.data || response.data;
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c._id === newCourse._id ? savedCourse : c));
          try {
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
          } catch (err) {
            console.warn('⚠️ Failed to update localStorage:', err.message);
          }
          return updatedCourses;
        });
      } catch (err) {
        console.error('❌ Add course error:', err);
        if (err.response?.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await axios.post(`${API_BASE_URL}/api/courses`, newCourse, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              timeout: 15000,
            });
            const savedCourse = retryResponse.data.data || retryResponse.data;
            setCourses((prev) => {
              const updatedCourses = prev.map((c) => (c._id === newCourse._id ? savedCourse : c));
              try {
                localStorage.setItem('courses', JSON.stringify(updatedCourses));
              } catch (err) {
                console.warn('⚠️ Failed to update localStorage:', err.message);
              }
              return updatedCourses;
            });
          } else {
            const errorMessage = handleApiError(err, navigate, 'cours');
            setError(errorMessage);
            setCourses((prev) => {
              const updatedCourses = prev.filter((c) => c._id !== newCourse._id);
              try {
                localStorage.setItem('courses', JSON.stringify(updatedCourses));
              } catch (err) {
                console.warn('⚠️ Failed to update localStorage:', err.message);
              }
              return updatedCourses;
            });
          }
        } else {
          const errorMessage = handleApiError(err, navigate, 'cours');
          setError(errorMessage);
          setCourses((prev) => {
            const updatedCourses = prev.filter((c) => c._id !== newCourse._id);
            try {
              localStorage.setItem('courses', JSON.stringify(updatedCourses));
            } catch (err) {
              console.warn('⚠️ Failed to update localStorage:', err.message);
            }
            return updatedCourses;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, navigate, API_BASE_URL, validateToken, refreshToken]
  );

  /**
   * Update an existing course
   */
  const updateCourse = useCallback(
    async (id, updates) => {
      if (!user || !user.token) {
        const errorMessage = 'Veuillez vous connecter pour modifier un cours';
        setError(errorMessage);
        navigate('/login', { replace: true });
        return;
      }

      if (!(await validateToken()) || ![Roles.ENSEIGNANT, Roles.ADMIN].includes(user?.role)) {
        const errorMessage =
          "Vous devez être connecté et avoir le rôle d'instructeur ou d'administrateur";
        setError(errorMessage);
        navigate(user?.role ? '/unauthorized' : '/login', { replace: true });
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c._id === id ? { ...c, ...updates } : c));
          try {
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
          } catch (err) {
            console.warn('⚠️ Failed to update localStorage:', err.message);
          }
          return updatedCourses;
        });

        console.log('📤 Updating course:', id, updates);
        const response = await axios.put(`${API_BASE_URL}/api/courses/${id}`, updates, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          timeout: 15000,
        });

        console.log('✅ Course updated:', response.data);
        const updatedCourse = response.data.data || response.data;
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c._id === id ? updatedCourse : c));
          try {
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
          } catch (err) {
            console.warn('⚠️ Failed to update localStorage:', err.message);
          }
          return updatedCourses;
        });
      } catch (err) {
        console.error('❌ Update course error:', err);
        if (err.response?.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await axios.put(`${API_BASE_URL}/api/courses/${id}`, updates, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              timeout: 15000,
            });
            const updatedCourse = retryResponse.data.data || retryResponse.data;
            setCourses((prev) => {
              const updatedCourses = prev.map((c) => (c._id === id ? updatedCourse : c));
              try {
                localStorage.setItem('courses', JSON.stringify(updatedCourses));
              } catch (err) {
                console.warn('⚠️ Failed to update localStorage:', err.message);
              }
              return updatedCourses;
            });
          } else {
            const errorMessage = handleApiError(err, navigate, 'cours');
            setError(errorMessage);
            setCourses((prev) => {
              const updatedCourses = prev.map((c) => (c._id === id ? { ...c, ...updates } : c));
              try {
                localStorage.setItem('courses', JSON.stringify(updatedCourses));
              } catch (err) {
                console.warn('⚠️ Failed to update localStorage:', err.message);
              }
              return updatedCourses;
            });
          }
        } else {
          const errorMessage = handleApiError(err, navigate, 'cours');
          setError(errorMessage);
          setCourses((prev) => {
            const updatedCourses = prev.map((c) => (c._id === id ? { ...c, ...updates } : c));
            try {
              localStorage.setItem('courses', JSON.stringify(updatedCourses));
            } catch (err) {
              console.warn('⚠️ Failed to update localStorage:', err.message);
            }
            return updatedCourses;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, navigate, API_BASE_URL, validateToken, refreshToken]
  );

  /**
   * Delete a course
   */
  const deleteCourse = useCallback(
    async (id) => {
      if (!user || !user.token) {
        const errorMessage = 'Veuillez vous connecter pour supprimer un cours';
        setError(errorMessage);
        navigate('/login', { replace: true });
        return;
      }

      if (!(await validateToken()) || ![Roles.ENSEIGNANT, Roles.ADMIN].includes(user?.role)) {
        const errorMessage =
          "Vous devez être connecté et avoir le rôle d'instructeur ou d'administrateur";
        setError(errorMessage);
        navigate(user?.role ? '/unauthorized' : '/login', { replace: true });
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        setCourses((prev) => {
          const updatedCourses = prev.filter((c) => c._id !== id);
          try {
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
          } catch (err) {
            console.warn('⚠️ Failed to update localStorage:', err.message);
          }
          return updatedCourses;
        });

        console.log('📤 Deleting course:', id);
        const response = await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          timeout: 15000,
        });

        console.log('✅ Course deleted:', response.data);
        if (response.status !== 204 && response.status !== 200) {
          throw new Error('Erreur lors de la suppression du cours');
        }
      } catch (err) {
        console.error('❌ Delete course error:', err);
        if (err.response?.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryResponse = await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              timeout: 15000,
            });
            if (retryResponse.status !== 204 && retryResponse.status !== 200) {
              throw new Error('Erreur lors de la suppression du cours');
            }
          } else {
            const errorMessage = handleApiError(err, navigate, 'cours');
            setError(errorMessage);
            fetchCourses();
          }
        } else {
          const errorMessage = handleApiError(err, navigate, 'cours');
          setError(errorMessage);
          fetchCourses();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, fetchCourses, navigate, API_BASE_URL, validateToken, refreshToken]
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
        autoHideDuration={10000}
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

export default CourseProvider;