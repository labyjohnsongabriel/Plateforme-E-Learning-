// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Snackbar, Alert, Backdrop, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { jwtDecode } from 'jwt-decode';

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
      console.error('Invalid token format', { token });
      return true;
    }
    const decoded = jwtDecode(token);
    if (!decoded.exp) {
      console.error('Token missing expiration claim', { decoded });
      return true;
    }
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Token decoding error:', { error: error.message });
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
        throw err; // No retry on 401, 403, or last attempt
      }
      const delay = baseDelay * 2 ** (attempt - 1);
      console.warn(`Retrying request (attempt ${attempt}/${maxRetries}) after ${delay}ms`);
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

  const fetchNotifications = useCallback(async () => {
    if (!user?.token || isTokenExpired(user.token)) {
      console.error('Invalid or missing token', { user });
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
      console.log('Fetching notifications', {
        url: `${API_BASE_URL}/api/notifications`,
        token: user.token.substring(0, 10) + '...',
        role: user?.role?.toUpperCase() || 'UNKNOWN',
      });

      const response = await retryRequest(() =>
        axios.get(`${API_BASE_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => status < 500,
        })
      );

      console.log('Notifications response:', {
        data: response.data,
        status: response.status,
        headers: response.headers,
      });

      if (
        response.status === 200 &&
        response.headers['content-type']?.includes('application/json')
      ) {
        const fetchedNotifications = Array.isArray(response.data) ? response.data : [];
        setNotifications(fetchedNotifications);
        localStorage.setItem('notifications', JSON.stringify(fetchedNotifications));
      } else if (response.status === 403) {
        // User doesn't have permission to access notifications - this is normal for some roles
        console.log('User does not have notification access permissions');
        setNotifications([]);
        localStorage.setItem('notifications', JSON.stringify([]));
      } else {
        throw new Error('Réponse serveur non-JSON ou statut invalide');
      }
    } catch (err) {
      console.error('Fetch notifications error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      let errorMessage;
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Session expirée, veuillez vous reconnecter';
            logout();
            navigate('/login');
            break;
          case 403:
            // This is not an error - user just doesn't have notification permissions
            console.log(
              'Notification access forbidden - user role may not have notification permissions'
            );
            setNotifications([]);
            localStorage.setItem('notifications', JSON.stringify([]));
            setIsLoading(false);
            return; // Exit early, no error state
          case 404:
            errorMessage = 'Service de notifications non disponible';
            break;
          default:
            errorMessage =
              err.response.data?.message || 'Erreur lors du chargement des notifications';
        }
      } else {
        errorMessage = 'Impossible de se connecter au serveur';
      }

      // Only set error for non-403 cases
      if (err.response?.status !== 403) {
        setError(errorMessage);
        setNotifications([]);
        localStorage.setItem('notifications', JSON.stringify([]));
      }
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, user, logout, navigate]);

  useEffect(() => {
    if (user?.token && !isTokenExpired(user.token)) {
      fetchNotifications();
      // Polling only for ADMIN role, with a longer interval to reduce load
      if (user?.role?.toUpperCase() === RoleUtilisateur.ADMIN) {
        const interval = setInterval(() => {
          if (document.visibilityState === 'visible') {
            fetchNotifications();
          }
        }, 60000); // Increased to 60 seconds
        return () => clearInterval(interval);
      }
    } else {
      setNotifications([]);
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  }, [user, fetchNotifications]);

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.lu).length : 0;

  // Version simplifiée de addNotification pour le frontend uniquement
  const addNotification = useCallback(
    async (message, severity = 'info', role = user?.role) => {
      setIsLoading(true);
      setError(null);

      const newNotification = {
        message,
        severity,
        role: role?.toUpperCase() || RoleUtilisateur.ETUDIANT,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lu: false,
      };

      try {
        console.log('Adding local notification', { newNotification });

        // Ajouter la notification localement seulement
        setNotifications((prev) => {
          const updatedNotifications = [newNotification, ...prev].slice(0, 10); // Garder seulement les 10 dernières
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });

        // NE PAS envoyer au backend pour éviter l'erreur 403
        console.log('Notification added locally - skipping backend save to avoid 403 error');
      } catch (err) {
        console.error('Add notification error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'Session expirée, veuillez vous reconnecter';
              logout();
              navigate('/login');
              break;
            case 403:
              // C'est normal - l'utilisateur n'a pas les permissions backend pour les notifications
              console.log('Backend notification access forbidden - using local notifications only');
              break;
            default:
              errorMessage =
                err.response.data?.message || "Erreur lors de l'ajout de la notification";
          }
        } else {
          errorMessage = 'Impossible de se connecter au serveur';
        }

        // Ne pas afficher d'erreur pour les 403 - c'est attendu
        if (err.response?.status !== 403) {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, logout, navigate]
  );

  const markAsRead = useCallback(
    async (id) => {
      if (!user?.token || isTokenExpired(user.token)) {
        console.error('Invalid or missing token', { user });
        setError('Session invalide');
        logout();
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log('Marking notification as read locally', { id });

        // Marquer comme lu localement seulement
        setNotifications((prev) => {
          const updatedNotifications = prev.map((n) =>
            n._id === id || n.id === id ? { ...n, lu: true } : n
          );
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });

        // NE PAS envoyer au backend pour éviter l'erreur 403
        console.log('Notification marked as read locally - skipping backend update');
      } catch (err) {
        console.error('Mark as read error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'Session expirée, veuillez vous reconnecter';
              logout();
              navigate('/login');
              break;
            case 403:
              // C'est normal - utiliser seulement le stockage local
              console.log('Backend notification update forbidden - using local state only');
              break;
            default:
              errorMessage =
                err.response.data?.message || 'Erreur lors de la mise à jour de la notification';
          }
        } else {
          errorMessage = 'Impossible de se connecter au serveur';
        }

        // Ne pas afficher d'erreur pour les 403
        if (err.response?.status !== 403) {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, logout, navigate]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.token || isTokenExpired(user.token)) {
      console.error('Invalid or missing token', { user });
      setError('Session invalide');
      logout();
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Marking all notifications as read locally');

      // Marquer toutes comme lu localement seulement
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) => ({ ...n, lu: true }));
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });

      // NE PAS envoyer au backend pour éviter l'erreur 403
      console.log('All notifications marked as read locally - skipping backend update');
    } catch (err) {
      console.error('Mark all as read error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      let errorMessage;
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Session expirée, veuillez vous reconnecter';
            logout();
            navigate('/login');
            break;
          case 403:
            // C'est normal - utiliser seulement le stockage local
            console.log('Backend notification update forbidden - using local state only');
            break;
          default:
            errorMessage =
              err.response.data?.message || 'Erreur lors de la mise à jour des notifications';
        }
      } else {
        errorMessage = 'Impossible de se connecter au serveur';
      }

      // Ne pas afficher d'erreur pour les 403
      if (err.response?.status !== 403) {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate]);

  const clearNotifications = useCallback(async () => {
    if (!user?.token || isTokenExpired(user.token)) {
      console.error('Invalid or missing token', { user });
      setError('Session invalide');
      logout();
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Clearing notifications locally');

      // Effacer localement seulement
      setNotifications([]);
      localStorage.removeItem('notifications');

      // NE PAS envoyer au backend pour éviter l'erreur 403
      console.log('Notifications cleared locally - skipping backend deletion');
    } catch (err) {
      console.error('Clear notifications error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      let errorMessage;
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Session expirée, veuillez vous reconnecter';
            logout();
            navigate('/login');
            break;
          case 403:
            // C'est normal - utiliser seulement le stockage local
            console.log('Backend notification deletion forbidden - using local state only');
            break;
          default:
            errorMessage =
              err.response.data?.message || 'Erreur lors de la suppression des notifications';
        }
      } else {
        errorMessage = 'Impossible de se connecter au serveur';
      }

      // Ne pas afficher d'erreur pour les 403
      if (err.response?.status !== 403) {
        setError(errorMessage);
      }

      // Recharger les notifications locales en cas d'erreur
      const localNotifications = localStorage.getItem('notifications');
      if (localNotifications) {
        setNotifications(JSON.parse(localNotifications));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate]);

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

  // Filtrer les notifications pour l'affichage
  const maxNotifications = 5; // Limite pour tous les utilisateurs
  const visibleNotifications = Array.isArray(notifications)
    ? notifications
        .filter((notification) => !notification.lu) // Seulement les non lues
        .slice(0, maxNotifications)
    : [];

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Affichage des notifications locales seulement */}
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
              background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
              backdropFilter: 'blur(20px)',
              color: '#ffffff',
              border: `1px solid ${colors.red}33`,
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}

      {/* Loading Backdrop */}
      <Backdrop
        open={isLoading}
        sx={{
          zIndex: 9999,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #010b40 0%, #1a237e 100%)',
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
        <Typography variant='h6' sx={{ mt: 2, fontFamily: 'Ubuntu, sans-serif', fontWeight: 500 }}>
          Chargement...
        </Typography>
      </Backdrop>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity='error'
          sx={{ width: '100%', maxWidth: '600px' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// Ajouter les couleurs manquantes
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  white: '#ffffff',
};
