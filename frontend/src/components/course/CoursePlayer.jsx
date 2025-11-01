// CoursePlayer.jsx - VERSION PROFESSIONNELLE COMPLÈTE
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
  Help as HelpCircleIcon,
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
} from '@mui/icons-material';
import axios from 'axios';

// === CONFIGURATION AVANCÉE ===
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
    box-shadow: 0 0 0 12px rgba(241, 53, 68, 0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const float = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-20px) rotate(5deg); 
  }
`;

// === SYSTÈME DE DESIGN PROFESSIONNEL ===
const colors = {
  // Couleurs principales
  navy: '#010b40',
  darkNavy: '#00072d',
  deepSpace: '#0a0f2d',
  spaceBlue: '#1a237e',

  // Accents
  red: '#f13544',
  redLight: '#ff6b74',
  redDark: '#c71f2e',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',

  // États
  success: '#10b981',
  successLight: '#34d399',
  successDark: '#047857',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  infoLight: '#60a5fa',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  glassLight: 'rgba(255, 255, 255, 0.12)',
  glassExtra: 'rgba(255, 255, 255, 0.05)',

  // Bordures
  border: 'rgba(241, 53, 68, 0.25)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderDark: 'rgba(1, 11, 64, 0.5)',

  // Texte
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.85)',
    muted: 'rgba(255, 255, 255, 0.65)',
    disabled: 'rgba(255, 255, 255, 0.4)',
    inverse: '#010b40',
  },
};

// === STYLED COMPONENTS PROFESSIONNELS ===
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(25px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '28px',
  padding: theme.spacing(4),
  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
  boxShadow: `
    0 25px 50px ${colors.navy}40,
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 1px 0 0 rgba(255, 255, 255, 0.1) inset
  `,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${colors.red}, transparent)`,
    animation: `${shimmer} 3s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `linear-gradient(45deg, 
      transparent 0%, 
      ${colors.red}08 50%, 
      transparent 100%
    )`,
    animation: `${float} 6s ease-in-out infinite`,
    pointerEvents: 'none',
  },
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `
      0 35px 70px ${colors.navy}60,
      0 0 0 1px rgba(255, 255, 255, 0.12) inset
    `,
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    borderRadius: '20px',
  },
}));

const SidebarCard = styled(Card)(({ theme, mobileopen }) => ({
  background: `linear-gradient(135deg, ${colors.glassLight}, ${colors.glassDark})`,
  backdropFilter: 'blur(25px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '24px',
  animation: `${slideInLeft} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
  boxShadow: `
    0 15px 40px ${colors.navy}50,
    0 0 0 1px rgba(255, 255, 255, 0.06) inset
  `,
  maxHeight: mobileopen ? '80vh' : 'calc(100vh - 200px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('lg')]: {
    position: mobileopen ? 'fixed' : 'relative',
    top: mobileopen ? 0 : 'auto',
    left: mobileopen ? 0 : 'auto',
    width: mobileopen ? '100vw' : '100%',
    height: mobileopen ? '100vh' : 'auto',
    maxHeight: mobileopen ? '100vh' : '500px',
    zIndex: mobileopen ? 1300 : 1,
    borderRadius: mobileopen ? 0 : '24px',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: colors.text.primary,
  borderRadius: '14px',
  padding: '14px 32px',
  fontWeight: 600,
  fontSize: '0.95rem',
  border: `1px solid ${colors.border}`,
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(15px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${colors.red}20, transparent)`,
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    backgroundColor: `${colors.red}15`,
    borderColor: colors.red,
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 25px ${colors.red}25`,
    '&::before': {
      left: '100%',
    },
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 24px',
    fontSize: '0.9rem',
  },
}));

