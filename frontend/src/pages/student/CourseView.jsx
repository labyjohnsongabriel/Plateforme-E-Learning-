// CourseView.jsx - Version Corrigée Complète
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Book as BookIcon,
  Schedule as ClockIcon,
  Person as UserIcon,
  ArrowForward as ArrowRightIcon,
  ArrowBack as ArrowLeftIcon,
  Warning as WarningIcon,
  Replay as RotateCcwIcon,
  PlayArrow as PlayIcon,
  WorkspacePremium as AwardIcon,
  Analytics as BarChart3Icon,
  Description as FileTextIcon,
  OndemandVideo as VideoIcon,
  Help as HelpCircleIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// === ANIMATIONS ===
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
    box-shadow: 0 0 30px rgba(241, 53, 68, 0.6);
  }
`;

// === PALETTE DE COULEURS ===
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

// === COMPOSANTS STYLISÉS ===
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

const SectionCard = styled(Accordion)(({ theme, completed }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}22, ${colors.success}11)`
    : `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px !important',
  border: completed ? `2px solid ${colors.success}66` : `1px solid ${colors.border}`,
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  '&:before': { display: 'none' },
  '&.Mui-expanded': {
    margin: `${theme.spacing(2)} 0 !important`,
  },
}));

const ModuleCard = styled(Card)(({ theme, completed, moduletype }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}15, ${colors.success}08)`
    : `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: completed ? `2px solid ${colors.success}66` : `1px solid ${getModuleColor(moduletype)}66`,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 25px ${getModuleColor(moduletype)}33`,
    borderColor: getModuleColor(moduletype),
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

const BackButton = styled(Button)(({ theme }) => ({
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
}));

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
const getModuleColor = (type) => {
  const colorsMap = {
    VIDEO: colors.red,
    TEXTE: colors.info,
    QUIZ: colors.warning,
    DOCUMENT: colors.purple,
  };
  return colorsMap[type] || colors.pink;
};

const getModuleIcon = (type) => {
  const icons = {
    VIDEO: VideoIcon,
    TEXTE: ArticleIcon,
    QUIZ: QuizIcon,
    DOCUMENT: FileTextIcon,
  };
  return icons[type] || BookIcon;
};

const formatDuration = (duration) => {
  if (!duration) return 'Durée non spécifiée';
  if (typeof duration === 'number') return `${duration} min`;
  return duration;
};

const calculateSectionProgress = (modules, completedModules = []) => {
  if (!modules || modules.length === 0) return 0;
  const completedCount = modules.filter((module) => completedModules.includes(module._id)).length;
  return Math.round((completedCount / modules.length) * 100);
};

// Fonction utilitaire pour obtenir l'ID du contenu
const getContenuId = (contenu) => {
  return contenu._id || contenu.id;
};

