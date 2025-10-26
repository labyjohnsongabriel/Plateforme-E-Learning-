import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  Fade,
  CircularProgress,
  Alert,
  Stack,
  Button,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, TrendingUp, Award, Clock, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Colors - Définir d'abord les couleurs
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
};

// Animations - Définir après les couleurs
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px ${colors.purple}4d; }
  50% { box-shadow: 0 0 20px ${colors.purple}80; }
`;

// Styled Components
const ProgressCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 32px ${colors.navy}66`,
    animation: `${glow} 2s ease-in-out infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink}, ${colors.purple})`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    borderRadius: '12px',
  },
}));

const CourseProgressCard = styled(Card)(({ theme, progress }) => ({
  background: `linear-gradient(135deg, ${colors.navy}80, ${colors.lightNavy}80)`,
  borderRadius: '14px',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderLeft: `5px solid ${
    progress >= 80 ? colors.success : 
    progress >= 50 ? colors.purple : 
    progress >= 25 ? colors.warning : colors.red
  }`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateX(8px) translateY(-2px)',
    boxShadow: `0 8px 24px ${colors.navy}4d`,
    borderLeftColor: colors.pink,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: '10px',
  },
}));

const ProgressCircle = styled(Box)(({ progress, color }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: `conic-gradient(${color} ${progress}%, ${colors.navy}40 ${progress}%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: colors.navy,
  },
}));

const StyledButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: 600,
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 24px ${colors.red}66`,
    background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`,
  borderRadius: '14px',
  padding: theme.spacing(2),
  border: `1px solid ${colors.purple}33`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: colors.purple,
  },
}));

// Utilities
const isTokenExpired = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      console.error('❌ Invalid token format');
      return true;
    }
    const decoded = jwtDecode(token);
    if (!decoded.exp) {
      console.error('❌ Token missing expiration claim');
      return true;
    }
    const isExpired = decoded.exp * 1000 < Date.now();
    console.log('🔐 Token expiration check:', {
      exp: new Date(decoded.exp * 1000),
      now: new Date(),
      isExpired,
    });
    return isExpired;
  } catch (error) {
    console.error('❌ Token decoding error:', error.message);
    return true;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryRequest = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (
        attempt === maxRetries ||
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        err.response?.status === 404
      ) {
        throw err;
      }
      const delay = baseDelay * 2 ** (attempt - 1);
      console.warn(`⏳ Retrying request (attempt ${attempt}/${maxRetries}) after ${delay}ms`);
      await sleep(delay);
    }
  }
};

const getProgressColor = (progress) => {
  if (progress >= 80) return colors.success;
  if (progress >= 50) return colors.purple;
  if (progress >= 25) return colors.warning;
  return colors.red;
};

const getProgressLabel = (progress) => {
  if (progress >= 90) return 'Excellent';
  if (progress >= 75) return 'Très bien';
  if (progress >= 50) return 'Bon';
  if (progress >= 25) return 'En cours';
  return 'Débutant';
};

const Progress = () => {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const navigate = useNavigate();
  const [globalProgress, setGlobalProgress] = useState(0);
  const [courseProgresses, setCourseProgresses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    averageProgress: 0,
    totalTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const fetchProgress = useCallback(async () => {
    try {
      // Vérifier l'utilisateur et le token
      if (!user) {
        console.error('❌ No user found');
        setError('Utilisateur non authentifié');
        logout();
        navigate('/login');
        return;
      }

      if (!user.token) {
        console.error('❌ No token found');
        setError('Token manquant, veuillez vous reconnecter');
        logout();
        navigate('/login');
        return;
      }

      if (isTokenExpired(user.token)) {
        console.error('❌ Token expired');
        setError('Session expirée, veuillez vous reconnecter');
        logout();
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('📊 Fetching global progress for user:', {
        userId: user.id,
        role: user.role,
        url: `${API_BASE_URL}/learning/progress/global`,
      });

      const response = await retryRequest(() =>
        axios.get(`${API_BASE_URL}/learning/progress/global`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        })
      );

      console.log('✅ Progress response:', {
        status: response.status,
        data: response.data,
      });

      // Vérifier le format de la réponse
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Format de réponse invalide');
      }

      // Extraire les données
      const { progress, courseProgresses, stats } = response.data;

      // Valider les données
      if (typeof progress !== 'number') {
        throw new Error('Progression globale non numérique dans la réponse');
      }

      if (!Array.isArray(courseProgresses)) {
        throw new Error('Liste des progressions par cours invalide');
      }

      setGlobalProgress(progress);
      setCourseProgresses(courseProgresses);
      setStats(stats || {
        totalCourses: courseProgresses.length,
        completedCourses: courseProgresses.filter(cp => cp.progress >= 95).length,
        averageProgress: progress,
        totalTime: courseProgresses.reduce((acc, cp) => acc + (cp.timeSpent || 0), 0),
      });

      console.log('✅ Progress loaded successfully:', {
        globalProgress: progress,
        courseCount: courseProgresses.length,
        stats,
      });
    } catch (err) {
      console.error('❌ Fetch progress error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        code: err.code,
      });

      let errorMessage = 'Erreur lors du chargement de la progression';

      if (err.response?.status === 401) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        logout();
        navigate('/login');
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions requises";
      } else if (err.response?.status === 404) {
        errorMessage = 'Service de progression non disponible';
      } else if (err.response?.status === 500) {
        errorMessage = err.response?.data?.message || 'Erreur serveur';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de se connecter au serveur';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Erreur réseau - veuillez vérifier votre connexion';
      }

      setError(errorMessage);
      setGlobalProgress(0);
      setCourseProgresses([]);
      setStats({
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        totalTime: 0,
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [user, logout, navigate, API_BASE_URL]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await fetchProgress();
  }, [fetchProgress]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // État de chargement
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
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
          animation: `${fadeInUp} 0.5s ease-out`,
          p: 3,
        }}
      >
        <CircularProgress 
          sx={{ 
            color: colors.pink,
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }} 
          size={60} 
          thickness={4} 
        />
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 500,
            mt: 3,
            textAlign: 'center',
          }}
        >
          Chargement de votre progression...
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            mt: 1,
            textAlign: 'center',
          }}
        >
          Préparation de vos statistiques détaillées
        </Typography>
      </Box>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
          p: { xs: 2, sm: 4 },
        }}
      >
        <Alert
          severity='error'
          sx={{
            width: { xs: '100%', sm: '80%', md: '50%' },
            background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`,
            color: '#ffffff',
            borderRadius: '16px',
            p: 3,
            border: `1px solid ${colors.red}33`,
            backdropFilter: 'blur(20px)',
            '& .MuiAlert-icon': {
              color: colors.pink,
            },
          }}
          action={
            <StyledButton
              size='small'
              onClick={handleRetry}
              disabled={retrying}
              startIcon={<RotateCcw size={18} />}
              sx={{ mt: 1 }}
            >
              {retrying ? 'Réessai...' : 'Réessayer'}
            </StyledButton>
          }
        >
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
              Erreur de Chargement
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.5 }}>
              {error}
            </Typography>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Affichage principal
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      {/* En-tête */}
      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 4, sm: 5 } }}>
          <Typography
            variant='h4'
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.6rem', sm: '2rem', md: '2.5rem' },
              textAlign: { xs: 'center', sm: 'left' },
              fontFamily: "'Poppins', sans-serif",
              background: `linear-gradient(135deg, ${colors.pink}, ${colors.purple})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ma Progression d'Apprentissage
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              textAlign: { xs: 'center', sm: 'left' },
              fontFamily: "'Ubuntu', sans-serif",
            }}
          >
            Suivez votre évolution et vos performances
          </Typography>
        </Box>
      </Fade>

      {/* Statistiques Globales */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: { xs: 3, sm: 4 } }}>
        <StatsCard>
          <BookOpen size={24} color={colors.purple} />
          <Typography variant='h6' sx={{ color: '#ffffff', mt: 1, fontWeight: 600 }}>
            {stats.totalCourses}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Cours Suivis
          </Typography>
        </StatsCard>

        <StatsCard>
          <Award size={24} color={colors.success} />
          <Typography variant='h6' sx={{ color: '#ffffff', mt: 1, fontWeight: 600 }}>
            {stats.completedCourses}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Cours Terminés
          </Typography>
        </StatsCard>

        <StatsCard>
          <TrendingUp size={24} color={colors.pink} />
          <Typography variant='h6' sx={{ color: '#ffffff', mt: 1, fontWeight: 600 }}>
            {stats.averageProgress}%
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Progression Moyenne
          </Typography>
        </StatsCard>

        <StatsCard>
          <Clock size={24} color={colors.warning} />
          <Typography variant='h6' sx={{ color: '#ffffff', mt: 1, fontWeight: 600 }}>
            {formatTime(stats.totalTime)}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Temps Total
          </Typography>
        </StatsCard>
      </Stack>

      {/* Progression Globale */}
      <ProgressCard elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Progression Globale
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.95rem',
                fontFamily: "'Ubuntu', sans-serif",
              }}
            >
              {getProgressLabel(globalProgress)} • {courseProgresses.length} cours enregistrés
            </Typography>
          </Box>
          <Chip
            label={`${globalProgress}%`}
            sx={{
              background: `linear-gradient(135deg, ${getProgressColor(globalProgress)}, ${colors.pink})`,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          />
        </Box>

        <LinearProgress
          variant='determinate'
          value={globalProgress}
          sx={{
            height: 16,
            borderRadius: 8,
            backgroundColor: `${colors.red}33`,
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${colors.red}, ${colors.pink}, ${colors.purple})`,
              borderRadius: 8,
              animation: `${pulse} 2s ease-in-out infinite`,
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
              fontFamily: "'Ubuntu', sans-serif",
            }}
          >
            Début
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
              fontFamily: "'Ubuntu', sans-serif",
            }}
          >
            Maîtrise
          </Typography>
        </Box>
      </ProgressCard>

      {/* Progression par Cours */}
      {courseProgresses.length > 0 && (
        <Box sx={{ mt: { xs: 4, sm: 5 } }}>
          <Typography
            variant='h5'
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 3,
              fontSize: { xs: '1.3rem', sm: '1.5rem' },
              fontFamily: "'Poppins', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingUp size={24} />
            Progression par Cours
          </Typography>

          <Stack spacing={2}>
            {courseProgresses.map((cp) => (
              <CourseProgressCard
                key={cp.coursId}
                elevation={0}
                progress={cp.progress}
                onClick={() => navigate(`/student/course/${cp.coursId}`)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        fontFamily: "'Poppins', sans-serif",
                        lineHeight: 1.3,
                      }}
                    >
                      {cp.title || 'Cours sans titre'}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Chip
                        label={`${cp.progress}%`}
                        size='small'
                        sx={{
                          background: getProgressColor(cp.progress),
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      />
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem',
                          fontFamily: "'Ubuntu', sans-serif",
                        }}
                      >
                        Niveau: {cp.level || 'Non spécifié'}
                      </Typography>
                      {cp.timeSpent > 0 && (
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.8rem',
                            fontFamily: "'Ubuntu', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Clock size={14} />
                          {formatTime(cp.timeSpent)}
                        </Typography>
                      )}
                    </Box>

                    <LinearProgress
                      variant='determinate'
                      value={cp.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${colors.red}33`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${getProgressColor(cp.progress)}, ${colors.pink})`,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Tooltip title={`${getProgressLabel(cp.progress)} - Cliquer pour ouvrir`}>
                    <IconButton
                      sx={{
                        ml: 2,
                        color: getProgressColor(cp.progress),
                        '&:hover': {
                          background: `${getProgressColor(cp.progress)}22`,
                        },
                      }}
                    >
                      <TrendingUp size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CourseProgressCard>
            ))}
          </Stack>
        </Box>
      )}

      {/* Message si aucun cours */}
      {courseProgresses.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            mt: { xs: 6, sm: 8 },
            py: 6,
          }}
        >
          <BookOpen size={64} color={colors.purple} style={{ opacity: 0.5, marginBottom: 16 }} />
          <Typography
            variant='h6'
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              mb: 1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Aucun cours en progression
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              mb: 3,
              fontFamily: "'Ubuntu', sans-serif",
            }}
          >
            Commencez votre parcours d'apprentissage dès maintenant
          </Typography>
          <StyledButton onClick={() => navigate('/courses')} startIcon={<BookOpen size={18} />}>
            Découvrir les Cours
          </StyledButton>
        </Box>
      )}

      {/* Actions */}
      <Fade in timeout={1200}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pt: 2 }}>
          <StyledButton
            onClick={handleRetry}
            startIcon={<RotateCcw size={18} />}
            variant='outlined'
            sx={{
              background: 'transparent',
              border: `2px solid ${colors.purple}`,
              color: colors.purple,
              '&:hover': {
                background: colors.purple,
                color: '#ffffff',
              },
            }}
          >
            Actualiser la Progression
          </StyledButton>
        </Box>
      </Fade>
    </Box>
  );
};

export default Progress;