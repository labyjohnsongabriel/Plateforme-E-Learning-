// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Snackbar, Alert, Backdrop, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { jwtDecode } from 'jwt-decode';

// Palette de couleurs professionnelle
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  darkNavy: '#00072d',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  border: 'rgba(241, 53, 68, 0.2)',
  white: '#ffffff',
};

// Role constants
const RoleUtilisateur = {
  ETUDIANT: 'ETUDIANT',
  ENSEIGNANT: 'ENSEIGNANT',
  ADMIN: 'ADMIN',
};

export const NotificationContext = createContext({
  notifications: [],
  fetchNotifications: async () => {},
  addNotification: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotifications: async () => {},
  unreadCount: 0,
  isLoading: false,
  error: null,
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const isTokenExpired = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return true;
    }
    const decoded = jwtDecode(token);
    if (!decoded.exp) {
      return true;
    }
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Utility to implement exponential backoff for retries
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryRequest = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || err.response?.status === 401 || err.response?.status === 403) {
        throw err;
      }
      const delay = baseDelay * 2 ** (attempt - 1);
      await sleep(delay);
    }
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const navigate = useNavigate();

  // Récupérer les notifications depuis le localStorage au chargement initial
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      } catch (err) {
        console.warn('Erreur lors du parsing des notifications sauvegardées');
        localStorage.removeItem('notifications');
      }
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    // Vérifier si l'utilisateur a accès aux notifications backend
    const userRole = typeof user?.role === 'string' ? user.role.toUpperCase() : 'UNKNOWN';
    const hasBackendAccess = [RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT].includes(userRole);

    if (!hasBackendAccess) {
      // Pour les étudiants, utiliser uniquement les notifications locales
      console.log('Utilisateur sans accès backend aux notifications - mode local uniquement');
      setIsLoading(false);
      return;
    }

    if (!user?.token || isTokenExpired(user.token)) {
      setError("Token d'authentification manquant, invalide ou expiré");
      logout();
      navigate('/login');
      setNotifications([]);
      localStorage.setItem('notifications', JSON.stringify([]));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await retryRequest(() =>
        axios.get(`${API_BASE_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => status < 500,
        })
      );

      if (response.status === 200 && response.headers['content-type']?.includes('application/json')) {
        const fetchedNotifications = Array.isArray(response.data) ? response.data : [];
        setNotifications(fetchedNotifications);
        localStorage.setItem('notifications', JSON.stringify(fetchedNotifications));
      } else if (response.status === 403) {
        console.log('Accès aux notifications backend refusé - utilisation du mode local');
        // Ne pas afficher d'erreur pour les 403, simplement utiliser les notifications locales
      } else {
        throw new Error('Réponse serveur non-JSON ou statut invalide');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        // Accès refusé - mode local uniquement
        console.log('Accès aux notifications backend refusé - mode local activé');
      } else if (err.response?.status === 401) {
        setError('Session expirée, veuillez vous reconnecter');
        logout();
        navigate('/login');
      } else if (err.response?.status !== 403) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des notifications');
      }
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, user, logout, navigate]);

  useEffect(() => {
    if (user?.token && !isTokenExpired(user.token)) {
      fetchNotifications();
      
      // Mettre à jour les notifications uniquement pour les administrateurs
      if (typeof user?.role === 'string' && user.role.toUpperCase() === RoleUtilisateur.ADMIN) {
        const interval = setInterval(() => {
          if (document.visibilityState === 'visible') {
            fetchNotifications();
          }
        }, 60000);
        return () => clearInterval(interval);
      }
    } else {
      setNotifications([]);
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  }, [user, fetchNotifications]);

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.lu).length : 0;

  const addNotification = useCallback(
    async (message, severity = 'info', role = user?.role || RoleUtilisateur.ETUDIANT) => {
      setIsLoading(true);
      setError(null);

      const newNotification = {
        message,
        severity,
        role: typeof role === 'string' ? role.toUpperCase() : RoleUtilisateur.ETUDIANT,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lu: false,
      };

      try {
        setNotifications((prev) => {
          const updatedNotifications = [newNotification, ...prev].slice(0, 20); // Limiter à 20 notifications
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });

        // Pour les rôles avec accès backend, tenter de sauvegarder sur le serveur
        const userRole = typeof user?.role === 'string' ? user.role.toUpperCase() : 'UNKNOWN';
        const hasBackendAccess = [RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT].includes(userRole);
        
        if (hasBackendAccess && user?.token && !isTokenExpired(user.token)) {
          try {
            await axios.post(
              `${API_BASE_URL}/api/notifications`,
              {
                message,
                severity,
                type: 'SYSTEM',
              },
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          } catch (backendErr) {
            // Ignorer les erreurs backend pour les notifications
            if (backendErr.response?.status !== 403) {
              console.warn('Erreur sauvegarde notification backend:', backendErr.message);
            }
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expirée, veuillez vous reconnecter');
          logout();
          navigate('/login');
        } else if (err.response?.status !== 403) {
          setError(err.response?.data?.message || "Erreur lors de l'ajout de la notification");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, logout, navigate, API_BASE_URL]
  );

  const markAsRead = useCallback(
    async (id) => {
      if (!user?.token || isTokenExpired(user.token)) {
        setError('Session invalide');
        logout();
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        setNotifications((prev) => {
          const updatedNotifications = prev.map((n) =>
            n._id === id || n.id === id ? { ...n, lu: true } : n
          );
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });

        // Tenter de marquer comme lu sur le backend pour les rôles avec accès
        const userRole = typeof user?.role === 'string' ? user.role.toUpperCase() : 'UNKNOWN';
        const hasBackendAccess = [RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT].includes(userRole);
        
        if (hasBackendAccess) {
          try {
            await axios.patch(
              `${API_BASE_URL}/api/notifications/${id}/read`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          } catch (backendErr) {
            // Ignorer les erreurs 403 du backend
            if (backendErr.response?.status !== 403) {
              console.warn('Erreur marquage lu backend:', backendErr.message);
            }
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expirée, veuillez vous reconnecter');
          logout();
          navigate('/login');
        } else if (err.response?.status !== 403) {
          setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la notification');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, logout, navigate, API_BASE_URL]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.token || isTokenExpired(user.token)) {
      setError('Session invalide');
      logout();
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) => ({ ...n, lu: true }));
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });

      // Tenter de marquer tout comme lu sur le backend pour les rôles avec accès
      const userRole = typeof user?.role === 'string' ? user.role.toUpperCase() : 'UNKNOWN';
      const hasBackendAccess = [RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT].includes(userRole);
      
      if (hasBackendAccess) {
        try {
          await axios.patch(
            `${API_BASE_URL}/api/notifications/read-all`,
            {},
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json',
              },
            }
          );
        } catch (backendErr) {
          // Ignorer les erreurs 403 du backend
          if (backendErr.response?.status !== 403) {
            console.warn('Erreur marquage tout lu backend:', backendErr.message);
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expirée, veuillez vous reconnecter');
        logout();
        navigate('/login');
      } else if (err.response?.status !== 403) {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour des notifications');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate, API_BASE_URL]);

  const clearNotifications = useCallback(async () => {
    if (!user?.token || isTokenExpired(user.token)) {
      setError('Session invalide');
      logout();
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      setNotifications([]);
      localStorage.removeItem('notifications');

      // Tenter de supprimer sur le backend pour les rôles avec accès
      const userRole = typeof user?.role === 'string' ? user.role.toUpperCase() : 'UNKNOWN';
      const hasBackendAccess = [RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT].includes(userRole);
      
      if (hasBackendAccess) {
        try {
          await axios.delete(`${API_BASE_URL}/api/notifications`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (backendErr) {
          // Ignorer les erreurs 403 du backend
          if (backendErr.response?.status !== 403) {
            console.warn('Erreur suppression notifications backend:', backendErr.message);
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expirée, veuillez vous reconnecter');
        logout();
        navigate('/login');
      } else if (err.response?.status !== 403) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression des notifications');
      }

      // Restaurer les notifications en cas d'erreur
      const localNotifications = localStorage.getItem('notifications');
      if (localNotifications) {
        setNotifications(JSON.parse(localNotifications));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate, API_BASE_URL]);

  const contextValue = {
    notifications,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
    isLoading,
    error,
  };

  const maxNotifications = 5;
  const visibleNotifications = Array.isArray(notifications)
    ? notifications
        .filter((notification) => !notification.lu)
        .slice(0, maxNotifications)
    : [];

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notifications toast */}
      {visibleNotifications.map((notification) => (
        <Snackbar
          key={notification.id || notification._id}
          open={true}
          autoHideDuration={6000}
          onClose={() => markAsRead(notification.id || notification._id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              marginTop: '80px',
            },
          }}
        >
          <Alert
            onClose={() => markAsRead(notification.id || notification._id)}
            severity={notification.severity || 'info'}
            sx={{
              width: '100%',
              maxWidth: '400px',
              background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
              backdropFilter: 'blur(20px)',
              color: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              fontWeight: 500,
              '& .MuiAlert-icon': {
                color: colors.white,
              },
              '& .MuiAlert-message': {
                padding: '8px 0',
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
      
      {/* Backdrop de chargement */}
      <Backdrop
        open={isLoading}
        sx={{
          zIndex: 9999,
          color: colors.white,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
        }}
      >
        <CircularProgress
          color='inherit'
          size={50}
          thickness={5}
          sx={{
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography 
          variant='h6' 
          sx={{ 
            mt: 2, 
            fontFamily: '"Inter", "SF Pro Display", sans-serif',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #ffffff, #ff6b74)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Chargement...
        </Typography>
      </Backdrop>
      
      {/* Snackbar d'erreur */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity='error'
          sx={{ 
            width: '100%', 
            maxWidth: '600px',
            background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
            backdropFilter: 'blur(20px)',
            color: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              color: colors.red,
            },
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};