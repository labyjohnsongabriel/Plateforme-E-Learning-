import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { BookOpen, Clock, User, ArrowRight, ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

/**
 * ==================== ANIMATIONS ====================
 */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
`;

/**
 * ==================== PALETTE DE COULEURS ====================
 */
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  darkBg: '#0a0e27',
  success: '#10b981',
};

/**
 * ==================== STYLED COMPONENTS ====================
 */
const CourseCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
    borderColor: `${colors.red}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ModuleCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.purple}33)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: `1px solid ${colors.purple}33`,
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  animation: `${slideInRight} 0.6s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 20px ${colors.purple}4d`,
    borderColor: `${colors.purple}66`,
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
    boxShadow: `0 8px 24px ${colors.red}4d`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

const BackButton = styled(Button)({
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '10px',
  padding: '8px 16px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  border: `1px solid ${colors.red}33`,
  '&:hover': {
    backgroundColor: `${colors.red}1a`,
    borderColor: `${colors.red}66`,
  },
});

const StatBox = styled(Box)({
  background: `linear-gradient(135deg, ${colors.purple}1a, ${colors.pink}1a)`,
  borderRadius: '12px',
  padding: '16px',
  border: `1px solid ${colors.purple}33`,
  textAlign: 'center',
});

/**
 * ==================== COMPOSANT PRINCIPAL ====================
 */
