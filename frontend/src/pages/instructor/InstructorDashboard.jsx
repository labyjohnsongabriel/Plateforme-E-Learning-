// src/components/instructor/InstructorDashboard.jsx - VERSION COMPLÈTEMENT CORRIGÉE
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Stack,
  LinearProgress,
  Fade,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  BarChart3,
  RefreshCw,
  Play,
  Download,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

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

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(241, 53, 68, 0.3);
  }
  50% { 
    box-shadow: 0 0 30px rgba(241, 53, 68, 0.6);
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
};

const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  padding: theme.spacing(3.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 50px ${colors.navy}80`,
    borderColor: `${colors.red}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
  },
}));

const StatCard = styled(Box)(({ theme, color = colors.red }) => ({
  background: `linear-gradient(135deg, ${color}15, ${color}08)`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: `1px solid ${color}33`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: `${color}66`,
    boxShadow: `0 12px 30px ${color}33`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 10px 25px ${colors.red}4d`,
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.9rem',
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `${colors.red}1a`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
  },
}));

const RefreshButton = styled(IconButton)(({ theme }) => ({
  color: '#ffffff',
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `${colors.red}1a`,
    borderColor: colors.red,
    transform: 'rotate(180deg)',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: `${colors.red}10`,
    transform: 'scale(1.01)',
  },
  '& td, & th': {
    border: 'none',
    padding: theme.spacing(2),
  },
}));

const InstructorDashboard = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCourses: 0,
      coursesInProgress: 0,
      totalStudents: 0,
      approvalRate: 0,
      completionRate: 0,
    },
    courses: [],
    recentStudents: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // === FONCTIONS D'AUTHENTIFICATION ===
  const getAuthToken = useCallback(() => {
    return user?.token || localStorage.getItem('token');
  }, [user]);

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : {};
  }, [getAuthToken]);

  // === VÉRIFICATION D'ACCÈS ===
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ENSEIGNANT') {
      setError('Accès non autorisé. Seuls les instructeurs peuvent accéder à cette page.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [user, authLoading, navigate]);

  // === RÉCUPÉRATION DES DONNÉES - VERSION COMPLÈTEMENT CORRIGÉE ===
  const fetchDashboardData = useCallback(
    async (isRefresh = false, page = 1) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const token = getAuthToken();
        if (!token) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const headers = getAuthHeaders();

        // Récupération des données de l'instructeur - VERSION CORRIGÉE
        const [profileResponse, coursesResponse, studentsStatsResponse, instructorStatsResponse] = await Promise.all([
          // Profil de l'instructeur
          axios
            .get(`${API_BASE_URL}/instructeurs/${user?.id}/profile`, { headers })
            .catch((err) => {
              console.warn('Erreur récupération profil:', err.message);
              return { data: { data: {} } };
            }),
          // Cours de l'instructeur
          axios
            .get(`${API_BASE_URL}/instructeurs/${user?.id}/courses`, { headers })
            .catch((err) => {
              console.warn('Erreur récupération cours:', err.message);
              return { data: { data: [] } };
            }),
          // NOUVEAU: Statistiques étudiants depuis l'API inscriptions
          axios
            .get(`${API_BASE_URL}/learning/instructor/stats`, { headers })
            .catch((err) => {
              console.warn('Erreur récupération statistiques étudiants:', err.message);
              return { data: { data: { totalStudents: 0 } } };
            }),
          // NOUVEAU: Statistiques détaillées instructeur
          axios
            .get(`${API_BASE_URL}/learning/instructor/students`, { headers })
            .catch((err) => {
              console.warn('Erreur récupération étudiants instructeur:', err.message);
              return { data: { data: { students: [], totalStudents: 0 } } };
            })
        ]);

        const profile = profileResponse.data.data || {};
        const courses = Array.isArray(coursesResponse.data?.data) ? coursesResponse.data.data : [];
        const studentsStats = studentsStatsResponse.data?.data || { totalStudents: 0 };
        const instructorStats = instructorStatsResponse.data?.data || { students: [], totalStudents: 0 };

        console.log('📊 Données reçues:', {
          profile,
          coursesCount: courses.length,
          studentsStats,
          instructorStats
        });

        // CALCUL DES STATISTIQUES - VERSION CORRIGÉE
        const totalCourses = profile.coursCrees?.length || 0;
        const coursesInProgress = profile.coursEnCoursEdition?.length || 0;

        // Utiliser le comptage d'étudiants depuis l'API inscriptions (plus fiable)
        const totalStudents = studentsStats.totalStudents || instructorStats.totalStudents || 0;

        const approvedCourses =
          profile.coursCrees?.filter((course) => course.statutApprobation === 'APPROVED').length ||
          0;

        const approvalRate =
          totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0;

        // Calcul du taux de complétion moyen
        const completionRate =
          totalCourses > 0
            ? Math.round(
                courses.reduce((sum, course) => sum + (course.tauxCompletion || 0), 0) /
                  totalCourses
              )
            : 0;

        // Pagination des cours
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedCourses = courses.slice(startIndex, endIndex);

        // ÉTUDIANTS RÉCENTS - VERSION CORRIGÉE
        let recentStudents = [];

        // Méthode 1: Utiliser les étudiants de l'API inscriptions
        if (instructorStats.students && Array.isArray(instructorStats.students)) {
          recentStudents = instructorStats.students.slice(0, 5).map(student => ({
            _id: student._id,
            nom: student.nom,
            prenom: student.prenom,
            email: student.email,
            dateInscription: student.dateInscription,
            courseTitle: 'Multiple courses', // L'étudiant peut être dans plusieurs cours
            inscriptionDate: student.dateInscription,
          }));
        } else {
          // Méthode de fallback: Extraire des cours
          const allStudents = [];
          profile.coursCrees?.forEach((course) => {
            if (course.etudiantsInscrits && Array.isArray(course.etudiantsInscrits)) {
              course.etudiantsInscrits.forEach((student) => {
                if (student && student.dateInscription) {
                  allStudents.push({
                    ...student,
                    courseTitle: course.titre,
                    inscriptionDate: student.dateInscription,
                  });
                }
              });
            }
          });

          // Trier par date d'inscription et prendre les 5 plus récents
          allStudents.sort((a, b) => new Date(b.inscriptionDate) - new Date(a.inscriptionDate));
          recentStudents = allStudents.slice(0, 5);
        }

        setDashboardData({
          stats: {
            totalCourses,
            coursesInProgress,
            totalStudents, // ← VALEUR CORRECTE
            approvalRate,
            completionRate,
          },
          courses: paginatedCourses,
          recentStudents: recentStudents,
        });

        setTotalPages(Math.ceil(courses.length / itemsPerPage));
        setCurrentPage(page);

        console.log('✅ Dashboard instructeur chargé avec succès:', {
          totalStudents: totalStudents,
          totalCourses: totalCourses,
          approvalRate: approvalRate,
          completionRate: completionRate,
          recentStudents: recentStudents.length
        });
      } catch (err) {
        console.error('❌ Erreur chargement dashboard instructeur:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement des données du tableau de bord';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_BASE_URL, user, getAuthToken, getAuthHeaders]
  );

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    if (user?.role === 'ENSEIGNANT') {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // === ACTUALISATION DES DONNÉES ===
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchDashboardData(false, value);
  };

  // === REDIRECTIONS ===
  const handleCreateCourse = () => {
    navigate('/instructor/create-course');
  };

  const handleViewAnalytics = () => {
    navigate('/instructor/analytics');
  };

  // === AFFICHAGE DU CHARGEMENT ===
  if (authLoading || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          animation: `${fadeInUp} 0.5s ease-out`,
        }}
      >
        <CircularProgress
          size={70}
          thickness={4}
          sx={{
            color: colors.red,
            animation: `${pulseGlow} 2s infinite`,
          }}
        />
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontWeight: 600,
            mt: 3,
          }}
        >
          Chargement de votre tableau de bord...
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            mt: 1,
          }}
        >
          Préparation de vos statistiques d'enseignement
        </Typography>
      </Box>
    );
  }

  if (error && error.includes('Accès non autorisé')) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          p: 3,
        }}
      >
        <Alert
          severity='error'
          sx={{
            maxWidth: 500,
            background: `${colors.red}15`,
            color: colors.red,
            borderRadius: '12px',
            border: `1px solid ${colors.red}33`,
            '& .MuiAlert-icon': { color: colors.red },
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      {/* En-tête avec bouton d'actualisation */}
      <Fade in timeout={800}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: { xs: 4, sm: 6 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant='h3'
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(135deg, #ffffff, #ff6b74)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Tableau de Bord Instructeur
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 500,
              }}
            >
              Bienvenue, {user?.nom || 'Instructeur'} • Gérez vos cours et suivez vos performances
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <SecondaryButton onClick={handleCreateCourse} startIcon={<BookOpen size={18} />}>
              Créer un cours
            </SecondaryButton>
            <Tooltip title='Actualiser les données'>
              <RefreshButton onClick={handleRefresh} disabled={refreshing} size='large'>
                <RefreshCw size={20} />
              </RefreshButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      {/* Alertes */}
      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            bgcolor: `${colors.red}15`,
            color: colors.red,
            borderRadius: '12px',
            border: `1px solid ${colors.red}33`,
            '& .MuiAlert-icon': { color: colors.red },
          }}
          action={
            <Button color='inherit' size='small' onClick={() => setError(null)}>
              Fermer
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* CARTES DE STATISTIQUES */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        {/* Total des Cours */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.red}>
            <BookOpen size={36} color={colors.red} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.red,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.totalCourses}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Total des Cours
            </Typography>
          </StatCard>
        </Grid>

        {/* Étudiants Inscrits - CORRIGÉ */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.purple}>
            <Users size={36} color={colors.purple} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.purple,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.totalStudents}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Étudiants Inscrits
            </Typography>
          </StatCard>
        </Grid>

        {/* Taux d'Approximation */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.success}>
            <Award size={36} color={colors.success} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.success,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.approvalRate}%
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Taux d'Approximation
            </Typography>
          </StatCard>
        </Grid>

        {/* Cours en Édition */}
        {/*
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.pink}>
            <Clock size={36} color={colors.pink} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.pink,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.coursesInProgress}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Cours en Édition
            </Typography>
          </StatCard>
        </Grid>
*/}
        {/* Taux de Complétion */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.warning}>
            <BarChart3 size={36} color={colors.warning} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.warning,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.completionRate}%
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Taux de Complétion
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* CONTENU PRINCIPAL */}
      <Grid container spacing={{ xs: 3, sm: 4, md: 4 }}>
        {/* PERFORMANCE GLOBALE */}
        <Grid item xs={12} lg={6}>
          <DashboardCard elevation={0}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography
                variant='h5'
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', sm: '1.6rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <TrendingUp size={28} color={colors.red} />
                Performance Globale
              </Typography>
              <Chip
                label={`${dashboardData.stats.approvalRate}% d'approbation`}
                sx={{
                  backgroundColor: `${colors.red}33`,
                  color: colors.red,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              />
            </Box>

            <LinearProgress
              variant='determinate'
              value={dashboardData.stats.approvalRate}
              sx={{
                height: 16,
                borderRadius: 8,
                backgroundColor: `${colors.red}33`,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  borderRadius: 8,
                  animation: `${pulseGlow} 2s infinite`,
                },
              }}
            />

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}
            >
              <Typography
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Performance globale sur {dashboardData.stats.totalCourses} cours
              </Typography>
              <Typography sx={{ color: colors.red, fontSize: '0.9rem', fontWeight: 700 }}>
                {dashboardData.stats.approvalRate}%
              </Typography>
            </Box>

            {/* Indicateurs de performance */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography sx={{ color: colors.success, fontSize: '1.2rem', fontWeight: 800 }}>
                  {dashboardData.stats.totalStudents}
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                  Étudiants
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography sx={{ color: colors.warning, fontSize: '1.2rem', fontWeight: 800 }}>
                  {dashboardData.stats.completionRate}%
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                  Complétion
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>

        {/* ÉTUDIANTS RÉCENTS - VERSION CORRIGÉE */}
        <Grid item xs={12} lg={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <UserCheck size={28} color={colors.pink} />
              Étudiants Récents ({dashboardData.recentStudents.length})
            </Typography>

            <Stack spacing={2}>
              {dashboardData.recentStudents.length > 0 ? (
                dashboardData.recentStudents.map((student, index) => (
                  <Box
                    key={student._id || `student-${index}`}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
                      borderRadius: '12px',
                      p: 2.5,
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        background: `${colors.red}1a`,
                        borderColor: colors.red,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {student.prenom} {student.nom}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        }}
                      >
                        {student.email}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          mt: 0.5,
                        }}
                      >
                        Inscrit le {new Date(student.inscriptionDate).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>

                    <Chip
                      label='Actif'
                      size='small'
                      sx={{
                        backgroundColor: `${colors.success}33`,
                        color: colors.success,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255, 255, 255, 0.5)' }}>
                  <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                    Aucun étudiant inscrit
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', mb: 2 }}>
                    Les étudiants apparaîtront ici lorsqu'ils s'inscriront à vos cours
                  </Typography>
                  <SecondaryButton onClick={handleCreateCourse}>Créer un cours</SecondaryButton>
                </Box>
              )}
            </Stack>
          </DashboardCard>
        </Grid>

        {/* COURS CRÉÉS */}
        <Grid item xs={12}>
          <DashboardCard elevation={0}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography
                variant='h5'
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', sm: '1.6rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <BookOpen size={28} color={colors.purple} />
                Mes Cours ({dashboardData.stats.totalCourses})
              </Typography>

              {dashboardData.stats.totalCourses > 0 && (
                <Chip
                  label={`${dashboardData.stats.approvalRate}% d'approbation`}
                  sx={{
                    backgroundColor: `${colors.success}33`,
                    color: colors.success,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                />
              )}
            </Box>

            {dashboardData.courses.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                          Titre du cours
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                          Statut
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                          Étudiants
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                          Taux de complétion
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.courses.map((course, index) => (
                        <StyledTableRow key={course._id || `course-${index}`}>
                          <TableCell>
                            <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                              {course.titre}
                            </Typography>
                            <Typography
                              sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}
                            >
                              {course.description?.substring(0, 50)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                course.statutApprobation === 'APPROVED'
                                  ? 'Approuvé'
                                  : course.statutApprobation === 'PENDING'
                                    ? 'En attente'
                                    : course.statutApprobation === 'REJECTED'
                                      ? 'Rejeté'
                                      : 'Brouillon'
                              }
                              size='small'
                              sx={{
                                backgroundColor:
                                  course.statutApprobation === 'APPROVED'
                                    ? `${colors.success}33`
                                    : course.statutApprobation === 'PENDING'
                                      ? `${colors.warning}33`
                                      : course.statutApprobation === 'REJECTED'
                                        ? `${colors.red}33`
                                        : `${colors.info}33`,
                                color:
                                  course.statutApprobation === 'APPROVED'
                                    ? colors.success
                                    : course.statutApprobation === 'PENDING'
                                      ? colors.warning
                                      : course.statutApprobation === 'REJECTED'
                                        ? colors.red
                                        : colors.info,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                              {course.etudiantsInscrits?.length || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <LinearProgress
                                variant='determinate'
                                value={course.tauxCompletion || 0}
                                sx={{
                                  flex: 1,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: `${colors.red}33`,
                                  '& .MuiLinearProgress-bar': {
                                    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                                    borderRadius: 4,
                                  },
                                }}
                              />
                              <Typography
                                sx={{ color: '#ffffff', fontSize: '0.8rem', minWidth: 35 }}
                              >
                                {course.tauxCompletion || 0}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <ActionButton
                              size='small'
                              onClick={() => navigate(`/instructor/course/${course._id}`)}
                              startIcon={<Play size={16} />}
                            >
                              Gérer
                            </ActionButton>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#ffffff',
                          '&.Mui-selected': {
                            background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                            color: '#ffffff',
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5, color: 'rgba(255, 255, 255, 0.5)' }}>
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
                  Aucun cours créé pour le moment
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', mb: 3 }}>
                  Créez votre premier cours pour commencer à enseigner
                </Typography>
                <ActionButton onClick={handleCreateCourse} startIcon={<BookOpen size={18} />}>
                  Créer mon premier cours
                </ActionButton>
              </Box>
            )}
          </DashboardCard>
        </Grid>
      </Grid>

      {/* ACTIONS RAPIDES */}
      <Box sx={{ mt: 4 }}>
        <DashboardCard elevation={0}>
          <Typography
            variant='h5'
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '1.3rem', sm: '1.6rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <BarChart3 size={28} color={colors.info} />
            Actions Rapides
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <SecondaryButton
                fullWidth
                onClick={handleCreateCourse}
                startIcon={<BookOpen size={18} />}
                sx={{ py: 2 }}
              >
                Créer un cours
              </SecondaryButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SecondaryButton
                fullWidth
                onClick={handleViewAnalytics}
                startIcon={<TrendingUp size={18} />}
                sx={{ py: 2 }}
              >
                Voir les analytics
              </SecondaryButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SecondaryButton
                fullWidth
                onClick={() => navigate('/instructor/students')}
                startIcon={<Users size={18} />}
                sx={{ py: 2 }}
              >
                Gérer les étudiants
              </SecondaryButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SecondaryButton
                fullWidth
                onClick={() => navigate('/instructor/settings')}
                startIcon={<Download size={18} />}
                sx={{ py: 2 }}
              >
                Paramètres
              </SecondaryButton>
            </Grid>
          </Grid>
        </DashboardCard>
      </Box>
    </Box>
  );
};

export default InstructorDashboard;