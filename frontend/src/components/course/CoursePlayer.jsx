import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Fade,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ArrowBack as ArrowLeftIcon,
  ArrowForward as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Book as BookIcon,
  Schedule as ClockIcon,
  Analytics as BarChart3Icon,
  PlayArrow as PlayIcon,
  Description as FileTextIcon,
  HelpOutline as HelpCircleIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as MaximizeIcon,
  GetApp as DownloadIcon,
  WorkspacePremium as AwardIcon,
  TrackChanges as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Replay as ReplayIcon,
  Quiz as QuizIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import axios from 'axios';

// === CONFIGURATION AVANCÉE ===
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:3001/uploads';

// === SYSTEME DE LOGGING PROFESSIONNEL ===
const logger = {
  info: (message, data = null) => {
    console.log(`ℹ️ [COURSE-PLAYER] ${message}`, data || '');
  },
  error: (message, error = null) => {
    console.error(`❌ [COURSE-PLAYER] ${message}`, error || '');
  },
  warn: (message, data = null) => {
    console.warn(`⚠️ [COURSE-PLAYER] ${message}`, data || '');
  },
};

// === ANIMATIONS AVANCÉES ===
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(40px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

const slideInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-50px) scale(0.98);
  }
  to { 
    opacity: 1; 
    transform: translateX(0) scale(1);
  }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 0 0 rgba(241, 53, 68, 0.7);
  }
  50% { 
    transform: scale(1.05); 
    boxShadow: 0 0 0 12px rgba(241, 53, 68, 0);
  }
`;

// === SYSTÈME DE DESIGN PROFESSIONNEL ===
const colors = {
  primary: '#1a237e',
  secondary: '#f50057',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#010b40',
  surface: '#010b40',
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
  },
};

// ✅ FONCTION: Simplification des noms de fichiers pour la recherche
const simplifyFilename = (filename) => {
  if (!filename) return '';

  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\-.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

// ✅ FONCTION: Vérification de fichier
const checkFileAvailability = async (videoUrl) => {
  if (!videoUrl) {
    console.warn('❌ URL vidéo manquante');
    return false;
  }

  try {
    const filename = videoUrl.split('/').pop();

    if (!filename) {
      console.warn("❌ Impossible d'extraire le nom de fichier de l'URL:", videoUrl);
      return false;
    }

    console.log('🔍 Vérification disponibilité fichier:', filename);

    const decodedFilename = decodeURIComponent(filename);
    console.log('🔍 Nom de fichier décodé:', decodedFilename);

    const checkUrl = `http://localhost:3001/api/upload/check/${encodeURIComponent(decodedFilename)}`;
    console.log('📡 URL de vérification:', checkUrl);

    const response = await axios.get(checkUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Réponse vérification fichier:', response.data);

    if (response.data.exists) {
      const actualUrl = response.data.url;
      console.log('🎯 URL réelle du fichier:', actualUrl);
      return actualUrl;
    } else {
      console.warn('❌ Fichier non trouvé sur le serveur:', decodedFilename);

      const simplifiedName = simplifyFilename(decodedFilename);
      console.log('🔄 Tentative avec nom simplifié:', simplifiedName);

      if (simplifiedName !== decodedFilename) {
        const fallbackCheckUrl = `http://localhost:3001/api/upload/check/${encodeURIComponent(simplifiedName)}`;
        try {
          const fallbackResponse = await axios.get(fallbackCheckUrl, {
            timeout: 5000,
          });

          if (fallbackResponse.data.exists) {
            console.log('✅ Fichier trouvé avec nom simplifié:', simplifiedName);
            return fallbackResponse.data.url;
          }
        } catch (fallbackError) {
          console.log('❌ Échec vérification nom simplifié');
        }
      }

      return false;
    }
  } catch (error) {
    console.error('❌ Erreur vérification fichier:', error);

    try {
      console.log('🔄 Fallback - Essai direct de l URL originale:', videoUrl);
      const testResponse = await axios.head(videoUrl, {
        timeout: 5000,
        validateStatus: (status) => status < 500,
      });

      if (testResponse.status === 200) {
        console.log('✅ Fallback réussi - Fichier accessible directement');
        return videoUrl;
      } else {
        console.warn(`❌ Statut HTTP ${testResponse.status} pour l'URL directe`);
        return false;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback échoué:', fallbackError);
      return false;
    }
  }
};

// ✅ FONCTION: Charger la vidéo
const loadVideo = async (videoUrl) => {
  if (!videoUrl) {
    console.warn('❌ URL vidéo manquante');
    return null;
  }

  try {
    console.log('🎬 Tentative de chargement vidéo:', videoUrl);

    const preparedUrl = prepareMediaUrl(videoUrl);
    console.log('🔧 URL préparée:', preparedUrl);

    if (!preparedUrl) {
      console.warn('❌ URL préparée invalide');
      return null;
    }

    const actualVideoUrl = await checkFileAvailability(preparedUrl);

    if (actualVideoUrl) {
      console.log('✅ Chargement vidéo avec URL:', actualVideoUrl);
      return actualVideoUrl;
    } else {
      console.warn('❌ Aucune URL vidéo valide trouvée');

      const filename = preparedUrl.split('/').pop();
      if (filename) {
        console.log('🔄 Tentative de recherche avancée pour:', filename);
        try {
          const searchUrl = `http://localhost:3001/api/upload/search/${encodeURIComponent(decodeURIComponent(filename))}`;
          const searchResponse = await axios.get(searchUrl, { timeout: 5000 });

          if (searchResponse.data.found) {
            console.log(
              '✅ Fichier trouvé via recherche avancée:',
              searchResponse.data.bestMatch.url
            );
            return searchResponse.data.bestMatch.url;
          }
        } catch (searchError) {
          console.log('❌ Recherche avancée échouée');
        }
      }

      return null;
    }
  } catch (error) {
    console.error('❌ Erreur chargement vidéo:', error);
    return null;
  }
};

