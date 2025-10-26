// CoursePlayer.jsx - Version Professionnelle Complète
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
  BookOpen,
  Home,
  Award,
  Clock,
  User,
} from 'lucide-react';
import axios from 'axios';

// === CONFIGURATION PROFESSIONNELLE ===
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// === ANIMATIONS PROFESSIONNELLES ===
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

const slideInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-30px); 
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

const progressPulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

// === PALETTE DE COULEURS PROFESSIONNELLE ===
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  darkNavy: '#00072d',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  border: 'rgba(241, 53, 68, 0.2)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
};

// === COMPOSANTS STYLISÉS PROFESSIONNELS ===
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '28px',
  padding: theme.spacing(4),
  margin: 'auto',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.7s ease-out forwards`,
  boxShadow: `0 20px 40px ${colors.navy}40`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 30px 60px ${colors.navy}66`,
    borderColor: colors.red,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: '20px',
  },
}));

const SidebarCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '24px',
  animation: `${slideInLeft} 0.6s ease-out forwards`,
  boxShadow: `0 15px 35px ${colors.navy}40`,
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
    '&:last-child': {
      paddingBottom: theme.spacing(3),
    },
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '20px',
    '& .MuiCardContent-root': {
      padding: theme.spacing(2.5),
    },
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
  boxShadow: `0 4px 15px ${colors.navy}33`,
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
    boxShadow: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 20px',
    fontSize: '0.9rem',
  },
}));

