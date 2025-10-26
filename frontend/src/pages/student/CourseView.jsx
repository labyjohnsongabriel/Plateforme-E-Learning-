// CourseView.jsx - Version Professionnelle Corrigée
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Fade,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Container,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  BookOpen,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
  Play,
  Award,
  BarChart3,
  FileText,
  Video,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// === ANIMATIONS PROFESSIONNELLES ===
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

const slideInRight = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(40px); 
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
    boxShadow: 0 0 30px rgba(241, 53, 68, 0.6);
  }
`;

// === PALETTE DE COULEURS PROFESSIONNELLE ===
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  darkBg: '#0a0e27',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  border: 'rgba(241, 53, 68, 0.2)',
};

// === COMPOSANTS STYLISÉS PROFESSIONNELS ===
const CourseCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${colors.border}`,
  padding: theme.spacing(4),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: `0 25px 50px ${colors.navy}80`,
    borderColor: `${colors.red}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const ContenuCard = styled(Card)(({ theme, completed }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}22, ${colors.success}11)`
    : `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: completed ? `2px solid ${colors.success}66` : `1px solid ${colors.border}`,
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
  animation: `${slideInRight} 0.6s ease-out forwards`,
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: completed ? `0 15px 35px ${colors.success}33` : `0 15px 35px ${colors.purple}33`,
    borderColor: completed ? colors.success : colors.purple,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '14px',
  padding: '14px 28px',
  fontWeight: 700,
  fontSize: '1rem',
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

const BackButton = styled(Button)({
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  border: `1px solid ${colors.border}`,
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  '&:hover': {
    backgroundColor: `${colors.red}1a`,
    borderColor: `${colors.red}66`,
    transform: 'translateY(-2px)',
  },
});

const StatBox = styled(Box)(({ theme, progress = 0 }) => ({
  background: `linear-gradient(135deg, ${colors.purple}22, ${colors.pink}22)`,
  borderRadius: '20px',
  padding: theme.spacing(3),
  border: `1px solid ${colors.purple}33`,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, transparent, ${colors.navy}66)`,
    pointerEvents: 'none',
  },
}));

const ProgressBar = styled(LinearProgress)({
  height: 12,
  borderRadius: 8,
  backgroundColor: `${colors.red}22`,
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
    borderRadius: 8,
    transition: 'width 0.8s ease-in-out',
  },
});

// === FONCTIONS UTILITAIRES ===
const getContenuId = (contenu) => {
  return contenu?._id || contenu?.id;
};

const getContenuIcon = (type) => {
  const icons = {
    video: Video,
    document: FileText,
    quiz: HelpCircle,
    text: FileText,
  };
  return icons[type] || BookOpen;
};

const getContenuColor = (type) => {
  const colorsMap = {
    video: colors.red,
    document: colors.purple,
    quiz: colors.warning,
    text: colors.info,
  };
  return colorsMap[type] || colors.pink;
};

const formatDuration = (duration) => {
  if (!duration) return 'Durée non spécifiée';
  if (typeof duration === 'number') return `${duration}h`;
  return duration;
};

