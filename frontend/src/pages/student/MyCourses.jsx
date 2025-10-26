import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  Grid,
  Fade,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Container,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  User,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Trash2,
  X,
  Trophy,
  TrendingUp,
  Target,
  Play,
  Star,
  Award,
  Search,
  Filter as FilterIcon,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

/**
 * Animations professionnelles pour une expérience utilisateur fluide
 */
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(40px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const scaleIn = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
`;

const pulse = keyframes`
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.5; 
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(241, 53, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(241, 53, 68, 0.6);
  }
`;

/**
 * Palette de couleurs UNIFIÉE (IDENTIQUE À Certificates.jsx)
 */
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  white: '#ffffff',
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(241, 53, 68, 0.22)',
  glassDark: 'rgba(1, 11, 64, 0.7)',
  darkBg: '#0a0e27',
  success: '#10b981',
  warning: '#f59e0b',
  gold: '#fbbf24',
  info: '#3b82f6',
  purple: '#8b5cf6',
};

/**
 * Composants stylisés professionnels
 */
const StatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1.5px solid ${colors.glassBorder}`,
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  animation: `${fadeInUp} 0.6s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${colors.navy}80`,
    borderColor: `${colors.red}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1.5px solid ${colors.glassBorder}`,
  padding: theme.spacing(3.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 25px 50px ${colors.navy}99`,
    borderColor: `${colors.red}99`,
    '& .course-glow': {
      opacity: 0.4,
    },
    '& .course-cta': {
      background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${colors.red}66`,
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    gap: '16px',
  },
}));

const GlassDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: `linear-gradient(135deg, ${colors.navy}e6, ${colors.lightNavy}e6)`,
    backdropFilter: 'blur(30px)',
    borderRadius: '28px',
    border: `2px solid ${colors.red}44`,
    maxWidth: '500px',
    width: '90vw',
    boxShadow: `0 25px 60px ${colors.navy}cc`,
  },
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '14px',
  padding: '12px 24px',
  fontWeight: 700,
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  boxShadow: `0 6px 20px ${colors.red}44`,
  animation: `${glow} 2s infinite`,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 30px ${colors.red}66`,
    background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    animation: 'none',
    boxShadow: 'none',
  },
}));

const DeleteButton = styled(IconButton)({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 10,
  background: `linear-gradient(135deg, ${colors.red}44, ${colors.pink}44)`,
  backdropFilter: 'blur(12px)',
  color: '#ffffff',
  border: `1.5px solid ${colors.glassBorder}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
    transform: 'scale(1.15) rotate(12deg)',
    boxShadow: `0 8px 25px ${colors.red}66`,
  },
});