const CompleteButton = styled(Button)(({ completed, theme }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}, ${colors.successLight})`
    : `linear-gradient(135deg, ${colors.red}, ${colors.redLight})`,
  color: colors.text.primary,
  borderRadius: '14px',
  padding: '16px 40px',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  animation: completed ? 'none' : `${pulse} 2s infinite`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: completed ? `0 12px 30px ${colors.success}40` : `0 12px 30px ${colors.red}40`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: completed ? `0 20px 45px ${colors.success}50` : `0 20px 45px ${colors.red}50`,
    '&::before': {
      opacity: 1,
    },
  },
  '&:disabled': {
    opacity: 0.7,
    transform: 'none',
    animation: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '14px 32px',
    fontSize: '0.95rem',
  },
}));

const ContentListItem = styled(ListItem)(({ selected, completed, theme }) => ({
  borderRadius: '16px',
  marginBottom: '12px',
  padding: '16px 20px',
  background: selected
    ? `linear-gradient(135deg, ${colors.red}20, ${colors.red}08)`
    : 'transparent',
  border: selected ? `1px solid ${colors.red}40` : `1px solid ${colors.borderLight}30`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    borderRadius: '0 4px 4px 0',
    background: completed
      ? `linear-gradient(180deg, ${colors.success}, ${colors.successLight})`
      : selected
        ? `linear-gradient(180deg, ${colors.red}, ${colors.redLight})`
        : 'transparent',
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    background: selected
      ? `linear-gradient(135deg, ${colors.red}25, ${colors.red}12)`
      : `${colors.glass}`,
    borderColor: selected ? colors.red : colors.borderLight,
    transform: 'translateX(8px)',
    boxShadow: `0 8px 20px ${colors.navy}30`,
  },
  '&:active': {
    transform: 'translateX(4px) scale(0.98)',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(15px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '18px',
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-5px)',
    borderColor: colors.red,
    boxShadow: `0 15px 35px ${colors.navy}40`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    gap: theme.spacing(2),
  },
}));

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
        logger.info(`Chargement du cours: ${courseId}`);

        // 1. Chargement des données du cours
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, {
          headers,
          timeout: 15000,
        });

        const courseData = courseResponse.data?.data || courseResponse.data;

        if (!courseData) {
          throw new Error('Données du cours non disponibles');
        }

        logger.info('Cours chargé avec succès', { titre: courseData.titre });

        // 2. Extraction et normalisation des contenus
        let contenusData = await extractAndNormalizeContents(courseData, courseId, headers);

        if (contenusData.length === 0) {
          throw new Error('Aucun contenu disponible pour ce cours');
        }

        logger.info(`Contenus normalisés: ${contenusData.length} éléments`);

        // 3. Sélection du contenu actuel
        const currentContent = findCurrentContent(contenusData, contenuId, courseId, navigate);

        // 4. Chargement de la progression
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

        logger.info('Initialisation terminée avec succès');
      } catch (error) {
        logger.error('Erreur lors du chargement des données', error);

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

// === FONCTIONS UTILITAIRES AVANCÉES ===
const extractAndNormalizeContents = async (courseData, courseId, headers) => {
  let contenusData = [];

  try {
    // Stratégie 1: Contenus dans la structure du cours
    if (courseData.contenu?.sections) {
      contenusData = courseData.contenu.sections.flatMap((section, sectionIndex) =>
        (section.modules || section.contenus || []).map((module, moduleIndex) => ({
          ...module,
          _id: module._id || `section-${sectionIndex}-module-${moduleIndex}`,
          sectionTitre: section.titre,
          sectionOrdre: sectionIndex + 1,
          ordre: module.ordre || moduleIndex + 1,
          type: determineContentType(module),
        }))
      );
    }

    // Stratégie 2: Chargement via API dédiée (fallback)
    if (contenusData.length === 0) {
      const endpoints = [
        `${API_BASE_URL}/courses/${courseId}/contenus`,
        `${API_BASE_URL}/contenus?courseId=${courseId}`,
        `${API_BASE_URL}/courses/contenu?courseId=${courseId}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, { headers, timeout: 8000 });
          const data = response.data?.data || response.data;
          if (Array.isArray(data) && data.length > 0) {
            contenusData = data;
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }

    // Normalisation finale
    return contenusData
      .map((content, index) => ({
        _id: content._id || content.id || `content-${index}`,
        titre: content.titre || content.title || content.nom || `Contenu ${index + 1}`,
        type: content.type || determineContentType(content),
        url: content.url || content.contenuUrl || content.fileUrl || content.videoUrl,
        description: content.description || content.desc || '',
        duration: content.duree || content.duration || content.temps,
        questions: content.questions || [],
        isCompleted: Boolean(content.isCompleted || content.completed || content.estTermine),
        ordre: content.ordre || content.order || index + 1,
        sectionTitre: content.sectionTitre || content.section,
        metadata: content.metadata || {},
      }))
      .sort((a, b) => a.ordre - b.ordre);
  } catch (error) {
    logger.error('Erreur lors de la normalisation des contenus', error);
    return [];
  }
};

