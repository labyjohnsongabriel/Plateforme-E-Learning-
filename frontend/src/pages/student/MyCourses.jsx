import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Colors
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  darkBg: '#0a0e27',
  success: '#10b981',
  warning: '#f59e0b',
  gold: '#fbbf24',
};

// Styled Components
const StatCard = styled(Card)(({ theme, gradient }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(2.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 12px 30px ${colors.navy}66`,
    borderColor: `${colors.red}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 20px 40px ${colors.navy}80`,
    borderColor: `${colors.red}99`,
    background: `linear-gradient(135deg, ${colors.lightNavy}cc, ${colors.purple}66)`,
    '& .course-glow': {
      opacity: 0.3,
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const GlassDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: `linear-gradient(135deg, ${colors.navy}e6, ${colors.lightNavy}e6)`,
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    border: `2px solid ${colors.red}44`,
    maxWidth: '500px',
    width: '90vw',
    boxShadow: `0 20px 60px ${colors.navy}cc`,
  },
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const StyledButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  boxShadow: `0 4px 15px ${colors.red}44`,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 25px ${colors.red}66`,
    background: `linear-gradient(135deg, ${colors.red}dd, ${colors.pink}dd)`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

const DeleteButton = styled(IconButton)({
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 10,
  background: `linear-gradient(135deg, ${colors.red}44, ${colors.pink}44)`,
  backdropFilter: 'blur(10px)',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
    transform: 'scale(1.15) rotate(10deg)',
    boxShadow: `0 6px 20px ${colors.red}66`,
  },
});

const FilterButton = styled(Button)(({ active }) => ({
  padding: '10px 20px',
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '0.9rem',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 0.3s ease',
  ...(active
    ? {
        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
        color: '#ffffff',
        boxShadow: `0 4px 15px ${colors.red}44`,
        transform: 'scale(1.05)',
      }
    : {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.15)',
          transform: 'translateY(-2px)',
        },
      }),
}));

const ProgressBar = styled(LinearProgress)({
  height: 8,
  borderRadius: 4,
  backgroundColor: `${colors.red}22`,
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
    borderRadius: 4,
    transition: 'width 0.8s ease-in-out',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.3)',
      animation: `${pulse} 2s ease-in-out infinite`,
    },
  },
});

const EmptyStateBox = styled(Box)({
  textAlign: 'center',
  padding: '80px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
});

// Helper functions
const getProgressColor = (progress) => {
  if (progress === 100) return colors.success;
  if (progress >= 75) return colors.pink;
  if (progress >= 50) return colors.purple;
  return colors.warning;
};

const getProgressLabel = (progress) => {
  if (progress === 0) return 'Non commencé';
  if (progress === 100) return 'Terminé';
  if (progress >= 75) return 'Presque terminé';
  if (progress >= 50) return 'En cours';
  return 'Commencé';
};

const getLevelColor = (level) => {
  const levelColors = {
    'Débutant': colors.success,
    'Intermédiaire': '#3b82f6',
    'Avancé': colors.warning,
    'Expert': colors.red,
  };
  return levelColors[level] || '#6b7280';
};

const CourseCardSkeleton = () => (
  <Card
    sx={{
      background: `${colors.navy}b3`,
      borderRadius: '20px',
      border: `1px solid ${colors.red}33`,
      padding: '24px',
      height: '100%',
    }}
  >
    <Skeleton variant='rectangular' height={180} sx={{ borderRadius: '16px', mb: 2 }} />
    <Skeleton variant='text' height={28} sx={{ mb: 1 }} />
    <Skeleton variant='text' height={45} sx={{ mb: 2 }} />
    <Skeleton variant='text' height={18} sx={{ mb: 2 }} />
    <Skeleton variant='rounded' height={45} />
  </Card>
);

