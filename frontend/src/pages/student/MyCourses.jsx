// src/components/MyCourses.jsx
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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  darkBg: '#0a0e27',
  success: '#10b981',
  warning: '#f59e0b',
};

const CourseCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(2.5),
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
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 30px ${colors.navy}4d`,
    borderColor: `${colors.red}66`,
    background: `linear-gradient(135deg, ${colors.lightNavy}cc, ${colors.purple}99)`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '10px',
  padding: '8px 16px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${colors.red}4d`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

const EmptyStateBox = styled(Box)({
  textAlign: 'center',
  py: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
});

const ProgressBar = styled(LinearProgress)({
  height: 6,
  borderRadius: 3,
  backgroundColor: `${colors.red}22`,
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
    borderRadius: 3,
  },
});

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

const CourseCardSkeleton = () => (
  <Card
    sx={{
      background: `${colors.navy}b3`,
      borderRadius: '12px',
      border: `1px solid ${colors.red}33`,
      padding: '20px',
      height: '100%',
    }}
  >
    <Skeleton variant='rectangular' height={160} sx={{ borderRadius: '12px', mb: 2 }} />
    <Skeleton variant='text' height={24} sx={{ mb: 1 }} />
    <Skeleton variant='text' height={40} sx={{ mb: 2 }} />
    <Skeleton variant='text' height={16} sx={{ mb: 2 }} />
    <Skeleton variant='rounded' height={40} />
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

      console.log('✅ Statut réponse:', response.status);
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
      }));

      console.log(`📊 ${coursesList.length} cours récupérés`);

      setCourses(coursesList);
      setError(null);

      if (location.state?.message) {
        addNotification(location.state.message, 'success');
        navigate(location.pathname, { replace: true });
      }
    } catch (err) {
      console.error('❌ Erreur récupération cours:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        code: err.code,
      });

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
        console.log('🚪 Déconnexion suite à une erreur 401');
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
  }, [user, logout, navigate, location, addNotification]);

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

  if (loading && !retrying) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: colors.navy,
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
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <BookOpen size={32} color={colors.red} />
              Mes Cours
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
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
        bgcolor: colors.navy,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
            <Typography
              variant='h3'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <BookOpen size={32} color={colors.red} />
              Mes Cours
            </Typography>
            {error && (
              <Button
                onClick={handleRetry}
                disabled={retrying}
                startIcon={retrying ? <CircularProgress size={16} /> : <RotateCcw size={16} />}
                sx={{
                  color: colors.white,
                  borderColor: colors.red,
                  '&:hover': {
                    backgroundColor: `${colors.red}22`,
                  },
                }}
                variant='outlined'
              >
                {retrying ? 'Chargement...' : 'Réessayer'}
              </Button>
            )}
          </Stack>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            {courses.length === 0 && !error
              ? "Vous n'êtes pas inscrit à un cours"
              : error
                ? 'Erreur lors du chargement'
                : `Vous êtes inscrit à ${courses.length} cours`}
          </Typography>
        </Box>
      </Fade>

      {error && (
        <Alert
          severity='error'
          sx={{
            bgcolor: `${colors.red}1a`,
            color: '#ffffff',
            borderRadius: '12px',
            mb: 4,
            '& .MuiAlert-icon': {
              color: colors.red,
            },
          }}
          action={
            <Button color='inherit' size='small' onClick={handleRetry} disabled={retrying}>
              {retrying ? 'Chargement...' : 'Réessayer'}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {courses.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {courses.map((course, index) => {
            const progress = course.progression || course.progress || 0;
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
                  <Box
                    sx={{
                      width: '100%',
                      height: 160,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${colors.red}33, ${colors.purple}33)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <BookOpen size={40} color={colors.red} style={{ opacity: 0.7 }} />
                    {progress === 100 && (
                      <Tooltip title='Cours terminé'>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: colors.success,
                            p: 1,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckCircle size={20} color='white' />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.title || course.titre || 'Cours sans titre'}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description || 'Pas de description disponible'}
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {course.level && (
                        <Chip
                          label={`Niveau: ${course.level}`}
                          size='small'
                          sx={{
                            backgroundColor: `${colors.purple}33`,
                            color: colors.purple,
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          }}
                        />
                      )}
                      {course.categorie && (
                        <Chip
                          label={course.categorie}
                          size='small'
                          sx={{
                            backgroundColor: `${colors.red}33`,
                            color: colors.red,
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          }}
                        />
                      )}
                    </Box>
                    {course.duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={16} color={colors.pink} />
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          }}
                        >
                          {course.duration} heures
                        </Typography>
                      </Box>
                    )}
                    {course.instructeurId && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size={16} color={colors.pink} />
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          }}
                        >
                          {(course.instructeurId?.prenom || course.instructeur?.prenom || '') +
                            ' ' +
                            (course.instructeurId?.nom ||
                              course.instructeur?.nom ||
                              'Instructeur inconnu')}
                        </Typography>
                      </Box>
                    )}
                    <Box>
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
                            fontSize: { xs: '0.8rem', sm: '0.85rem' },
                          }}
                        >
                          Progression
                        </Typography>
                        <Typography
                          sx={{
                            color: progressColor,
                            fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            fontWeight: 600,
                          }}
                        >
                          {progress}%
                        </Typography>
                      </Box>
                      <ProgressBar variant='determinate' value={progress} />
                      <Typography
                        sx={{
                          color: progressColor,
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          mt: 0.5,
                          fontWeight: 500,
                        }}
                      >
                        {progressLabel}
                      </Typography>
                    </Box>
                  </Stack>
                  <StyledButton
                    fullWidth
                    endIcon={<ArrowRight size={18} />}
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
            <BookOpen size={80} color={colors.red} style={{ opacity: 0.2 }} />
            <Box>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '1.2rem', sm: '1.3rem' },
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Aucun cours inscrit
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
              >
                Explorez notre catalogue et inscrivez-vous à un cours pour commencer
              </Typography>
            </Box>
            <StyledButton
              onClick={() => navigate('/catalog')}
              endIcon={<ArrowRight size={18} />}
              aria-label='Découvrir les cours'
            >
              Découvrir les cours
            </StyledButton>
          </EmptyStateBox>
        )
      )}
    </Box>
  );
};

export default MyCourses;