const determineContentType = (content) => {
  if (content.type) return content.type;
  if (content.questions && Array.isArray(content.questions)) return 'quiz';
  if (content.url?.includes('.mp4') || content.url?.includes('.webm')) return 'video';
  if (content.url?.includes('.pdf') || content.url?.includes('.doc')) return 'document';
  return 'document';
};

const findCurrentContent = (contenus, contenuId, courseId, navigate) => {
  let current = contenuId ? contenus.find((c) => c._id === contenuId) : contenus[0];

  if (!current && contenus.length > 0) {
    current = contenus[0];
    navigate(`/student/learn/${courseId}/contenu/${current._id}`, { replace: true });
  }

  return current;
};

const loadProgress = async (courseId, headers, contenus) => {
  try {
    const endpoints = [
      `${API_BASE_URL}/learning/progress/${courseId}`,
      `${API_BASE_URL}/progress/${courseId}`,
      `${API_BASE_URL}/courses/${courseId}/progress`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { headers, timeout: 5000 });
        const data = response.data?.data || response.data;
        const progress = data?.pourcentage || data?.progress || data?.percentage;
        if (progress !== undefined) return Math.min(100, Math.max(0, progress));
      } catch (error) {
        continue;
      }
    }

    // Fallback: calcul basé sur les contenus complétés
    const completedCount = contenus.filter((c) => c.isCompleted).length;
    return contenus.length > 0 ? Math.round((completedCount / contenus.length) * 100) : 0;
  } catch (error) {
    logger.warn('Erreur lors du chargement de la progression, utilisation du fallback');
    const completedCount = contenus.filter((c) => c.isCompleted).length;
    return contenus.length > 0 ? Math.round((completedCount / contenus.length) * 100) : 0;
  }
};

const getErrorMessage = (error) => {
  if (error.response?.status === 404) {
    return 'Cours ou contenu non trouvé';
  }
  if (error.response?.status === 401) {
    return 'Session expirée - Veuillez vous reconnecter';
  }
  if (error.response?.status === 403) {
    return 'Accès non autorisé à ce cours';
  }
  return error.response?.data?.message || error.message || 'Une erreur est survenue';
};