// ✅ FONCTION: Préparer les URLs
const prepareMediaUrl = (url) => {
  if (!url) {
    logger.warn('URL manquante');
    return null;
  }

  try {
    let finalUrl = url;

    if (finalUrl.includes('localhost:5173')) {
      finalUrl = finalUrl.replace('localhost:5173', 'localhost:3001');
      logger.info(`🔄 URL corrigée vers backend: ${finalUrl}`);
    }

    if (finalUrl.startsWith('/uploads/')) {
      finalUrl = `http://localhost:3001${finalUrl}`;
    } else if (finalUrl.startsWith('/') && !finalUrl.startsWith('//')) {
      finalUrl = `${UPLOADS_BASE_URL}/${encodeURIComponent(finalUrl.substring(1))}`;
    }

    try {
      new URL(finalUrl);
    } catch (urlError) {
      logger.warn('URL invalide, tentative de correction', finalUrl);
      if (!finalUrl.includes('://')) {
        finalUrl = `${UPLOADS_BASE_URL}/${encodeURIComponent(finalUrl)}`;
      }
    }

    logger.info(`🎬 URL média finale: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    logger.error('❌ Erreur lors de la préparation de l URL', error);
    return url;
  }
};

// === HOOK PERSONNALISÉ POUR LA GESTION DES COURS ===
const useCourseData = (courseId, contenuId, headers) => {
  const [state, setState] = useState({
    course: null,
    contenu: null,
    contenus: [],
    progress: 0,
    loading: true,
    error: null,
    isCompleted: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!headers) {
        navigate('/login', {
          state: {
            from: location.pathname,
            message: 'Veuillez vous connecter pour accéder au cours',
          },
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        logger.info(`🔄 Chargement du cours: ${courseId}`);

        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, {
          headers,
          timeout: 15000,
        });

        const courseData = courseResponse.data?.data || courseResponse.data;

        if (!courseData) {
          throw new Error('Données du cours non disponibles');
        }

        logger.info('✅ Cours chargé avec succès', {
          titre: courseData.titre,
          contenu: courseData.contenu ? 'Oui' : 'Non',
        });

        if (!courseData.contenu || !courseData.contenu.sections) {
          throw new Error('Structure de contenu invalide ou manquante');
        }

        let contenusData = await extractAndNormalizeContents(courseData, courseId, headers);

        if (contenusData.length === 0) {
          throw new Error('Aucun contenu disponible pour ce cours');
        }

        logger.info(`📚 Contenus normalisés: ${contenusData.length} éléments`);

        const currentContent = findCurrentContent(contenusData, contenuId, courseId, navigate);

        const progressData = await loadProgress(courseId, headers, contenusData);

        setState({
          course: courseData,
          contenu: currentContent,
          contenus: contenusData,
          progress: progressData,
          isCompleted: currentContent?.isCompleted || false,
          loading: false,
          error: null,
        });

        logger.info('🎯 Initialisation terminée avec succès');
      } catch (error) {
        logger.error('❌ Erreur lors du chargement des données', error);

        const errorMessage = getErrorMessage(error);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    };

    fetchCourseData();
  }, [courseId, contenuId, headers, navigate, location]);

  return state;
};

const extractAndNormalizeContents = async (courseData, courseId, headers) => {
  const contenusData = [];

  try {
    if (!courseData?.contenu || typeof courseData.contenu !== 'object') {
      logger.warn('Structure contenu manquante ou invalide', courseData);
      return [];
    }

    const sections = courseData.contenu.sections;
    if (!Array.isArray(sections) || sections.length === 0) {
      logger.warn('Aucune section trouvée dans le contenu');
      return [];
    }

    logger.info(`Traitement de ${sections.length} section(s)`);

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];

      if (!section || typeof section !== 'object') {
        logger.warn(`Section ${sectionIndex} invalide`, section);
        continue;
      }

      const modules = section.modules;
      if (!Array.isArray(modules)) {
        logger.warn(`Modules de la section ${sectionIndex} invalides`, modules);
        continue;
      }

      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
        const module = modules[moduleIndex];

        if (!module || typeof module !== 'object') {
          logger.warn(`Module ${moduleIndex} invalide dans section ${sectionIndex}`, module);
          continue;
        }

        const moduleId = module._id || module.id || `section-${sectionIndex}-module-${moduleIndex}`;
        const moduleTitre = (module.titre || '').trim() || `Module ${moduleIndex + 1}`;

        if (!moduleId || !moduleTitre) {
          logger.warn(`Module ${moduleIndex} incomplet dans section ${sectionIndex}`, module);
          continue;
        }

        let contentUrl = null;
        let contentData = null;

        if (module.contenu) {
          if (module.type === 'TEXTE') {
            contentData = String(module.contenu).trim();
          } else {
            contentUrl = prepareMediaUrl(String(module.contenu).trim());
          }
        }

        const typeMap = {
          VIDEO: 'video',
          TEXTE: 'texte',
          QUIZ: 'quiz',
          DOCUMENT: 'document',
        };

        const moduleType = typeMap[(module.type || '').toString().toUpperCase()] || 'document';

        logger.info(`Module: ${moduleTitre}`, {
          type: moduleType,
          url: contentUrl,
          hasContentData: !!contentData,
          originalType: module.type,
        });

        contenusData.push({
          _id: moduleId,
          titre: moduleTitre,
          type: moduleType,
          url: contentUrl,
          contenu: contentData,
          description: (module.description || '').trim(),
          duration: Number(module.duree) || 0,
          questions: Array.isArray(module.questions) ? module.questions : [],
          isCompleted: Boolean(module.isCompleted),
          ordre: Number(module.ordre) || moduleIndex + 1,
          sectionTitre: (section.titre || '').trim() || `Section ${sectionIndex + 1}`,
          sectionOrdre: sectionIndex + 1,
          metadata: module.metadata || {},
          isValid: true,
          hasContent: !!contentUrl || !!contentData || moduleType === 'quiz',
          originalType: module.type,
        });
      }
    }

    contenusData.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));

    logger.info(`Normalisation OK: ${contenusData.length} contenu(x)`);
    return contenusData;
  } catch (error) {
    logger.error('Erreur normalisation', error);
    return [];
  }
};

const findCurrentContent = (contenus, contenuId, courseId, navigate) => {
  if (!contenus || contenus.length === 0) {
    logger.error('Aucun contenu disponible');
    return null;
  }

  let current = null;

  if (contenuId) {
    current = contenus.find((c) => c._id === contenuId);

    if (!current) {
      logger.warn(`Contenu ${contenuId} non trouvé, utilisation du premier contenu`);
      current = contenus[0];

      if (current && current._id) {
        navigate(`/student/learn/${courseId}/contenu/${current._id}`, { replace: true });
      }
    }
  } else {
    current = contenus.find((c) => !c.isCompleted) || contenus[0];

    if (current && current._id) {
      navigate(`/student/learn/${courseId}/contenu/${current._id}`, { replace: true });
    }
  }

  if (current) {
    logger.info(`🎯 Contenu actuel: ${current.titre} (${current.type}) - URL: ${current.url}`);
  } else {
    logger.error('❌ Aucun contenu valide trouvé');
  }

  return current;
};

const loadProgress = async (courseId, headers, contenus) => {
  try {
    const endpoints = [
      `${API_BASE_URL}/learning/progress/${courseId}`,
      `${API_BASE_URL}/progress/${courseId}`,
      `${API_BASE_URL}/learning/${courseId}/progress`,
    ];

    for (const endpoint of endpoints) {
      try {
        logger.info(`🔄 Tentative de chargement progression: ${endpoint}`);

        const response = await axios.get(endpoint, {
          headers,
          timeout: 8000,
        });

        const data = response.data?.data || response.data;
        const progress = data?.pourcentage || data?.progress || data?.percentage;

        if (progress !== undefined && progress !== null) {
          const normalizedProgress = Math.min(100, Math.max(0, Number(progress)));
          logger.info(`✅ Progression chargée: ${normalizedProgress}%`);
          return normalizedProgress;
        }
      } catch (error) {
        logger.warn(`❌ Échec endpoint progression: ${endpoint}`, error.message);
        continue;
      }
    }

    const validContenus = contenus.filter((c) => c.isValid);
    const completedCount = validContenus.filter((c) => c.isCompleted).length;
    const fallbackProgress =
      validContenus.length > 0 ? Math.round((completedCount / validContenus.length) * 100) : 0;

    logger.info(
      `📊 Progression fallback: ${fallbackProgress}% (${completedCount}/${validContenus.length})`
    );
    return fallbackProgress;
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de la progression', error);

    const completedCount = contenus.filter((c) => c.isCompleted).length;
    const ultraFallback =
      contenus.length > 0 ? Math.round((completedCount / contenus.length) * 100) : 0;

    logger.warn(`🆘 Progression ultra-fallback: ${ultraFallback}%`);
    return ultraFallback;
  }
};

const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        return 'Session expirée - Veuillez vous reconnecter';
      case 403:
        return 'Accès non autorisé à ce cours';
      case 404:
        return 'Cours ou contenu non trouvé';
      case 500:
        return 'Erreur serveur - Veuillez réessayer plus tard';
      default:
        return data?.message || `Erreur ${status} - ${data?.error || 'Veuillez réessayer'}`;
    }
  }

  if (error.request) {
    return 'Impossible de se connecter au serveur - Vérifiez votre connexion';
  }

  if (error.message) {
    return error.message;
  }

  return 'Une erreur inattendue est survenue';
};

// === COMPOSANT LECTEUR VIDÉO ===
const VideoPlayer = React.memo(({ videoUrl, onEnded, onProgress, autoComplete = true }) => {
  const videoRef = useRef(null);
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    showControls: true,
    isLoading: true,
    hasError: false,
    errorType: null,
    errorDetails: null,
    resolvedUrl: null,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const controlsTimeoutRef = useRef();

  const preparedVideoUrl = useMemo(() => {
    return prepareMediaUrl(videoUrl);
  }, [videoUrl]);

  const isValidVideoUrl = useMemo(() => {
    if (!preparedVideoUrl) {
      logger.warn('URL vidéo manquante après préparation');
      return false;
    }

    try {
      new URL(preparedVideoUrl);

      if (!preparedVideoUrl.includes('localhost:3001')) {
        logger.warn(`URL ne pointe pas vers le backend: ${preparedVideoUrl}`);
        return false;
      }

      if (preparedVideoUrl.match(/\.(mp4|webm|mov|avi|mkv|m3u8)$/i)) {
        return true;
      }

      logger.warn(`URL vidéo sans extension reconnue: ${preparedVideoUrl}`);
      return true;
    } catch (error) {
      logger.warn(`URL vidéo non valide: ${preparedVideoUrl}`, error);
      return false;
    }
  }, [preparedVideoUrl]);

  useEffect(() => {
    const verifyVideoAvailability = async () => {
      if (!preparedVideoUrl || !isValidVideoUrl) {
        setPlayerState((prev) => ({
          ...prev,
          hasError: true,
          errorType: 'network',
          errorDetails: 'URL invalide',
          isLoading: false,
        }));
        return;
      }

      try {
        setPlayerState((prev) => ({ ...prev, isLoading: true }));

        const actualVideoUrl = await loadVideo(preparedVideoUrl);

        if (actualVideoUrl) {
          setPlayerState((prev) => ({
            ...prev,
            isLoading: false,
            resolvedUrl: actualVideoUrl,
          }));

          if (videoRef.current) {
            videoRef.current.load();
          }
        } else {
          setPlayerState((prev) => ({
            ...prev,
            hasError: true,
            errorType: 'network',
            errorDetails: 'Fichier non trouvé sur le serveur',
            isLoading: false,
          }));
        }
      } catch (error) {
        logger.warn('❌ Erreur lors de la vérification du fichier vidéo', error);
        setPlayerState((prev) => ({
          ...prev,
          isLoading: false,
          hasError: true,
          errorType: 'network',
          errorDetails: error.message,
        }));
      }
    };

    verifyVideoAvailability();
  }, [preparedVideoUrl, isValidVideoUrl]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current || !playerState.resolvedUrl || playerState.hasError) return;

    try {
      if (playerState.isPlaying) {
        videoRef.current.pause();
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      } else {
        videoRef.current
          .play()
          .then(() => {
            setPlayerState((prev) => ({ ...prev, isPlaying: true }));
          })
          .catch((error) => {
            logger.error('❌ Erreur lors de la lecture vidéo', error);
            setPlayerState((prev) => ({
              ...prev,
              hasError: true,
              errorType: 'format',
              errorDetails: error.message,
            }));
          });
      }
    } catch (error) {
      logger.error('❌ Erreur toggle play', error);
      setPlayerState((prev) => ({
        ...prev,
        hasError: true,
        errorType: 'format',
        errorDetails: error.message,
      }));
    }
  }, [playerState.isPlaying, playerState.resolvedUrl, playerState.hasError]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 0;
      setPlayerState((prev) => ({ ...prev, currentTime, duration }));

      if (onProgress && duration > 0) {
        const progress = (currentTime / duration) * 100;
        onProgress(progress);
      }

      if (autoComplete && currentTime > 0 && duration > 0 && currentTime / duration > 0.95) {
        onEnded?.();
      }
    }
  }, [onProgress, onEnded, autoComplete]);

  const handleLoadedData = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      isLoading: false,
      duration: videoRef.current?.duration || 0,
    }));
    logger.info('✅ Données vidéo chargées avec succès');
  }, []);

  const handleError = useCallback(
    (event) => {
      const video = event.target;
      const error = video.error;

      let errorType = 'unknown';
      let errorDetails = 'Erreur inconnue';

      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorType = 'network';
            errorDetails = 'Chargement annulé';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorType = 'network';
            errorDetails = 'Erreur réseau';
            break;
          case error.MEDIA_ERR_DECODE:
            errorType = 'format';
            errorDetails = 'Erreur de décodage - format non supporté';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorType = 'format';
            errorDetails = 'Format vidéo non supporté par le navigateur';
            break;
          default:
            errorType = 'unknown';
            errorDetails = `Code erreur: ${error.code}`;
        }
      }

      logger.error('❌ Erreur de chargement vidéo', {
        url: playerState.resolvedUrl,
        errorType,
        errorDetails,
        errorCode: error?.code,
        errorMessage: error?.message,
      });

      setPlayerState((prev) => ({
        ...prev,
        hasError: true,
        errorType,
        errorDetails,
        isLoading: false,
      }));
    },
    [playerState.resolvedUrl]
  );

  const handleSeek = useCallback(
    (event) => {
      if (videoRef.current && playerState.duration > 0) {
        const rect = event.currentTarget.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const newTime = Math.max(0, Math.min(playerState.duration, percent * playerState.duration));
        videoRef.current.currentTime = newTime;
      }
    },
    [playerState.duration]
  );

  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getErrorMessage = useCallback(() => {
    switch (playerState.errorType) {
      case 'network':
        return 'Problème de réseau - Vérifiez votre connexion internet';
      case 'format':
        return 'Format vidéo non supporté - Essayez un autre navigateur';
      case 'access':
        return 'Accès refusé - Vérifiez les permissions du fichier';
      default:
        return `Erreur de chargement - ${playerState.errorDetails || 'Vérifiez votre connexion'}`;
    }
  }, [playerState.errorType, playerState.errorDetails]);

  const handleRetry = useCallback(() => {
    logger.info('🔄 Tentative de rechargement de la vidéo');

    setPlayerState({
      isPlaying: false,
      isMuted: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      showControls: true,
      isLoading: true,
      hasError: false,
      errorType: null,
      errorDetails: null,
      resolvedUrl: playerState.resolvedUrl,
    });

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [playerState.resolvedUrl]);

  const handleOpenInNewTab = useCallback(() => {
    if (playerState.resolvedUrl) {
      window.open(playerState.resolvedUrl, '_blank');
    }
  }, [playerState.resolvedUrl]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!isValidVideoUrl) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? 300 : 500,
          bgcolor: colors.surface,
          borderRadius: '20px',
          border: `1px solid ${colors.error}30`,
          color: 'white',
          textAlign: 'center',
          p: 4,
        }}
      >
        <WarningIcon sx={{ fontSize: 64, color: colors.error, mb: 3 }} />
        <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
          URL vidéo invalide
        </Typography>
        <Typography color={colors.text.muted} sx={{ mb: 2 }}>
          L'URL de la vidéo n'est pas valide ou accessible.
        </Typography>
        <Typography
          variant='body2'
          color={colors.text.muted}
          sx={{ mb: 3, wordBreak: 'break-all' }}
        >
          URL: {preparedVideoUrl || 'Non définie'}
        </Typography>
        <Button
          variant='contained'
          onClick={() =>
            logger.info('Debug vidéo', {
              preparedVideoUrl,
              isValidVideoUrl,
              originalUrl: videoUrl,
            })
          }
          sx={{ bgcolor: colors.secondary }}
        >
          Voir les détails techniques
        </Button>
      </Box>
    );
  }

  if (playerState.hasError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? 300 : 500,
          bgcolor: colors.surface,
          borderRadius: '20px',
          border: `1px solid ${colors.error}30`,
          color: 'white',
          textAlign: 'center',
          p: 4,
        }}
      >
        <WarningIcon sx={{ fontSize: 64, color: colors.error, mb: 3 }} />
        <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
          Erreur de chargement
        </Typography>
        <Typography color={colors.text.muted} sx={{ mb: 2 }}>
          {getErrorMessage()}
        </Typography>
        {playerState.errorDetails && (
          <Typography variant='body2' color={colors.text.muted} sx={{ mb: 2 }}>
            Détails: {playerState.errorDetails}
          </Typography>
        )}
        <Typography
          variant='body2'
          color={colors.text.muted}
          sx={{ mb: 3, wordBreak: 'break-all' }}
        >
          URL: {playerState.resolvedUrl}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant='contained' onClick={handleRetry} sx={{ bgcolor: colors.secondary }}>
            <ReplayIcon sx={{ mr: 1 }} />
            Réessayer
          </Button>
          <Button
            variant='outlined'
            onClick={handleOpenInNewTab}
            sx={{ borderColor: colors.text.muted, color: colors.text.primary }}
          >
            <VideoIcon sx={{ mr: 1 }} />
            Ouvrir dans un nouvel onglet
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 300 : 500,
        bgcolor: '#000',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8)`,
      }}
      onMouseMove={() => {
        setPlayerState((prev) => ({ ...prev, showControls: true }));
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          setPlayerState((prev) => ({ ...prev, showControls: false }));
        }, 3000);
      }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={playerState.resolvedUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          cursor: 'pointer',
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={onEnded}
        onError={handleError}
        onClick={(e) => e.stopPropagation()}
        preload='auto'
        crossOrigin='anonymous'
        playsInline
      />

      {playerState.isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.7)',
          }}
        >
          <Box textAlign='center'>
            <CircularProgress size={60} thickness={4} sx={{ color: colors.secondary, mb: 2 }} />
            <Typography color='white' variant='body2'>
              Chargement de la vidéo...
            </Typography>
          </Box>
        </Box>
      )}

      {!playerState.isPlaying && !playerState.isLoading && !playerState.hasError && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}
        >
          <IconButton
            onClick={togglePlay}
            sx={{
              bgcolor: `${colors.secondary}dd`,
              color: 'white',
              width: isMobile ? 80 : 100,
              height: isMobile ? 80 : 100,
              backdropFilter: 'blur(10px)',
              animation: `${pulse} 2s infinite`,
              '&:hover': {
                bgcolor: colors.secondary,
                transform: 'scale(1.1)',
              },
            }}
          >
            <PlayIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
          </IconButton>
        </Box>
      )}

      {playerState.showControls && !playerState.isLoading && !playerState.hasError && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
            p: isMobile ? 2 : 3,
            pt: 4,
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: 6,
              bgcolor: 'rgba(255,255,255,0.3)',
              borderRadius: 3,
              cursor: 'pointer',
              mb: 3,
              position: 'relative',
            }}
            onClick={handleSeek}
          >
            <Box
              sx={{
                width: `${(playerState.currentTime / playerState.duration) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`,
                borderRadius: 3,
                transition: 'width 0.1s ease',
              }}
            />
          </Box>

          <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title={playerState.isPlaying ? 'Pause' : 'Lecture'}>
                <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                  {playerState.isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Tooltip>

              <Typography variant='body2' color='white' sx={{ minWidth: 100 }}>
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </Typography>
            </Stack>

            <Stack direction='row' spacing={1}>
              <Tooltip title='Plein écran'>
                <IconButton
                  onClick={() => videoRef.current?.requestFullscreen?.()}
                  sx={{ color: 'white' }}
                >
                  <MaximizeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
});

