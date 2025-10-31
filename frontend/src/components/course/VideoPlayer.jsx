// VideoPlayer.jsx - Lecteur vidéo professionnel avec fond immersif
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import {
  Box,
  Container,
  Typography,
  Fade,
  LinearProgress,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Film,
  List as ListIcon,
} from 'lucide-react';
import axios from 'axios';

// === CONFIGURATION ===
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// === ANIMATIONS SOPHISTIQUÉES ===
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
    transform: translateX(-50px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-20px) rotate(5deg); 
  }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(241, 53, 68, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(241, 53, 68, 0.6);
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

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// === COULEURS PROFESSIONNELLES ===
const colors = {
  navy: '#010b40',
  darkNavy: '#00072d',
  lightNavy: '#1a237e',
  deepSpace: '#0a0f2d',
  red: '#f13544',
  redLight: '#ff6b74',
  redDark: '#c71f2e',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  info: '#3b82f6',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  glassLight: 'rgba(255, 255, 255, 0.12)',
  border: 'rgba(241, 53, 68, 0.25)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.4)',
  },
};

// === STYLED COMPONENTS ===
const VideoContainer = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(30px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '24px',
  maxWidth: '1200px',
  margin: 'auto',
  padding: theme.spacing(4),
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  boxShadow: `
    0 20px 60px ${colors.navy}80,
    0 0 0 1px rgba(255, 255, 255, 0.05) inset
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
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `
      0 30px 80px ${colors.navy}99,
      0 0 0 1px rgba(255, 255, 255, 0.1) inset
    `,
  },
}));

const SidebarCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glassLight}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '20px',
  animation: `${slideInLeft} 0.6s ease-out`,
  boxShadow: `
    0 10px 40px ${colors.navy}60,
    0 0 0 1px rgba(255, 255, 255, 0.05) inset
  `,
  maxHeight: 'calc(100vh - 150px)',
  position: 'sticky',
  top: 100,
  overflow: 'hidden',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: colors.text.primary,
  borderRadius: '12px',
  padding: '12px 28px',
  fontWeight: 600,
  fontSize: '0.95rem',
  border: `1px solid ${colors.border}`,
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: `${colors.red}20`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${colors.red}30`,
  },
  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
}));

const CompleteButton = styled(Button)(({ completed }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}, ${colors.successLight})`
    : `linear-gradient(135deg, ${colors.red}, ${colors.redLight})`,
  color: colors.text.primary,
  borderRadius: '12px',
  padding: '14px 36px',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: completed
    ? `0 8px 25px ${colors.success}40`
    : `0 8px 25px ${colors.red}40`,
  animation: completed ? 'none' : `${pulseGlow} 2s infinite`,
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: completed
      ? `0 12px 35px ${colors.success}50`
      : `0 12px 35px ${colors.red}50`,
  },
  '&:disabled': {
    opacity: 0.7,
  },
}));

const ContentListItem = styled(ListItem)(({ selected, completed }) => ({
  borderRadius: '12px',
  marginBottom: '10px',
  padding: '14px 16px',
  background: selected
    ? `linear-gradient(135deg, ${colors.red}25, ${colors.red}15)`
    : 'transparent',
  border: selected ? `1px solid ${colors.red}50` : '1px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
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
  },
  '&:hover': {
    background: selected
      ? `linear-gradient(135deg, ${colors.red}35, ${colors.red}20)`
      : `${colors.glass}`,
    borderColor: selected ? colors.red : colors.borderLight,
    transform: 'translateX(6px)',
  },
}));

const PlayerWrapper = styled(Box)({
  position: 'relative',
  paddingTop: '56.25%', // 16:9 Aspect Ratio
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: '#000',
  boxShadow: `
    0 20px 60px ${colors.navy}99,
    0 0 0 1px rgba(255, 255, 255, 0.1) inset
  `,
});

const ControlsOverlay = styled(Box)(({ visible }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)',
  padding: '24px 20px 16px',
  opacity: visible ? 1 : 0,
  transition: 'opacity 0.3s ease',
  zIndex: 10,
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '16px',
  padding: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 10px 30px ${colors.navy}50`,
    borderColor: colors.red,
  },
}));