// === COMPOSANT LECTEUR VIDÉO PROFESSIONNEL ===
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
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const controlsTimeoutRef = useRef();

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          logger.error('Erreur lors de la lecture vidéo', error);
          setPlayerState((prev) => ({ ...prev, hasError: true }));
        });
      }
      setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  }, [playerState.isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setPlayerState((prev) => ({ ...prev, currentTime, duration }));

      // Rapport de progression
      if (onProgress && duration > 0) {
        const progress = (currentTime / duration) * 100;
        onProgress(progress);
      }

      // Auto-complétion à 95%
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
  }, []);

  const handleError = useCallback(() => {
    logger.error('Erreur de chargement vidéo', { url: videoUrl });
    setPlayerState((prev) => ({ ...prev, hasError: true, isLoading: false }));
  }, [videoUrl]);

  const handleSeek = useCallback(
    (event) => {
      if (videoRef.current) {
        const rect = event.currentTarget.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = percent * playerState.duration;
      }
    },
    [playerState.duration]
  );

  const handleVolumeChange = useCallback((event) => {
    const volume = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setPlayerState((prev) => ({ ...prev, volume, isMuted: volume === 0 }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const isMuted = !playerState.isMuted;
      videoRef.current.muted = isMuted;
      setPlayerState((prev) => ({ ...prev, isMuted }));
    }
  }, [playerState.isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const skip = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const showControls = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, showControls: true }));
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState.isPlaying) {
        setPlayerState((prev) => ({ ...prev, showControls: false }));
      }
    }, 3000);
  }, [playerState.isPlaying]);

  useEffect(() => {
    return () => {
      clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  if (playerState.hasError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? 300 : 500,
          bgcolor: colors.glassDark,
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
        <Typography color={colors.text.muted} sx={{ mb: 3 }}>
          Impossible de charger la vidéo. Vérifiez votre connexion.
        </Typography>
        <Button
          variant='contained'
          onClick={() => window.open(videoUrl, '_blank')}
          sx={{ bgcolor: colors.red }}
        >
          Ouvrir dans un nouvel onglet
        </Button>
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
        boxShadow: `0 20px 60px ${colors.navy}80`,
      }}
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onClick={togglePlay}
    >
      {/* Vidéo */}
      <video
        ref={videoRef}
        src={videoUrl}
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
      />

      {/* Overlay de chargement */}
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
          <CircularProgress size={60} thickness={4} sx={{ color: colors.red }} />
        </Box>
      )}

      {/* Overlay de lecture */}
      <Fade in={!playerState.isPlaying && !playerState.isLoading}>
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
              bgcolor: `${colors.red}dd`,
              color: 'white',
              width: isMobile ? 80 : 100,
              height: isMobile ? 80 : 100,
              backdropFilter: 'blur(10px)',
              animation: `${pulse} 2s infinite`,
              '&:hover': {
                bgcolor: colors.red,
                transform: 'scale(1.1)',
              },
            }}
          >
            <PlayIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
          </IconButton>
        </Box>
      </Fade>

      {/* Contrôles avancés */}
      <Fade in={playerState.showControls || !playerState.isPlaying}>
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
          {/* Barre de progression principale */}
          <Box
            sx={{
              width: '100%',
              height: 6,
              bgcolor: 'rgba(255,255,255,0.3)',
              borderRadius: 3,
              cursor: 'pointer',
              mb: 3,
              position: 'relative',
              '&:hover': { height: 8 },
            }}
            onClick={handleSeek}
          >
            <Box
              sx={{
                width: `${(playerState.currentTime / playerState.duration) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${colors.red}, ${colors.purple})`,
                borderRadius: 3,
                position: 'relative',
                transition: 'width 0.1s ease',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: `${(playerState.currentTime / playerState.duration) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'white',
                boxShadow: `0 0 10px ${colors.red}`,
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }}
              className='progress-thumb'
            />
          </Box>

          {/* Contrôles principaux */}
          <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
            {/* Groupe gauche */}
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title={playerState.isPlaying ? 'Pause' : 'Lecture'}>
                <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                  {playerState.isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title='Reculer 10s'>
                <IconButton onClick={() => skip(-10)} sx={{ color: 'white' }}>
                  <ReplayIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title='Avancer 10s'>
                <IconButton onClick={() => skip(10)} sx={{ color: 'white' }}>
                  <SkipNextIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={playerState.isMuted ? 'Activer le son' : 'Désactiver le son'}>
                <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
                  {playerState.isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
              </Tooltip>

              <Box sx={{ width: 80, display: { xs: 'none', sm: 'block' } }}>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={playerState.volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: '100%',
                    accentColor: colors.red,
                  }}
                />
              </Box>

              <Typography variant='body2' color='white' sx={{ minWidth: 100 }}>
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </Typography>
            </Stack>

            {/* Groupe droite */}
            <Stack direction='row' spacing={1}>
              <Tooltip title='Télécharger'>
                <IconButton onClick={() => window.open(videoUrl, '_blank')} sx={{ color: 'white' }}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title='Plein écran'>
                <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                  <MaximizeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Fade>
    </Box>
  );
});

// === COMPOSANT PRINCIPAL COURSE PLAYER ===
const CoursePlayer = () => {
  const { courseId, contenuId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Gestionnaire d'authentification
  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : null;
  }, []);

  // État global avec notre hook personnalisé
  const courseData = useCourseData(courseId, contenuId, headers);
  const { course, contenu, contenus, progress, loading, error, isCompleted } = courseData;

  // États d'interface
  const [uiState, setUiState] = useState({
    snackbar: { open: false, message: '', severity: 'info' },
    completing: false,
    sidebarOpen: false,
    confirmDialog: { open: false, action: null, title: '', message: '' },
  });

  // Références
  const completionTimeoutsRef = useRef();

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (completionTimeoutsRef.current) {
        clearTimeout(completionTimeoutsRef.current);
      }
    };
  }, []);

  // Gestionnaire de complétion avancé
  const handleComplete = useCallback(async () => {
    if (uiState.completing || isCompleted || !headers || !contenuId) return;

    setUiState((prev) => ({ ...prev, completing: true }));

    try {
      logger.info(`Début de la complétion du contenu: ${contenuId}`);

      // Essayer plusieurs endpoints de complétion
      const endpoints = [
        {
          url: `${API_BASE_URL}/courses/contenu/${contenuId}/complete`,
          method: 'PUT',
        },
        {
          url: `${API_BASE_URL}/contenus/${contenuId}/complete`,
          method: 'PUT',
        },
        {
          url: `${API_BASE_URL}/learning/complete`,
          method: 'POST',
          data: { contenuId, courseId },
        },
      ];

      let success = false;
      for (const endpoint of endpoints) {
        try {
          const response = await axios({
            method: endpoint.method,
            url: endpoint.url,
            data: endpoint.data || {},
            headers,
            timeout: 10000,
          });

          if (response.status === 200 || response.status === 201) {
            success = true;
            logger.info(`Complétion réussie via: ${endpoint.url}`);
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!success) {
        logger.warn('Aucun endpoint de complétion disponible, mise à jour locale uniquement');
      }

      // Mise à jour optimiste de l'interface
      courseData.contenu.isCompleted = true;

      setUiState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: '🎉 Contenu terminé avec succès !',
          severity: 'success',
        },
        completing: false,
      }));

      // Navigation automatique après délai
      const currentIndex = contenus.findIndex((c) => c._id === contenuId);
      if (currentIndex < contenus.length - 1) {
        completionTimeoutsRef.current = setTimeout(() => {
          navigate(`/student/learn/${courseId}/contenu/${contenus[currentIndex + 1]._id}`);
        }, 2000);
      }
    } catch (error) {
      logger.error('Erreur lors de la complétion', error);
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
  }, [contenuId, contenus, courseId, navigate, headers, uiState.completing, isCompleted]);

  // Gestionnaire de fin de vidéo
  const handleVideoEnd = useCallback(() => {
    if (!isCompleted && contenu?.type === 'video') {
      handleComplete();
    }
  }, [isCompleted, contenu?.type, handleComplete]);

  // Navigation entre contenus
  const currentIndex = useMemo(
    () => contenus.findIndex((c) => c._id === contenuId),
    [contenus, contenuId]
  );

  const navigateToContent = useCallback(
    (direction) => {
      const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex >= 0 && newIndex < contenus.length) {
        navigate(`/student/learn/${courseId}/contenu/${contenus[newIndex]._id}`);
      }
    },
    [currentIndex, contenus, courseId, navigate]
  );

  // Statistiques calculées
  const stats = useMemo(() => {
    const completed = contenus.filter((c) => c.isCompleted).length;
    const total = contenus.length;
    const remaining = total - completed;
    const estimatedTime = remaining * 10; // 10 minutes estimées par contenu

    return { completed, total, remaining, estimatedTime };
  }, [contenus]);

  // Gestionnaire de sidebar mobile
  const toggleSidebar = useCallback(() => {
    setUiState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  // Fermeture des notifications
  const handleSnackbarClose = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      snackbar: { ...prev.snackbar, open: false },
    }));
  }, []);

  // Rendu du chargement
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
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
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
              color: colors.red,
              animation: `${pulse} 2s infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <BookIcon
              sx={{
                fontSize: isSmallMobile ? 32 : 48,
                color: colors.red,
              }}
            />
          </Box>
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

  // Rendu des erreurs
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
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
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
              bgcolor: colors.red,
              px: 4,
              '&:hover': { bgcolor: colors.redLight },
            }}
          >
            Actualiser la page
          </Button>
          <Button
            onClick={() => navigate('/student/dashboard')}
            variant='outlined'
            size='large'
            sx={{
              borderColor: colors.border,
              color: colors.text.primary,
              px: 4,
              '&:hover': { borderColor: colors.red },
            }}
          >
            Tableau de bord
          </Button>
        </Stack>
      </Box>
    );
  }

  // Rendu principal
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Arrière-plan animé */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, ${colors.red}08, transparent 50%),
            radial-gradient(circle at 80% 70%, ${colors.purple}08, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

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
            {/* HEADER PROFESSIONNEL */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                background: `linear-gradient(135deg, ${colors.glassDark}, ${colors.navy}ee)`,
                backdropFilter: 'blur(30px)',
                borderBottom: `1px solid ${colors.border}`,
                p: { xs: 2, sm: 3 },
                zIndex: 1000,
                boxShadow: `0 8px 32px ${colors.navy}40`,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent='space-between'
                alignItems='center'
                spacing={3}
              >
                {/* Navigation et menu */}
                <Stack direction='row' spacing={2} alignItems='center'>
                  <NavButton
                    startIcon={<ArrowLeftIcon />}
                    onClick={() => navigate(`/student/course/${courseId}`)}
                  >
                    Retour au cours
                  </NavButton>

                  {isMobile && (
                    <IconButton
                      onClick={toggleSidebar}
                      sx={{
                        color: colors.text.primary,
                        bgcolor: colors.glass,
                        border: `1px solid ${colors.border}`,
                        '&:hover': {
                          bgcolor: `${colors.red}20`,
                          borderColor: colors.red,
                        },
                      }}
                    >
                      {uiState.sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                  )}
                </Stack>

                {/* Titre et progression */}
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
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: `${colors.red}15`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.purple})`,
                          borderRadius: 5,
                          transition: 'transform 0.4s ease',
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Statistiques rapides */}
                {!isMobile && (
                  <Stack direction='row' spacing={2}>
                    <StatsCard>
                      <BarChart3Icon sx={{ fontSize: 24, color: colors.success }} />
                      <Box>
                        <Typography variant='caption' color={colors.text.muted}>
                          Complétés
                        </Typography>
                        <Typography variant='h6' color={colors.text.primary} fontWeight={700}>
                          {stats.completed}/{stats.total}
                        </Typography>
                      </Box>
                    </StatsCard>

                    <StatsCard>
                      <ClockIcon sx={{ fontSize: 24, color: colors.info }} />
                      <Box>
                        <Typography variant='caption' color={colors.text.muted}>
                          Restant
                        </Typography>
                        <Typography variant='h6' color={colors.text.primary} fontWeight={700}>
                          {stats.estimatedTime}min
                        </Typography>
                      </Box>
                    </StatsCard>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* CONTENU PRINCIPAL */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 4,
                p: { xs: 2, sm: 3 },
                minHeight: 'calc(100vh - 140px)',
              }}
            >
              {/* SIDEBAR - Navigation des contenus */}
              {(!isMobile || uiState.sidebarOpen) && (
                <Box
                  sx={{
                    width: { xs: '100%', lg: 400 },
                    flexShrink: 0,
                    position: isMobile && uiState.sidebarOpen ? 'fixed' : 'relative',
                    top: isMobile && uiState.sidebarOpen ? 0 : 'auto',
                    left: isMobile && uiState.sidebarOpen ? 0 : 'auto',
                    zIndex: isMobile && uiState.sidebarOpen ? 1200 : 1,
                  }}
                >
                  <SidebarCard mobileopen={uiState.sidebarOpen}>
                    <CardContent
                      sx={{
                        p: { xs: 2, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      {/* En-tête sidebar */}
                      {isMobile && uiState.sidebarOpen && (
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
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                fontWeight: 700,
                              }}
                            >
                              <BookIcon sx={{ color: colors.red }} />
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
                          <Divider sx={{ mb: 3, borderColor: colors.borderLight }} />
                        </>
                      )}

                      {/* Liste des contenus */}
                      <List
                        sx={{
                          overflow: 'auto',
                          flex: 1,
                          '&::-webkit-scrollbar': {
                            width: '6px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '3px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: colors.red,
                            borderRadius: '3px',
                          },
                        }}
                      >
                        {contenus.map((content, index) => (
                          <ContentListItem
                            key={content._id}
                            selected={content._id === contenuId}
                            completed={content.isCompleted}
                            onClick={() => {
                              navigate(`/student/learn/${courseId}/contenu/${content._id}`);
                              if (isMobile) {
                                setUiState((prev) => ({ ...prev, sidebarOpen: false }));
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 52 }}>
                              {content.isCompleted ? (
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: `${colors.success}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `1px solid ${colors.success}30`,
                                  }}
                                >
                                  <CheckCircleIcon
                                    sx={{
                                      color: colors.success,
                                      fontSize: 20,
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor:
                                      content._id === contenuId ? `${colors.red}20` : colors.glass,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color:
                                      content._id === contenuId ? colors.red : colors.text.muted,
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    border: `1px solid ${
                                      content._id === contenuId ? colors.red : colors.borderLight
                                    }`,
                                    transition: 'all 0.3s ease',
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
                                  sx={{
                                    mb: 0.5,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {content.titre}
                                </Typography>
                              }
                              secondary={
                                <Stack direction='row' spacing={1} alignItems='center'>
                                  <Chip
                                    label={
                                      content.type === 'video'
                                        ? 'VIDÉO'
                                        : content.type === 'quiz'
                                          ? 'QUIZ'
                                          : 'DOCUMENT'
                                    }
                                    size='small'
                                    sx={{
                                      height: 22,
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      bgcolor:
                                        content.type === 'video'
                                          ? `${colors.purple}20`
                                          : content.type === 'quiz'
                                            ? `${colors.warning}20`
                                            : `${colors.info}20`,
                                      color:
                                        content.type === 'video'
                                          ? colors.purple
                                          : content.type === 'quiz'
                                            ? colors.warning
                                            : colors.info,
                                    }}
                                  />
                                  {content.duration && (
                                    <Typography
                                      variant='caption'
                                      color={colors.text.muted}
                                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                    >
                                      <ClockIcon sx={{ fontSize: 12 }} />
                                      {content.duration}
                                    </Typography>
                                  )}
                                </Stack>
                              }
                            />
                          </ContentListItem>
                        ))}
                      </List>

                      {/* Résumé de progression */}
                      <Box
                        sx={{
                          mt: 3,
                          p: 2.5,
                          borderRadius: '14px',
                          bgcolor: `${colors.success}10`,
                          border: `1px solid ${colors.success}25`,
                        }}
                      >
                        <Stack direction='row' alignItems='center' spacing={2}>
                          <TargetIcon sx={{ color: colors.success }} />
                          <Box flex={1}>
                            <Typography
                              variant='body2'
                              color={colors.text.primary}
                              fontWeight={600}
                              sx={{ mb: 0.5 }}
                            >
                              Objectif: {stats.remaining} contenu{stats.remaining > 1 ? 's' : ''}{' '}
                              restant{stats.remaining > 1 ? 's' : ''}
                            </Typography>
                            <Typography variant='caption' color={colors.text.muted}>
                              {stats.remaining === 0
                                ? '🎉 Félicitations ! Vous avez terminé !'
                                : 'Continuez vos efforts ! 💪'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </CardContent>
                  </SidebarCard>
                </Box>
              )}

              {/* ZONE DE CONTENU PRINCIPAL */}
              <GlassCard
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack spacing={4} sx={{ height: '100%' }}>
                  {/* En-tête du contenu */}
                  <Box>
                    <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2.5 }}>
                      <Chip
                        label={contenu?.type?.toUpperCase() || 'CONTENU'}
                        sx={{
                          bgcolor: colors.red,
                          color: colors.text.primary,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          px: 1,
                          height: 28,
                        }}
                      />
                      {isCompleted && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          label='TERMINÉ'
                          sx={{
                            bgcolor: `${colors.success}20`,
                            color: colors.success,
                            fontWeight: 700,
                            border: `1px solid ${colors.success}40`,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant={isSmallMobile ? 'h4' : 'h3'}
                      color={colors.text.primary}
                      fontWeight={800}
                      sx={{
                        mb: 2,
                        fontSize: {
                          xs: '1.75rem',
                          sm: '2.5rem',
                          md: '3rem',
                        },
                        lineHeight: 1.2,
                        background: `linear-gradient(135deg, ${colors.text.primary}, ${colors.text.secondary})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {contenu?.titre}
                    </Typography>

                    {contenu?.description && (
                      <Typography
                        variant='body1'
                        color={colors.text.secondary}
                        sx={{
                          lineHeight: 1.7,
                          fontSize: '1.1rem',
                        }}
                      >
                        {contenu.description}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ borderColor: colors.borderLight }} />

                  {/* Conteneur du média principal */}
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    {contenu?.type === 'video' && (
                      <VideoPlayer
                        videoUrl={contenu.url}
                        onEnded={handleVideoEnd}
                        autoComplete={true}
                      />
                    )}

                    {contenu?.type === 'document' && (
                      <Box
                        sx={{
                          height: { xs: 400, sm: 500, md: 600 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <DocumentViewer pdfUrl={contenu.url} />
                      </Box>
                    )}

                    {contenu?.type === 'quiz' && (
                      <Box sx={{ height: '100%', minHeight: 500 }}>
                        <QuizComponent questions={contenu.questions} onSubmit={handleComplete} />
                      </Box>
                    )}
                  </Box>

                  {/* Barre de navigation et actions */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent='space-between'
                    alignItems='center'
                    spacing={3}
                    sx={{
                      p: 3,
                      borderRadius: '18px',
                      bgcolor: colors.glass,
                      border: `1px solid ${colors.borderLight}`,
                      mt: 'auto',
                    }}
                  >
                    <NavButton
                      startIcon={<ArrowLeftIcon />}
                      onClick={() => navigateToContent('prev')}
                      disabled={currentIndex === 0}
                      sx={{
                        minWidth: { xs: '100%', sm: 140 },
                        order: { xs: 2, sm: 1 },
                      }}
                    >
                      Précédent
                    </NavButton>

                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        order: { xs: 1, sm: 2 },
                        width: { xs: '100%', sm: 'auto' },
                        mb: { xs: 2, sm: 0 },
                      }}
                    >
                      {!isCompleted && contenu?.type !== 'quiz' && (
                        <CompleteButton
                          onClick={handleComplete}
                          disabled={uiState.completing}
                          completed={false}
                          startIcon={
                            uiState.completing ? (
                              <CircularProgress size={20} sx={{ color: 'white' }} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          {uiState.completing ? 'Marquage...' : 'Marquer comme terminé'}
                        </CompleteButton>
                      )}

                      {isCompleted && (
                        <CompleteButton
                          completed={true}
                          disabled
                          startIcon={<AwardIcon />}
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          Contenu terminé
                        </CompleteButton>
                      )}
                    </Box>

                    <NavButton
                      endIcon={<ArrowRightIcon />}
                      onClick={() => navigateToContent('next')}
                      disabled={currentIndex === contenus.length - 1}
                      sx={{
                        minWidth: { xs: '100%', sm: 140 },
                        order: { xs: 3, sm: 3 },
                      }}
                    >
                      Suivant
                    </NavButton>
                  </Stack>
                </Stack>
              </GlassCard>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Système de notification */}
      <Snackbar
        open={uiState.snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert
          severity={uiState.snackbar.severity}
          variant='filled'
          sx={{
            borderRadius: '14px',
            boxShadow: `0 12px 40px ${colors.navy}60`,
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              fontSize: 28,
            },
          }}
        >
          {uiState.snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Composants manquants à implémenter (versions simplifiées pour l'exemple)
const DocumentViewer = ({ pdfUrl }) => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: colors.glassDark,
      borderRadius: '20px',
      border: `1px solid ${colors.borderLight}`,
      color: 'white',
      textAlign: 'center',
      p: 4,
    }}
  >
    <FileTextIcon sx={{ fontSize: 80, color: colors.red, mb: 3 }} />
    <Typography variant='h4' sx={{ mb: 2, fontWeight: 700 }}>
      Document PDF
    </Typography>
    <Typography color={colors.text.secondary} sx={{ mb: 4, maxWidth: 400 }}>
      Ce document est disponible en téléchargement
    </Typography>
    <Button
      variant='contained'
      size='large'
      startIcon={<DownloadIcon />}
      sx={{
        bgcolor: colors.red,
        px: 4,
        py: 1.5,
        fontSize: '1rem',
        fontWeight: 600,
        '&:hover': {
          bgcolor: colors.redLight,
        },
      }}
      onClick={() => window.open(pdfUrl, '_blank')}
    >
      Télécharger le document
    </Button>
  </Box>
);

const QuizComponent = ({ questions, onSubmit }) => (
  <Box
    sx={{
      p: 4,
      bgcolor: colors.glassDark,
      borderRadius: '20px',
      border: `1px solid ${colors.borderLight}`,
      color: 'white',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Typography variant='h4' sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
      Quiz de validation
    </Typography>
    <Typography color={colors.text.secondary} sx={{ mb: 4, textAlign: 'center' }}>
      Répondez aux questions pour valider vos connaissances
    </Typography>
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Button
        variant='contained'
        size='large'
        onClick={onSubmit}
        sx={{
          bgcolor: colors.red,
          px: 6,
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        Commencer le quiz
      </Button>
    </Box>
  </Box>
);

export default React.memo(CoursePlayer);