// === COMPOSANT DOCUMENT VIEWER COMPLET ===
const DocumentViewer = React.memo(({ documentUrl, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const preparedDocumentUrl = useMemo(() => {
    return prepareMediaUrl(documentUrl);
  }, [documentUrl]);

  const isValidDocumentUrl = useMemo(() => {
    if (!preparedDocumentUrl) {
      logger.warn('URL du document manquante après préparation');
      return false;
    }

    try {
      new URL(preparedDocumentUrl);

      if (!preparedDocumentUrl.includes('localhost:3001')) {
        logger.warn(`URL ne pointe pas vers le backend: ${preparedDocumentUrl}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.warn(`URL document non valide: ${preparedDocumentUrl}`, error);
      return false;
    }
  }, [preparedDocumentUrl]);

  const handleLoadSuccess = useCallback(() => {
    setLoading(false);
    setError(null);
    logger.info('✅ Document chargé avec succès');
  }, []);

  const handleLoadError = useCallback((err) => {
    logger.error('❌ Erreur de chargement du document', err);
    setLoading(false);
    setError('Erreur de chargement du document');
  }, []);

  const handleDownload = useCallback(() => {
    if (!isValidDocumentUrl) {
      logger.error('URL document invalide pour le téléchargement', preparedDocumentUrl);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = preparedDocumentUrl;
      link.download = 'document.pdf';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      logger.error('Erreur lors du téléchargement', error);
      window.open(preparedDocumentUrl, '_blank');
    }
  }, [preparedDocumentUrl, isValidDocumentUrl]);

  const handleViewOnline = useCallback(() => {
    if (!isValidDocumentUrl) {
      logger.error('URL document invalide pour la visualisation', preparedDocumentUrl);
      return;
    }

    try {
      window.open(preparedDocumentUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      logger.error("Erreur lors de l'ouverture", error);
    }
  }, [preparedDocumentUrl, isValidDocumentUrl]);

  const handleMarkComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  if (isValidDocumentUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: colors.surface,
          borderRadius: '20px',
          overflow: 'hidden',
          border: `1px solid ${colors.text.muted}30`,
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${colors.text.muted}20`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: colors.background,
          }}
        >
          <Stack direction='row' spacing={2} alignItems='center'>
            <FileTextIcon sx={{ fontSize: 32, color: colors.secondary }} />
            <Box>
              <Typography variant='h6' color={colors.text.primary} fontWeight={600}>
                Document PDF
              </Typography>
              <Typography variant='body2' color={colors.text.muted}>
                Lecture en ligne
              </Typography>
            </Box>
          </Stack>

          <Stack direction='row' spacing={1}>
            <Tooltip title='Télécharger'>
              <IconButton onClick={handleDownload} sx={{ color: colors.text.primary }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Ouvrir dans un nouvel onglet'>
              <IconButton onClick={handleViewOnline} sx={{ color: colors.text.primary }}>
                <MaximizeIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant='contained'
              onClick={handleMarkComplete}
              sx={{
                bgcolor: colors.secondary,
                '&:hover': { bgcolor: colors.primary },
              }}
            >
              Terminer
            </Button>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, position: 'relative' }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.7)',
                zIndex: 2,
              }}
            >
              <CircularProgress size={60} sx={{ color: colors.secondary }} />
            </Box>
          )}

          <iframe
            src={preparedDocumentUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'white',
            }}
            onLoad={handleLoadSuccess}
            onError={handleLoadError}
            title='Document PDF'
          />
        </Box>

        {error && (
          <Box
            sx={{
              p: 3,
              bgcolor: `${colors.error}15`,
              borderTop: `1px solid ${colors.error}30`,
              textAlign: 'center',
            }}
          >
            <Typography color={colors.error}>{error}</Typography>
            <Button
              onClick={() => window.open(preparedDocumentUrl, '_blank')}
              sx={{ mt: 1, color: colors.text.primary }}
            >
              Ouvrir dans un nouvel onglet
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  if (!isValidDocumentUrl) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.surface,
          borderRadius: '20px',
          border: `1px solid ${colors.error}30`,
          color: 'white',
          textAlign: 'center',
          p: 4,
        }}
      >
        <WarningIcon sx={{ fontSize: 64, color: colors.error, mb: 3 }} />
        <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
          Document non disponible
        </Typography>
        <Typography color={colors.text.muted} sx={{ mb: 2 }}>
          Le document n'est pas accessible actuellement.
        </Typography>
        <Typography variant='body2' color={colors.text.muted} sx={{ mb: 3 }}>
          URL: {preparedDocumentUrl || 'Non définie'}
        </Typography>
        <Button
          variant='outlined'
          onClick={() =>
            logger.info('Debug document', {
              preparedDocumentUrl,
              isValidDocumentUrl,
              originalUrl: documentUrl,
            })
          }
          sx={{ color: colors.text.secondary }}
        >
          Voir les détails techniques
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.surface,
        borderRadius: '20px',
        border: `1px solid ${colors.text.muted}30`,
        color: 'white',
        textAlign: 'center',
        p: 4,
        gap: 3,
      }}
    >
      <FileTextIcon sx={{ fontSize: 80, color: colors.secondary, mb: 2 }} />
      <Typography variant='h4' sx={{ mb: 1, fontWeight: 700 }}>
        Document
      </Typography>
      <Typography color={colors.text.secondary} sx={{ mb: 3, maxWidth: 400 }}>
        Ce document est disponible en téléchargement ou consultation en ligne
      </Typography>

      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        <Button
          variant='contained'
          size='large'
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{
            bgcolor: colors.secondary,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            flex: 1,
            '&:hover': {
              bgcolor: colors.primary,
            },
          }}
        >
          Télécharger
        </Button>
        <Button
          variant='outlined'
          size='large'
          startIcon={<ArticleIcon />}
          onClick={handleViewOnline}
          sx={{
            borderColor: colors.text.muted,
            color: colors.text.primary,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            flex: 1,
            '&:hover': {
              borderColor: colors.secondary,
              bgcolor: `${colors.secondary}10`,
            },
          }}
        >
          Voir en ligne
        </Button>
      </Stack>

      <Button
        variant='contained'
        onClick={handleMarkComplete}
        sx={{
          bgcolor: colors.success,
          mt: 2,
          '&:hover': { bgcolor: colors.success },
        }}
      >
        Marquer comme terminé
      </Button>

      {process.env.NODE_ENV === 'development' && (
        <Typography variant='caption' color={colors.text.muted} sx={{ mt: 2 }}>
          Debug: {preparedDocumentUrl}
        </Typography>
      )}
    </Box>
  );
});

