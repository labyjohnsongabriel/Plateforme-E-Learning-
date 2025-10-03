// Configuration avancée pour Axios avec gestion d'erreurs et retry
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 30000; // 30 secondes
const MAX_RETRIES = 3;

// Création de l'instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour obtenir le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Fonction pour supprimer le token d'authentification
const removeAuthToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Fonction pour rediriger vers la page de connexion
const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Fonction de retry avec backoff exponentiel
const retryRequest = async (error, retryCount = 0) => {
  if (retryCount >= MAX_RETRIES) {
    throw error;
  }

  // Ne pas retry pour certains codes d'erreur
  const noRetryStatuses = [400, 401, 403, 404, 422];
  if (error.response && noRetryStatuses.includes(error.response.status)) {
    throw error;
  }

  // Attendre avant de retry (backoff exponentiel)
  const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
  await new Promise(resolve => setTimeout(resolve, delay));

  // Retry la requête
  return api.request(error.config);
};

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter un ID unique à chaque requête pour le tracking
    config.metadata = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
    };

    // Log de la requête en mode développement
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request [${config.metadata.requestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    const duration = Date.now() - (config.metadata?.startTime || 0);

    // Log de la réponse en mode développement
    if (import.meta.env.DEV) {
      console.log(`✅ API Response [${config.metadata?.requestId}] (${duration}ms):`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const config = error.config;
    const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;

    // Log de l'erreur
    console.error(`❌ API Error [${config?.metadata?.requestId}] (${duration}ms):`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Gestion des erreurs spécifiques
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          removeAuthToken();
          toast.error('Session expirée. Veuillez vous reconnecter.');
          redirectToLogin();
          break;

        case 403:
          toast.error('Accès refusé. Permissions insuffisantes.');
          break;

        case 404:
          toast.error('Ressource non trouvée.');
          break;

        case 422:
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err) => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else {
            toast.error(data?.message || 'Données invalides.');
          }
          break;

        case 429:
          toast.error('Trop de requêtes. Veuillez patienter.');
          break;

        case 500:
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;

        default:
          if (status >= 500) {
            toast.error('Erreur serveur. Veuillez réessayer plus tard.');
          } else {
            toast.error(data?.message || 'Une erreur est survenue.');
          }
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Requête expirée. Vérifiez votre connexion.');
    } else if (error.message === 'Network Error') {
      toast.error('Erreur de connexion. Vérifiez votre réseau.');
    } else {
      toast.error('Une erreur inattendue est survenue.');
    }

    // Tentative de retry pour certaines erreurs
    if (error.response?.status && error.response.status >= 500) {
      try {
        const retryCount = config?.metadata?.retryCount || 0;
        config.metadata = { ...config.metadata, retryCount: retryCount + 1 };
        return await retryRequest(error, retryCount);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les requêtes API
export const apiUtils = {
  // GET request avec gestion d'erreurs
  get: async (url, config) => {
    const response = await api.get(url, config);
    return response.data.data || response.data;
  },

  // POST request avec gestion d'erreurs
  post: async (url, data, config) => {
    const response = await api.post(url, data, config);
    return response.data.data || response.data;
  },

  // PUT request avec gestion d'erreurs
  put: async (url, data, config) => {
    const response = await api.put(url, data, config);
    return response.data.data || response.data;
  },

  // PATCH request avec gestion d'erreurs
  patch: async (url, data, config) => {
    const response = await api.patch(url, data, config);
    return response.data.data || response.data;
  },

  // DELETE request avec gestion d'erreurs
  delete: async (url, config) => {
    const response = await api.delete(url, config);
    return response.data.data || response.data;
  },

  // Upload de fichier avec progress
  upload: async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data || response.data;
  },

  // Download de fichier
  download: async (url, filename) => {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Configuration pour React Query
export const queryConfig = {
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Ne pas retry pour les erreurs 4xx
        if (error?.response?.status && error.response.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
};

// Ancienne fonction pour compatibilité
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await api.request({
      url,
    ...options,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
