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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Pie, Bar } from 'react-chartjs-2';
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

// Thème personnalisé
const instructorTheme = createTheme({
  palette: {
    primary: { main: colors.fuschia || '#f13544', light: colors.lightFuschia || '#ff6b74' },
    secondary: { main: colors.navy || '#010b40', light: colors.lightNavy || '#1a237e' },
    background: {
      default: colors.navy || '#010b40',
      paper: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
    },
    text: { primary: colors.white || '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: '16px' } } },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
      },
    },
  },
});

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Composants stylisés
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${colors.lightNavy || '#1a237e'})`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}cc, ${colors.lightNavy || '#1a237e'}cc)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}4d`,
    borderColor: `${colors.fuschia || '#f13544'}66`,
  },
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  animation: `${fadeIn} 0.8s ease-out`,
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
  color: colors.white || '#ffffff',
  boxShadow: `0 4px 16px ${colors.fuschia || '#f13544'}4d`,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}cc, ${colors.lightFuschia || '#ff6b74'}cc)`,
    boxShadow: `0 6px 20px ${colors.fuschia || '#f13544'}66`,
    transform: 'translateY(-2px)',
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

        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const headers = { Authorization: `Bearer ${user.token}` };

        // Récupérer le profil avec statistiques
        const profileRes = await axios.get(`${baseURL}/api/instructors/${user.id}/profile`, {
          headers,
        });

        const profile = profileRes.data.data || {};

        // Calculer les statistiques basées sur les données réelles
        const totalCourses = profile.coursCrees?.length || 0;
        const coursesInProgressCount = profile.coursEnCoursEdition?.length || 0;

        // Calculer le taux d'approbation
        const approvedCourses =
          profile.coursCrees?.filter((course) => course.statutApprobation === 'APPROVED').length ||
          0;
        const approvalRate =
          totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0;

        // Calculer le nombre total d'étudiants
        const totalStudents =
          profile.coursCrees?.reduce((total, course) => {
            return total + (course.etudiantsInscrits?.length || 0);
          }, 0) || 0;

        // Grouper les cours par statut
        const coursesByStatus = {};
        profile.coursCrees?.forEach((course) => {
          const status = course.statutApprobation || 'PENDING';
          coursesByStatus[status] = (coursesByStatus[status] || 0) + 1;
        });

        // Paginer les cours
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

  // Données du graphique circulaire
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
        backgroundColor: [
          colors.fuschia || '#f13544',
          colors.lightFuschia || '#ff6b74',
          colors.navy || '#010b40',
          colors.lightNavy || '#1a237e',
        ],
        borderColor: colors.white || '#ffffff',
        borderWidth: 2,
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
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'Répartition des cours par statut',
        color: colors.white || '#ffffff',
        font: { size: 16, weight: 'bold' },
      },
    },
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchData(value);
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: colors.navy || '#010b40',
        }}
      >
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: colors.navy || '#010b40',
        }}
      >
        <Alert
          severity='error'
          sx={{
            maxWidth: 500,
            bgcolor: `${colors.fuschia || '#f13544'}20`,
            color: colors.white || '#ffffff',
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
        {/* Background Decorations */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${colors.fuschia || '#f13544'}0a 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.05,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 60,
            right: 30,
            width: 120,
            height: 120,
            background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
            borderRadius: '50%',
            opacity: 0.15,
            animation: `${floatingAnimation} 4s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth='xl'>
          {/* Header */}
          <Box
            sx={{
              p: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <DashboardIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Box>
              <Typography
                variant='h3'
                sx={{
                  color: colors.white || '#ffffff',
                  fontSize: { xs: '1.5rem', md: '2.5rem' },
                }}
              >
                Tableau de Bord Instructeur
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Bienvenue {user?.nom || 'Instructeur'}
              </Typography>
            </Box>
            <Chip
              label='Instructeur'
              sx={{
                bgcolor: `${colors.fuschia || '#f13544'}33`,
                color: colors.white || '#ffffff',
                border: `1px solid ${colors.fuschia || '#f13544'}`,
              }}
            />
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Cours créés
                  </Typography>
                  <Typography variant='h4' sx={{ color: colors.fuschia || '#f13544', mb: 2 }}>
                    {stats.totalCourses}
                  </Typography>
                  <StyledButton fullWidth component={Link} to='/instructor/courses' size='small'>
                    Gérer les cours
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Cours en édition
                  </Typography>
                  <Typography variant='h4' sx={{ color: colors.fuschia || '#f13544', mb: 2 }}>
                    {stats.coursesInProgress}
                  </Typography>
                  <StyledButton
                    fullWidth
                    component={Link}
                    to='/instructor/courses-in-progress'
                    size='small'
                  >
                    Continuer l'édition
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Étudiants inscrits
                  </Typography>
                  <Typography variant='h4' sx={{ color: colors.fuschia || '#f13544', mb: 2 }}>
                    {stats.totalStudents}
                  </Typography>
                  <StyledButton fullWidth component={Link} to='/instructor/students' size='small'>
                    Voir les étudiants
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 40, color: colors.fuschia || '#f13544', mb: 2 }}
                  />
                  <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Taux d'approbation
                  </Typography>
                  <Typography variant='h4' sx={{ color: colors.fuschia || '#f13544', mb: 2 }}>
                    {stats.approvalRate}%
                  </Typography>
                  <Chip
                    label={stats.approvalRate >= 80 ? 'Excellent' : 'À améliorer'}
                    size='small'
                    variant='outlined'
                    sx={{
                      color: colors.white || '#ffffff',
                      borderColor: colors.fuschia || '#f13544',
                    }}
                  />
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Charts and Recent Courses */}
          <Grid container spacing={3} sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 2 }}>
                  Répartition des cours par statut
                </Typography>
                <Box sx={{ height: 300 }}>
                  {Object.keys(stats.coursesByStatus).length > 0 ? (
                    <Pie data={pieChartData} options={pieChartOptions} />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
                        Aucun cours créé pour le moment
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartCard>
                <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 2 }}>
                  Vos cours récents
                </Typography>
                <Box sx={{ height: 300, overflowY: 'auto' }}>
                  {stats.courses.length > 0 ? (
                    <TableContainer>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}
                            >
                              Titre du cours
                            </TableCell>
                            <TableCell
                              sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}
                            >
                              Statut
                            </TableCell>
                            <TableCell
                              sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}
                            >
                              Étudiants
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.courses.map((course) => (
                            <TableRow
                              key={course._id}
                              sx={{
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(241, 53, 68, 0.1)',
                                },
                              }}
                            >
                              <TableCell sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                {course.titre}
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
                                    bgcolor:
                                      course.statutApprobation === 'APPROVED'
                                        ? '#4caf50'
                                        : course.statutApprobation === 'PENDING'
                                          ? '#ff9800'
                                          : course.statutApprobation === 'REJECTED'
                                            ? '#f44336'
                                            : '#9e9e9e',
                                    color: colors.white || '#ffffff',
                                    fontWeight: 'bold',
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                {course.etudiantsInscrits?.length || 0}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
                        Aucun cours créé pour le moment
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}33`,
                    '&:hover': {
                      bgcolor: `${colors.fuschia || '#f13544'}33`,
                    },
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: colors.fuschia || '#f13544',
                    '&:hover': {
                      backgroundColor: colors.lightFuschia || '#ff6b74',
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* Quick Actions */}
          <ChartCard sx={{ p: 4, mb: 4 }}>
            <Typography variant='h5' sx={{ color: colors.white || '#ffffff', mb: 3 }}>
              Actions rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant='outlined'
                  component={Link}
                  to='/instructor/courses/create'
                  startIcon={<SchoolIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
                      borderColor: colors.fuschia || '#f13544',
                    },
                  }}
                >
                  Créer un nouveau cours
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant='outlined'
                  component={Link}
                  to='/instructor/analytics'
                  startIcon={<AssessmentIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
                      borderColor: colors.fuschia || '#f13544',
                    },
                  }}
                >
                  Analytics étudiants
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant='outlined'
                  component={Link}
                  to='/instructor/courses-in-progress'
                  startIcon={<ScheduleIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
                      borderColor: colors.fuschia || '#f13544',
                    },
                  }}
                >
                  Cours en édition
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant='outlined'
                  component={Link}
                  to='/instructor/settings'
                  startIcon={<SettingsIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
                      borderColor: colors.fuschia || '#f13544',
                    },
                  }}
                >
                  Paramètres
                </Button>
              </Grid>
            </Grid>
          </ChartCard>
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default InstructorDashboard;