// === COMPOSANT TEXT VIEWER COMPLET ===
const TextViewer = React.memo(({ content, title, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isExpanded, setIsExpanded] = useState(false);

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const truncatedContent = useMemo(() => {
    if (!content) return '';
    if (isExpanded || content.length <= 500) return content;
    return content.substring(0, 500) + '...';
  }, [content, isExpanded]);

  if (!content) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.surface,
          borderRadius: '20px',
          border: `1px solid ${colors.warning}30`,
          color: 'white',
          textAlign: 'center',
          p: 4,
        }}
      >
        <ArticleIcon sx={{ fontSize: 64, color: colors.warning, mb: 3 }} />
        <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
          Contenu texte non disponible
        </Typography>
        <Typography color={colors.text.muted}>
          Aucun contenu textuel n'est disponible pour ce module.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.surface,
        borderRadius: '20px',
        border: `1px solid ${colors.text.muted}30`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${colors.text.muted}20`,
          bgcolor: colors.background,
        }}
      >
        <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
          <Stack direction='row' spacing={2} alignItems='center'>
            <ArticleIcon sx={{ fontSize: 32, color: colors.secondary }} />
            <Box>
              <Typography variant='h5' color={colors.text.primary} fontWeight={700}>
                {title || 'Contenu Textuel'}
              </Typography>
              <Typography variant='body2' color={colors.text.muted}>
                Lecture en ligne
              </Typography>
            </Box>
          </Stack>
          <Button
            variant='contained'
            onClick={handleComplete}
            sx={{
              bgcolor: colors.secondary,
              '&:hover': { bgcolor: colors.primary },
            }}
          >
            Terminer la lecture
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 4,
        }}
      >
        <Paper
          sx={{
            p: 4,
            bgcolor: colors.background,
            border: `1px solid ${colors.text.muted}20`,
            borderRadius: '12px',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          <Typography
            variant='body1'
            color={colors.text.primary}
            sx={{
              lineHeight: 1.8,
              fontSize: '1.1rem',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
            }}
          >
            {truncatedContent}
          </Typography>

          {content.length > 500 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant='outlined'
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  '&:hover': {
                    bgcolor: `${colors.secondary}10`,
                  },
                }}
              >
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${colors.text.muted}20`,
          bgcolor: colors.background,
          textAlign: 'center',
        }}
      >
        <Typography variant='body2' color={colors.text.muted}>
          {content.length} caractères • Temps de lecture estimé: {Math.ceil(content.length / 1000)}{' '}
          minute(s)
        </Typography>
      </Box>
    </Box>
  );
});

