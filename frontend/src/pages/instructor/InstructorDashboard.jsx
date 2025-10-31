// src/components/instructor/InstructorDashboard.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  ThemeProvider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
  createTheme,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Pie } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Thème professionnel
const instructorTheme = createTheme({
  palette: {
    primary: { main: colors.fuschia || '#f13544', light: colors.lightFuschia || '#ff6b74' },
    secondary: { main: colors.navy || '#010b40', light: colors.lightNavy || '#1a237e' },
    background: {
      default: colors.navy || '#010b40',
      paper: colors.navy || '#010b40',
    },
    text: { primary: colors.white || '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
});

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

// Conteneur principal avec design moderne
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'} 0%, ${colors.lightNavy || '#1a237e'} 100%)`,
  position: 'relative',
  overflow: 'auto',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, ${colors.fuschia}15 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${colors.lightFuschia}10 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
}));

// Carte de statistiques moderne
const ModernStatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)`,
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${colors.fuschia}, ${colors.lightFuschia})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px ${colors.fuschia}20`,
    border: `1px solid ${colors.fuschia}40`,
    '&::before': {
      opacity: 1,
    },
  },
}));

// Carte graphique avec style glassmorphism
const GlassCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
  backdropFilter: 'blur(30px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  animation: `${fadeIn} 0.8s ease-out`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: '20px',
  },
}));

// Bouton moderne avec effet gradient
const ModernButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia}, ${colors.lightFuschia})`,
  color: colors.white,
  borderRadius: '16px',
  padding: '14px 32px',
  fontWeight: 600,
  fontSize: '0.95rem',
  textTransform: 'none',
  boxShadow: `0 8px 24px ${colors.fuschia}40`,
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${colors.fuschia}60`,
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

