// CoursePlayer.jsx - Composant complet de lecteur de cours
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import DocumentViewer from './DocumentViewer';
import QuizComponent from './QuizComponent';
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
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Play,
  FileText,
  HelpCircle,
  Home,
  BookOpen,
} from 'lucide-react';
import axios from 'axios';

// === CONFIGURATION ===
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// === ANIMATIONS ===
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
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

// === COULEURS PREMIUM ===
const colors = {
  navy: '#010b40',
  darkNavy: '#00072d',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  border: 'rgba(241, 53, 68, 0.2)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
};

// === STYLED COMPONENTS ===
const GlassCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '24px',
  padding: '32px',
  maxWidth: '1000px',
  margin: 'auto',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.7s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 25px 60px ${colors.navy}80`,
    borderColor: colors.red,
  },
}));

const SidebarCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(15px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '20px',
  animation: `${slideInRight} 0.6s ease-out forwards`,
  '& .MuiCardContent-root': {
    padding: '20px',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '14px',
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '0.95rem',
  border: `1px solid ${colors.border}`,
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: `${colors.red}1a`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${colors.red}33`,
  },
  '&:disabled': {
    borderColor: `${colors.border}40`,
    color: 'rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.05)',
  },
}));

const CompleteButton = styled(Button)(({ theme, completed }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}, #34d399)`
    : `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  borderRadius: '14px',
  padding: '14px 36px',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: completed ? `0 8px 25px ${colors.success}4d` : `0 8px 25px ${colors.red}4d`,
  transition: 'all 0.3s ease',
  animation: completed ? 'none' : `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: completed ? `0 15px 35px ${colors.success}66` : `0 15px 35px ${colors.red}66`,
    background: completed
      ? `linear-gradient(135deg, #34d399, ${colors.success})`
      : `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
  },
  '&:disabled': {
    animation: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    boxShadow: 'none',
  },
}));

const ProgressIndicator = styled(Box)(({ theme, progress }) => ({
  position: 'relative',
  width: '60px',
  height: '60px',
  '& .MuiCircularProgress-root': {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  '& .progress-text': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.8rem',
  },
}));

// === CONFETTI FALLBACK AMÉLIORÉ ===
const triggerConfetti = () => {
  if (typeof window === 'undefined') return;

  try {
    // Essayer d'utiliser canvas-confetti si disponible
    const confetti = require('canvas-confetti');
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch (error) {
    // Fallback personnalisé
    const fallbackConfetti = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(canvas);

      const particles = [];
      const colors = [colors.red, colors.pink, colors.purple, colors.success, '#fbbf24'];

      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -Math.random() * canvas.height,
          size: Math.random() * 8 + 4,
          speed: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          sway: Math.random() * 2 - 1,
        });
      }

      let animationId;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeParticles = 0;
        particles.forEach((particle) => {
          particle.y += particle.speed;
          particle.x += particle.sway;

          if (particle.y < canvas.height) {
            activeParticles++;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        if (activeParticles > 0) {
          animationId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(animationId);
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas);
          }
        }
      };

      animate();
    };

    fallbackConfetti();
  }
};

// === COMPOSANT PRINCIPAL ===
const CoursePlayer = () => {
  const { courseId, contenuId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [contenu, setContenu] = useState(null);
  const [contenus, setContenus] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [completing, setCompleting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // === CHARGEMENT DES DONNÉES ===
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        setError('ID de cours manquant');
        setLoading(false);
        return;
      }

      if (!headers.Authorization) {
        navigate('/login', {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Charger les données du cours et des contenus en parallèle
        const [courseRes, contenusRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/courses/${courseId}`, { headers }),
          axios.get(`${API_BASE_URL}/courses/contenu`, {
            params: { courseId },
            headers,
          }),
        ]);

        const courseData = courseRes.data?.data || courseRes.data;
        const contenusData = contenusRes.data?.data || contenusRes.data || [];

        if (!courseData) {
          throw new Error('Cours non trouvé');
        }

        if (!Array.isArray(contenusData)) {
          throw new Error('Format de données des contenus invalide');
        }

        setCourse(courseData);
        setContenus(contenusData);

        // Gérer le contenu actuel
        let currentContenu = null;
        if (contenuId) {
          currentContenu = contenusData.find((c) => c._id === contenuId);
        }

        if (!currentContenu && contenusData.length > 0) {
          // Rediriger vers le premier contenu si le contenu actuel n'est pas trouvé
          navigate(`/student/learn/${courseId}/contenu/${contenusData[0]._id}`, {
            replace: true,
          });
          return;
        }

        if (currentContenu) {
          setContenu(currentContenu);
          setIsCompleted(currentContenu.isCompleted || false);
        }

        // Charger la progression
        try {
          const progressRes = await axios.get(`${API_BASE_URL}/learning/progress/${courseId}`, {
            headers,
          });
          const progressData = progressRes.data?.data || progressRes.data;
          setProgress(progressData?.pourcentage || 0);
        } catch (progressError) {
          console.warn('Erreur lors du chargement de la progression:', progressError);
          // Calculer la progression localement en fallback
          const completedCount = contenusData.filter((c) => c.isCompleted).length;
          const localProgress =
            contenusData.length > 0 ? Math.round((completedCount / contenusData.length) * 100) : 0;
          setProgress(localProgress);
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
        const errorMessage =
          err.response?.data?.message || err.message || 'Erreur lors du chargement du cours';
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, contenuId, navigate, headers, location.pathname]);

  // === MARQUER COMME TERMINÉ ===
  const handleComplete = useCallback(async () => {
    if (!headers.Authorization || completing || isCompleted) return;

    setCompleting(true);

    try {
      // Marquer le contenu comme terminé
      await axios.put(`${API_BASE_URL}/courses/contenu/${contenuId}/complete`, {}, { headers });

      // Mettre à jour l'état local
      setIsCompleted(true);

      // Mettre à jour la liste des contenus
      setContenus((prev) =>
        prev.map((c) => (c._id === contenuId ? { ...c, isCompleted: true } : c))
      );

      // Calculer la nouvelle progression
      const completedCount = contenus.filter((c) =>
        c._id === contenuId ? true : c.isCompleted
      ).length;
      const newProgress =
        contenus.length > 0 ? Math.round((completedCount / contenus.length) * 100) : 0;

      // Mettre à jour la progression sur le serveur
      try {
        await axios.put(
          `${API_BASE_URL}/learning/progress/${courseId}`,
          { pourcentage: newProgress },
          { headers }
        );
      } catch (progressError) {
        console.warn('Erreur de mise à jour de la progression:', progressError);
      }

      setProgress(newProgress);

      // Effet de confetti
      triggerConfetti();

      // Navigation automatique ou message de félicitations
      const currentIndex = contenus.findIndex((c) => c._id === contenuId);
      if (currentIndex < contenus.length - 1) {
        // Naviguer vers le contenu suivant après un délai
        setTimeout(() => {
          navigate(`/student/learn/${courseId}/contenu/${contenus[currentIndex + 1]._id}`);
        }, 1500);
      } else {
        // Cours terminé
        setSnackbar({
          open: true,
          message: '🎉 Félicitations ! Vous avez terminé ce cours !',
          severity: 'success',
        });
      }
    } catch (err) {
      console.error('Erreur de complétion:', err);
      setSnackbar({
        open: true,
        message: 'Erreur lors du marquage comme terminé',
        severity: 'error',
      });
    } finally {
      setCompleting(false);
    }
  }, [contenuId, contenus, courseId, navigate, headers, completing, isCompleted]);

  // === SOUMISSION DE QUIZ ===
  const handleQuizSubmit = useCallback(
    async (answers) => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/courses/contenu/${contenuId}/soumettre`,
          { answers },
          { headers }
        );

        if (res.data.success) {
          handleComplete();
        } else {
          setSnackbar({
            open: true,
            message: 'Quiz soumis avec succès !',
            severity: 'success',
          });
          handleComplete();
        }
      } catch (err) {
        console.error('Erreur de soumission du quiz:', err);
        setSnackbar({
          open: true,
          message: 'Erreur lors de la soumission du quiz',
          severity: 'error',
        });
      }
    },
    [contenuId, headers, handleComplete]
  );

  // === NAVIGATION ===
  const goToContent = useCallback(
    (direction) => {
      const currentIndex = contenus.findIndex((c) => c._id === contenuId);
      let targetIndex = currentIndex;

      if (direction === 'prev' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'next' && currentIndex < contenus.length - 1) {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex !== currentIndex) {
        navigate(`/student/learn/${courseId}/contenu/${contenus[targetIndex]._id}`);
      }
    },
    [contenus, contenuId, courseId, navigate]
  );

  const currentIndex = useMemo(
    () => contenus.findIndex((c) => c._id === contenuId),
    [contenus, contenuId]
  );

  // === GESTIONNAIRES D'ÉVÉNEMENTS ===
  const handleVideoProgress = useCallback((progress) => {
    setVideoProgress(progress);
  }, []);

  const handleVideoEnd = useCallback(() => {
    if (!isCompleted && contenu?.type === 'video') {
      handleComplete();
    }
  }, [isCompleted, contenu?.type, handleComplete]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleGoHome = useCallback(() => {
    navigate('/student/dashboard');
  }, [navigate]);

  const handleGoToCourses = useCallback(() => {
    navigate('/student/courses');
  }, [navigate]);

  // === ÉCRAN DE CHARGEMENT ===
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
          color: '#ffffff',
          gap: 3,
        }}
      >
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: colors.red,
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        />
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          Chargement du cours...
        </Typography>
        <Typography variant='body1' sx={{ opacity: 0.8 }}>
          Préparation de votre expérience d'apprentissage
        </Typography>
      </Box>
    );
  }

  // === ÉCRAN D'ERREUR ===
  if (error || !course || contenus.length === 0) {
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
          color: '#ffffff',
          gap: 4,
          p: 3,
        }}
      >
        <Box
          sx={{
            animation: `${pulse} 2s ease-in-out infinite`,
            textAlign: 'center',
          }}
        >
          <AlertCircle size={80} color={colors.red} />
        </Box>

        <Typography variant='h4' sx={{ fontWeight: 700, textAlign: 'center' }}>
          Oups ! Quelque chose s'est mal passé
        </Typography>

        <Typography variant='h6' sx={{ opacity: 0.8, textAlign: 'center', maxWidth: '500px' }}>
          {error || 'Le cours demandé est indisponible ou a été supprimé.'}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Button
            onClick={handleRetry}
            startIcon={<RotateCw size={20} />}
            variant='contained'
            sx={{
              background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${colors.red}4d`,
              },
            }}
          >
            Réessayer
          </Button>

          <Button
            onClick={handleGoHome}
            startIcon={<Home size={20} />}
            variant='outlined'
            sx={{
              borderColor: colors.border,
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 600,
              '&:hover': {
                borderColor: colors.red,
                backgroundColor: `${colors.red}1a`,
              },
            }}
          >
            Retour à l'accueil
          </Button>

          <Button
            onClick={handleGoToCourses}
            startIcon={<BookOpen size={20} />}
            variant='outlined'
            sx={{
              borderColor: colors.border,
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 600,
              '&:hover': {
                borderColor: colors.purple,
                backgroundColor: `${colors.purple}1a`,
              },
            }}
          >
            Mes cours
          </Button>
        </Stack>
      </Box>
    );
  }

  // === RENDU PRINCIPAL ===
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
        position: 'relative',
        overflowX: 'hidden',
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
            radial-gradient(circle at 20% 20%, ${colors.red}08, transparent 50%),
            radial-gradient(circle at 80% 80%, ${colors.purple}08, transparent 50%),
            radial-gradient(circle at 40% 40%, ${colors.pink}06, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in timeout={800}>
          <Box>
            {/* EN-TÊTE FIXE */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: `linear-gradient(135deg, ${colors.glassDark}, ${colors.navy}ee)`,
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${colors.border}`,
                py: 2,
                px: { xs: 2, md: 4 },
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent='space-between'
                alignItems='center'
                spacing={3}
              >
                {/* Navigation */}
                <Stack direction='row' spacing={2} alignItems='center'>
                  <NavButton
                    startIcon={<ArrowLeft size={20} />}
                    onClick={() => navigate(`/student/course/${courseId}`)}
                  >
                    Retour au cours
                  </NavButton>

                  <Typography
                    variant='h6'
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      display: { xs: 'none', md: 'block' },
                    }}
                  >
                    {course.titre}
                  </Typography>
                </Stack>

                {/* Progression */}
                <Stack
                  direction='row'
                  spacing={3}
                  alignItems='center'
                  sx={{ width: { xs: '100%', md: 'auto' } }}
                >
                  <Box sx={{ flex: 1, maxWidth: '400px' }}>
                    <Typography
                      variant='body2'
                      sx={{
                        color: '#ffffff',
                        mb: 1,
                        textAlign: { xs: 'center', md: 'left' },
                        fontWeight: 600,
                      }}
                    >
                      Progression globale: {Math.round(progress)}%
                    </Typography>
                    <LinearProgress
                      variant='determinate'
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${colors.navy}99`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                          borderRadius: 4,
                          animation: `${glow} 2s ease-in-out infinite`,
                        },
                      }}
                    />
                  </Box>

                  <ProgressIndicator progress={progress}>
                    <CircularProgress
                      variant='determinate'
                      value={progress}
                      size={60}
                      thickness={4}
                      sx={{
                        color: colors.red,
                        animation: `${glow} 2s ease-in-out infinite`,
                      }}
                    />
                    <div className='progress-text'>{Math.round(progress)}%</div>
                  </ProgressIndicator>
                </Stack>
              </Stack>
            </Box>

            {/* CONTENU PRINCIPAL */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 4,
                p: { xs: 2, md: 4 },
                minHeight: 'calc(100vh - 100px)',
              }}
            >
              {/* BARRE LATÉRALE - LISTE DES CONTENUS */}
              <Box sx={{ width: { xs: '100%', lg: 350 }, order: { xs: 2, lg: 1 } }}>
                <SidebarCard>
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#ffffff',
                        fontWeight: 700,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <BookOpen size={20} />
                      Plan du cours
                    </Typography>

                    <List sx={{ p: 0 }}>
                      {contenus.map((content, index) => (
                        <React.Fragment key={content._id}>
                          <ListItem
                            button
                            selected={content._id === contenuId}
                            onClick={() =>
                              navigate(`/student/learn/${courseId}/contenu/${content._id}`)
                            }
                            sx={{
                              borderRadius: '12px',
                              mb: 1,
                              py: 2,
                              transition: 'all 0.3s ease',
                              border:
                                content._id === contenuId
                                  ? `2px solid ${colors.red}`
                                  : '2px solid transparent',
                              '&.Mui-selected': {
                                backgroundColor: `${colors.red}15`,
                                '&:hover': {
                                  backgroundColor: `${colors.red}25`,
                                },
                              },
                              '&:hover': {
                                backgroundColor: `${colors.red}10`,
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  {/* Icône selon le type */}
                                  {content.type === 'video' && (
                                    <Play size={18} color={colors.red} />
                                  )}
                                  {content.type === 'document' && (
                                    <FileText size={18} color={colors.purple} />
                                  )}
                                  {content.type === 'quiz' && (
                                    <HelpCircle size={18} color={colors.warning} />
                                  )}

                                  <Typography
                                    variant='body1'
                                    sx={{
                                      color: '#ffffff',
                                      fontWeight: content._id === contenuId ? 700 : 500,
                                      fontSize: '0.9rem',
                                    }}
                                  >
                                    {content.titre || `Contenu ${index + 1}`}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Typography
                                  variant='caption'
                                  sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}
                                >
                                  Durée: {content.duree || 'N/A'} • Étape {index + 1}
                                </Typography>
                              }
                            />

                            {/* Indicateur de complétion */}
                            {content.isCompleted && (
                              <CheckCircle
                                size={20}
                                color={colors.success}
                                style={{ flexShrink: 0 }}
                              />
                            )}
                          </ListItem>

                          {index < contenus.length - 1 && (
                            <Divider sx={{ bgcolor: colors.borderLight, my: 1 }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </SidebarCard>
              </Box>

              {/* CONTENU DU COURS */}
              <GlassCard sx={{ order: { xs: 1, lg: 2 }, flex: 1 }}>
                <Stack spacing={4}>
                  {/* En-tête du contenu */}
                  <Box>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent='space-between'
                      sx={{ mb: 3 }}
                    >
                      <Box>
                        <Chip
                          label={contenu?.type?.toUpperCase() || 'CONTENU'}
                          size='small'
                          sx={{
                            bgcolor:
                              contenu?.type === 'video'
                                ? colors.red
                                : contenu?.type === 'document'
                                  ? colors.purple
                                  : contenu?.type === 'quiz'
                                    ? colors.warning
                                    : colors.success,
                            color: '#ffffff',
                            fontWeight: 700,
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant='h3'
                          sx={{
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            lineHeight: 1.2,
                          }}
                        >
                          {contenu?.titre || 'Titre non disponible'}
                        </Typography>
                      </Box>

                      {isCompleted && (
                        <Chip
                          icon={<CheckCircle size={16} />}
                          label='TERMINÉ'
                          color='success'
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant='h6'
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 600,
                      }}
                    >
                      {course.titre}
                    </Typography>

                    {contenu?.description && (
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.7,
                          mt: 2,
                          fontSize: '1.1rem',
                        }}
                      >
                        {contenu.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Contenu spécifique selon le type */}
                  <Box sx={{ minHeight: '400px' }}>
                    {contenu?.type === 'video' && (
                      <VideoPlayer
                        videoUrl={contenu.url}
                        onProgress={handleVideoProgress}
                        onEnded={handleVideoEnd}
                        autoPlay={!isCompleted}
                      />
                    )}

                    {contenu?.type === 'document' && (
                      <DocumentViewer pdfUrl={contenu.url} title={contenu.titre} />
                    )}

                    {contenu?.type === 'quiz' && (
                      <QuizComponent
                        questions={contenu.questions || []}
                        onSubmit={handleQuizSubmit}
                        disabled={isCompleted}
                      />
                    )}
                  </Box>

                  {/* Actions de navigation */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ mt: 4 }}
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <NavButton
                      startIcon={<ArrowLeft size={20} />}
                      onClick={() => goToContent('prev')}
                      disabled={currentIndex === 0}
                      sx={{ minWidth: '140px' }}
                    >
                      Précédent
                    </NavButton>

                    {/* Bouton de complétion conditionnel */}
                    {!isCompleted && contenu?.type !== 'quiz' && (
                      <CompleteButton
                        onClick={handleComplete}
                        disabled={completing}
                        completed={isCompleted}
                        sx={{ minWidth: '200px' }}
                      >
                        {completing ? (
                          <>
                            <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} />
                            Marquage...
                          </>
                        ) : (
                          'Marquer comme terminé'
                        )}
                      </CompleteButton>
                    )}

                    {isCompleted && (
                      <CompleteButton completed={true} disabled sx={{ minWidth: '200px' }}>
                        <CheckCircle size={20} style={{ marginRight: '8px' }} />
                        Terminé
                      </CompleteButton>
                    )}

                    <NavButton
                      endIcon={<ArrowRight size={20} />}
                      onClick={() => goToContent('next')}
                      disabled={currentIndex === contenus.length - 1}
                      sx={{ minWidth: '140px' }}
                    >
                      Suivant
                    </NavButton>
                  </Stack>

                  {/* Indicateur de progression */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {currentIndex + 1} sur {contenus.length} contenus • Progression:{' '}
                      {Math.round(
                        ((currentIndex + (isCompleted ? 1 : videoProgress)) / contenus.length) * 100
                      )}
                      %
                    </Typography>
                  </Box>
                </Stack>
              </GlassCard>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* SNACKBAR DE NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'success' ? 6000 : 8000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontWeight: 600,
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            backgroundColor: `${colors.glassDark}`,
            color: '#ffffff',
            border: `1px solid ${colors.border}`,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? colors.success : colors.red,
            },
          }}
          iconMapping={{
            success: <CheckCircle size={24} />,
            error: <AlertCircle size={24} />,
            warning: <AlertCircle size={24} />,
            info: <AlertCircle size={24} />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(CoursePlayer);