// === COMPOSANT QUIZ INTERACTIF COMPLET ===
const QuizComponent = React.memo(({ questions, title, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validQuestions = useMemo(() => {
    if (!questions || !Array.isArray(questions)) {
      logger.warn('Questions invalides ou non fournies');
      return [];
    }

    return questions.filter((q, index) => {
      if (!q || typeof q !== 'object') {
        logger.warn(`Question ${index} invalide`, q);
        return false;
      }

      if (!q.question || typeof q.question !== 'string') {
        logger.warn(`Question ${index} sans texte`, q);
        return false;
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
        logger.warn(`Question ${index} sans options valides`, q);
        return false;
      }

      if (
        typeof q.correctAnswer !== 'number' ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length
      ) {
        logger.warn(`Question ${index} avec réponse correcte invalide`, q);
        return false;
      }

      return true;
    });
  }, [questions]);

  const currentQ = validQuestions[currentQuestion];

  const handleAnswerSelect = useCallback((questionIndex, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestion < validQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const calculatedScore = validQuestions.reduce((total, question, index) => {
        return total + (answers[index] === question.correctAnswer ? 1 : 0);
      }, 0);
      setScore(calculatedScore);
      setShowResults(true);
    }
  }, [currentQuestion, validQuestions, answers]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setQuizStarted(false);
  }, []);

  const handleStartQuiz = useCallback(() => {
    setQuizStarted(true);
  }, []);

  const handleSubmitQuiz = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  if (!quizStarted) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.surface,
          borderRadius: '20px',
          border: `1px solid ${colors.text.muted}30`,
          color: 'white',
          textAlign: 'center',
          p: 4,
        }}
      >
        <QuizIcon sx={{ fontSize: 80, color: colors.secondary, mb: 3 }} />
        <Typography variant='h3' sx={{ mb: 2, fontWeight: 800 }}>
          {title || 'Quiz'}
        </Typography>
        <Typography variant='h6' color={colors.text.secondary} sx={{ mb: 4 }}>
          Testez vos connaissances
        </Typography>

        <Stack spacing={3} sx={{ maxWidth: 400, width: '100%' }}>
          <Paper
            sx={{
              p: 3,
              bgcolor: colors.background,
              border: `1px solid ${colors.text.muted}20`,
            }}
          >
            <Stack direction='row' justifyContent='space-between' sx={{ mb: 2 }}>
              <Typography color={colors.text.muted}>Nombre de questions:</Typography>
              <Typography color={colors.text.primary} fontWeight={600}>
                {validQuestions.length}
              </Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between' sx={{ mb: 2 }}>
              <Typography color={colors.text.muted}>Temps estimé:</Typography>
              <Typography color={colors.text.primary} fontWeight={600}>
                {Math.ceil(validQuestions.length * 1.5)} minutes
              </Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography color={colors.text.muted}>Score de passage:</Typography>
              <Typography color={colors.success} fontWeight={600}>
                70%
              </Typography>
            </Stack>
          </Paper>

          <Button
            variant='contained'
            size='large'
            onClick={handleStartQuiz}
            sx={{
              bgcolor: colors.secondary,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              '&:hover': {
                bgcolor: colors.primary,
              },
            }}
          >
            Commencer le Quiz
          </Button>
        </Stack>
      </Box>
    );
  }

  if (validQuestions.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          bgcolor: colors.surface,
          borderRadius: '20px',
          border: `1px solid ${colors.warning}30`,
          color: 'white',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <QuizIcon sx={{ fontSize: 80, color: colors.warning, mb: 3 }} />
        <Typography variant='h4' sx={{ mb: 2, fontWeight: 700 }}>
          Quiz non disponible
        </Typography>
        <Typography color={colors.text.secondary} sx={{ mb: 4 }}>
          Aucune question valide n'est disponible pour ce quiz.
        </Typography>
        <Button
          variant='contained'
          size='large'
          onClick={onComplete}
          sx={{
            bgcolor: colors.secondary,
            px: 6,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          Marquer comme terminé
        </Button>
      </Box>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / validQuestions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: colors.surface,
          borderRadius: '20px',
          border: `1px solid ${isPassing ? colors.success : colors.error}30`,
          color: 'white',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: colors.background,
            borderBottom: `1px solid ${colors.text.muted}20`,
          }}
        >
          <AwardIcon
            sx={{
              fontSize: 80,
              color: isPassing ? colors.success : colors.error,
              mb: 2,
            }}
          />
          <Typography variant='h3' sx={{ mb: 2, fontWeight: 800 }}>
            {isPassing ? '🎉 Félicitations !' : '📝 Presque !'}
          </Typography>
          <Typography variant='h4' sx={{ mb: 1, fontWeight: 700 }}>
            Score: {score}/{validQuestions.length} ({percentage}%)
          </Typography>
          <Typography color={colors.text.secondary}>
            {isPassing
              ? 'Vous avez réussi le quiz avec brio !'
              : 'Continuez à vous entraîner pour améliorer votre score.'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {validQuestions.map((question, index) => (
            <Card
              key={index}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: '12px',
                bgcolor: `${answers[index] === question.correctAnswer ? colors.success : colors.error}15`,
                border: `1px solid ${answers[index] === question.correctAnswer ? colors.success : colors.error}30`,
              }}
            >
              <Typography fontWeight={700} sx={{ mb: 2, fontSize: '1.1rem' }}>
                {index + 1}. {question.question}
              </Typography>

              <Typography color={colors.text.muted} sx={{ mb: 1 }}>
                Votre réponse:{' '}
                <strong>{question.options?.[answers[index]] || 'Non répondue'}</strong>
              </Typography>

              {answers[index] !== question.correctAnswer && (
                <Typography color={colors.success} sx={{ fontWeight: 600 }}>
                  Réponse correcte: {question.options?.[question.correctAnswer]}
                </Typography>
              )}

              {question.explanation && (
                <Paper
                  sx={{
                    p: 2,
                    mt: 2,
                    bgcolor: colors.background,
                    border: `1px solid ${colors.text.muted}20`,
                  }}
                >
                  <Typography variant='body2' color={colors.text.secondary}>
                    <strong>Explication:</strong> {question.explanation}
                  </Typography>
                </Paper>
              )}
            </Card>
          ))}
        </Box>

        <Box sx={{ p: 3, borderTop: `1px solid ${colors.text.muted}20` }}>
          <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
            <Button
              variant='outlined'
              onClick={handleRestart}
              sx={{
                borderColor: colors.text.muted,
                color: colors.text.primary,
                flex: 1,
                '&:hover': {
                  borderColor: colors.secondary,
                },
              }}
            >
              Refaire le quiz
            </Button>
            <Button
              variant='contained'
              onClick={handleSubmitQuiz}
              sx={{
                bgcolor: isPassing ? colors.success : colors.secondary,
                flex: 1,
                '&:hover': {
                  bgcolor: isPassing ? colors.success : colors.primary,
                },
              }}
            >
              {isPassing ? 'Terminer le quiz' : 'Continuer quand même'}
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.surface,
        borderRadius: '20px',
        border: `1px solid ${colors.text.muted}30`,
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${colors.text.muted}20`,
          bgcolor: colors.background,
        }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
          <Chip
            label={`Question ${currentQuestion + 1}/${validQuestions.length}`}
            sx={{
              bgcolor: colors.secondary,
              color: 'white',
              fontWeight: 700,
            }}
          />
          <Typography color={colors.text.muted}>
            Score:{' '}
            {
              Object.values(answers).filter(
                (ans, idx) => ans === validQuestions[idx]?.correctAnswer
              ).length
            }
            /{validQuestions.length}
          </Typography>
        </Stack>

        <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.4 }}>
          {currentQ?.question}
        </Typography>

        {currentQ?.description && (
          <Typography color={colors.text.secondary} sx={{ mt: 1 }}>
            {currentQ.description}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {currentQ?.options?.map((option, optionIndex) => (
          <Card
            key={optionIndex}
            sx={{
              p: 3,
              mb: 2,
              cursor: 'pointer',
              bgcolor:
                answers[currentQuestion] === optionIndex
                  ? `${colors.secondary}20`
                  : colors.background,
              border: `2px solid ${
                answers[currentQuestion] === optionIndex ? colors.secondary : colors.text.muted
              }`,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: `${colors.secondary}15`,
                borderColor: colors.secondary,
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => handleAnswerSelect(currentQuestion, optionIndex)}
          >
            <Stack direction='row' alignItems='center' spacing={3}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: `2px solid ${
                    answers[currentQuestion] === optionIndex ? colors.secondary : colors.text.muted
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor:
                    answers[currentQuestion] === optionIndex ? colors.secondary : 'transparent',
                  flexShrink: 0,
                }}
              >
                {answers[currentQuestion] === optionIndex && (
                  <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                )}
              </Box>
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.4 }}>{option}</Typography>
            </Stack>
          </Card>
        ))}
      </Box>

      <Box sx={{ p: 3, borderTop: `1px solid ${colors.text.muted}20` }}>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
          <Button
            variant='outlined'
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            startIcon={<ArrowLeftIcon />}
            sx={{
              borderColor: colors.text.muted,
              color: colors.text.primary,
              flex: 1,
              '&:hover': {
                borderColor: colors.secondary,
              },
            }}
          >
            Précédent
          </Button>
          <Button
            variant='contained'
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            endIcon={
              currentQuestion === validQuestions.length - 1 ? <AwardIcon /> : <ArrowRightIcon />
            }
            sx={{
              bgcolor: colors.secondary,
              flex: 1,
              '&:hover': {
                bgcolor: colors.primary,
              },
            }}
          >
            {currentQuestion === validQuestions.length - 1
              ? 'Terminer le quiz'
              : 'Question suivante'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
});