// Ligne de tableau stylisée
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: `${colors.fuschia}10`,
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
  const [stats, setStats] = useState({
    totalCourses: 0,
    coursesInProgress: 0,
    totalStudents: 0,
    approvalRate: 0,
    coursesByStatus: {},
    courses: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Vérifier l'accès de l'instructeur
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ENSEIGNANT') {
      setError('Accès non autorisé. Seuls les instructeurs peuvent accéder à cette page.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [user, authLoading, navigate]);

  // Récupérer les données
  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError('');
      try {
        if (!user) return;

        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        const headers = { Authorization: `Bearer ${user.token}` };

        const profileRes = await axios.get(`${baseURL}/api/instructeurs/${user.id}/profile`, {
          headers,
        });

        const profile = profileRes.data.data || {};

        const totalCourses = profile.coursCrees?.length || 0;
        const coursesInProgressCount = profile.coursEnCoursEdition?.length || 0;

        const approvedCourses =
          profile.coursCrees?.filter((course) => course.statutApprobation === 'APPROVED').length ||
          0;
        const approvalRate =
          totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0;

        const totalStudents =
          profile.coursCrees?.reduce((total, course) => {
            return total + (course.etudiantsInscrits?.length || 0);
          }, 0) || 0;

        const coursesByStatus = {};
        profile.coursCrees?.forEach((course) => {
          const status = course.statutApprobation || 'PENDING';
          coursesByStatus[status] = (coursesByStatus[status] || 0) + 1;
        });

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedCourses = profile.coursCrees?.slice(startIndex, endIndex) || [];

        setStats({
          totalCourses,
          coursesInProgress: coursesInProgressCount,
          totalStudents,
          approvalRate,
          coursesByStatus,
          courses: paginatedCourses,
        });

        setTotalPages(Math.ceil(totalCourses / itemsPerPage));
        setCurrentPage(page);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données.');
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user?.role === 'ENSEIGNANT') {
      fetchData(1);
    }
  }, [user, fetchData]);

  // Configuration du graphique
  const pieChartData = {
    labels: Object.keys(stats.coursesByStatus).map((status) => {
      const statusMap = {
        PENDING: 'En attente',
        APPROVED: 'Approuvé',
        REJECTED: 'Rejeté',
        DRAFT: 'Brouillon',
      };
      return statusMap[status] || status;
    }),
    datasets: [
      {
        data: Object.values(stats.coursesByStatus),
        backgroundColor: [colors.fuschia || '#f13544', '#10b981', '#ef4444', '#6b7280'],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.white || '#ffffff',
          font: { size: 13, weight: '500' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchData(value);
  };

  // État de chargement
  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: colors.fuschia }} />
        <Typography sx={{ color: colors.white, fontSize: '1.1rem', fontWeight: 500 }}>
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
          p: 3,
        }}
      >
        <Alert
          severity='error'
          sx={{
            maxWidth: 500,
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: colors.white,
            borderRadius: '16px',
            '& .MuiAlert-icon': { color: '#ef4444' },
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={instructorTheme}>
      <DashboardContainer>
        {/* Éléments de fond décoratifs */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${colors.fuschia}15, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: `${float} 10s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            background: `radial-gradient(circle, ${colors.lightFuschia}10, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(100px)',
            animation: `${float} 12s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth='xl' sx={{ py: 5, position: 'relative', zIndex: 1 }}>
          {/* En-tête moderne */}
          <Box sx={{ mb: 6, animation: `${scaleIn} 0.5s ease-out` }}>
            <Stack direction='row' spacing={3} alignItems='center' flexWrap='wrap'>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: `linear-gradient(135deg, ${colors.fuschia}, ${colors.lightFuschia})`,
                  boxShadow: `0 8px 24px ${colors.fuschia}40`,
                }}
              >
                <DashboardIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='h3'
                  sx={{
                    color: colors.white,
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                    mb: 1,
                    fontWeight: 700,
                  }}
                >
                  Tableau de Bord Instructeur
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.1rem',
                    fontWeight: 400,
                  }}
                >
                  Bienvenue, {user?.nom || 'Instructeur'} • Gérez vos cours et suivez vos
                  performances
                </Typography>
              </Box>
              <Chip
                label='Instructeur'
                icon={<CheckCircleIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${colors.fuschia}20, ${colors.lightFuschia}20)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.fuschia}40`,
                  color: colors.white,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  height: '42px',
                  px: 2,
                  '& .MuiChip-icon': { color: colors.fuschia },
                }}
              />
            </Stack>
          </Box>

          {/* Grille de statistiques modernisée */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <ModernStatCard sx={{ animationDelay: '0.1s' }}>
                <Stack spacing={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        background: `${colors.fuschia}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 32, color: colors.fuschia }} />
                    </Box>
                    <Chip
                      label='+12%'
                      size='small'
                      sx={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        fontWeight: 600,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    />
                  </Stack>
                  <Box>
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 1 }}
                    >
                      Cours créés
                    </Typography>
                    <Typography variant='h3' sx={{ color: colors.white, fontWeight: 700 }}>
                      {stats.totalCourses}
                    </Typography>
                  </Box>
                  <ModernButton
                    fullWidth
                    component={Link}
                    to='/instructor/courses'
                    size='small'
                    sx={{ mt: 1 }}
                  >
                    Gérer les cours
                  </ModernButton>
                </Stack>
              </ModernStatCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ModernStatCard sx={{ animationDelay: '0.2s' }}>
                <Stack spacing={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        background: `${colors.fuschia}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: 32, color: colors.fuschia }} />
                    </Box>
                    <Chip
                      label='En cours'
                      size='small'
                      sx={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#f59e0b',
                        fontWeight: 600,
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    />
                  </Stack>
                  <Box>
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 1 }}
                    >
                      Cours en édition
                    </Typography>
                    <Typography variant='h3' sx={{ color: colors.white, fontWeight: 700 }}>
                      {stats.coursesInProgress}
                    </Typography>
                  </Box>
                  <ModernButton
                    fullWidth
                    component={Link}
                    to='/instructor/courses-in-progress'
                    size='small'
                    sx={{ mt: 1 }}
                  >
                    Continuer l'édition
                  </ModernButton>
                </Stack>
              </ModernStatCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ModernStatCard sx={{ animationDelay: '0.3s' }}>
                <Stack spacing={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        background: `${colors.fuschia}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 32, color: colors.fuschia }} />
                    </Box>
                    <Chip
                      label='+28%'
                      size='small'
                      sx={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        fontWeight: 600,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    />
                  </Stack>
                  <Box>
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 1 }}
                    >
                      Étudiants inscrits
                    </Typography>
                    <Typography variant='h3' sx={{ color: colors.white, fontWeight: 700 }}>
                      {stats.totalStudents}
                    </Typography>
                  </Box>
                  <ModernButton
                    fullWidth
                    component={Link}
                    to='/instructor/students'
                    size='small'
                    sx={{ mt: 1 }}
                  >
                    Voir les étudiants
                  </ModernButton>
                </Stack>
              </ModernStatCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ModernStatCard sx={{ animationDelay: '0.4s' }}>
                <Stack spacing={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        background: `${colors.fuschia}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 32, color: colors.fuschia }} />
                    </Box>
                    <Chip
                      label={stats.approvalRate >= 80 ? 'Excellent' : 'Bon'}
                      size='small'
                      sx={{
                        background:
                          stats.approvalRate >= 80
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                        color: stats.approvalRate >= 80 ? '#10b981' : '#f59e0b',
                        fontWeight: 600,
                        border:
                          stats.approvalRate >= 80
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    />
                  </Stack>
                  <Box>
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 1 }}
                    >
                      Taux d'approbation
                    </Typography>
                    <Typography variant='h3' sx={{ color: colors.white, fontWeight: 700 }}>
                      {stats.approvalRate}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: '6px',
                      borderRadius: '3px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden',
                      mt: 1,
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${stats.approvalRate}%`,
                        background: `linear-gradient(90deg, ${colors.fuschia}, ${colors.lightFuschia})`,
                        borderRadius: '3px',
                        transition: 'width 1s ease',
                      }}
                    />
                  </Box>
                </Stack>
              </ModernStatCard>
            </Grid>
          </Grid>

          {/* Section graphiques et cours récents */}
          <Grid container spacing={4} sx={{ mb: 5 }}>
            {/* Graphique */}
            <Grid item xs={12} lg={6}>
              <GlassCard sx={{ height: '100%' }}>
                <Typography
                  variant='h5'
                  sx={{
                    color: colors.white,
                    mb: 3,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <AssessmentIcon sx={{ color: colors.fuschia }} />
                  Répartition des cours
                </Typography>
                <Box sx={{ height: 350 }}>
                  {Object.keys(stats.coursesByStatus).length > 0 ? (
                    <Pie data={pieChartData} options={pieChartOptions} />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.2)' }} />
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                        Aucun cours créé pour le moment
                      </Typography>
                    </Box>
                  )}
                </Box>
              </GlassCard>
            </Grid>

            {/* Cours récents */}
            <Grid item xs={12} lg={6}>
              <GlassCard sx={{ height: '100%' }}>
                <Typography
                  variant='h5'
                  sx={{
                    color: colors.white,
                    mb: 3,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <SchoolIcon sx={{ color: colors.fuschia }} />
                  Cours récents
                </Typography>
                <Box sx={{ height: 350, overflowY: 'auto', pr: 1 }}>
                  {stats.courses.length > 0 ? (
                    <TableContainer>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, pb: 2 }}
                            >
                              Titre
                            </TableCell>
                            <TableCell
                              sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, pb: 2 }}
                            >
                              Statut
                            </TableCell>
                            <TableCell
                              sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, pb: 2 }}
                            >
                              Étudiants
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.courses.map((course, index) => (
                            <StyledTableRow
                              key={course._id}
                              sx={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <TableCell sx={{ color: colors.white }}>
                                <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                  {course.titre}
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
                                    background:
                                      course.statutApprobation === 'APPROVED'
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : course.statutApprobation === 'PENDING'
                                          ? 'rgba(245, 158, 11, 0.2)'
                                          : course.statutApprobation === 'REJECTED'
                                            ? 'rgba(239, 68, 68, 0.2)'
                                            : 'rgba(107, 114, 128, 0.2)',
                                    color:
                                      course.statutApprobation === 'APPROVED'
                                        ? '#10b981'
                                        : course.statutApprobation === 'PENDING'
                                          ? '#f59e0b'
                                          : course.statutApprobation === 'REJECTED'
                                            ? '#ef4444'
                                            : '#9ca3af',
                                    fontWeight: 600,
                                    border:
                                      course.statutApprobation === 'APPROVED'
                                        ? '1px solid rgba(16, 185, 129, 0.3)'
                                        : course.statutApprobation === 'PENDING'
                                          ? '1px solid rgba(245, 158, 11, 0.3)'
                                          : course.statutApprobation === 'REJECTED'
                                            ? '1px solid rgba(239, 68, 68, 0.3)'
                                            : '1px solid rgba(107, 114, 128, 0.3)',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction='row' spacing={1} alignItems='center'>
                                  <PeopleIcon sx={{ fontSize: 18, color: colors.fuschia }} />
                                  <Typography sx={{ color: colors.white, fontWeight: 500 }}>
                                    {course.etudiantsInscrits?.length || 0}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.2)' }} />
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                        Aucun cours créé pour le moment
                      </Typography>
                      <ModernButton
                        component={Link}
                        to='/instructor/create-course'
                        startIcon={<AddIcon />}
                        sx={{ mt: 2 }}
                      >
                        Créer un cours
                      </ModernButton>
                    </Box>
                  )}
                </Box>
              </GlassCard>
            </Grid>
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                size='large'
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: colors.white,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 500,
                    '&:hover': {
                      background: `${colors.fuschia}20`,
                      borderColor: `${colors.fuschia}40`,
                    },
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    background: `linear-gradient(135deg, ${colors.fuschia}, ${colors.lightFuschia})`,
                    borderColor: colors.fuschia,
                    fontWeight: 700,
                    boxShadow: `0 4px 16px ${colors.fuschia}40`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${colors.fuschia}dd, ${colors.lightFuschia}dd)`,
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* Actions rapides modernisées */}
          <GlassCard>
            <Typography
              variant='h5'
              sx={{
                color: colors.white,
                mb: 4,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <SettingsIcon sx={{ color: colors.fuschia }} />
              Actions rapides
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  component={Link}
                  to='/instructor/create-course'
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${colors.fuschia}40`,
                    color: colors.white,
                    borderRadius: '16px',
                    py: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `${colors.fuschia}20`,
                      borderColor: colors.fuschia,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${colors.fuschia}30`,
                    },
                  }}
                >
                  Créer un cours
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  component={Link}
                  to='/instructor/analytics'
                  startIcon={<AssessmentIcon />}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${colors.fuschia}40`,
                    color: colors.white,
                    borderRadius: '16px',
                    py: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `${colors.fuschia}20`,
                      borderColor: colors.fuschia,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${colors.fuschia}30`,
                    },
                  }}
                >
                  Analytics
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  component={Link}
                  to='/instructor/analytics'
                  startIcon={<ScheduleIcon />}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${colors.fuschia}40`,
                    color: colors.white,
                    borderRadius: '16px',
                    py: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `${colors.fuschia}20`,
                      borderColor: colors.fuschia,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${colors.fuschia}30`,
                    },
                  }}
                >
                  Cours en édition
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  component={Link}
                  to='/instructor/settings'
                  startIcon={<SettingsIcon />}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${colors.fuschia}40`,
                    color: colors.white,
                    borderRadius: '16px',
                    py: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `${colors.fuschia}20`,
                      borderColor: colors.fuschia,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${colors.fuschia}30`,
                    },
                  }}
                >
                  Paramètres
                </Button>
              </Grid>
            </Grid>
          </GlassCard>
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default InstructorDashboard;