const CourseView = () => {
  const { id, courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth() || { user: null, logout: () => {} };

  // Utiliser soit id soit courseId, en priorisant id
  const courseIdentifier = id || courseId;

  // État
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  /**
   * Récupère les détails du cours
   */
  const fetchCourseData = useCallback(async () => {
    try {
      if (!user?.token) {
        setError('Authentification requise');
        logout();
        navigate('/login');
        setLoading(false);
        return;
      }

      if (!courseIdentifier) {
        setError('ID du cours manquant');
        setLoading(false);
        return;
      }

      // Valider l'ObjectId
      if (!courseIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        setError('ID du cours invalide');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Récupération du cours:', courseIdentifier);

      const headers = {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      };

      // Récupérer le cours avec les modules inclus
      const courseResponse = await axios.get(
        `${API_BASE_URL}/courses/${courseIdentifier}?includeModules=true`,
        {
          headers,
          timeout: 10000,
        }
      );

      console.log('Réponse cours:', courseResponse.data);

      const courseData = courseResponse.data?.data || courseResponse.data;
      setCourse(courseData);

      // Récupérer les modules depuis la réponse du cours ou via endpoint séparé
      let modulesList = [];

      if (courseData.modules && Array.isArray(courseData.modules)) {
        modulesList = courseData.modules;
      } else {
        // Fallback: essayer de récupérer les modules via endpoint séparé
        try {
          const modulesResponse = await axios.get(`${API_BASE_URL}/modules`, {
            params: { courseId: courseIdentifier },
            headers,
            timeout: 10000,
          });
          modulesList = modulesResponse.data?.data || modulesResponse.data || [];
        } catch (modulesErr) {
          console.warn('Erreur récupération modules:', modulesErr.message);
          modulesList = [];
        }
      }

      // S'assurer que modulesList est un tableau et a des IDs valides
      const validModules = Array.isArray(modulesList)
        ? modulesList.filter((module) => module && (module._id || module.id))
        : [];

      console.log('Modules valides:', validModules);
      setModules(validModules);

      // Récupérer la progression avec gestion d'erreur améliorée
      try {
        const progressResponse = await axios.get(
          `${API_BASE_URL}/learning/progress/${courseIdentifier}`,
          {
            headers,
            timeout: 10000,
          }
        );
        const progressData = progressResponse.data?.data || progressResponse.data;
        setProgress(progressData);
      } catch (progressErr) {
        console.warn('Erreur récupération progression:', progressErr.message);
        // Créer un objet progression par défaut
        setProgress({
          pourcentage: 0,
          dateDebut: null,
          dateFin: null,
          cours: courseIdentifier,
          apprenant: user._id,
        });
      }
    } catch (err) {
      console.error('Erreur chargement cours:', {
        message: err.message,
        status: err.response?.status,
        code: err.code,
        data: err.response?.data,
      });

      let errorMessage = 'Erreur lors du chargement du cours';

      if (err.response?.status === 400) {
        errorMessage = 'ID du cours invalide';
      } else if (err.response?.status === 401) {
        errorMessage = 'Votre session a expiré';
        logout();
        navigate('/login');
        return;
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas accès à ce cours";
      } else if (err.response?.status === 404) {
        errorMessage = 'Cours non trouvé';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de se connecter au serveur';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setCourse(null);
      setModules([]);
      setProgress(null);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [courseIdentifier, user, logout, navigate, API_BASE_URL]);

  // Charger les données au montage
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  /**
   * Réessaie de charger les données
   */
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await fetchCourseData();
  }, [fetchCourseData]);

  /**
   * Navigue vers le player du cours
   */
  const handleStartLearning = useCallback(() => {
    if (modules.length > 0) {
      // Trouver le premier module valide avec un ID
      const firstModule = modules.find((module) => module && (module._id || module.id));

      if (firstModule) {
        const firstModuleId = firstModule._id || firstModule.id;
        console.log('Navigation vers le module:', firstModuleId);
        navigate(`/student/learn/${courseIdentifier}/module/${firstModuleId}`);
      } else {
        console.error('Aucun module valide trouvé');
        setError('Aucun module valide disponible pour ce cours');
      }
    } else {
      console.log('Aucun module, navigation vers la vue générale');
      navigate(`/student/learn/${courseIdentifier}`);
    }
  }, [navigate, courseIdentifier, modules]);

  /**
   * Navigue vers un module spécifique
   */
  const handleModuleClick = useCallback(
    (module) => {
      if (module && (module._id || module.id)) {
        const moduleId = module._id || module.id;
        console.log('Navigation vers le module:', moduleId);
        navigate(`/student/learn/${courseIdentifier}/module/${moduleId}`);
      } else {
        console.error('Module invalide:', module);
        setError('Module invalide');
      }
    },
    [navigate, courseIdentifier]
  );

  /**
   * ========== AFFICHAGE CHARGEMENT ==========
   */
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
        <CircularProgress sx={{ color: colors.pink }} size={60} thickness={4} />
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1rem', sm: '1.2rem' },
            fontWeight: 500,
            mt: 2,
          }}
        >
          Chargement du cours...
        </Typography>
      </Box>
    );
  }

  /**
   * ========== AFFICHAGE ERREUR ==========
   */
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
          bgcolor: colors.navy,
          p: { xs: 2, sm: 4 },
          gap: 3,
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
            '& .MuiAlert-icon': {
              color: colors.red,
              mt: 0.5,
            },
          }}
          icon={<AlertCircle size={24} />}
          action={
            <StyledButton
              size='small'
              onClick={handleRetry}
              disabled={retrying}
              endIcon={<RotateCcw size={16} />}
              aria-label='Réessayer'
            >
              {retrying ? 'Réessai...' : 'Réessayer'}
            </StyledButton>
          }
        >
          <Typography sx={{ fontSize: '0.95rem' }}>{error || 'Cours non trouvé'}</Typography>
        </Alert>

        <BackButton
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/student/courses')}
          aria-label='Retour à mes cours'
        >
          Retour à mes cours
        </BackButton>
      </Box>
    );
  }

  /**
   * ========== AFFICHAGE PRINCIPAL ==========
   */
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
      {/* Bouton retour */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <BackButton
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/student/courses')}
          aria-label='Retour'
        >
          Retour
        </BackButton>
      </Box>

      {/* En-tête */}
      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant='h3'
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            {course.titre || course.title || 'Cours'}
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Catégorie: {course.categorie || 'Non spécifiée'}
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Colonne principale - Détails du cours */}
        <Grid item xs={12} md={8}>
          {/* Carte principale */}
          <CourseCard elevation={0} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.red}33, ${colors.purple}33)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={28} color={colors.red} />
              </Box>
              <Typography
                variant='h5'
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                Détails du Cours
              </Typography>
            </Box>

            <Divider sx={{ borderColor: `${colors.red}33`, mb: 3 }} />

            {/* Description */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              {course.description || 'Aucune description disponible'}
            </Typography>

            {/* Métadonnées */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {(course.niveau || course.level) && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={`Niveau: ${course.niveau || course.level}`}
                      sx={{
                        backgroundColor: `${colors.purple}33`,
                        color: colors.purple,
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      }}
                    />
                  </Box>
                </Grid>
              )}

              {course.duree && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Clock size={18} color={colors.pink} />
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      }}
                    >
                      {course.duree} heures
                    </Typography>
                  </Box>
                </Grid>
              )}

              {course.instructeurId && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <User size={18} color={colors.pink} />
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      }}
                    >
                      Instructeur: {course.instructeurId.prenom} {course.instructeurId.nom}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Bouton commencer l'apprentissage */}
            <StyledButton
              fullWidth
              onClick={handleStartLearning}
              endIcon={<ArrowRight size={18} />}
              aria-label="Commencer l'apprentissage"
              disabled={modules.length === 0}
            >
              {modules.length > 0 ? "Commencer l'Apprentissage" : 'Aucun module disponible'}
            </StyledButton>
          </CourseCard>

          {/* Modules */}
          {modules.length > 0 ? (
            <Box>
              <Typography
                variant='h5'
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                }}
              >
                Modules ({modules.length})
              </Typography>

              <Stack spacing={2}>
                {modules.map((module, index) => (
                  <ModuleCard
                    key={module._id || module.id || index}
                    elevation={0}
                    sx={{
                      animation: `${slideInRight} 0.6s ease-out ${index * 0.1}s forwards`,
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleModuleClick(module)}
                  >
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                        mb: 1,
                      }}
                    >
                      {module.ordre || index + 1}. {module.titre || module.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {module.contenu ||
                        module.content ||
                        module.description ||
                        'Aucun contenu disponible'}
                    </Typography>
                    {module.dateCreation && (
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.4)',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          mt: 1,
                        }}
                      >
                        {new Date(module.dateCreation).toLocaleDateString('fr-FR')}
                      </Typography>
                    )}
                  </ModuleCard>
                ))}
              </Stack>
            </Box>
          ) : (
            <Alert
              severity='info'
              sx={{
                bgcolor: `${colors.purple}1a`,
                color: '#ffffff',
                borderRadius: '12px',
                '& .MuiAlert-icon': {
                  color: colors.purple,
                },
              }}
            >
              Aucun module disponible pour ce cours.
            </Alert>
          )}
        </Grid>

        {/* Colonne latérale - Progression et Actions */}
        <Grid item xs={12} md={4}>
          {/* Progression */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              Votre Progression
            </Typography>

            <StatBox>
              <Typography
                sx={{
                  color: colors.success,
                  fontWeight: 700,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  mb: 1,
                }}
              >
                {progress?.pourcentage || 0}%
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                }}
              >
                Complété
              </Typography>
            </StatBox>

            {progress?.dateDebut && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: `${colors.purple}1a`,
                  borderRadius: '12px',
                  border: `1px solid ${colors.purple}33`,
                }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    mb: 1,
                  }}
                >
                  Commencé le:
                </Typography>
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  }}
                >
                  {new Date(progress.dateDebut).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            )}

            {progress?.dateFin && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: `${colors.success}1a`,
                  borderRadius: '12px',
                  border: `1px solid ${colors.success}33`,
                }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    mb: 1,
                  }}
                >
                  Terminé le:
                </Typography>
                <Typography
                  sx={{
                    color: colors.success,
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  }}
                >
                  {new Date(progress.dateFin).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Boutons d'action */}
          <Stack spacing={2}>
            <StyledButton
              fullWidth
              endIcon={<ArrowRight size={18} />}
              onClick={() => navigate(`/student/progress/${courseIdentifier}`)}
              aria-label='Voir ma progression'
            >
              Voir Ma Progression
            </StyledButton>

            {progress && progress.pourcentage === 100 && (
              <StyledButton
                fullWidth
                onClick={() => navigate('/student/certificates')}
                sx={{
                  background: `linear-gradient(135deg, ${colors.success}, #06d6a0)`,
                }}
                aria-label='Voir mon certificat'
              >
                Voir Mon Certificat
              </StyledButton>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseView;