// === COMPOSANT PRINCIPAL COURSE PLAYER COMPLET ===
const CoursePlayer = () => {
  const { courseId, contenuId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const headers = useMemo(() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        logger.warn("Aucun token d'authentification trouvé");
        return null;
      }

      if (typeof token !== 'string' || token.length < 10) {
        logger.error("Token d'authentification invalide");
        return null;
      }

      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération du token', error);
      return null;
    }
  }, []);

  const courseData = useCourseData(courseId, contenuId, headers);
  const { course, contenu, contenus, progress, loading, error, isCompleted } = courseData;

  const [uiState, setUiState] = useState({
    snackbar: { open: false, message: '', severity: 'info' },
    completing: false,
    sidebarOpen: !isMobile,
    mobileSidebarOpen: false,
  });

  const completionTimeoutsRef = useRef();

  useEffect(() => {
    return () => {
      if (completionTimeoutsRef.current) {
        clearTimeout(completionTimeoutsRef.current);
      }
    };
  }, []);

  const handleComplete = useCallback(async () => {
    if (uiState.completing || !headers || !contenuId) {
      logger.warn('Conditions de complétion non remplies', {
        completing: uiState.completing,
        hasHeaders: !!headers,
        contenuId,
      });
      return;
    }

    const currentContent = contenus.find((c) => c._id === contenuId);
    if (!currentContent) {
      logger.error('Contenu à compléter non trouvé', contenuId);
      setUiState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: 'Erreur: contenu non trouvé',
          severity: 'error',
        },
      }));
      return;
    }

    setUiState((prev) => ({ ...prev, completing: true }));

    try {
      logger.info(`🚀 Début de la complétion du contenu: ${contenuId}`, {
        titre: currentContent.titre,
        type: currentContent.type,
      });

      const endpoints = [
    /*    {
          url: `${API_BASE_URL}/learning/contenus/${contenuId}/complete`,
          method: 'PUT',
        },
        {
          url: `${API_BASE_URL}/contenus/${contenuId}/complete`,
          method: 'PUT',
        },*/
        {
          url: `${API_BASE_URL}/learning/progress/complete`,
          method: 'POST',
          data: { contenuId, courseId },
        },
      ];

      let success = false;
      for (const endpoint of endpoints) {
        try {
          logger.info(`🔄 Tentative de complétion via: ${endpoint.url}`);

          const response = await axios({
            method: endpoint.method,
            url: endpoint.url,
            data: endpoint.data || {},
            headers,
            timeout: 10000,
          });

          if (response.status === 200 || response.status === 201) {
            success = true;
            logger.info(`✅ Complétion réussie via: ${endpoint.url}`);
            break;
          }
        } catch (err) {
          logger.warn(`❌ Échec endpoint: ${endpoint.url}`, err.message);
          continue;
        }
      }

      if (!success) {
        logger.warn('⚠️ Aucun endpoint de complétion disponible, mise à jour locale uniquement');
      }

      const updatedContenus = contenus.map((c) =>
        c._id === contenuId ? { ...c, isCompleted: true } : c
      );

      const completedCount = updatedContenus.filter((c) => c.isCompleted).length;
      const newProgress =
        updatedContenus.length > 0
          ? Math.round((completedCount / updatedContenus.length) * 100)
          : 0;

      setUiState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: '🎉 Contenu terminé avec succès !',
          severity: 'success',
        },
        completing: false,
      }));

      const currentIndex = contenus.findIndex((c) => c._id === contenuId);
      if (currentIndex < contenus.length - 1) {
        const nextContent = contenus[currentIndex + 1];
        if (nextContent && nextContent._id) {
          completionTimeoutsRef.current = setTimeout(() => {
            navigate(`/student/learn/${courseId}/contenu/${nextContent._id}`);
          }, 2000);
        }
      } else {
        setUiState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message: '🎊 Félicitations ! Vous avez terminé ce cours !',
            severity: 'success',
          },
        }));
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la complétion', error);
      setUiState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: 'Erreur lors de la mise à jour. Réessayez.',
          severity: 'error',
        },
        completing: false,
      }));
    }
  }, [contenuId, contenus, courseId, navigate, headers, uiState.completing]);

  const handleVideoEnd = useCallback(() => {
    if (!isCompleted && contenu?.type === 'video') {
      logger.info('🎬 Fin de vidéo détectée, marquage automatique');
      handleComplete();
    }
  }, [isCompleted, contenu?.type, handleComplete]);

  const currentIndex = useMemo(
    () => contenus.findIndex((c) => c._id === contenuId),
    [contenus, contenuId]
  );

  const navigateToContent = useCallback(
    (direction) => {
      const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < contenus.length) {
        const targetContent = contenus[newIndex];
        if (targetContent && targetContent._id) {
          navigate(`/student/learn/${courseId}/contenu/${targetContent._id}`);
        } else {
          logger.error('Contenu cible invalide pour la navigation', targetContent);
        }
      } else {
        logger.warn(`Navigation ${direction} impossible: index ${newIndex} hors limites`);
      }
    },
    [currentIndex, contenus, courseId, navigate]
  );

  const stats = useMemo(() => {
    const validContenus = contenus.filter((c) => c.isValid !== false);
    const completed = validContenus.filter((c) => c.isCompleted).length;
    const total = validContenus.length;
    const remaining = total - completed;
    const estimatedTime = remaining * 10;

    return {
      completed,
      total,
      remaining,
      estimatedTime,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [contenus]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setUiState((prev) => ({ ...prev, mobileSidebarOpen: !prev.mobileSidebarOpen }));
    } else {
      setUiState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
    }
  }, [isMobile]);

  const handleSnackbarClose = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      snackbar: { ...prev.snackbar, open: false },
    }));
  }, []);

  // ✅ FONCTION RENDER CONTENT CORRIGÉE POUR TOUS LES TYPES
  const renderContent = () => {
    if (!contenu) {
      return (
        <Box
          sx={{
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: colors.surface,
            borderRadius: '20px',
            border: `1px solid ${colors.warning}30`,
            color: 'white',
            textAlign: 'center',
            p: 4,
          }}
        >
          <HelpCircleIcon sx={{ fontSize: 64, color: colors.warning, mb: 3 }} />
          <Typography variant='h4' sx={{ mb: 2, fontWeight: 600 }}>
            Contenu non disponible
          </Typography>
          <Typography color={colors.text.muted}>
            Le contenu demandé n'est pas disponible ou a été supprimé.
          </Typography>
        </Box>
      );
    }

    // ✅ GESTION DE TOUS LES TYPES DE CONTENU
    switch (contenu.type) {
      case 'video':
        return (
          <Box sx={{ height: { xs: 300, sm: 400, md: 500, lg: 600 } }}>
            <VideoPlayer videoUrl={contenu.url} onEnded={handleVideoEnd} autoComplete={true} />
          </Box>
        );

      case 'document':
        return (
          <Box sx={{ height: { xs: 500, sm: 600, md: 700, lg: 800 } }}>
            <DocumentViewer documentUrl={contenu.url} onComplete={handleComplete} />
          </Box>
        );

      case 'texte':
        return (
          <Box sx={{ height: { xs: 500, sm: 600, md: 700, lg: 800 } }}>
            <TextViewer
              content={contenu.contenu || contenu.url}
              title={contenu.titre}
              onComplete={handleComplete}
            />
          </Box>
        );

      case 'quiz':
        return (
          <Box sx={{ height: { xs: 500, sm: 600, md: 700, lg: 800 } }}>
            <QuizComponent
              questions={contenu.questions}
              title={contenu.titre}
              onComplete={handleComplete}
            />
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: colors.surface,
              borderRadius: '20px',
              border: `1px solid ${colors.warning}30`,
              color: 'white',
              textAlign: 'center',
              p: 4,
            }}
          >
            <WarningIcon sx={{ fontSize: 64, color: colors.warning, mb: 3 }} />
            <Typography variant='h4' sx={{ mb: 2, fontWeight: 600 }}>
              Type de contenu non supporté
            </Typography>
            <Typography color={colors.text.muted} sx={{ mb: 3 }}>
              Le type "{contenu.type}" n'est pas encore supporté par le lecteur.
            </Typography>
            <Typography variant='body2' color={colors.text.muted} sx={{ mb: 3 }}>
              Type original: {contenu.originalType} - URL: {contenu.url}
            </Typography>
            <Button
              variant='contained'
              onClick={handleComplete}
              disabled={uiState.completing}
              sx={{
                bgcolor: colors.secondary,
                '&:hover': { bgcolor: colors.primary },
              }}
            >
              {uiState.completing ? 'Marquage...' : 'Marquer comme terminé'}
            </Button>
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`,
          color: colors.text.primary,
          gap: 4,
          p: 3,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CircularProgress
            size={isSmallMobile ? 80 : 120}
            thickness={3}
            sx={{
              color: colors.secondary,
            }}
          />
        </Box>
        <Box textAlign='center'>
          <Typography variant={isSmallMobile ? 'h5' : 'h4'} fontWeight={700} sx={{ mb: 2 }}>
            Chargement du cours...
          </Typography>
          <Typography color={colors.text.muted}>
            Préparation de votre expérience d'apprentissage
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`,
          color: colors.text.primary,
          textAlign: 'center',
          p: 3,
        }}
      >
        <Box
          sx={{
            width: isSmallMobile ? 100 : 140,
            height: isSmallMobile ? 100 : 140,
            borderRadius: '50%',
            bgcolor: `${colors.error}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <WarningIcon
            sx={{
              fontSize: isSmallMobile ? 50 : 70,
              color: colors.error,
            }}
          />
        </Box>
        <Typography variant={isSmallMobile ? 'h4' : 'h3'} fontWeight={800} sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Typography color={colors.text.secondary} sx={{ mb: 4, maxWidth: 500 }}>
          Nous n'avons pas pu charger ce cours. Vérifiez votre connexion ou réessayez.
        </Typography>
        <Stack direction={isSmallMobile ? 'column' : 'row'} spacing={2}>
          <Button
            onClick={() => window.location.reload()}
            variant='contained'
            size='large'
            sx={{
              bgcolor: colors.secondary,
              px: 4,
              '&:hover': { bgcolor: colors.primary },
            }}
          >
            Actualiser la page
          </Button>
          <Button
            onClick={() => navigate('/student/courses')}
            variant='outlined'
            size='large'
            sx={{
              borderColor: colors.text.muted,
              color: colors.text.primary,
              px: 4,
              '&:hover': { borderColor: colors.secondary },
            }}
          >
            Mes cours
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
          py: 0,
        }}
      >
        <Fade in timeout={1000}>
          <Box>
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                background: `linear-gradient(135deg, ${colors.surface}ee, ${colors.background}ee)`,
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${colors.text.muted}20`,
                p: { xs: 2, sm: 3 },
                zIndex: 1000,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent='space-between'
                alignItems='center'
                spacing={3}
              >
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Button
                    startIcon={<ArrowLeftIcon />}
                    onClick={() => navigate(`/student/course/${courseId}`)}
                    sx={{
                      color: colors.text.primary,
                      border: `1px solid ${colors.text.muted}30`,
                      borderRadius: '12px',
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                    }}
                  >
                    Retour au cours
                  </Button>

                  {isMobile && (
                    <IconButton
                      onClick={toggleSidebar}
                      sx={{
                        color: colors.text.primary,
                        bgcolor: colors.surface,
                        border: `1px solid ${colors.text.muted}30`,
                      }}
                    >
                      {uiState.mobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                  )}
                </Stack>

                <Box
                  sx={{
                    textAlign: 'center',
                    flex: 1,
                    minWidth: isMobile ? '100%' : 400,
                  }}
                >
                  <Typography
                    variant={isSmallMobile ? 'h6' : 'h5'}
                    color={colors.text.primary}
                    fontWeight={700}
                    sx={{ mb: 2 }}
                    noWrap
                  >
                    {course?.titre || 'Cours'}
                  </Typography>

                  <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      sx={{ mb: 1 }}
                    >
                      <Typography variant='body2' color={colors.text.muted}>
                        Progression globale
                      </Typography>
                      <Typography variant='body2' color={colors.text.primary} fontWeight={600}>
                        {Math.round(progress)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant='determinate'
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${colors.text.muted}20`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </Box>

                {!isMobile && (
                  <Stack direction='row' spacing={2}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        background: colors.surface,
                        border: `1px solid ${colors.text.muted}20`,
                        borderRadius: '12px',
                      }}
                    >
                      <BarChart3Icon sx={{ fontSize: 24, color: colors.success }} />
                      <Box>
                        <Typography variant='caption' color={colors.text.muted}>
                          Complétés
                        </Typography>
                        <Typography variant='h6' color={colors.text.primary} fontWeight={700}>
                          {stats.completed}/{stats.total}
                        </Typography>
                      </Box>
                    </Paper>
                  </Stack>
                )}
              </Stack>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 4,
                p: { xs: 2, sm: 3 },
                minHeight: 'calc(100vh - 140px)',
              }}
            >
              {((!isMobile && uiState.sidebarOpen) || (isMobile && uiState.mobileSidebarOpen)) && (
                <Box
                  sx={{
                    width: { xs: '100%', lg: 400 },
                    flexShrink: 0,
                    position: isMobile && uiState.mobileSidebarOpen ? 'fixed' : 'relative',
                    top: isMobile && uiState.mobileSidebarOpen ? 0 : 'auto',
                    left: isMobile && uiState.mobileSidebarOpen ? 0 : 'auto',
                    zIndex: isMobile && uiState.mobileSidebarOpen ? 1200 : 1,
                    height: isMobile && uiState.mobileSidebarOpen ? '100vh' : 'auto',
                    background:
                      isMobile && uiState.mobileSidebarOpen ? colors.background : 'transparent',
                  }}
                >
                  <Card
                    sx={{
                      background: colors.surface,
                      border: `1px solid ${colors.text.muted}20`,
                      borderRadius: '16px',
                      maxHeight:
                        isMobile && uiState.mobileSidebarOpen ? '100vh' : 'calc(100vh - 200px)',
                      overflow: 'hidden',
                    }}
                  >
                    <CardContent
                      sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      {isMobile && uiState.mobileSidebarOpen && (
                        <>
                          <Stack
                            direction='row'
                            justifyContent='space-between'
                            alignItems='center'
                            sx={{ mb: 3 }}
                          >
                            <Typography
                              variant='h6'
                              color={colors.text.primary}
                              sx={{ fontWeight: 700 }}
                            >
                              Parcours d'apprentissage
                            </Typography>
                            <Chip
                              label={`${stats.completed}/${stats.total}`}
                              size='small'
                              sx={{
                                bgcolor: `${colors.success}20`,
                                color: colors.success,
                                fontWeight: 600,
                              }}
                            />
                          </Stack>
                          <Divider sx={{ mb: 3, borderColor: colors.text.muted }} />
                        </>
                      )}

                      <List sx={{ overflow: 'auto', flex: 1 }}>
                        {contenus.map((content, index) => (
                          <ListItem
                            key={content._id}
                            sx={{
                              p: 2,
                              mb: 1,
                              borderRadius: '12px',
                              background:
                                content._id === contenuId ? `${colors.secondary}15` : 'transparent',
                              border: `1px solid ${
                                content._id === contenuId ? colors.secondary : colors.text.muted
                              }30`,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: `${colors.secondary}10`,
                                transform: 'translateX(4px)',
                              },
                            }}
                            onClick={() => {
                              navigate(`/student/learn/${courseId}/contenu/${content._id}`);
                              if (isMobile) {
                                setUiState((prev) => ({ ...prev, mobileSidebarOpen: false }));
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {content.isCompleted ? (
                                <CheckCircleIcon sx={{ color: colors.success }} />
                              ) : (
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor:
                                      content._id === contenuId
                                        ? colors.secondary
                                        : colors.text.muted,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  {index + 1}
                                </Box>
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  color={
                                    content._id === contenuId
                                      ? colors.text.primary
                                      : colors.text.secondary
                                  }
                                  fontWeight={content._id === contenuId ? 600 : 500}
                                >
                                  {content.titre}
                                </Typography>
                              }
                              secondary={
                                <Stack
                                  direction='row'
                                  spacing={1}
                                  alignItems='center'
                                  sx={{ mt: 0.5 }}
                                >
                                  <Chip
                                    label={content.type.toUpperCase()}
                                    size='small'
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      bgcolor:
                                        content.type === 'video'
                                          ? `${colors.secondary}20`
                                          : content.type === 'quiz'
                                            ? `${colors.warning}20`
                                            : content.type === 'texte'
                                              ? `${colors.info}20`
                                              : `${colors.primary}20`,
                                      color:
                                        content.type === 'video'
                                          ? colors.secondary
                                          : content.type === 'quiz'
                                            ? colors.warning
                                            : content.type === 'texte'
                                              ? colors.info
                                              : colors.primary,
                                    }}
                                  />
                                  {process.env.NODE_ENV === 'development' &&
                                    content.originalType && (
                                      <Chip
                                        label={content.originalType}
                                        size='small'
                                        variant='outlined'
                                        sx={{
                                          height: 20,
                                          fontSize: '0.6rem',
                                        }}
                                      />
                                    )}
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              )}

              <Card
                sx={{
                  flex: 1,
                  background: colors.surface,
                  border: `1px solid ${colors.text.muted}20`,
                  borderRadius: '16px',
                  p: 4,
                }}
              >
                <Stack spacing={4} sx={{ height: '100%' }}>
                  <Box>
                    <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
                      <Chip
                        label={contenu?.type?.toUpperCase() || 'CONTENU'}
                        sx={{
                          bgcolor: colors.secondary,
                          color: 'white',
                          fontWeight: 700,
                        }}
                      />
                      {isCompleted && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label='TERMINÉ'
                          sx={{
                            bgcolor: `${colors.success}20`,
                            color: colors.success,
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {process.env.NODE_ENV === 'development' && contenu?.originalType && (
                        <Chip
                          label={`Original: ${contenu.originalType}`}
                          size='small'
                          variant='outlined'
                          sx={{
                            color: colors.text.muted,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant='h4'
                      color={colors.text.primary}
                      fontWeight={800}
                      sx={{ mb: 2 }}
                    >
                      {contenu?.titre}
                    </Typography>

                    {contenu?.description && (
                      <Typography
                        variant='body1'
                        color={colors.text.secondary}
                        sx={{ lineHeight: 1.6 }}
                      >
                        {contenu.description}
                      </Typography>
                    )}

                    {process.env.NODE_ENV === 'development' && contenu?.url && (
                      <Typography
                        variant='caption'
                        color={colors.text.muted}
                        sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}
                      >
                        URL: {contenu.url}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ borderColor: colors.text.muted }} />

                  <Box sx={{ flex: 1, minHeight: 0 }}>{renderContent()}</Box>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent='space-between'
                    alignItems='center'
                    spacing={3}
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: colors.background,
                      border: `1px solid ${colors.text.muted}20`,
                      mt: 'auto',
                    }}
                  >
                    <Button
                      startIcon={<ArrowLeftIcon />}
                      onClick={() => navigateToContent('prev')}
                      disabled={currentIndex === 0}
                      sx={{
                        color: colors.text.primary,
                        border: `1px solid ${colors.text.muted}30`,
                        borderRadius: '8px',
                        px: 3,
                        minWidth: { xs: '100%', sm: 140 },
                      }}
                    >
                      Précédent
                    </Button>

                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      {!isCompleted && contenu?.type !== 'quiz' && (
                        <Button
                          onClick={handleComplete}
                          disabled={uiState.completing}
                          startIcon={
                            uiState.completing ? (
                              <CircularProgress size={20} sx={{ color: 'white' }} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                          sx={{
                            bgcolor: colors.secondary,
                            color: 'white',
                            borderRadius: '8px',
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            '&:hover': {
                              bgcolor: colors.primary,
                            },
                            width: { xs: '100%', sm: 'auto' },
                          }}
                        >
                          {uiState.completing ? 'Marquage...' : 'Marquer comme terminé'}
                        </Button>
                      )}
                    </Box>

                    <Button
                      endIcon={<ArrowRightIcon />}
                      onClick={() => navigateToContent('next')}
                      disabled={currentIndex === contenus.length - 1}
                      sx={{
                        color: colors.text.primary,
                        border: `1px solid ${colors.text.muted}30`,
                        borderRadius: '8px',
                        px: 3,
                        minWidth: { xs: '100%', sm: 140 },
                      }}
                    >
                      Suivant
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Box>
          </Box>
        </Fade>
      </Container>

      <Snackbar
        open={uiState.snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={uiState.snackbar.severity} variant='filled' sx={{ borderRadius: '8px' }}>
          {uiState.snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(CoursePlayer);