// === COMPOSANT PRINCIPAL ===
const VideoPlayer = () => {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  // États principaux
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // États du lecteur
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  // === CHARGEMENT DES DONNÉES ===
  useEffect(() => {
    const fetchData = async () => {
      if (!headers) {
        navigate('/login', { state: { from: `/course/${courseId}/learn/${contentId}` } });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [courseRes, contentsRes, contentRes, progressRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/courses/${courseId}`, { headers }),
          axios.get(`${API_BASE_URL}/contenu`, { params: { courseId }, headers }),
          axios.get(`${API_BASE_URL}/contenu/${contentId}`, { headers }),
          axios.get(`${API_BASE_URL}/learning/progress/${courseId}`, { headers }),
        ]);

        if (courseRes.status === 'fulfilled') {
          setCourse(courseRes.value.data.data || courseRes.value.data);
        }

        if (contentsRes.status === 'fulfilled') {
          const contentsData = contentsRes.value.data.data || contentsRes.value.data || [];
          setContents(contentsData);
        }

        if (contentRes.status === 'fulfilled') {
          const contentData = contentRes.value.data.data || contentRes.value.data;
          setContent(contentData);
          setIsCompleted(contentData.isCompleted || false);
        }

        if (progressRes.status === 'fulfilled') {
          const progressData = progressRes.value.data.data || progressRes.value.data;
          setProgress(progressData?.pourcentage || progressData?.progress || 0);
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
        const errorMessage =
          err.response?.status === 404
            ? 'Cours ou contenu non trouvé'
            : err.response?.data?.message || 'Erreur lors du chargement';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, contentId, navigate, headers]);

  // === GESTION DE LA COMPLÉTION ===
  const handleCompleteContent = async () => {
    if (isCompleted || !headers) return;

    try {
      const newProgress = progress + (contents.length > 0 ? 100 / contents.length : 0);
      
      await axios.put(
        `${API_BASE_URL}/learning/progress/${courseId}`,
        { pourcentage: Math.min(newProgress, 100) },
        { headers }
      );

      setIsCompleted(true);
      setProgress(Math.min(newProgress, 100));

      setSnackbar({
        open: true,
        message: '🎉 Vidéo terminée avec succès !',
        severity: 'success',
      });

      // Navigation automatique
      const currentIndex = contents.findIndex((c) => c._id === contentId);
      if (currentIndex < contents.length - 1) {
        setTimeout(() => {
          navigate(`/course/${courseId}/learn/${contents[currentIndex + 1]._id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Erreur de complétion:', err);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la complétion',
        severity: 'error',
      });
    }
  };

  // === GESTION DU LECTEUR ===
  const handleProgress = (state) => {
    setPlayed(state.played);
    
    // Auto-complétion à 90%
    if (state.played > 0.9 && !isCompleted) {
      handleCompleteContent();
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTo = (e.clientX - rect.left) / rect.width;
    playerRef.current?.seekTo(seekTo);
  };

  const handleSkip = (seconds) => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(currentTime + seconds);
  };

  const toggleFullscreen = () => {
    const element = document.querySelector('.player-wrapper');
    if (!isFullscreen) {
      element?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // === NAVIGATION ===
  const handleNavigation = (direction) => {
    const currentIndex = contents.findIndex((c) => c._id === contentId);
    if (direction === 'prev' && currentIndex > 0) {
      navigate(`/course/${courseId}/learn/${contents[currentIndex - 1]._id}`);
    } else if (direction === 'next' && currentIndex < contents.length - 1) {
      navigate(`/course/${courseId}/learn/${contents[currentIndex + 1]._id}`);
    }
  };

  // Statistiques
  const stats = useMemo(() => {
    const completed = contents.filter((c) => c.isCompleted).length;
    const total = contents.length;
    const remaining = total - completed;
    return { completed, total, remaining };
  }, [contents]);

  // === RENDU DU CHARGEMENT ===
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          color: colors.text.primary,
          gap: 3,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CircularProgress
            size={100}
            thickness={3}
            sx={{
              color: colors.red,
              animation: `${pulseGlow} 2s infinite`,
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
            <Film size={40} color={colors.red} />
          </Box>
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Chargement de la vidéo...
        </Typography>
        <Typography color={colors.text.muted}>
          Préparation de votre contenu
        </Typography>
      </Box>
    );
  }

  // === RENDU DES ERREURS ===
  if (error || !content?.url) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          color: colors.text.primary,
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: `${colors.red}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Film size={60} color={colors.red} />
        </Box>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          {error || 'Vidéo non disponible'}
        </Typography>
        <Typography color={colors.text.secondary} sx={{ mb: 4, maxWidth: 500 }}>
          Nous n'avons pas pu charger cette vidéo. Veuillez réessayer.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => window.location.reload()}
            variant="contained"
            sx={{
              bgcolor: colors.red,
              '&:hover': { bgcolor: colors.redLight },
            }}
          >
            Réessayer
          </Button>
          <Button
            onClick={() => navigate(`/student/course/${courseId}`)}
            variant="outlined"
            sx={{
              borderColor: colors.border,
              color: colors.text.primary,
            }}
          >
            Retour au cours
          </Button>
        </Stack>
      </Box>
    );
  }

  // === RENDU PRINCIPAL ===
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.darkNavy} 100%)`,
        overflow: 'hidden',
        pt: 4,
        pb: 8,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, ${colors.red}12, transparent 50%),
            radial-gradient(circle at 80% 70%, ${colors.purple}12, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Décorations de fond */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.red}08 1.5px, transparent 1.5px),
            linear-gradient(90deg, ${colors.red}08 1.5px, transparent 1.5px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.3,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 100,
          right: 60,
          width: 200,
          height: 200,
          background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
          borderRadius: '50%',
          opacity: 0.08,
          filter: 'blur(80px)',
          animation: `${floatingAnimation} 4s ease-in-out infinite`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 150,
          left: 80,
          width: 150,
          height: 150,
          background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
          borderRadius: '50%',
          opacity: 0.06,
          filter: 'blur(60px)',
          animation: `${floatingAnimation} 5s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        {/* En-tête avec navigation */}
        <Fade in timeout={600}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <NavButton
              startIcon={<ArrowLeft size={20} />}
              onClick={() => navigate(`/student/course/${courseId}`)}
            >
              Retour au cours
            </NavButton>

            <Stack direction="row" spacing={2}>
              <StatsCard elevation={0}>
                <BookOpen size={22} color={colors.info} />
                <Box>
                  <Typography variant="caption" color={colors.text.muted}>
                    Contenus
                  </Typography>
                  <Typography variant="h6" color={colors.text.primary} fontWeight={700}>
                    {stats.completed}/{stats.total}
                  </Typography>
                </Box>
              </StatsCard>

              <StatsCard elevation={0}>
                <TrendingUp size={22} color={colors.success} />
                <Box>
                  <Typography variant="caption" color={colors.text.muted}>
                    Progression
                  </Typography>
                  <Typography variant="h6" color={colors.text.primary} fontWeight={700}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
              </StatsCard>
            </Stack>
          </Stack>
        </Fade>

        <Fade in timeout={1000}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            {/* SIDEBAR - Liste des contenus */}
            <Box sx={{ width: { xs: '100%', lg: 350 } }}>
              <SidebarCard>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Typography
                      variant="h6"
                      color={colors.text.primary}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontWeight: 700,
                      }}
                    >
                      <ListIcon size={24} color={colors.red} />
                      Contenu du cours
                    </Typography>
                    <Chip
                      label={`${stats.completed}/${stats.total}`}
                      size="small"
                      sx={{
                        bgcolor: `${colors.success}20`,
                        color: colors.success,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Divider sx={{ mb: 2, borderColor: colors.borderLight }} />

                  <List sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 350px)', pr: 1 }}>
                    {contents.map((c, index) => (
                      <ContentListItem
                        key={c._id}
                        selected={c._id === contentId}
                        completed={c.isCompleted}
                        onClick={() => navigate(`/course/${courseId}/learn/${c._id}`)}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              {c.isCompleted ? (
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    bgcolor: `${colors.success}25`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <CheckCircle color={colors.success} size={16} />
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    bgcolor:
                                      c._id === contentId ? `${colors.red}25` : colors.glass,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color:
                                      c._id === contentId ? colors.red : colors.text.muted,
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {index + 1}
                                </Box>
                              )}
                              <Typography
                                color={
                                  c._id === contentId
                                    ? colors.text.primary
                                    : colors.text.secondary
                                }
                                fontWeight={c._id === contentId ? 600 : 400}
                                sx={{ flex: 1 }}
                              >
                                {c.titre}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Box sx={{ ml: 5, mt: 0.5 }}>
                              <Chip
                                label={c.type?.charAt(0).toUpperCase() + c.type?.slice(1)}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor:
                                    c.type === 'video'
                                      ? `${colors.purple}20`
                                      : `${colors.info}20`,
                                  color: c.type === 'video' ? colors.purple : colors.info,
                                }}
                              />
                            </Box>
                          }
                        />
                      </ContentListItem>
                    ))}
                  </List>
                </CardContent>
              </SidebarCard>
            </Box>

            {/* LECTEUR VIDÉO PRINCIPAL */}
            <VideoContainer>
              {/* Titre et informations */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    label="VIDÉO"
                    sx={{
                      bgcolor: colors.red,
                      color: colors.text.primary,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  />
                  {isCompleted && (
                    <Chip
                      icon={<CheckCircle size={16} />}
                      label="TERMINÉ"
                      sx={{
                        bgcolor: `${colors.success}20`,
                        color: colors.success,
                        fontWeight: 700,
                        border: `1px solid ${colors.success}`,
                      }}
                    />
                  )}
                </Stack>

                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    fontWeight: 800,
                    color: colors.text.primary,
                    mb: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {course?.titre}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 600,
                    color: colors.text.secondary,
                    mb: 3,
                  }}
                >
                  {content?.titre}
                </Typography>

                {/* Barre de progression du cours */}
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant="body2"
                      color={colors.text.secondary}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <TrendingUp size={16} color={colors.success} />
                      Progression du cours
                    </Typography>
                    <Typography
                      variant="h6"
                      color={colors.text.primary}
                      fontWeight={700}
                    >
                      {Math.round(progress)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: `${colors.red}15`,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${colors.red}, ${colors.purple})`,
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderColor: colors.borderLight }} />

              {/* LECTEUR VIDÉO avec contrôles personnalisés */}
              <Box
                className="player-wrapper"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => playing && setShowControls(false)}
                sx={{ position: 'relative' }}
              >
                <PlayerWrapper>
                  <ReactPlayer
                    ref={playerRef}
                    url={content.url}
                    width="100%"
                    height="100%"
                    playing={playing}
                    muted={muted}
                    volume={volume}
                    onProgress={handleProgress}
                    onDuration={setDuration}
                    onEnded={() => !isCompleted && handleCompleteContent()}
                    onError={() => setError('Erreur lors du chargement de la vidéo')}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload',
                        },
                      },
                    }}
                  />

                  {/* Bouton Play/Pause central */}
                  {!playing && (
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
                        onClick={() => setPlaying(true)}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: `${colors.red}dd`,
                          color: 'white',
                          backdropFilter: 'blur(10px)',
                          animation: `${pulseGlow} 2s infinite`,
                          '&:hover': {
                            bgcolor: colors.red,
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Play size={40} />
                      </IconButton>
                    </Box>
                  )}

                  {/* Contrôles personnalisés */}
                  <ControlsOverlay visible={showControls || !playing}>
                    {/* Barre de progression */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 6,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        cursor: 'pointer',
                        mb: 2,
                        position: 'relative',
                        '&:hover': {
                          height: 8,
                        },
                      }}
                      onClick={handleSeek}
                    >
                      <Box
                        sx={{
                          width: `${played * 100}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                          borderRadius: 3,
                          position: 'relative',
                          transition: 'width 0.1s',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: -6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            boxShadow: `0 0 10px ${colors.red}`,
                          },
                        }}
                      />
                    </Box>

                    {/* Contrôles principaux */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      {/* Contrôles gauche */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => setPlaying(!playing)}
                          sx={{ color: 'white' }}
                        >
                          {playing ? <Pause size={24} /> : <Play size={24} />}
                        </IconButton>

                        <IconButton
                          onClick={() => handleSkip(-10)}
                          sx={{ color: 'white' }}
                        >
                          <SkipBack size={20} />
                        </IconButton>

                        <IconButton
                          onClick={() => handleSkip(10)}
                          sx={{ color: 'white' }}
                        >
                          <SkipForward size={20} />
                        </IconButton>

                        <IconButton
                          onClick={() => setMuted(!muted)}
                          sx={{ color: 'white' }}
                        >
                          {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                        </IconButton>

                        <Typography
                          variant="body2"
                          color="white"
                          sx={{ ml: 2, minWidth: 100 }}
                        >
                          {formatTime(played * duration)} / {formatTime(duration)}
                        </Typography>
                      </Stack>

                      {/* Contrôles droite */}
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Télécharger" arrow>
                          <IconButton
                            onClick={() => window.open(content.url, '_blank')}
                            sx={{ color: 'white' }}
                          >
                            <Download size={20} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Plein écran" arrow>
                          <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                            {isFullscreen ? (
                              <Minimize size={20} />
                            ) : (
                              <Maximize size={20} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </ControlsOverlay>
                </PlayerWrapper>
              </Box>

              {/* Description du contenu */}
              {content.description && (
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: `${colors.glass}`,
                    border: `1px solid ${colors.borderLight}`,
                  }}
                >
                  <Typography
                    variant="body1"
                    color={colors.text.secondary}
                    sx={{ lineHeight: 1.8 }}
                  >
                    {content.description}
                  </Typography>
                </Box>
              )}

              {/* Boutons de navigation et complétion */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: colors.glass,
                  border: `1px solid ${colors.borderLight}`,
                }}
              >
                <NavButton
                  startIcon={<ArrowLeft size={18} />}
                  onClick={() => handleNavigation('prev')}
                  disabled={contents.findIndex((c) => c._id === contentId) === 0}
                  sx={{ minWidth: 130 }}
                >
                  Précédent
                </NavButton>

                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  {!isCompleted ? (
                    <CompleteButton
                      onClick={handleCompleteContent}
                      completed={false}
                      startIcon={<CheckCircle size={20} />}
                    >
                      Marquer comme terminé
                    </CompleteButton>
                  ) : (
                    <CompleteButton
                      completed={true}
                      disabled
                      startIcon={<Award size={20} />}
                    >
                      Vidéo terminée
                    </CompleteButton>
                  )}
                </Box>

                <NavButton
                  endIcon={<ArrowRight size={18} />}
                  onClick={() => handleNavigation('next')}
                  disabled={
                    contents.findIndex((c) => c._id === contentId) === contents.length - 1
                  }
                  sx={{ minWidth: 130 }}
                >
                  Suivant
                </NavButton>
              </Stack>

              {/* Message de progression */}
              {played > 0.5 && played < 0.9 && !isCompleted && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 3,
                    borderRadius: '12px',
                    bgcolor: `${colors.info}15`,
                    border: `1px solid ${colors.info}30`,
                    '& .MuiAlert-icon': {
                      color: colors.info,
                    },
                  }}
                >
                  <Typography variant="body2" color={colors.text.primary}>
                    <strong>Bon travail !</strong> Vous avez regardé {Math.round(played * 100)}% de
                    la vidéo. Continuez pour débloquer le contenu suivant ! 🎯
                  </Typography>
                </Alert>
              )}
            </VideoContainer>
          </Box>
        </Fade>
      </Container>

      {/* NOTIFICATION SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: '12px',
            boxShadow: `0 8px 32px ${colors.navy}60`,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Optimisation avec React.memo
export default React.memo(VideoPlayer);