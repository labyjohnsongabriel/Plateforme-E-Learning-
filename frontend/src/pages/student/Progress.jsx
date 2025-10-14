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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Colors
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  success: '#4caf50',
};

// Styled Components
const ProgressCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(2.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${colors.navy}4d`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const CourseProgressCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}80, ${colors.lightNavy}80)`,
  borderRadius: '12px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${colors.purple}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderLeftColor: colors.pink,
    transform: 'translateX(4px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
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

const Progress = () => {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const navigate = useNavigate();
  const [globalProgress, setGlobalProgress] = useState(0);
  const [courseProgresses, setCourseProgresses] = useState([]);
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
      const { progress, courseProgresses } = response.data;

      // Valider les données
      if (typeof progress !== 'number') {
        throw new Error('Progression globale non numérique dans la réponse');
      }

      if (!Array.isArray(courseProgresses)) {
        throw new Error('Liste des progressions par cours invalide');
      }

      setGlobalProgress(progress);
      setCourseProgresses(courseProgresses);

      console.log('✅ Progress loaded successfully:', {
        globalProgress: progress,
        courseCount: courseProgresses.length,
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

  // État de chargement
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: colors.navy,
          animation: `${fadeInUp} 0.5s ease-out`,
        }}
      >
        <CircularProgress sx={{ color: colors.pink }} size={50} thickness={5} />
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1rem', sm: '1.2rem' },
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 500,
            mt: 2,
          }}
        >
          Chargement de la progression...
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
          height: '100vh',
          width: '100vw',
          bgcolor: colors.navy,
          p: { xs: 2, sm: 4 },
        }}
      >
        <Alert
          severity='error'
          sx={{
            width: { xs: '100%', sm: '80%', md: '50%' },
            bgcolor: `${colors.red}1a`,
            color: '#ffffff',
            borderRadius: '12px',
            p: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
          action={
            <StyledButton
              size='small'
              onClick={handleRetry}
              disabled={retrying}
              endIcon={<RotateCcw size={16} />}
            >
              {retrying ? 'Réessai...' : 'Réessayer'}
            </StyledButton>
          }
        >
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Erreur</Typography>
            <Typography sx={{ fontSize: '0.95rem' }}>{error}</Typography>
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
        bgcolor: colors.navy,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      {/* En-tête */}
      <Fade in timeout={800}>
        <Typography
          variant='h4'
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            mb: { xs: 3, sm: 4 },
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
            textAlign: { xs: 'center', sm: 'left' },
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Ma Progression
        </Typography>
      </Fade>

      {/* Progression Globale */}
      <ProgressCard elevation={0}>
        <Typography
          variant='h5'
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Progression Globale ({courseProgresses.length} cours)
        </Typography>
        <LinearProgress
          variant='determinate'
          value={globalProgress}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: `${colors.red}33`,
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
            },
          }}
        />
        <Typography
          sx={{
            color: '#ffffff',
            mt: 1,
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
            textAlign: 'right',
            fontFamily: "'Ubuntu', sans-serif",
          }}
        >
          Complété : {globalProgress}%
        </Typography>
      </ProgressCard>

      {/* Progression par Cours */}
      {courseProgresses.length > 0 && (
        <Stack spacing={2} sx={{ mt: { xs: 3, sm: 4 } }}>
          <Typography
            variant='h6'
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Progression par Cours
          </Typography>
          {courseProgresses.map((cp) => (
            <CourseProgressCard
              key={cp.coursId}
              elevation={0}
              onClick={() => navigate(`/student/course/${cp.coursId}`)}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {cp.title || 'Cours sans titre'}
              </Typography>
              <LinearProgress
                variant='determinate'
                value={cp.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: `${colors.red}33`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(135deg, ${colors.purple}, ${colors.pink})`,
                  },
                }}
              />
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  mt: 1,
                  fontFamily: "'Ubuntu', sans-serif",
                }}
              >
                Progression: {cp.progress}% | Niveau: {cp.level || 'Non spécifié'}
              </Typography>
            </CourseProgressCard>
          ))}
        </Stack>
      )}

      {/* Message si aucun cours */}
      {courseProgresses.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            mt: { xs: 4, sm: 6 },
            py: 4,
          }}
        >
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
            }}
          >
            Aucun cours en progression pour le moment
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Progress;