const CompleteButton = styled(Button)(({ theme, completed }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}, #34d399)`
    : `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  borderRadius: '14px',
  padding: '14px 32px',
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
  [theme.breakpoints.down('sm')]: {
    padding: '12px 24px',
    fontSize: '0.95rem',
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 400,
  '& .progress-text': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '1.1rem',
    textShadow: `0 2px 4px ${colors.navy}80`,
  },
}));

// === SYSTÈME DE CONFETTI PROFESSIONNEL ===
const triggerConfetti = () => {
  if (typeof window === 'undefined') return;

  const launchConfetti = (origin, colors, count = 100) => {
    try {
      const confetti = require('canvas-confetti');
      confetti({
        particleCount: count,
        angle: 45,
        spread: 70,
        origin: origin,
        colors: colors,
        startVelocity: 45,
        decay: 0.9,
        gravity: 1,
        drift: 0,
        ticks: 200,
        scalar: 1.2,
      });
    } catch (error) {
      fallbackConfetti();
    }
  };

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
    const confettiColors = [
      colors.red,
      colors.pink,
      colors.purple,
      colors.success,
      colors.warning,
      colors.info,
    ];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        speed: Math.random() * 3 + 2,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        sway: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;
      particles.forEach((particle) => {
        particle.y += particle.speed;
        particle.x += particle.sway;
        particle.rotation += particle.rotationSpeed;

        if (particle.y < canvas.height) {
          activeParticles++;

          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation * Math.PI) / 180);

          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);

          ctx.restore();
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

  // Lancement multiple de confetti pour un effet professionnel
  launchConfetti({ x: 0.2, y: 0.6 }, [colors.red, colors.pink], 80);
  setTimeout(() => launchConfetti({ x: 0.8, y: 0.6 }, [colors.purple, colors.info], 80), 150);
  setTimeout(() => launchConfetti({ x: 0.5, y: 0.7 }, [colors.success, colors.warning], 60), 300);
};

// === COMPOSANT PRINCIPAL COURSEPLAYER ===
const CoursePlayer = () => {
  const { courseId, contenuId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // États professionnels avec gestion d'erreur
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

  // Références pour optimiser les performances
  const contentRef = useRef(null);

  // Headers d'authentification mémoïsés
  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : null;
  }, []);

  // === CHARGEMENT INTELLIGENT DES DONNÉES ===
  useEffect(() => {
    const fetchData = async () => {
      // Validation des paramètres
      if (!courseId || !/^[0-9a-fA-F]{24}$/.test(courseId)) {
        setError('Identifiant de cours invalide');
        setLoading(false);
        return;
      }

      if (!headers) {
        navigate('/login', {
          state: {
            from: location.pathname,
            message: 'Authentification requise pour accéder au cours',
          },
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Récupération parallèle des données pour de meilleures performances
        const [courseResponse, contenusResponse, progressResponse] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/courses/${courseId}`, {
            headers,
            timeout: 15000,
          }),
          axios.get(`${API_BASE_URL}/courses/contenu`, {
            params: { courseId },
            headers,
            timeout: 15000,
          }),
          axios.get(`${API_BASE_URL}/learning/progress/${courseId}`, { headers, timeout: 10000 }),
        ]);

        // Traitement de la réponse du cours
        if (courseResponse.status === 'rejected') {
          throw new Error(`Erreur cours: ${courseResponse.reason.message}`);
        }

        const courseData = courseResponse.value.data?.data || courseResponse.value.data;
        if (!courseData) {
          throw new Error('Données du cours non trouvées');
        }

        setCourse({
          ...courseData,
          titre: courseData.titre || courseData.title || 'Cours sans titre',
          description: courseData.description || 'Description non disponible',
        });

        // Traitement des contenus
        if (contenusResponse.status === 'fulfilled') {
          const contenusData =
            contenusResponse.value.data?.data || contenusResponse.value.data || [];

          if (!Array.isArray(contenusData)) {
            throw new Error('Format de données des contenus invalide');
          }

          const validContenus = contenusData
            .filter((contenu) => contenu && (contenu._id || contenu.id))
            .map((contenu, index) => ({
              ...contenu,
              _id: contenu._id || contenu.id,
              ordre: contenu.ordre || index + 1,
              titre: contenu.titre || contenu.title || `Contenu ${index + 1}`,
              description: contenu.description || 'Description non disponible',
              type: contenu.type || 'document',
              isCompleted: contenu.isCompleted || false,
            }));

          setContenus(validContenus);

          // Gestion du contenu actuel
          let currentContenu = null;
          if (contenuId) {
            currentContenu = validContenus.find((c) => c._id === contenuId);
          }

          if (!currentContenu && validContenus.length > 0) {
            // Redirection vers le premier contenu valide
            navigate(`/student/learn/${courseId}/contenu/${validContenus[0]._id}`, {
              replace: true,
            });
            return;
          }

          if (currentContenu) {
            setContenu(currentContenu);
            setIsCompleted(currentContenu.isCompleted || false);
          }
        } else {
          throw new Error(`Erreur contenus: ${contenusResponse.reason.message}`);
        }

        // Traitement de la progression
        if (progressResponse.status === 'fulfilled') {
          const progressData = progressResponse.value.data?.data || progressResponse.value.data;
          setProgress(progressData?.pourcentage || 0);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement du contenu du cours';

        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });

        // Redirection en cas d'erreur spécifique
        if (err.response?.status === 401) {
          setTimeout(() => {
            navigate('/login', {
              state: {
                from: location.pathname,
                message: 'Session expirée - Reconnexion requise',
              },
            });
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, contenuId, navigate, headers, location.pathname]);

  // === GESTION DE LA COMPLÉTION ===
  const handleComplete = useCallback(async () => {
    if (!headers || completing || isCompleted) return;

    setCompleting(true);

    try {
      // Marquer le contenu comme terminé
      await axios.put(`${API_BASE_URL}/courses/contenu/${contenuId}/complete`, {}, { headers });

      // Mettre à jour l'état local immédiatement (optimistic update)
      setIsCompleted(true);
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
        setProgress(newProgress);
      } catch (progressError) {
        console.warn('Erreur mise à jour progression:', progressError);
      }

      // Effet de célébration
      triggerConfetti();

      // Navigation automatique ou message de félicitations
      const currentIndex = contenus.findIndex((c) => c._id === contenuId);
      if (currentIndex < contenus.length - 1) {
        // Navigation vers le contenu suivant avec délai pour l'effet visuel
        setTimeout(() => {
          navigate(`/student/learn/${courseId}/contenu/${contenus[currentIndex + 1]._id}`);
        }, 1200);
      } else {
        // Cours terminé - Message de félicitations
        setSnackbar({
          open: true,
          message: 'Félicitations ! Vous avez terminé ce cours avec succès !',
          severity: 'success',
        });
      }
    } catch (err) {
      console.error('Erreur lors de la complétion:', err);

      // Rollback de l'état en cas d'erreur
      setIsCompleted(false);
      setContenus((prev) =>
        prev.map((c) => (c._id === contenuId ? { ...c, isCompleted: false } : c))
      );

      setSnackbar({
        open: true,
        message: 'Erreur lors du marquage comme terminé',
        severity: 'error',
      });
    } finally {
      setCompleting(false);
    }
  }, [contenuId, contenus, courseId, navigate, headers, completing, isCompleted]);

  // === GESTION DES QUIZ ===
  const handleQuizSubmit = useCallback(
    async (answers) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/courses/contenu/${contenuId}/soumettre`,
          { answers },
          { headers }
        );

        if (response.data.success) {
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
        console.error('Erreur soumission quiz:', err);
        setSnackbar({
          open: true,
          message: 'Erreur lors de la soumission du quiz',
          severity: 'error',
        });
      }
    },
    [contenuId, headers, handleComplete]
  );

  // === NAVIGATION INTELLIGENTE ===
  const navigateToContent = useCallback(
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

        // Scroll vers le haut pour une meilleure expérience
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    [contenus, contenuId, courseId, navigate]
  );

  // Calcul de l'index actuel mémoïsé
  const currentIndex = useMemo(
    () => contenus.findIndex((c) => c._id === contenuId),
    [contenus, contenuId]
  );

  // Gestionnaire de progression vidéo
  const handleVideoProgress = useCallback((progress) => {
    setVideoProgress(progress);
  }, []);

  // Gestionnaire de fin de vidéo
  const handleVideoEnd = useCallback(() => {
    if (!isCompleted && contenu?.type === 'video') {
      handleComplete();
    }
  }, [isCompleted, contenu?.type, handleComplete]);

  // Gestionnaire de réessai
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // === AFFICHAGE DU CHARGEMENT PROFESSIONNEL ===
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
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          Chargement du contenu...
        </Typography>
        <Typography variant='body1' sx={{ opacity: 0.8 }}>
          Préparation de votre expérience d'apprentissage
        </Typography>
      </Box>
    );
  }

  // === AFFICHAGE D'ERREUR PROFESSIONNEL ===
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
          {error || 'Contenu indisponible'}
        </Typography>

        <Typography variant='h6' sx={{ opacity: 0.8, textAlign: 'center', maxWidth: '500px' }}>
          {!course
            ? 'Le cours demandé est introuvable.'
            : contenus.length === 0
              ? 'Aucun contenu disponible pour ce cours.'
              : 'Une erreur est survenue lors du chargement.'}
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

          <NavButton
            startIcon={<BookOpen size={20} />}
            onClick={() => navigate('/student/courses')}
          >
            Mes cours
          </NavButton>

          <NavButton startIcon={<Home size={20} />} onClick={() => navigate('/student/dashboard')}>
            Tableau de bord
          </NavButton>
        </Stack>
      </Box>
    );
  }

  // === RENDU PRINCIPAL PROFESSIONNEL ===
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
        position: 'relative',
        overflow: 'hidden',
      }}
      ref={contentRef}
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
            {/* EN-TÊTE FIXE AVANCÉE */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: `linear-gradient(135deg, ${colors.glassDark}, ${colors.navy}ee)`,
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${colors.border}`,
                py: 3,
                px: { xs: 2, md: 4 },
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent='space-between'
                alignItems='center'
                spacing={3}
              >
                {/* Navigation et informations */}
                <Stack direction='row' spacing={2} alignItems='center' sx={{ flex: 1 }}>
                  <NavButton
                    startIcon={<ArrowLeft size={20} />}
                    onClick={() => navigate(`/student/course/${courseId}`)}
                  >
                    Retour au cours
                  </NavButton>

                  <Box sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}>
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                      }}
                    >
                      {course.titre}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.9rem',
                      }}
                    >
                      Contenu {currentIndex + 1} sur {contenus.length}
                    </Typography>
                  </Box>
                </Stack>

                {/* Progression avancée */}
                <ProgressContainer>
                  <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                      }}
                    >
                      Progression du cours: {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant='determinate'
                      value={progress}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: `${colors.navy}99`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                          borderRadius: 6,
                          animation: `${progressPulse} 2s ease-in-out infinite`,
                        },
                      }}
                    />
                    <div className='progress-text'>{Math.round(progress)}%</div>
                  </Box>
                </ProgressContainer>
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
              {/* BARRE LATÉRALE DES CONTENUS */}
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
                        gap: 1.5,
                      }}
                    >
                      <BookOpen size={24} />
                      Parcours d'Apprentissage
                    </Typography>

                    <List sx={{ p: 0 }}>
                      {contenus.map((content, index) => {
                        const isActive = content._id === contenuId;
                        const isDone = content.isCompleted;

                        return (
                          <React.Fragment key={content._id}>
                            <ListItem
                              button
                              selected={isActive}
                              onClick={() =>
                                navigate(`/student/learn/${courseId}/contenu/${content._id}`)
                              }
                              sx={{
                                borderRadius: '16px',
                                mb: 1.5,
                                py: 2.5,
                                px: 2,
                                transition: 'all 0.3s ease',
                                border: isActive
                                  ? `2px solid ${colors.red}`
                                  : '2px solid transparent',
                                background: isActive
                                  ? `${colors.red}15`
                                  : isDone
                                    ? `${colors.success}10`
                                    : 'transparent',
                                '&:hover': {
                                  background: isActive ? `${colors.red}25` : `${colors.red}10`,
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {/* Icône selon le type avec indicateur de statut */}
                                    <Box sx={{ position: 'relative' }}>
                                      {content.type === 'video' && (
                                        <Play
                                          size={20}
                                          color={isActive ? colors.red : colors.pink}
                                        />
                                      )}
                                      {content.type === 'document' && (
                                        <FileText
                                          size={20}
                                          color={isActive ? colors.red : colors.purple}
                                        />
                                      )}
                                      {content.type === 'quiz' && (
                                        <HelpCircle
                                          size={20}
                                          color={isActive ? colors.red : colors.warning}
                                        />
                                      )}
                                      {isDone && (
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            top: -4,
                                            right: -4,
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: colors.success,
                                            border: `2px solid ${colors.navy}`,
                                          }}
                                        />
                                      )}
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant='body1'
                                        sx={{
                                          color: '#ffffff',
                                          fontWeight: isActive ? 700 : 600,
                                          fontSize: '0.95rem',
                                          lineHeight: 1.3,
                                        }}
                                      >
                                        {content.titre}
                                      </Typography>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          color: 'rgba(255,255,255,0.6)',
                                          mt: 0.5,
                                          display: 'block',
                                        }}
                                      >
                                        Étape {index + 1} • {content.type}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />

                              {/* Indicateur de progression */}
                              {isDone && (
                                <CheckCircle
                                  size={20}
                                  color={colors.success}
                                  style={{ flexShrink: 0 }}
                                />
                              )}
                            </ListItem>

                            {index < contenus.length - 1 && (
                              <Divider sx={{ bgcolor: colors.borderLight, my: 1.5 }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </CardContent>
                </SidebarCard>
              </Box>

              {/* CONTENU DU COURS PRINCIPAL */}
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
                          label={contenu.type?.toUpperCase() || 'CONTENU'}
                          size='small'
                          sx={{
                            bgcolor:
                              contenu.type === 'video'
                                ? colors.red
                                : contenu.type === 'document'
                                  ? colors.purple
                                  : contenu.type === 'quiz'
                                    ? colors.warning
                                    : colors.success,
                            color: '#ffffff',
                            fontWeight: 700,
                            mb: 2,
                            fontSize: '0.8rem',
                            padding: '4px 12px',
                          }}
                        />
                        <Typography
                          variant='h3'
                          sx={{
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            lineHeight: 1.2,
                            mb: 1,
                          }}
                        >
                          {contenu.titre}
                        </Typography>
                      </Box>

                      {/* Indicateurs de statut */}
                      <Stack direction='row' spacing={1} alignItems='center'>
                        {isCompleted && (
                          <Chip
                            icon={<CheckCircle size={16} />}
                            label='TERMINÉ'
                            color='success'
                            sx={{
                              fontWeight: 700,
                              background: `linear-gradient(135deg, ${colors.success}, #34d399)`,
                            }}
                          />
                        )}
                        <Chip
                          label={`Étape ${currentIndex + 1}/${contenus.length}`}
                          sx={{
                            backgroundColor: `${colors.info}33`,
                            color: colors.info,
                            fontWeight: 600,
                          }}
                        />
                      </Stack>
                    </Stack>

                    <Typography
                      variant='h6'
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      {course.titre}
                    </Typography>

                    {contenu.description && (
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.7,
                          fontSize: '1.1rem',
                        }}
                      >
                        {contenu.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Contenu spécifique selon le type */}
                  <Box sx={{ minHeight: '400px', borderRadius: '20px', overflow: 'hidden' }}>
                    {contenu.type === 'video' && (
                      <VideoPlayer
                        videoUrl={contenu.url}
                        onProgress={handleVideoProgress}
                        onEnded={handleVideoEnd}
                        autoPlay={!isCompleted}
                        title={contenu.titre}
                      />
                    )}

                    {contenu.type === 'document' && (
                      <DocumentViewer pdfUrl={contenu.url} title={contenu.titre} />
                    )}

                    {contenu.type === 'quiz' && (
                      <QuizComponent
                        questions={contenu.questions || []}
                        onSubmit={handleQuizSubmit}
                        disabled={isCompleted}
                        title={contenu.titre}
                      />
                    )}
                  </Box>

                  {/* Actions de navigation avancées */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ mt: 4 }}
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <NavButton
                      startIcon={<ArrowLeft size={20} />}
                      onClick={() => navigateToContent('prev')}
                      disabled={currentIndex === 0}
                      sx={{ minWidth: '140px' }}
                    >
                      Précédent
                    </NavButton>

                    {/* Bouton de complétion conditionnel */}
                    {!isCompleted && contenu.type !== 'quiz' && (
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
                      onClick={() => navigateToContent('next')}
                      disabled={currentIndex === contenus.length - 1}
                      sx={{ minWidth: '140px' }}
                    >
                      Suivant
                    </NavButton>
                  </Stack>

                  {/* Indicateur de progression détaillé */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {currentIndex + 1} sur {contenus.length} contenus • Progression:{' '}
                      {Math.round(
                        ((currentIndex + (isCompleted ? 1 : videoProgress / 100)) /
                          contenus.length) *
                          100
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

      {/* SNACKBAR DE NOTIFICATION PROFESSIONNEL */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'success' ? 6000 : 8000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '16px',
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
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            backgroundColor: `${colors.glassDark}`,
            color: '#ffffff',
            border: `1px solid ${colors.border}`,
            fontSize: '1rem',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? colors.success : colors.red,
              fontSize: '1.5rem',
            },
          }}
          iconMapping={{
            success: <Award size={24} />,
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