// === COMPOSANT PRINCIPAL ===
const CourseView = () => {
  const { id, courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const { addNotification } = useNotifications();

  const courseIdentifier = id || courseId;

  // ✅ CORRECTION: URLs d'API corrigées
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const COURSES_API_URL = `${API_BASE_URL}/courses`;
  const LEARNING_API_URL = `${API_BASE_URL}/learning`;

  // États du composant
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [progress, setProgress] = useState(null);
  const [expandedSections, setExpandedSections] = useState([]);

  /**
   * Navigation vers un module
   */
  const handleModuleClick = useCallback(
    (module, section) => {
      const moduleId = module._id || module.id;
      if (!moduleId) {
        addNotification('Module inaccessible - ID manquant', 'error');
        return;
      }

      console.log('📂 Navigation vers le module:', {
        moduleId,
        moduleTitle: module.titre,
        sectionTitle: section?.titre,
      });

      navigate(`/student/learn/${courseIdentifier}/contenu/${moduleId}`, {
        state: {
          message: `Ouverture de "${module.titre}"`,
          moduleTitle: module.titre,
          sectionTitle: section?.titre,
          courseTitle: course?.titre,
        },
      });
    },
    [navigate, courseIdentifier, addNotification, course]
  );

  /**
   * Récupération des données du cours avec structure de sections
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

      setLoading(true);
      setError(null);

      console.log('📚 Début de la récupération du cours:', courseIdentifier);

      const headers = {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      };

      // ✅ CORRECTION: Récupération parallèle des données avec les bons endpoints
      const [courseResponse, progressResponse] = await Promise.allSettled([
        // Données du cours avec sections et modules
        axios.get(`${COURSES_API_URL}/${courseIdentifier}`, {
          headers,
          timeout: 15000,
        }),
        // Progression de l'utilisateur
        axios
          .get(`${LEARNING_API_URL}/progress/${courseIdentifier}`, {
            headers,
            timeout: 10000,
          })
          .catch((err) => {
            console.warn(
              '⚠️ Endpoint progression non disponible, utilisation des données par défaut'
            );
            return { data: { data: { pourcentage: 0, completedModules: [] } } };
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

      console.log('📋 Données cours reçues:', courseData);

      // ✅ CORRECTION: Normalisation améliorée de la structure des données
      const normalizedCourse = {
        ...courseData,
        _id: courseData._id || courseIdentifier,
        titre: courseData.titre || courseData.title || 'Cours sans titre',
        description: courseData.description || 'Aucune description disponible pour le moment.',
        duree: courseData.duree || courseData.duration,
        niveau: courseData.niveau || courseData.level || 'ALFA',
        domaine:
          courseData.domaineId?.nom || courseData.domaine || courseData.category || 'Général',
        createur: courseData.createur || courseData.instructor || courseData.auteur,
        contenu: courseData.contenu || { sections: [] },
      };

      // ✅ CORRECTION: Validation et normalisation des sections et modules
      if (normalizedCourse.contenu && normalizedCourse.contenu.sections) {
        normalizedCourse.contenu.sections = normalizedCourse.contenu.sections.map(
          (section, index) => ({
            ...section,
            _id: section._id || `section-${index}`,
            titre: section.titre || `Section ${index + 1}`,
            modules: (section.modules || []).map((module, modIndex) => ({
              ...module,
              _id: module._id || `module-${index}-${modIndex}`,
              titre: module.titre || `Module ${modIndex + 1}`,
              type: module.type || 'TEXTE',
              duree: module.duree || 0,
            })),
          })
        );
      }

      setCourse(normalizedCourse);

      // Expansion de la première section par défaut
      if (normalizedCourse.contenu.sections.length > 0) {
        setExpandedSections([normalizedCourse.contenu.sections[0]._id]);
      }

      // ✅ CORRECTION: Traitement amélioré de la progression
      let progressData = { pourcentage: 0, completedModules: [] };

      if (progressResponse.status === 'fulfilled') {
        progressData =
          progressResponse.value.data?.data || progressResponse.value.data || progressData;
      }

      console.log('📊 Données progression:', progressData);

      setProgress({
        pourcentage: Math.min(100, Math.max(0, progressData?.pourcentage || 0)),
        dateDebut: progressData?.dateDebut || progressData?.startDate,
        dateFin: progressData?.dateFin || progressData?.endDate,
        cours: courseIdentifier,
        apprenant: user?._id || user?.id,
        completedModules: progressData?.completedModules || [],
      });
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
  }, [courseIdentifier, user, logout, navigate, COURSES_API_URL, LEARNING_API_URL]);

  // Effet de chargement initial
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  /**
   * Gestion de l'expansion des sections
   */
  const handleSectionExpand = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  /**
   * Navigation vers le premier module
   */
  const handleStartLearning = useCallback(() => {
    const firstSection = course?.contenu?.sections?.[0];
    const firstModule = firstSection?.modules?.[0];

    if (!firstModule) {
      addNotification('Aucun module disponible dans ce cours', 'warning');
      return;
    }

    handleModuleClick(firstModule, firstSection);
  }, [course, handleModuleClick, addNotification]);

  /**
   * Réessai de chargement
   */
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await fetchCourseData();
  }, [fetchCourseData]);

  /**
   * Calcul des statistiques du cours
   */
  const courseStats = useMemo(() => {
    const sections = course?.contenu?.sections || [];
    const totalModules = sections.reduce((acc, section) => acc + (section.modules?.length || 0), 0);

    const completedModules = progress?.completedModules || [];
    const completedCount = sections.reduce(
      (acc, section) =>
        acc +
        (section.modules?.filter((module) => completedModules.includes(module._id)).length || 0),
      0
    );

    const completionRate = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    return {
      totalSections: sections.length,
      totalModules,
      completedCount,
      completionRate,
      estimatedTime: sections.reduce(
        (total, section) =>
          total +
          (section.modules?.reduce(
            (sectionTotal, module) => sectionTotal + (module.duree || 0),
            0
          ) || 0),
        0
      ),
    };
  }, [course, progress]);

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
          <WarningIcon sx={{ fontSize: 80, color: colors.red }} />
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
              <Button
                size='small'
                onClick={handleRetry}
                disabled={retrying}
                startIcon={retrying ? <CircularProgress size={16} /> : <RotateCcwIcon />}
                sx={{ color: '#ffffff' }}
              >
                {retrying ? 'Chargement...' : 'Réessayer'}
              </Button>
              <Button
                size='small'
                onClick={() => navigate('/student/courses')}
                startIcon={<ArrowLeftIcon />}
                sx={{ color: '#ffffff' }}
              >
                Mes Cours
              </Button>
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
            startIcon={<ArrowLeftIcon />}
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
            <BookIcon />
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
                <BookIcon sx={{ fontSize: 32, color: colors.red }} />
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
                  Structure du Cours
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1rem',
                  }}
                >
                  {courseStats.totalSections} sections • {courseStats.totalModules} modules
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
                      <ClockIcon sx={{ color: colors.pink }} />
                      <Box>
                        <Typography sx={{ color: colors.pink, fontSize: '1rem', fontWeight: 700 }}>
                          {course.duree} heures
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                          Durée estimée
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Modules */}
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
                    <FileTextIcon sx={{ color: colors.info }} />
                    <Box>
                      <Typography sx={{ color: colors.info, fontSize: '1rem', fontWeight: 700 }}>
                        {courseStats.totalModules}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                        Modules
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
                      <UserIcon sx={{ color: colors.success }} />
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
              endIcon={<PlayIcon />}
              disabled={courseStats.totalModules === 0}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                background:
                  courseStats.totalModules === 0
                    ? 'rgba(255, 255, 255, 0.1)'
                    : `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
              }}
            >
              {courseStats.totalModules > 0
                ? "🎯 Commencer l'Apprentissage"
                : '⏳ Contenu en préparation...'}
            </ActionButton>
          </CourseCard>

          {/* Sections et Modules */}
          {course.contenu.sections.length > 0 ? (
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
                  label={`${courseStats.totalSections} sections`}
                  sx={{
                    backgroundColor: `${colors.purple}33`,
                    color: colors.purple,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                />
              </Box>

              {course.contenu.sections.map((section, sectionIndex) => {
                const sectionProgress = calculateSectionProgress(
                  section.modules,
                  progress?.completedModules || []
                );
                const isExpanded = expandedSections.includes(section._id);

                return (
                  <SectionCard
                    key={section._id}
                    expanded={isExpanded}
                    onChange={() => handleSectionExpand(section._id)}
                    completed={sectionProgress === 100}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
                      sx={{
                        background:
                          sectionProgress === 100
                            ? `linear-gradient(135deg, ${colors.success}22, ${colors.success}11)`
                            : `linear-gradient(135deg, ${colors.purple}22, ${colors.pink}22)`,
                        borderBottom: isExpanded ? `1px solid ${colors.border}` : 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '12px',
                            background:
                              sectionProgress === 100
                                ? `linear-gradient(135deg, ${colors.success}33, ${colors.success}66)`
                                : `linear-gradient(135deg, ${colors.purple}33, ${colors.pink}33)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border:
                              sectionProgress === 100
                                ? `2px solid ${colors.success}66`
                                : `2px solid ${colors.purple}66`,
                          }}
                        >
                          {sectionProgress === 100 ? (
                            <CheckCircleIcon sx={{ color: colors.success, fontSize: 24 }} />
                          ) : (
                            <Typography
                              sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.2rem' }}
                            >
                              {section.ordre || sectionIndex + 1}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '1.2rem',
                              mb: 1,
                            }}
                          >
                            {section.titre}
                          </Typography>

                          {section.description && (
                            <Typography
                              sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.95rem',
                                mb: 1,
                              }}
                            >
                              {section.description}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              label={`${section.modules?.length || 0} modules`}
                              size='small'
                              sx={{
                                backgroundColor: `${colors.info}33`,
                                color: colors.info,
                                fontWeight: 600,
                              }}
                            />

                            {sectionProgress > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant='determinate'
                                  value={sectionProgress}
                                  sx={{
                                    width: 100,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: `${colors.success}22`,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: colors.success,
                                    },
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: colors.success,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  {sectionProgress}%
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 3 }}>
                      {section.modules && section.modules.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {section.modules.map((module, moduleIndex) => {
                            const ModuleIcon = getModuleIcon(module.type);
                            const moduleColor = getModuleColor(module.type);
                            const isCompleted = progress?.completedModules?.includes(module._id);

                            return (
                              <ModuleCard
                                key={module._id}
                                completed={isCompleted}
                                moduletype={module.type}
                                onClick={() => handleModuleClick(module, section)}
                              >
                                <ListItem sx={{ p: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 50 }}>
                                    <Box
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        background: `${moduleColor}33`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `2px solid ${moduleColor}66`,
                                      }}
                                    >
                                      <ModuleIcon sx={{ color: moduleColor }} />
                                    </Box>
                                  </ListItemIcon>

                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 2,
                                          mb: 1,
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                          }}
                                        >
                                          {module.ordre || moduleIndex + 1}. {module.titre}
                                        </Typography>

                                        <Chip
                                          label={module.type}
                                          size='small'
                                          sx={{
                                            backgroundColor: `${moduleColor}33`,
                                            color: moduleColor,
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                          }}
                                        />

                                        {isCompleted && (
                                          <CheckCircleIcon
                                            sx={{ color: colors.success, fontSize: 20 }}
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Box>
                                        {module.description && (
                                          <Typography
                                            sx={{
                                              color: 'rgba(255, 255, 255, 0.7)',
                                              fontSize: '0.9rem',
                                              mb: 1,
                                            }}
                                          >
                                            {module.description}
                                          </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          {module.duree && (
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                              }}
                                            >
                                              <ClockIcon
                                                sx={{ fontSize: 16, color: colors.pink }}
                                              />
                                              <Typography
                                                sx={{
                                                  color: 'rgba(255, 255, 255, 0.6)',
                                                  fontSize: '0.8rem',
                                                }}
                                              >
                                                {module.duree} min
                                              </Typography>
                                            </Box>
                                          )}

                                          <Typography
                                            sx={{
                                              color: isCompleted ? colors.success : colors.pink,
                                              fontSize: '0.8rem',
                                              fontWeight: 600,
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 0.5,
                                            }}
                                          >
                                            {isCompleted ? 'Revoir le module' : 'Commencer'}
                                            <ArrowRightIcon sx={{ fontSize: 16 }} />
                                          </Typography>
                                        </Box>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              </ModuleCard>
                            );
                          })}
                        </List>
                      ) : (
                        <Alert
                          severity='info'
                          sx={{ bgcolor: `${colors.info}15`, color: '#ffffff' }}
                        >
                          Aucun module dans cette section pour le moment.
                        </Alert>
                      )}
                    </AccordionDetails>
                  </SectionCard>
                );
              })}
            </Box>
          ) : (
            <Alert
              severity='info'
              sx={{
                bgcolor: `${colors.info}15`,
                color: '#ffffff',
                borderRadius: '20px',
                p: 3,
              }}
            >
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Contenu en cours de préparation
              </Typography>
              <Typography>
                Les sections et modules de ce cours sont actuellement en développement.
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
              <BarChart3Icon sx={{ color: colors.purple }} />
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
                  {courseStats.completedCount} sur {courseStats.totalModules} modules terminés
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
              startIcon={<BarChart3Icon />}
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
                startIcon={<AwardIcon />}
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
              startIcon={<BookIcon />}
              onClick={() => navigate('/student/courses')}
            >
              Retour aux Cours
            </BackButton>
          </Stack>

          {/* Statistiques rapides */}
          {courseStats.totalModules > 0 && (
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
                    Modules terminés:
                  </Typography>
                  <Typography sx={{ color: colors.success, fontWeight: 700, fontSize: '1rem' }}>
                    {courseStats.completedCount}/{courseStats.totalModules}
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