// === COMPOSANT PRINCIPAL ===
const CourseView = () => {
  const { id, courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const { addNotification } = useNotifications();

  // Utiliser soit id soit courseId, en priorisant id
  const courseIdentifier = id || courseId;

  // États du composant
  const [course, setCourse] = useState(null);
  const [contenus, setContenus] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  /**
   * Récupération des données du cours avec gestion d'erreur professionnelle
   */
  const fetchCourseData = useCallback(async () => {
    try {
      if (!user?.token) {
        setError('🔐 Authentification requise - Veuillez vous reconnecter');
        setTimeout(() => {
          logout();
          navigate('/login', {
            state: {
              returnUrl: `/student/course/${courseIdentifier}`,
              message: 'Session expirée - Reconnexion requise',
            },
          });
        }, 2000);
        setLoading(false);
        return;
      }

      if (!courseIdentifier) {
        setError('❌ Identifiant du cours manquant');
        setLoading(false);
        return;
      }

      // Validation robuste de l'ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(courseIdentifier)) {
        setError("❌ Format d'identifiant de cours invalide");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('📚 Début de la récupération du cours:', courseIdentifier);

      const headers = {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      };

      // Récupération parallèle des données pour de meilleures performances
      const [courseResponse, contenusResponse, progressResponse] = await Promise.allSettled([
        // Données du cours
        axios.get(`${API_BASE_URL}/courses/${courseIdentifier}`, {
          headers,
          timeout: 15000,
        }),
        // Contenus du cours
        axios.get(`${API_BASE_URL}/courses/contenu`, {
          params: { courseId: courseIdentifier },
          headers,
          timeout: 15000,
        }),
        // Progression de l'utilisateur
        axios.get(`${API_BASE_URL}/learning/progress/${courseIdentifier}`, {
          headers,
          timeout: 10000,
        }),
      ]);

      // Traitement de la réponse du cours
      if (courseResponse.status === 'rejected') {
        throw new Error(`Erreur cours: ${courseResponse.reason.message}`);
      }

      const courseData = courseResponse.value.data?.data || courseResponse.value.data;
      if (!courseData) {
        throw new Error('❌ Données du cours non trouvées');
      }

      setCourse({
        ...courseData,
        _id: courseData._id || courseIdentifier,
        titre: courseData.titre || courseData.title || 'Cours sans titre',
        description:
          courseData.description ||
          'Aucune description disponible pour le moment. Revenez plus tard pour découvrir le contenu de ce cours.',
        duree: courseData.duree || courseData.duration,
        niveau: courseData.niveau || courseData.level || 'Débutant',
        domaine:
          courseData.domaineId?.nom || courseData.domaine || courseData.category || 'Général',
        createur: courseData.createur || courseData.instructor || courseData.auteur,
      });

      // Traitement des contenus
      let contenusList = [];
      if (contenusResponse.status === 'fulfilled') {
        const contenusData = contenusResponse.value.data?.data || contenusResponse.value.data || [];

        contenusList = Array.isArray(contenusData)
          ? contenusData
              .filter((contenu) => contenu && getContenuId(contenu))
              .map((contenu, index) => ({
                ...contenu,
                _id: getContenuId(contenu),
                ordre: contenu.ordre || index + 1,
                titre: contenu.titre || contenu.title || `Contenu ${index + 1}`,
                description: contenu.description || 'Description non disponible pour le moment.',
                type: contenu.type || 'document',
                duree: contenu.duree || contenu.duration,
                isCompleted: contenu.isCompleted || false,
              }))
          : [];

        console.log(`📖 ${contenusList.length} contenus chargés avec succès`);
      } else {
        console.warn('⚠️ Erreur récupération contenus:', contenusResponse.reason.message);
      }

      setContenus(contenusList);

      // Traitement de la progression
      if (progressResponse.status === 'fulfilled') {
        const progressData = progressResponse.value.data?.data || progressResponse.value.data;
        setProgress({
          pourcentage: Math.min(100, Math.max(0, progressData?.pourcentage || 0)),
          dateDebut: progressData?.dateDebut || progressData?.startDate,
          dateFin: progressData?.dateFin || progressData?.endDate,
          cours: courseIdentifier,
          apprenant: user?._id || user?.id,
        });
      } else {
        console.warn('⚠️ Erreur récupération progression:', progressResponse.reason.message);
        setProgress({
          pourcentage: 0,
          dateDebut: null,
          dateFin: null,
          cours: courseIdentifier,
          apprenant: user?._id || user?.id,
        });
      }
    } catch (err) {
      console.error('❌ Erreur critique lors du chargement du cours:', {
        message: err.message,
        status: err.response?.status,
        code: err.code,
        data: err.response?.data,
      });

      let errorMessage = '🚨 Erreur lors du chargement du cours';
      let shouldLogout = false;

      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = '❌ Identifiant de cours invalide ou mal formaté';
            break;
          case 401:
            errorMessage = '🔐 Session expirée - Redirection en cours...';
            shouldLogout = true;
            break;
          case 403:
            errorMessage = "⛔ Accès refusé - Vous n'avez pas l'autorisation pour ce cours";
            break;
          case 404:
            errorMessage =
              "🔍 Cours non trouvé - Vérifiez l'identifiant ou contactez l'administrateur";
            break;
          case 500:
            errorMessage = '⚡ Erreur serveur - Veuillez réessayer dans quelques instants';
            break;
          default:
            errorMessage = err.response.data?.message || `Erreur ${err.response.status}`;
        }
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = "🔌 Serveur inaccessible - Vérifiez votre connexion et l'état du serveur";
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = '🌐 Erreur réseau - Vérifiez votre connexion internet';
      } else if (err.code === 'TIMEOUT') {
        errorMessage = '⏰ Timeout - Le serveur met trop de temps à répondre';
      } else {
        errorMessage = err.message || 'Erreur inconnue lors du chargement';
      }

      setError(errorMessage);
      setCourse(null);
      setContenus([]);
      setProgress(null);

      if (shouldLogout) {
        setTimeout(() => {
          logout();
          navigate('/login', {
            state: {
              returnUrl: `/student/course/${courseIdentifier}`,
              message: 'Session expirée - Veuillez vous reconnecter',
            },
          });
        }, 3000);
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [courseIdentifier, user, logout, navigate, API_BASE_URL]);

  // Effet de chargement initial
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  /**
   * Réessai de chargement des données
   */
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await fetchCourseData();
  }, [fetchCourseData]);

  /**
   * Navigation vers le premier contenu disponible
   */
  const handleStartLearning = useCallback(() => {
    if (contenus.length === 0) {
      addNotification('Aucun contenu disponible pour ce cours', 'warning');
      return;
    }

    const firstValidContenu = contenus.find((contenu) => getContenuId(contenu));
    if (!firstValidContenu) {
      addNotification('Aucun contenu valide trouvé', 'error');
      return;
    }

    const firstContenuId = getContenuId(firstValidContenu);
    console.log('🎬 Navigation vers le premier contenu:', firstContenuId);

    navigate(`/student/learn/${courseIdentifier}/contenu/${firstContenuId}`, {
      state: {
        message: `Bonne découverte du cours "${course?.titre}" !`,
        courseTitle: course?.titre,
      },
    });
  }, [navigate, courseIdentifier, contenus, course?.titre, addNotification]);

  /**
   * Navigation vers un contenu spécifique
   */
  const handleContenuClick = useCallback(
    (contenu) => {
      const contenuId = getContenuId(contenu);
      if (!contenuId) {
        addNotification('Contenu inaccessible - ID manquant', 'error');
        return;
      }

      console.log('📂 Navigation vers le contenu:', contenuId);
      navigate(`/student/learn/${courseIdentifier}/contenu/${contenuId}`, {
        state: {
          message: `Ouverture de "${contenu.titre}"`,
          contenuTitle: contenu.titre,
        },
      });
    },
    [navigate, courseIdentifier, addNotification]
  );

  /**
   * Navigation vers la progression détaillée
   */
  const handleViewProgress = useCallback(() => {
    navigate(`/student/progress/${courseIdentifier}`, {
      state: {
        courseTitle: course?.titre,
        progress: progress?.pourcentage,
      },
    });
  }, [navigate, courseIdentifier, course?.titre, progress?.pourcentage]);

  /**
   * Navigation vers les certificats
   */
  const handleViewCertificate = useCallback(() => {
    navigate('/student/certificates', {
      state: {
        courseId: courseIdentifier,
        courseTitle: course?.titre,
      },
    });
  }, [navigate, courseIdentifier, course?.titre]);

  /**
   * Calcul des statistiques automatiques
   */
  const courseStats = useMemo(() => {
    const totalContenus = contenus.length;
    const completedContenus = contenus.filter((c) => c.isCompleted).length;
    const completionRate =
      totalContenus > 0 ? Math.round((completedContenus / totalContenus) * 100) : 0;

    const contenusByType = contenus.reduce((acc, contenu) => {
      acc[contenu.type] = (acc[contenu.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalContenus,
      completedContenus,
      completionRate,
      contenusByType,
      estimatedTime: contenus.reduce((total, contenu) => total + (contenu.duree || 0), 0),
    };
  }, [contenus]);

  // === AFFICHAGE DU CHARGEMENT ===
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
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkBg})`,
          animation: `${fadeInUp} 0.5s ease-out`,
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
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1.2rem', sm: '1.4rem' },
            fontWeight: 600,
            mt: 3,
          }}
        >
          Chargement de votre cours...
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1rem',
            mt: 1,
          }}
        >
          Préparation de votre expérience d'apprentissage
        </Typography>
      </Box>
    );
  }

  // === AFFICHAGE D'ERREUR ===
  if (error || !course) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkBg})`,
          p: { xs: 3, sm: 4 },
          gap: 4,
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

        <Alert
          severity='error'
          sx={{
            width: { xs: '100%', sm: '80%', md: '50%' },
            bgcolor: `${colors.red}15`,
            color: '#ffffff',
            borderRadius: '20px',
            p: 3,
            border: `1px solid ${colors.red}44`,
            '& .MuiAlert-icon': {
              color: colors.red,
              alignItems: 'center',
            },
          }}
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <ActionButton
                size='small'
                onClick={handleRetry}
                disabled={retrying}
                startIcon={retrying ? <CircularProgress size={16} /> : <RotateCcw size={16} />}
              >
                {retrying ? 'Chargement...' : 'Réessayer'}
              </ActionButton>
              <BackButton
                size='small'
                onClick={() => navigate('/student/courses')}
                startIcon={<ArrowLeft size={16} />}
              >
                Mes Cours
              </BackButton>
            </Stack>
          }
        >
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
            {error || 'Cours non trouvé'}
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', opacity: 0.9 }}>
            Nous n'avons pas pu charger les détails de ce cours. Vérifiez votre connexion ou
            réessayez.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // === RENDU PRINCIPAL ===
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
      {/* En-tête de navigation */}
      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <BackButton
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/student/courses')}
            aria-label='Retour à mes cours'
          >
            Retour à mes cours
          </BackButton>
        </Box>
      </Fade>

      {/* En-tête du cours */}
      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant='h1'
            sx={{
              color: '#ffffff',
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' },
              background: 'linear-gradient(135deg, #ffffff, #ff6b74)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            {course.titre}
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BookOpen size={20} />
            Domaine: {course.domaine}
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={{ xs: 3, sm: 4, md: 4 }}>
        {/* Colonne principale - Détails du cours */}
        <Grid item xs={12} lg={8}>
          {/* Carte principale du cours */}
          <CourseCard elevation={0} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${colors.red}33, ${colors.purple}33)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.border}`,
                }}
              >
                <BookOpen size={32} color={colors.red} />
              </Box>
              <Box>
                <Typography
                  variant='h2'
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                    mb: 0.5,
                  }}
                >
                  Détails du Cours
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1rem',
                  }}
                >
                  Explorez le contenu et commencez votre apprentissage
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: `${colors.red}33`, mb: 4 }} />

            {/* Description enrichie */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                {course.description}
              </Typography>

              {/* Métadonnées avancées */}
              <Grid container spacing={3}>
                {/* Niveau */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: `${colors.purple}15`,
                    }}
                  >
                    <Chip
                      label={course.niveau}
                      sx={{
                        backgroundColor: `${colors.purple}33`,
                        color: colors.purple,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    />
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      Niveau
                    </Typography>
                  </Box>
                </Grid>

                {/* Durée */}
                {course.duree && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: `${colors.pink}15`,
                      }}
                    >
                      <Clock size={20} color={colors.pink} />
                      <Box>
                        <Typography sx={{ color: colors.pink, fontSize: '1rem', fontWeight: 700 }}>
                          {formatDuration(course.duree)}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                          Durée estimée
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Contenus */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: `${colors.info}15`,
                    }}
                  >
                    <FileText size={20} color={colors.info} />
                    <Box>
                      <Typography sx={{ color: colors.info, fontSize: '1rem', fontWeight: 700 }}>
                        {courseStats.totalContenus}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                        Contenus
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Instructeur */}
                {course.createur && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: `${colors.success}15`,
                      }}
                    >
                      <User size={20} color={colors.success} />
                      <Box>
                        <Typography
                          sx={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600, mb: 0.5 }}
                        >
                          Instructeur
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
                          {typeof course.createur === 'object'
                            ? `${course.createur.prenom || ''} ${course.createur.nom || ''}`.trim()
                            : course.createur}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Bouton d'action principal */}
            <ActionButton
              fullWidth
              onClick={handleStartLearning}
              endIcon={<Play size={22} />}
              disabled={contenus.length === 0}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                background:
                  contenus.length === 0
                    ? 'rgba(255, 255, 255, 0.1)'
                    : `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
              }}
            >
              {contenus.length > 0
                ? "🎯 Commencer l'Apprentissage"
                : '⏳ Contenu en préparation...'}
            </ActionButton>
          </CourseCard>

          {/* Section des contenus */}
          {contenus.length > 0 ? (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 4,
                }}
              >
                <Typography
                  variant='h2'
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  }}
                >
                  Parcours d'Apprentissage
                </Typography>
                <Chip
                  label={`${courseStats.totalContenus} contenus`}
                  sx={{
                    backgroundColor: `${colors.purple}33`,
                    color: colors.purple,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                />
              </Box>

              <Stack spacing={3}>
                {contenus.map((contenu, index) => {
                  const ContenuIcon = getContenuIcon(contenu.type);
                  const contenuColor = getContenuColor(contenu.type);

                  return (
                    <ContenuCard
                      key={contenu._id}
                      elevation={0}
                      completed={contenu.isCompleted}
                      sx={{
                        animation: `${slideInRight} 0.6s ease-out ${index * 0.1}s forwards`,
                        opacity: 0,
                      }}
                      onClick={() => handleContenuClick(contenu)}
                    >
                      {/* En-tête du contenu */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 2 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '12px',
                            background: `${contenuColor}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${contenuColor}66`,
                            flexShrink: 0,
                          }}
                        >
                          <ContenuIcon size={24} color={contenuColor} />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Typography
                              sx={{
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: { xs: '1.1rem', sm: '1.2rem' },
                              }}
                            >
                              {contenu.ordre}. {contenu.titre}
                            </Typography>

                            <Chip
                              label={contenu.type?.toUpperCase()}
                              size='small'
                              sx={{
                                backgroundColor: `${contenuColor}33`,
                                color: contenuColor,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />

                            {contenu.isCompleted && (
                              <Tooltip title='Contenu terminé' arrow>
                                <CheckCircle size={20} color={colors.success} />
                              </Tooltip>
                            )}
                          </Box>

                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              lineHeight: 1.6,
                              mb: 1,
                            }}
                          >
                            {contenu.description}
                          </Typography>

                          {/* Métadonnées du contenu */}
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}
                          >
                            {contenu.duree && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Clock size={16} color={colors.pink} />
                                <Typography
                                  sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}
                                >
                                  {contenu.duree} min
                                </Typography>
                              </Box>
                            )}

                            {contenu.createdAt && (
                              <Typography
                                sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}
                              >
                                Ajouté le {new Date(contenu.createdAt).toLocaleDateString('fr-FR')}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Indicateur d'action */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        <Typography
                          sx={{
                            color: contenu.isCompleted ? colors.success : colors.pink,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {contenu.isCompleted ? 'Revoir le contenu' : 'Commencer'}
                          <ArrowRight size={16} />
                        </Typography>
                      </Box>
                    </ContenuCard>
                  );
                })}
              </Stack>
            </Box>
          ) : (
            <Alert
              severity='info'
              sx={{
                bgcolor: `${colors.info}15`,
                color: '#ffffff',
                borderRadius: '20px',
                p: 3,
                border: `1px solid ${colors.info}33`,
                '& .MuiAlert-icon': {
                  color: colors.info,
                },
              }}
            >
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                📝 Contenu en cours de préparation
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', opacity: 0.9 }}>
                Les contenus de ce cours sont actuellement en développement. Revenez bientôt pour
                découvrir le matériel d'apprentissage.
              </Typography>
            </Alert>
          )}
        </Grid>

        {/* Colonne latérale - Progression et Actions */}
        <Grid item xs={12} lg={4}>
          {/* Carte de progression */}
          <CourseCard elevation={0} sx={{ mb: 4 }}>
            <Typography
              variant='h3'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <BarChart3 size={24} color={colors.purple} />
              Votre Progression
            </Typography>

            {/* Indicateur de progression principal */}
            <StatBox progress={progress?.pourcentage || 0} sx={{ mb: 3 }}>
              <Typography
                sx={{
                  color: colors.success,
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                  mb: 1,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {progress?.pourcentage || 0}%
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {progress?.pourcentage === 100 ? '🎉 Cours Maîtrisé !' : 'Progression Globale'}
              </Typography>

              {/* Barre de progression détaillée */}
              <Box sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
                <ProgressBar
                  variant='determinate'
                  value={progress?.pourcentage || 0}
                  sx={{ mb: 2 }}
                />
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  {courseStats.completedContenus} sur {courseStats.totalContenus} contenus terminés
                </Typography>
              </Box>
            </StatBox>

            {/* Dates importantes */}
            <Stack spacing={2}>
              {progress?.dateDebut && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: `${colors.purple}15`,
                    borderRadius: '12px',
                    border: `1px solid ${colors.purple}33`,
                  }}
                >
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      mb: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    🗓️ Commencé le:
                  </Typography>
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  >
                    {new Date(progress.dateDebut).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              )}

              {progress?.dateFin && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: `${colors.success}15`,
                    borderRadius: '12px',
                    border: `1px solid ${colors.success}33`,
                  }}
                >
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      mb: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    🏆 Terminé le:
                  </Typography>
                  <Typography
                    sx={{
                      color: colors.success,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  >
                    {new Date(progress.dateFin).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CourseCard>

          {/* Actions rapides */}
          <Stack spacing={2}>
            <ActionButton
              fullWidth
              startIcon={<BarChart3 size={20} />}
              onClick={handleViewProgress}
              sx={{
                background: `linear-gradient(135deg, ${colors.info}, #60a5fa)`,
              }}
            >
              Détails de la Progression
            </ActionButton>

            {progress?.pourcentage === 100 && (
              <ActionButton
                fullWidth
                startIcon={<Award size={20} />}
                onClick={handleViewCertificate}
                sx={{
                  background: `linear-gradient(135deg, ${colors.success}, #34d399)`,
                  animation: `${pulse} 2s infinite`,
                }}
              >
                Voir Mon Certificat
              </ActionButton>
            )}

            <BackButton
              fullWidth
              startIcon={<BookOpen size={20} />}
              onClick={() => navigate('/student/courses')}
            >
              Retour aux Cours
            </BackButton>
          </Stack>

          {/* Statistiques rapides */}
          {courseStats.totalContenus > 0 && (
            <CourseCard elevation={0} sx={{ mt: 4 }}>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: '1.1rem',
                }}
              >
                📊 Aperçu du Cours
              </Typography>

              <Stack spacing={2}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Contenus terminés:
                  </Typography>
                  <Typography sx={{ color: colors.success, fontWeight: 700, fontSize: '1rem' }}>
                    {courseStats.completedContenus}/{courseStats.totalContenus}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Taux de complétion:
                  </Typography>
                  <Typography sx={{ color: colors.pink, fontWeight: 700, fontSize: '1rem' }}>
                    {courseStats.completionRate}%
                  </Typography>
                </Box>

                {courseStats.estimatedTime > 0 && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                      Temps total estimé:
                    </Typography>
                    <Typography sx={{ color: colors.warning, fontWeight: 700, fontSize: '1rem' }}>
                      {Math.ceil(courseStats.estimatedTime / 60)}h
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CourseCard>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(CourseView);
