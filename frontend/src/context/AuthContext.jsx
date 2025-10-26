// AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Backdrop, CircularProgress, Typography, Snackbar, Alert, keyframes } from '@mui/material';
import axios from 'axios';
import { useNotifications } from './NotificationContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Animation pour le logo
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

export const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  refreshToken: async () => {},
  isAuthenticated: false,
  isLoading: false,
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isTokenExpired = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token format:', token);
      return true;
    }
    const decoded = jwtDecode(token);
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false); // Nouveau state pour éviter les boucles
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      console.warn('⚠️ No refresh token found');
      logout();
      return false;
    }

    try {
      console.log(
        '🔄 Refreshing token with refreshToken:',
        storedRefreshToken.slice(0, 10) + '...'
      );
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
        refreshToken: storedRefreshToken,
      });
      console.log('Refresh token response:', response.data);
      const { token: newAccessToken, user: newUserData } = response.data;
      if (!newAccessToken || !newUserData?._id) {
        throw new Error('Réponse serveur incomplète');
      }
      const formattedUser = {
        id: newUserData._id,
        prenom: newUserData.prenom || 'Utilisateur',
        nom: newUserData.nom || '',
        email: newUserData.email,
        role: newUserData.role || 'ETUDIANT',
        level: newUserData.level || null,
        avatar: newUserData.avatar || '/images/default-avatar.png',
        token: newAccessToken,
      };
      setUser(formattedUser);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      localStorage.setItem('token', newAccessToken);
      console.log('✅ Token refreshed successfully for user:', formattedUser.email);
      return true;
    } catch (err) {
      console.error('❌ Refresh token error:', err);
      let errorMessage;
      if (err.response?.status === 401) {
        errorMessage = 'Token de rafraîchissement invalide. Veuillez vous reconnecter.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
      } else {
        errorMessage = err.response?.data?.message || 'Erreur lors du rafraîchissement du token.';
      }
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      logout();
      return false;
    }
  }, [addNotification, API_BASE_URL]);

  const logout = useCallback(() => {
    console.log('🔒 Logging out user');
    setUser(null);
    setInitialized(true); // Marquer comme initialisé pour éviter les boucles
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('notifications');
    addNotification('Déconnexion réussie.', 'success');
    navigate('/login');
  }, [navigate, addNotification]);

  const initializeAuth = useCallback(async () => {
    // Éviter les initialisations multiples
    if (initialized) {
      console.log('⏳ Auth already initialized, skipping...');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      console.log('🚫 No user in localStorage, setting loading to false');
      setIsLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      if (!userData?.id || !userData?.email || !userData?.token) {
        throw new Error('Données utilisateur corrompues');
      }
      console.log('⏳ Initializing auth with user:', userData.email);
      
      if (isTokenExpired(userData.token)) {
        console.log('🔄 Token expired, attempting refresh');
        const refreshed = await refreshToken();
        if (!refreshed) {
          console.log('❌ Refresh failed, logging out');
          logout();
          setIsLoading(false);
          setInitialized(true);
          return;
        }
        // Si refresh réussi, user est déjà mis à jour via refreshToken
        setIsLoading(false);
        setInitialized(true);
        return;
      }
      
      console.log('⏳ Verifying user with token:', userData.token.slice(0, 10) + '...');
      const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${userData.token}` },
        validateStatus: (status) => status < 500,
        timeout: 10000, // Timeout pour éviter les attentes infinies
      });
      
      console.log('Profile response:', response.data);
      if (response.status === 200) {
        const formattedUser = {
          id: response.data._id || userData.id,
          prenom: response.data.prenom || userData.prenom || 'Utilisateur',
          nom: response.data.nom || userData.nom || '',
          email: response.data.email || userData.email,
          role: response.data.role || userData.role,
          level: response.data.level || userData.level || null,
          avatar: response.data.avatar || userData.avatar || '/images/default-avatar.png',
          token: userData.token,
        };
        setUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
        console.log('✅ Auth initialized with user:', formattedUser.email);
      } else if (response.status === 401) {
        console.log('🔄 401 received, attempting refresh');
        const refreshed = await refreshToken();
        if (!refreshed) {
          throw new Error('Session non autorisée');
        }
      } else {
        throw new Error(response.data?.message || 'Session invalide');
      }
    } catch (err) {
      console.error('❌ Failed to verify user:', err.message);
      localStorage.removeItem('user');
      localStorage.removeItem('notifications');
      setUser(null);
      let errorMessage;
      if (err.message === 'Token expiré' || err.response?.status === 401) {
        errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Profil non trouvé. Veuillez vérifier votre compte.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Erreur serveur lors de la vérification de la session.';
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
        // En cas d'erreur réseau, on garde l'utilisateur connecté localement
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('📱 Using cached user data due to network error');
        }
      } else {
        errorMessage =
          err.response?.data?.message || 'Session invalide. Veuillez vous reconnecter.';
      }
      addNotification(errorMessage, 'error');
      // Éviter logout automatique si réseau down
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED') {
        logout();
      }
    } finally {
      setIsLoading(false);
      setInitialized(true); // Marquer comme initialisé
    }
  }, [addNotification, API_BASE_URL, refreshToken, logout, initialized]);

  const login = useCallback(
    async (email, password, rememberMe) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!email || !password) {
          throw new Error("L'email et le mot de passe sont requis.");
        }
        console.log('📤 Logging in with email:', email);
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/login`,
          { email: email.trim(), password },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000 
          }
        );
        console.log('Login response:', response.data);
        if (response.headers['content-type'].includes('application/json')) {
          const { token, refreshToken, user: userData } = response.data;
          if (!token || !userData?._id) {
            throw new Error('Réponse serveur incomplète');
          }
          const formattedUser = {
            id: userData._id,
            prenom: userData.prenom || 'Utilisateur',
            nom: userData.nom || '',
            email: userData.email,
            role: userData.role || 'ETUDIANT',
            level: userData.level || null,
            avatar: userData.avatar || '/images/default-avatar.png',
            token,
          };
          setUser(formattedUser);
          setInitialized(true); // Marquer comme initialisé
          localStorage.setItem('user', JSON.stringify(formattedUser));
          localStorage.setItem('token', token);
          if (rememberMe && refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          addNotification('Connexion réussie !', 'success');
          const role = formattedUser.role;
          navigate(
            role === 'ADMIN'
              ? '/admin/dashboard'
              : role === 'ETUDIANT'
                ? '/student/dashboard'
                : role === 'ENSEIGNANT'
                  ? '/instructor/dashboard'
                  : '/'
          );
          return formattedUser;
        } else {
          throw new Error('Réponse serveur non-JSON');
        }
      } catch (err) {
        console.error('❌ Login error:', err);
        let errorMessage;
        if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
          errorMessage =
            'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
        } else if (err.response) {
          switch (err.response.status) {
            case 400:
              errorMessage = err.response.data.message || 'Veuillez vérifier vos informations.';
              break;
            case 401:
              errorMessage = err.response.data.message || 'Email ou mot de passe incorrect.';
              break;
            case 404:
              errorMessage = 'Service de connexion indisponible.';
              break;
            case 500:
              errorMessage = "Une erreur serveur s'est produite. Veuillez réessayer plus tard.";
              break;
            default:
              errorMessage =
                err.response.data.message || "Une erreur s'est produite lors de la connexion.";
          }
        } else {
          errorMessage = err.message || "Une erreur inattendue s'est produite.";
        }
        setError(errorMessage);
        addNotification(errorMessage, 'error');
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, API_BASE_URL, navigate]
  );

  const register = useCallback(
    async (nom, prenom, email, password, level = 1, avatar, rememberMe) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!nom || nom.trim().length < 2) {
          throw new Error('Le nom doit contenir au moins 2 caractères.');
        }
        if (!prenom || prenom.trim().length < 2) {
          throw new Error('Le prénom doit contenir au moins 2 caractères.');
        }
        if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
          throw new Error('Veuillez entrer une adresse email valide.');
        }
        if (!password || password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
        }

        const formData = new FormData();
        formData.append('nom', nom.trim());
        formData.append('prenom', prenom.trim());
        formData.append('email', email.trim());
        formData.append('password', password);
        formData.append('level', level);
        formData.append('role', 'ETUDIANT');
        if (avatar) {
          formData.append('avatar', avatar);
        }

        console.log('📤 Registering user with email:', email);
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        });
        console.log('Register response:', response.data);
        if (response.headers['content-type'].includes('application/json')) {
          const { token, refreshToken, user: userData } = response.data;
          if (!token || !userData?._id) {
            throw new Error('Réponse serveur incomplète');
          }
          const formattedUser = {
            id: userData._id,
            prenom: userData.prenom || prenom || 'Utilisateur',
            nom: userData.nom || nom || '',
            email: userData.email || email,
            role: userData.role || 'ETUDIANT',
            level: userData.level || level || 1,
            avatar: userData.avatar || '/images/default-avatar.png',
            token,
          };
          setUser(formattedUser);
          setInitialized(true); // Marquer comme initialisé
          localStorage.setItem('user', JSON.stringify(formattedUser));
          localStorage.setItem('token', token);
          if (rememberMe && refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          addNotification('Inscription réussie ! Bienvenue sur Youth Computing.', 'success');
          const role = formattedUser.role;
          navigate(
            role === 'ADMIN'
              ? '/admin/dashboard'
              : role === 'ETUDIANT'
                ? '/student/dashboard'
                : role === 'ENSEIGNANT'
                  ? '/instructor/dashboard'
                  : '/'
          );
          return true;
        } else {
          throw new Error('Réponse serveur non-JSON');
        }
      } catch (err) {
        console.error('❌ Register error:', err);
        let errorMessage;
        if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
          errorMessage =
            'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
        } else if (err.response) {
          switch (err.response.status) {
            case 400:
              errorMessage =
                err.response.data.message || 'Veuillez vérifier les informations saisies.';
              break;
            case 409:
              errorMessage = 'Cet email est déjà utilisé.';
              break;
            case 500:
              errorMessage = "Une erreur serveur s'est produite. Veuillez réessayer plus tard.";
              break;
            default:
              errorMessage =
                err.response.data.message || "Une erreur s'est produite lors de l'inscription.";
          }
        } else {
          errorMessage = err.message || "Une erreur inattendue s'est produite.";
        }
        setError(errorMessage);
        addNotification(errorMessage, 'error');
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, API_BASE_URL, navigate]
  );

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initializeAuth, initialized]);

  const contextValue = {
    user,
    login,
    logout,
    register,
    refreshToken,
    isAuthenticated: !!user && !isTokenExpired(user?.token),
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <Backdrop
        open={isLoading}
        sx={{
          zIndex: 9999,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #010b40 0%, #1a237e 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <img
          src='../../src/assets/images/Youth Computing.png'
          alt='Youth Computing Logo'
          style={{
            width: '120px',
            height: '120px',
            marginBottom: '24px',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
        <CircularProgress
          color='inherit'
          size={60}
          thickness={5}
          sx={{ '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
        />
        <Typography
          variant='h6'
          sx={{
            mt: 3,
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.5px',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          Préparation de votre espace...
        </Typography>
      </Backdrop>
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
            bgcolor: '#f135441a',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#f13544' },
            border: '1px solid #f1354433',
            borderRadius: '8px',
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};