const FilterButton = styled(Button)(({ active, theme }) => ({
  padding: '12px 24px',
  borderRadius: '14px',
  fontWeight: 700,
  fontSize: '0.9rem',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 0.3s ease',
  minWidth: 'auto',
  ...(active
    ? {
        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
        color: '#ffffff',
        boxShadow: `0 6px 20px ${colors.red}44`,
        transform: 'scale(1.05)',
      }
    : {
        background: colors.glass,
        color: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${colors.glassBorder}`,
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.12)',
          transform: 'translateY(-2px)',
          borderColor: colors.red,
        },
      }),
}));

const ProgressBar = styled(LinearProgress)({
  height: 10,
  borderRadius: 6,
  backgroundColor: `${colors.red}22`,
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
    borderRadius: 6,
    transition: 'width 0.8s ease-in-out',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: `${pulse} 2s ease-in-out infinite`,
    },
  },
});

const EmptyStateBox = styled(Box)({
  textAlign: 'center',
  padding: '100px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '28px',
});

/**
 * Fonctions utilitaires professionnelles
 */
const getProgressColor = (progress) => {
  if (progress === 100) return colors.success;
  if (progress >= 75) return colors.pink;
  if (progress >= 50) return colors.purple;
  if (progress >= 25) return colors.warning;
  return colors.red;
};

const getProgressLabel = (progress) => {
  if (progress === 0) return 'Non commencé';
  if (progress === 100) return 'Terminé';
  if (progress >= 75) return 'Presque terminé';
  if (progress >= 50) return 'Bien avancé';
  if (progress >= 25) return 'En progression';
  return 'Débuté';
};

const getLevelColor = (level) => {
  const levelColors = {
    Débutant: colors.success,
    Intermédiaire: colors.info,
    Avancé: colors.warning,
    Expert: colors.red,
  };
  return levelColors[level] || colors.purple;
};

const formatDuration = (duration) => {
  if (!duration) return 'Durée non spécifiée';
  if (typeof duration === 'number') return `${duration}h`;
  return duration;
};

/**
 * Composant Skeleton pour le chargement
 */
const CourseCardSkeleton = () => (
  <Card
    sx={{
      background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
      borderRadius: '24px',
      border: `1.5px solid ${colors.glassBorder}`,
      padding: '28px',
      height: '100%',
      animation: `${pulse} 2s ease-in-out infinite`,
    }}
  >
    <Skeleton
      variant='rectangular'
      height={200}
      sx={{
        borderRadius: '16px',
        mb: 3,
        background: `linear-gradient(90deg, ${colors.red}22, ${colors.pink}22, ${colors.red}22)`,
      }}
    />
    <Skeleton variant='text' height={32} sx={{ mb: 2, borderRadius: '4px' }} />
    <Skeleton variant='text' height={60} sx={{ mb: 3, borderRadius: '4px' }} />
    <Skeleton variant='rounded' height={50} sx={{ borderRadius: '12px' }} />
  </Card>
);

/**
 * COMPOSANT PRINCIPAL MyCourses
 */
const MyCourses = () => {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // États du composant
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedView, setSelectedView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  /**
   * Récupération des cours avec gestion d'erreur professionnelle
   */
  const fetchCourses = useCallback(async () => {
    try {
      if (!user?.token) {
        console.error('Token utilisateur manquant');
        setError('Authentification requise');
        setTimeout(() => {
          logout();
          navigate('/login', {
            state: {
              returnUrl: '/student/courses',
              message: 'Veuillez vous reconnecter pour accéder à vos cours',
            },
          });
        }, 1500);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Début de la récupération des cours...');

      const response = await axios.get(`${API_BASE_URL}/courses/my-courses`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      });

      console.log('Réponse serveur reçue:', response.data);

      // Traitement des données avec validation robuste
      let coursesList = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        coursesList = response.data.data;
      } else if (Array.isArray(response.data)) {
        coursesList = response.data;
      } else if (response.data?.courses && Array.isArray(response.data.courses)) {
        coursesList = response.data.courses;
      } else {
        console.warn('Format de réponse inattendu:', response.data);
        setError('Format de données serveur invalide');
        setCourses([]);
        setLoading(false);
        return;
      }

      // Normalisation et enrichissement des données
      const normalizedCourses = coursesList.map((course, index) => ({
        ...course,
        _id: course._id || course.id || `temp-${index}`,
        title: course.title || course.titre || 'Cours sans titre',
        description:
          course.description || course.desc || 'Aucune description disponible pour le moment.',
        progression: Math.min(100, Math.max(0, Number(course.progression || course.progress || 0))),
        duration: course.duration || course.duree || null,
        level: course.level || course.niveau?.nom || 'Débutant',
        instructeur: course.instructeurId || course.instructeur || null,
        inscriptionId: course.inscriptionId || course.enrollmentId || null,
        categorie: course.categorie || course.category || 'Général',
        dateInscription: course.dateInscription || course.createdAt || new Date().toISOString(),
        rating: course.rating || Math.random() * 1 + 4,
      }));

      console.log(`${normalizedCourses.length} cours normalisés avec succès`);

      setCourses(normalizedCourses);
      setError(null);

      // Gestion des messages de notification
      if (location.state?.message) {
        addNotification(location.state.message, 'success');
        navigate(location.pathname, { replace: true });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des cours:', err);

      let errorMessage = 'Erreur lors du chargement de vos cours';
      let shouldLogout = false;

      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Votre session a expiré, veuillez vous reconnecter';
            shouldLogout = true;
            break;
          case 403:
            errorMessage = "Vous n'avez pas l'autorisation d'accéder à ces cours";
            break;
          case 404:
            errorMessage = 'Aucun cours trouvé pour votre compte';
            setCourses([]);
            setError(null);
            setLoading(false);
            return;
          case 500:
            errorMessage = 'Erreur interne du serveur, veuillez réessayer plus tard';
            break;
          default:
            errorMessage = err.response.data?.message || `Erreur serveur (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else {
        errorMessage = err.message || 'Erreur inconnue lors du chargement';
      }

      setError(errorMessage);

      if (shouldLogout) {
        setTimeout(() => {
          logout();
          navigate('/login', {
            state: {
              returnUrl: '/student/courses',
              message: 'Session expirée - Reconnexion requise',
            },
          });
        }, 2000);
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [user, logout, navigate, location, addNotification, API_BASE_URL]);

  /**
   * Gestionnaires de suppression professionnels
   */
  const handleDeleteClick = useCallback((course, e) => {
    e.stopPropagation();
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedCourse?.inscriptionId) {
      addNotification("Erreur: Identifiant d'inscription manquant", 'error');
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      return;
    }

    setDeleteLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        addNotification('Authentification requise pour cette action', 'warning');
        navigate('/login', { state: { returnUrl: '/student/courses' } });
        return;
      }

      await axios.delete(`${API_BASE_URL}/learning/enrollment/${selectedCourse.inscriptionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      addNotification(`Désinscription réussie - "${selectedCourse.title}"`, 'success');

      // Mise à jour optimiste de l'état local
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.inscriptionId !== selectedCourse.inscriptionId)
      );

      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error('Erreur lors de la désinscription:', err);

      let errorMessage = 'Erreur lors de la désinscription';
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || 'Données de requête invalides';
            break;
          case 401:
            errorMessage = 'Session expirée, reconnexion requise';
            navigate('/login', { state: { returnUrl: '/student/courses' } });
            break;
          case 403:
            errorMessage = 'Action non autorisée';
            break;
          case 404:
            errorMessage = 'Inscription introuvable';
            break;
          case 500:
            errorMessage = 'Erreur serveur lors de la suppression';
            break;
          default:
            errorMessage = err.response.data?.message || 'Erreur inconnue';
        }
      } else if (err.request) {
        errorMessage = 'Impossible de contacter le serveur';
      }

      addNotification(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedCourse, user, navigate, addNotification, API_BASE_URL]);

  const handleDeleteDialogClose = useCallback(() => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  }, [deleteLoading]);

  /**
   * Effet de chargement initial
   */
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /**
   * Gestionnaires d'événements
   */
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await fetchCourses();
  }, [fetchCourses]);

  const handleOpenCourse = useCallback(
    (courseId) => {
      if (courseId && !courseId.startsWith('temp-')) {
        navigate(`/student/course/${courseId}`);
      } else {
        addNotification("Impossible d'ouvrir ce cours pour le moment", 'warning');
      }
    },
    [navigate, addNotification]
  );

  /**
   * Calcul des statistiques automatiques
   */
  const stats = useMemo(() => {
    const total = courses.length;
    const inProgress = courses.filter((c) => c.progression > 0 && c.progression < 100).length;
    const completed = courses.filter((c) => c.progression === 100).length;
    const notStarted = courses.filter((c) => c.progression === 0).length;
    const avgProgress =
      total > 0 ? Math.round(courses.reduce((acc, c) => acc + c.progression, 0) / total) : 0;

    return {
      total,
      inProgress,
      completed,
      notStarted,
      avgProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [courses]);

  /**
   * Filtrage et recherche des cours
   */
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      // Filtre par statut
      if (selectedView === 'in-progress') {
        return course.progression > 0 && course.progression < 100;
      }
      if (selectedView === 'completed') {
        return course.progression === 100;
      }
      if (selectedView === 'not-started') {
        return course.progression === 0;
      }
      return true;
    });

    // Filtre par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.categorie.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [courses, selectedView, searchTerm]);

  /**
   * État de chargement
   */
  if (loading && !retrying) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkBg})`,
          p: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ mb: { xs: 4, sm: 6 } }}>
            <Typography
              variant='h3'
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 12px 30px ${colors.red}66`,
                }}
              >
                <BookOpen size={40} />
              </Box>
              Mes Cours
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '1.1rem', sm: '1.2rem' },
                ml: { xs: 0, sm: 10 },
              }}
            >
              Chargement de votre portfolio d'apprentissage...
            </Typography>
          </Box>
        </Fade>

        {/* Squelettes des cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} sm={6} md={3} key={item}>
              <StatCard elevation={0}>
                <Skeleton variant='circular' width={48} height={48} sx={{ mb: 2 }} />
                <Skeleton variant='text' height={40} sx={{ mb: 1 }} />
                <Skeleton variant='text' height={24} />
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Squelettes des cartes de cours */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <CourseCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  /**
   * RENDU PRINCIPAL
   */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkBg})`,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      {/* En-tête principal */}
      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent='space-between'
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography
                variant='h3'
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  mb: 1,
                  background: 'linear-gradient(135deg, #ffffff, #ff6b74)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 12px 30px ${colors.red}66`,
                  }}
                >
                  <BookOpen size={40} />
                </Box>
                Mes Cours
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                  ml: { xs: 0, sm: 10 },
                  fontWeight: 500,
                }}
              >
                {courses.length === 0 && !error
                  ? "Commencez votre voyage d'apprentissage"
                  : error
                    ? 'Une erreur est survenue'
                    : `Votre portfolio - ${courses.length} cours${courses.length > 1 ? 's' : ''} actif${courses.length > 1 ? 's' : ''}`}
              </Typography>
            </Box>

            {/* Bouton de réessai */}
            {error && (
              <ActionButton
                onClick={handleRetry}
                disabled={retrying}
                startIcon={retrying ? <CircularProgress size={18} /> : <RotateCcw size={18} />}
                sx={{
                  mt: { xs: 2, md: 0 },
                  px: 4,
                  py: 1.5,
                }}
              >
                {retrying ? 'Chargement...' : 'Actualiser'}
              </ActionButton>
            )}
          </Stack>

          {/* Cartes de statistiques automatiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                label: 'Total des Cours',
                value: stats.total,
                icon: BookOpen,
                color: colors.info,
                description: 'Cours inscrits',
              },
              {
                label: 'En Cours',
                value: stats.inProgress,
                icon: Play,
                color: colors.purple,
                description: 'En progression',
              },
              {
                label: 'Terminés',
                value: stats.completed,
                icon: CheckCircle,
                color: colors.success,
                description: 'Formations achevées',
              },
              {
                label: 'Progression Moyenne',
                value: `${stats.avgProgress}%`,
                icon: TrendingUp,
                color: colors.warning,
                description: 'Moyenne générale',
              },
            ].map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <StatCard elevation={0}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: `${stat.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      border: `1.5px solid ${stat.color}33`,
                    }}
                  >
                    <stat.icon size={28} color={stat.color} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.8rem', sm: '2.2rem' },
                      fontWeight: 800,
                      color: '#ffffff',
                      mb: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {stat.description}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          {/* Barre de filtres et recherche */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent='space-between'
            sx={{ mb: 3 }}
          >
            {/* Filtres */}
            <Stack
              direction='row'
              spacing={1}
              sx={{
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { display: 'none' },
                flex: 1,
              }}
            >
              {[
                { id: 'all', label: 'Tous les cours', count: stats.total },
                { id: 'in-progress', label: 'En cours', count: stats.inProgress },
                { id: 'completed', label: 'Terminés', count: stats.completed },
                { id: 'not-started', label: 'Non commencés', count: stats.notStarted },
              ].map((filter) => (
                <FilterButton
                  key={filter.id}
                  active={selectedView === filter.id}
                  onClick={() => setSelectedView(filter.id)}
                >
                  {filter.label}
                  <Chip
                    label={filter.count}
                    size='small'
                    sx={{
                      ml: 1,
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      ...(selectedView === filter.id
                        ? {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            color: '#ffffff',
                          }
                        : {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: 'rgba( Cateurs, 255, 255, 0.7)',
                          }),
                    }}
                  />
                </FilterButton>
              ))}
            </Stack>

            {/* Barre de recherche */}
            <Box
              sx={{
                position: 'relative',
                minWidth: { xs: '100%', sm: '300px' },
              }}
            >
              <Search
                size={20}
                color='rgba(255,255,255,0.5)'
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type='text'
                placeholder='Rechercher un cours...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: colors.glass,
                  border: `1.5px solid ${colors.glassBorder}`,
                  borderRadius: '14px',
                  padding: '12px 12px 12px 40px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.borderColor = colors.red;
                }}
                onBlur={(e) => {
                  e.target.style.background = colors.glass;
                  e.target.style.borderColor = colors.glassBorder;
                }}
              />
            </Box>
          </Stack>
        </Box>
      </Fade>

      {/* Alerte d'erreur */}
      {error && (
        <Alert
          severity='error'
          sx={{
            bgcolor: `${colors.red}15`,
            color: '#ffffff',
            borderRadius: '16px',
            mb: 4,
            border: `1.5px solid ${colors.red}44`,
            '& .MuiAlert-icon': {
              color: colors.red,
            },
          }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={handleRetry}
              disabled={retrying}
              sx={{
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {retrying ? 'Chargement...' : 'Réessayer'}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Grille des cours */}
      {filteredCourses.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {filteredCourses.map((course, index) => {
            const progress = course.progression || 0;
            const progressColor = getProgressColor(progress);
            const progressLabel = getProgressLabel(progress);

            return (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <CourseCard
                  elevation={0}
                  onClick={() => handleOpenCourse(course._id)}
                  sx={{
                    animation: `${slideIn} 0.6s ease-out ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Effet de lueur */}
                  <Box
                    className='course-glow'
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at 50% 0%, ${colors.pink}33, transparent 70%)`,
                      opacity: 0,
                      transition: 'opacity 0.5s ease',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Bouton de suppression */}
                  <DeleteButton
                    onClick={(e) => handleDeleteClick(course, e)}
                    aria-label={`Se désinscrire de ${course.title}`}
                  >
                    <Trash2 size={20} />
                  </DeleteButton>

                  {/* En-tête du cours avec image/icône */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${colors.red}44, ${colors.purple}44)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(135deg, transparent, ${colors.navy}88)`,
                      }}
                    />
                    <BookOpen
                      size={64}
                      color='#ffffff'
                      style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}
                    />

                    {/* Badge de niveau */}
                    <Chip
                      label={course.level}
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        backgroundColor: `${getLevelColor(course.level)}33`,
                        color: getLevelColor(course.level),
                        backdropFilter: 'blur(12px)',
                        border: `1.5px solid ${getLevelColor(course.level)}66`,
                      }}
                    />

                    {/* Badge de complétion */}
                    {progress === 100 && (
                      <Tooltip title='Cours maîtrisé' arrow placement='top'>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 60,
                            p: 1.5,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${colors.success}, #34d399)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 6px 20px ${colors.success}66`,
                            animation: 'bounce 2s infinite',
                          }}
                        >
                          <Trophy size={22} color='#ffffff' />
                        </Box>
                      </Tooltip>
                    )}

                    {/* Badge de notation */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(12px)',
                        px: 2,
                        py: 1,
                        borderRadius: '10px',
                        border: `1.5px solid ${colors.gold}33`,
                      }}
                    >
                      <Star size={16} color={colors.gold} fill={colors.gold} />
                      <Typography
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {course.rating?.toFixed(1) || '4.8'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Catégorie */}
                  <Chip
                    label={course.categorie}
                    size='small'
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: `${colors.red}33`,
                      color: colors.red,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      mb: 1,
                    }}
                  />

                  {/* Titre du cours */}
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: { xs: '1.2rem', sm: '1.3rem' },
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1,
                    }}
                  >
                    {course.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      minHeight: 48,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                      lineHeight: 1.5,
                    }}
                  >
                    {course.description}
                  </Typography>

                  {/* Informations du cours */}
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {/* Instructeur */}
                    {course.instructeur && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <User size={18} color={colors.pink} />
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                            fontWeight: 500,
                          }}
                        >
                          {typeof course.instructeur === 'object'
                            ? `${course.instructeur.prenom || ''} ${course.instructeur.nom || ''}`.trim()
                            : 'Instructeur'}
                        </Typography>
                      </Box>
                    )}

                    {/* Durée */}
                    {course.duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Clock size_USERNAME={18} color={colors.purple} />
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                            fontWeight: 500,
                          }}
                        >
                          {formatDuration(course.duration)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Section de progression */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          fontWeight: 600,
                        }}
                      >
                        Votre progression
                      </Typography>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          fontWeight: 800,
                        }}
                      >
                        {progress}%
                      </Typography>
                    </Box>
                    <ProgressBar variant='determinate' value={progress} />
                    <Typography
                      sx={{
                        color: progressColor,
                        fontSize: '0.85rem',
                        mt: 1,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {progress === 100 && <CheckCircle size={16} />}
                      {progressLabel}
                    </Typography>
                  </Box>

                  {/* Bouton d'action */}
                  <ActionButton
                    fullWidth
                    className='course-cta'
                    endIcon={progress === 100 ? <Award size={20} /> : <ArrowRight size={20} />}
                    sx={{
                      mt: 'auto',
                      background:
                        progress === 100
                          ? `linear-gradient(135deg, ${colors.success}, #34d399)`
                          : `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    }}
                    aria-label={
                      progress === 100
                        ? `Revoir le cours ${course.title}`
                        : `Continuer le cours ${course.title}`
                    }
                  >
                    {progress === 100 ? 'Revoir le cours' : 'Continuer'}
                  </ActionButton>
                </CourseCard>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        !error && (
          <EmptyStateBox>
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.red}22, ${colors.pink}22)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                border: `2px solid ${colors.glassBorder}`,
              }}
            >
              <BookOpen size={70} color={colors.red} style={{ opacity: 0.5 }} />
            </Box>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
                fontWeight: 800,
                mb: 1,
              }}
            >
              {searchTerm ? 'Aucun résultat' : 'Aucun cours trouvé'}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '1.1rem', sm: '1.2rem' },
                mb: 3,
                maxWidth: 500,
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {searchTerm
                ? `Aucun cours ne correspond à "${searchTerm}". Essayez avec d'autres termes.`
                : selectedView !== 'all'
                  ? `Aucun cours dans la catégorie "${selectedView}". Modifiez vos filtres.`
                  : 'Explorez notre catalogue et inscrivez-vous à des cours pour commencer votre apprentissage.'}
            </Typography>
            {selectedView === 'all' && !searchTerm && (
              <ActionButton
                onClick={() => navigate('/catalog')}
                endIcon={<ArrowRight size={22} />}
                sx={{ px: 5, py: 2, fontSize: '1rem' }}
                aria-label='Découvrir le catalogue de cours'
              >
                Explorer le Catalogue
              </ActionButton>
            )}
            {(searchTerm || selectedView !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedView('all');
                }}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#ffffff',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </EmptyStateBox>
        )
      )}

      {/* Dialogue de confirmation de suppression */}
      <GlassDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby='delete-dialog-title'
      >
        <DialogTitle
          id='delete-dialog-title'
          sx={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem',
            borderBottom: `1.5px solid ${colors.red}44`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 3,
            pt: 4,
            px: 4,
          }}
        >
          Confirmer la désinscription
          <IconButton
            onClick={handleDeleteDialogClose}
            disabled={deleteLoading}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              },
            }}
            aria-label='Fermer la boîte de dialogue'
          >
            <X size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: 4 }}>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 3,
              fontSize: '1.05rem',
              lineHeight: 1.6,
            }}
          >
            Êtes-vous sûr de vouloir vous désinscrire de ce cours ? Cette action est irréversible.
          </Typography>

          {selectedCourse && (
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${colors.navy}99, ${colors.lightNavy}99)`,
                border: `1.5px solid ${colors.red}33`,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  mb: 1.5,
                }}
              >
                {selectedCourse.title}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.95rem',
                  mb: 2,
                  lineHeight: 1.5,
                }}
              >
                {selectedCourse.description}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 2,
                  borderTop: `1.5px solid ${colors.red}22`,
                }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  Progression actuelle
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: getProgressColor(selectedCourse.progression),
                    fontSize: '1.1rem',
                  }}
                >
                  {selectedCourse.progression}%
                </Typography>
              </Box>
            </Box>
          )}

          <Alert
            severity='warning'
            sx={{
              backgroundColor: `${colors.warning}22`,
              color: colors.warning,
              borderRadius: '12px',
              border: `1.5px solid ${colors.warning}44`,
              '& .MuiAlert-icon': {
                color: colors.warning,
              },
            }}
          >
            Votre progression et vos données d'apprentissage seront définitivement supprimées.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
          <Button
            onClick={handleDeleteDialogClose}
            disabled={deleteLoading}
            variant='outlined'
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: '0.95rem',
              minWidth: '120px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            Annuler
          </Button>
          <ActionButton
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
            sx={{
              px: 4,
              py: 1.5,
              minWidth: '140px',
              background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
            }}
          >
            {deleteLoading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1.5, color: '#ffffff' }} />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={18} style={{ marginRight: 10 }} />
                Confirmer
              </>
            )}
          </ActionButton>
        </DialogActions>
      </GlassDialog>

      {/* Styles d'animation personnalisés */}
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  );
};

export default React.memo(MyCourses);