const MyCourses = () => {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedView, setSelectedView] = useState('all');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      if (!user?.token || !user?.id) {
        console.error('Missing user token or ID', { user });
        setError('Authentification requise');
        logout();
        navigate('/login');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log("📚 Récupération des cours de l'utilisateur...", {
        userId: user.id,
        tokenPresent: !!user.token,
      });

      const response = await axios.get(`${API_BASE_URL}/courses/my-courses`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      console.log('✅ Réponse serveur:', response.data);

      let coursesList = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        coursesList = response.data.data;
      } else if (Array.isArray(response.data)) {
        coursesList = response.data;
      } else {
        console.warn('⚠️ Format de réponse inattendu:', response.data);
        setError('Format de réponse serveur invalide');
        setCourses([]);
        setLoading(false);
        return;
      }

      coursesList = coursesList.map((course) => ({
        ...course,
        _id: course._id || '',
        title: course.title || course.titre || 'Cours sans titre',
        description: course.description || 'Pas de description disponible',
        progression: Number(course.progression || course.progress || 0),
        duration: course.duration || course.duree || null,
        level: course.level || course.niveau?.nom || 'N/A',
        instructeurId: course.instructeurId || course.instructeur || null,
        inscriptionId: course.inscriptionId || null,
        categorie: course.categorie || course.category || 'Général',
      }));

      console.log(`📊 ${coursesList.length} cours récupérés`);

      setCourses(coursesList);
      setError(null);

      if (location.state?.message) {
        addNotification(location.state.message, 'success');
        navigate(location.pathname, { replace: true });
      }
    } catch (err) {
      console.error('❌ Erreur récupération cours:', err);

      let errorMessage = 'Erreur lors du chargement des cours';
      let shouldLogout = false;

      if (err.response?.status === 401) {
        errorMessage = 'Votre session a expiré, veuillez vous reconnecter';
        shouldLogout = true;
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas accès à vos cours";
      } else if (err.response?.status === 404) {
        errorMessage = 'Aucun cours trouvé pour votre compte';
        setCourses([]);
        setError(null);
        setLoading(false);
        return;
      } else if (err.response?.status === 500) {
        errorMessage = 'Erreur serveur temporaire - veuillez réessayer';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de se connecter au serveur';
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = 'Serveur non trouvé, vérifiez votre connexion';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Erreur réseau - vérifiez votre connexion Internet';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setCourses([]);

      if (shouldLogout) {
        setTimeout(() => {
          logout();
          navigate('/login', {
            state: {
              returnUrl: '/student/courses',
              message: 'Votre session a expiré, veuillez vous reconnecter',
            },
          });
        }, 2000);
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [user, logout, navigate, location, addNotification, API_BASE_URL]);

  // Delete handlers
  const handleDeleteClick = useCallback((course, e) => {
    e.stopPropagation();
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedCourse?.inscriptionId) {
      addNotification('Erreur: Inscription non valide', 'error');
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      return;
    }

    setDeleteLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        addNotification('Veuillez vous reconnecter pour supprimer un cours', 'warning');
        navigate('/login', { state: { returnUrl: '/student/courses' } });
        setDeleteDialogOpen(false);
        setSelectedCourse(null);
        return;
      }

      await axios.delete(`${API_BASE_URL}/learning/enrollment/${selectedCourse.inscriptionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      addNotification(`Désinscription du cours "${selectedCourse.title}" réussie !`, 'success');
      setCourses((prev) =>
        prev.filter((course) => course.inscriptionId !== selectedCourse.inscriptionId)
      );
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      let errorMessage = 'Erreur lors de la désinscription';
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || 'Données invalides';
            break;
          case 401:
            errorMessage = 'Session expirée, veuillez vous reconnecter';
            navigate('/login', { state: { returnUrl: '/student/courses' } });
            break;
          case 403:
            errorMessage = 'Vous n êtes pas autorisé à supprimer ce cours';
            break;
          case 404:
            errorMessage = 'Inscription introuvable';
            break;
          default:
            errorMessage = err.response.data?.message || 'Erreur serveur';
        }
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur';
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

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await fetchCourses();
  }, [fetchCourses]);

  const handleOpenCourse = useCallback(
    (courseId) => {
      if (courseId) {
        navigate(`/student/course/${courseId}`);
      }
    },
    [navigate]
  );

  // Calculate statistics
  const stats = {
    total: courses.length,
    inProgress: courses.filter((c) => c.progression > 0 && c.progression < 100).length,
    completed: courses.filter((c) => c.progression === 100).length,
    avgProgress: courses.length
      ? Math.round(courses.reduce((acc, c) => acc + c.progression, 0) / courses.length)
      : 0,
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    if (selectedView === 'all') return true;
    if (selectedView === 'in-progress')
      return course.progression > 0 && course.progression < 100;
    if (selectedView === 'completed') return course.progression === 100;
    if (selectedView === 'not-started') return course.progression === 0;
    return true;
  });

  // Loading state
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
                fontWeight: 700,
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={36} />
              </Box>
              Mes Cours
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              Chargement de vos cours...
            </Typography>
          </Box>
        </Fade>
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <CourseCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

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
      {/* Header Section */}
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
                  fontWeight: 700,
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 24px ${colors.red}44`,
                  }}
                >
                  <BookOpen size={36} />
                </Box>
                Mes Cours
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  ml: { xs: 0, sm: 8 },
                }}
              >
                {courses.length === 0 && !error
                  ? "Vous n'êtes pas inscrit à un cours"
                  : error
                    ? 'Erreur lors du chargement'
                    : `Continuez votre apprentissage - ${courses.length} cours actifs`}
              </Typography>
            </Box>
            {error && (
              <Button
                onClick={handleRetry}
                disabled={retrying}
                startIcon={retrying ? <CircularProgress size={18} /> : <RotateCcw size={18} />}
                sx={{
                  mt: { xs: 2, md: 0 },
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  color: '#ffffff',
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 20px ${colors.red}44`,
                  },
                }}
              >
                {retrying ? 'Chargement...' : 'Réessayer'}
              </Button>
            )}
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                label: 'Total',
                value: stats.total,
                icon: BookOpen,
                color: 'from-blue-500 to-cyan-500',
                bgColor: '#3b82f6',
              },
              {
                label: 'En cours',
                value: stats.inProgress,
                icon: Play,
                color: 'from-purple-500 to-pink-500',
                bgColor: colors.purple,
              },
              {
                label: 'Terminés',
                value: stats.completed,
                icon: CheckCircle,
                color: 'from-green-500 to-emerald-500',
                bgColor: colors.success,
              },
              {
                label: 'Progression',
                value: `${stats.avgProgress}%`,
                icon: TrendingUp,
                color: 'from-orange-500 to-red-500',
                bgColor: colors.warning,
              },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={6} md={3} key={idx}>
                <StatCard elevation={0}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: `${stat.bgColor}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <stat.icon size={24} color={stat.bgColor} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      color: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          {/* Filters */}
          <Stack
            direction='row'
            spacing={2}
            sx={{
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {[
              { id: 'all', label: 'Tous les cours', count: stats.total },
              { id: 'in-progress', label: 'En cours', count: stats.inProgress },
              { id: 'completed', label: 'Terminés', count: stats.completed },
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
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    ...(selectedView === filter.id
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                        }
                      : {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.7)',
                        }),
                  }}
                />
              </FilterButton>
            ))}
          </Stack>
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Alert
          severity='error'
          sx={{
            bgcolor: `${colors.red}1a`,
            color: '#ffffff',
            borderRadius: '16px',
            mb: 4,
            border: `1px solid ${colors.red}44`,
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
              sx={{ fontWeight: 600 }}
            >
              {retrying ? 'Chargement...' : 'Réessayer'}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {filteredCourses.map((course, index) => {
            const progress = course.progression || 0;
            const progressColor = getProgressColor(progress);
            const progressLabel = getProgressLabel(progress);

            return (
              <Grid item xs={12} sm={6} md={4} key={course._id || index}>
                <CourseCard
                  elevation={0}
                  onClick={() => handleOpenCourse(course._id)}
                  sx={{
                    animation: `${slideIn} 0.5s ease-out ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Glow Effect */}
                  <Box
                    className='course-glow'
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at 50% 0%, ${colors.pink}22, transparent 70%)`,
                      opacity: 0,
                      transition: 'opacity 0.5s ease',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Delete Button */}
                  <DeleteButton
                    onClick={(e) => handleDeleteClick(course, e)}
                    aria-label={`Supprimer le cours ${course.title}`}
                  >
                    <Trash2 size={20} />
                  </DeleteButton>

                  {/* Course Image/Header */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 180,
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
                        background: `linear-gradient(135deg, transparent, ${colors.navy}66)`,
                      }}
                    />
                    <BookOpen
                      size={56}
                      color='#ffffff'
                      style={{ opacity: 0.6, position: 'relative', zIndex: 1 }}
                    />

                    {/* Level Badge */}
                    <Chip
                      label={course.level}
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        backgroundColor: `${getLevelColor(course.level)}33`,
                        color: getLevelColor(course.level),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${getLevelColor(course.level)}66`,
                      }}
                    />

                    {/* Completion Badge */}
                    {progress === 100 && (
                      <Tooltip title='Cours terminé' arrow>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 52,
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: colors.success,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${colors.success}66`,
                            animation: 'bounce 2s infinite',
                          }}
                        >
                          <Trophy size={20} color='#ffffff' />
                        </Box>
                      </Tooltip>
                    )}

                    {/* Rating Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(10px)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '8px',
                      }}
                    >
                      <Star size={14} color={colors.gold} fill={colors.gold} />
                      <Typography
                        sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}
                      >
                        4.8
                      </Typography>
                    </Box>
                  </Box>

                  {/* Category Chip */}
                  <Chip
                    label={course.categorie}
                    size='small'
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: `${colors.red}33`,
                      color: colors.red,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      mb: 1,
                    }}
                  />

                  {/* Title */}
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      lineHeight: 1.4,
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
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {course.description}
                  </Typography>

                  {/* Course Info */}
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {/* Instructor */}
                    {course.instructeurId && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size={16} color={colors.pink} />
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          }}
                        >
                          {`${course.instructeurId?.prenom || ''} ${
                            course.instructeurId?.nom || 'Instructeur'
                          }`}
                        </Typography>
                      </Box>
                    )}

                    {/* Duration */}
                    {course.duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={16} color={colors.purple} />
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          }}
                        >
                          {course.duration} heures
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Progress Section */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        }}
                      >
                        Progression
                      </Typography>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          fontWeight: 700,
                        }}
                      >
                        {progress}%
                      </Typography>
                    </Box>
                    <ProgressBar variant='determinate' value={progress} />
                    <Typography
                      sx={{
                        color: progressColor,
                        fontSize: '0.8rem',
                        mt: 0.5,
                        fontWeight: 600,
                      }}
                    >
                      {progressLabel}
                    </Typography>
                  </Box>

                  {/* CTA Button */}
                  <StyledButton
                    fullWidth
                    endIcon={progress === 100 ? <Award size={18} /> : <ArrowRight size={18} />}
                    sx={{ mt: 'auto' }}
                    aria-label={progress === 100 ? 'Revoir le cours' : 'Continuer le cours'}
                  >
                    {progress === 100 ? 'Revoir le cours' : 'Continuer'}
                  </StyledButton>
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
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.red}22, ${colors.pink}22)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <BookOpen size={60} color={colors.red} style={{ opacity: 0.4 }} />
            </Box>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: { xs: '1.4rem', sm: '1.6rem' },
                fontWeight: 700,
                mb: 1,
              }}
            >
              Aucun cours {selectedView !== 'all' && 'dans cette catégorie'}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                mb: 3,
                maxWidth: 500,
              }}
            >
              {selectedView === 'all'
                ? 'Explorez notre catalogue et inscrivez-vous à un cours pour commencer votre apprentissage'
                : 'Changez de filtre ou explorez de nouveaux cours'}
            </Typography>
            {selectedView === 'all' && (
              <StyledButton
                onClick={() => navigate('/catalog')}
                endIcon={<ArrowRight size={20} />}
                sx={{ px: 4, py: 1.5 }}
                aria-label='Découvrir les cours'
              >
                Découvrir les cours
              </StyledButton>
            )}
          </EmptyStateBox>
        )
      )}

      {/* Delete Confirmation Dialog */}
      <GlassDialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.4rem',
            borderBottom: `1px solid ${colors.red}44`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
          }}
        >
          Confirmer la désinscription
          <IconButton
            onClick={handleDeleteDialogClose}
            disabled={deleteLoading}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <X size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, fontSize: '1rem' }}>
            Êtes-vous sûr de vouloir vous désinscrire du cours suivant ?
          </Typography>

          {selectedCourse && (
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${colors.navy}99, ${colors.lightNavy}99)`,
                border: `1px solid ${colors.red}33`,
                mb: 3,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: '#ffffff', fontSize: '1.1rem', mb: 1 }}
              >
                {selectedCourse.title}
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 2 }}>
                {selectedCourse.description}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 2,
                  borderTop: `1px solid ${colors.red}22`,
                }}
              >
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                  Progression actuelle
                </Typography>
                <Typography sx={{ fontWeight: 700, color: colors.pink, fontSize: '1rem' }}>
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
              border: `1px solid ${colors.warning}44`,
              '& .MuiAlert-icon': {
                color: colors.warning,
              },
            }}
          >
            Cette action supprimera définitivement votre progression et votre inscription à ce
            cours.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleDeleteDialogClose}
            disabled={deleteLoading}
            variant='outlined'
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            Annuler
          </Button>
          <StyledButton
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
            sx={{ px: 3, py: 1.5 }}
          >
            {deleteLoading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1, color: '#ffffff' }} />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={18} style={{ marginRight: 8 }} />
                Confirmer
              </>
            )}
          </StyledButton>
        </DialogActions>
      </GlassDialog>

      {/* Custom Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </Box>
  );
};

export default MyCourses;