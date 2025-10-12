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
  Divider,
  Avatar,
  Chip,
  createTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Pie, Bar } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import {
  School as SchoolIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
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

// Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
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
  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      if (!user) return;

      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const headers = { Authorization: `Bearer ${user.token}` };

      // Récupérer le profil
      const profileRes = await axios.get(
        `${baseURL}/instructor/${user.id}/profile`,
        { headers }
      );
      const profile = profileRes.data.data || {};

      // Récupérer les cours avec pagination
      const coursesRes = await axios.get(
        `${baseURL}/instructor/${user.id}/courses?page=${page}&limit=${itemsPerPage}`,
        { headers }
      );
      const coursesData = coursesRes.data.data || [];
      const pagination = coursesRes.data.pagination || {};

      // Récupérer les cours en cours
      const inProgressRes = await axios.get(
        `${baseURL}/instructor/${user.id}/courses-in-progress`,
        { headers }
      );
      const coursesInProgress = inProgressRes.data.data || [];

      // Calculer les statistiques
      const totalCourses = profile.stats?.totalCourses || 0;
      const coursesInProgressCount = coursesInProgress.length;
      const approvalRate = profile.stats?.approvalRate || 0;

      // Grouper les cours par statut
      const coursesByStatus = coursesData.reduce((acc, course) => {
        acc[course.statutApprobation] = (acc[course.statutApprobation] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalCourses,
        coursesInProgress: coursesInProgressCount,
        totalStudents: profile.stats?.totalStudents || 0,
        approvalRate,
        coursesByStatus,
        courses: coursesData,
      });

      setTotalPages(pagination.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors de la récupération des données.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'ENSEIGNANT') {
      fetchData(1);
    }
  }, [user, fetchData]);

  // Données du graphique circulaire
  const pieChartData = {
    labels: Object.keys(stats.coursesByStatus),
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
      legend: { position: 'bottom', labels: { color: colors.white || '#ffffff' } },
      title: {
        display: true,
        text: 'Répartition des cours par statut',
        color: colors.white || '#ffffff',
        font: { size: 16, weight: 'bold' },
      },
    },
  };

  if (authLoading || isLoading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: colors.navy || '#010b40',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: colors.navy || '#010b40',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={instructorTheme}>
      <DashboardContainer>
        {/* Background Decorations */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${colors.fuschia || '#f13544'}0a 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.05,
          pointerEvents: 'none',
        }} />
        <Box sx={{
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
        }} />

        <Container maxWidth={false} disableGutters>
          {/* Header */}
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <DashboardIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Box>
              <Typography variant="h3" sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
                Tableau de Bord Instructeur
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Bienvenue {user?.nom || 'Instructeur'}
              </Typography>
            </Box>
            <Chip
              label="Instructeur"
              sx={{
                bgcolor: `${colors.fuschia || '#f13544'}33`,
                color: colors.white || '#ffffff',
                border: `1px solid ${colors.fuschia || '#f13544'}`,
              }}
            />
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <SchoolIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Cours créés
                  </Typography>
                  <Typography variant="h4" sx={{ color: colors.fuschia || '#f13544', mb: 2 }}>
                    {stats.totalCourses}
                  </Typography>
                  <StyledButton fullWidth component={Link} to="/instructor/courses" size="small">
                    Gérer
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <ScheduleIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Cours en cours
                  </Typography>
                  <Typography variant="h4" sx={{ color: colors.fuschia || '#f13544', mb: 2 }}>
                    {stats.coursesInProgress}
                  </Typography>
                  <StyledButton fullWidth component={Link} to="/instructor/courses-in-progress" size="small">
                    Éditer
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <CheckCircleIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Taux d'approbation
                  </Typography>
                  <Typography variant="h4" sx={{ color: colors.fuschia || '#f13544', mb: 2 }}>
                    {stats.approvalRate}%
                  </Typography>
                  <Chip label="Approuvés" size="small" variant="outlined" />
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Typography variant="h6" sx={{ color: colors.white || '#ffffff', mb: 2 }}>
                  Répartition des cours
                </Typography>
                <Box sx={{ height: 300 }}>
                  {stats.coursesByStatus && Object.keys(stats.coursesByStatus).length > 0 ? (
                    <Pie data={pieChartData} options={pieChartOptions} />
                  ) : (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 10 }}>
                      Aucune donnée disponible
                    </Typography>
                  )}
                </Box>
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartCard>
                <Typography variant="h6" sx={{ color: colors.white || '#ffffff', mb: 2 }}>
                  Vos cours récents
                </Typography>
                <Box sx={{ height: 300, overflowY: 'auto' }}>
                  {stats.courses.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: colors.white || '#ffffff' }}>Titre</TableCell>
                            <TableCell sx={{ color: colors.white || '#ffffff' }}>Statut</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.courses.map((course) => (
                            <TableRow key={course._id} sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                              <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                                {course.titre}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={course.statutApprobation}
                                  size="small"
                                  sx={{
                                    bgcolor: course.statutApprobation === 'APPROVED' ? '#4caf50' : '#ff9800',
                                    color: colors.white || '#ffffff',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 10 }}>
                      Aucun cours créé
                    </Typography>
                  )}
                </Box>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, position: 'relative', zIndex: 1 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => fetchData(page)}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}33`,
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: colors.fuschia || '#f13544',
                  },
                }}
              />
            </Box>
          )}

          {/* Quick Actions */}
          <ChartCard sx={{ p: 4, mb: 4, position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ color: colors.white || '#ffffff', mb: 3 }}>
              Actions rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/instructor/courses/create"
                  startIcon={<SchoolIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
                    },
                  }}
                >
                  Créer cours
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/instructor/reports"
                  startIcon={<AssessmentIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
                    },
                  }}
                >
                  Rapports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/instructor/students"
                  startIcon={<PeopleIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
                    },
                  }}
                >
                  Étudiants
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/instructor/settings"
                  startIcon={<SettingsIcon />}
                  sx={{
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}66`,
                    '&:hover': {
                      backgroundColor: `${colors.fuschia || '#f13544'}33`,
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