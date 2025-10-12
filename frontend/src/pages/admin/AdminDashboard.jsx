import React, { useState, useEffect, useContext } from 'react';
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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Pie, Bar } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
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

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Custom theme
const adminTheme = createTheme({
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
    h6: { fontWeight: 500 },
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
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
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
  '&:disabled': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}80, ${colors.lightFuschia || '#ff6b74'}80)`,
    cursor: 'not-allowed',
  },
}));

const IconWrapper = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}33, ${colors.lightFuschia || '#ff6b74'}33)`,
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': { fontSize: '2rem', color: colors.fuschia || '#f13544' },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  color: colors.white || '#ffffff',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}33, ${colors.lightFuschia || '#ff6b74'}33)`,
    borderColor: `${colors.fuschia || '#f13544'}66`,
    transform: 'translateY(-2px)',
  },
}));

const AdminDashboard = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    completionRate: 0,
    usersByRole: { ETUDIANT: 0, ENSEIGNANT: 0, ADMIN: 0 },
    recentActivities: [],
    coursesData: Array(6).fill({ newUsers: 0, completed: 0 }),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // Admin access check
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      setError('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
  }, [user, authLoading, navigate]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.token) {
        setError('Utilisateur non authentifié. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        console.log('Fetching stats from:', `${API_BASE_URL}/api/admin/stats/global`);
        const response = await axios.get(`${API_BASE_URL}/api/admin/stats/global`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = response.data || {};
        setStats({
          totalUsers: data.totalUsers || 0,
          totalCourses: data.totalCourses || 0,
          completionRate: data.completionRate || 0,
          usersByRole: data.usersByRole || { ETUDIANT: 0, ENSEIGNANT: 0, ADMIN: 0 },
          recentActivities: data.recentActivities || [],
          coursesData: data.coursesData || Array(6).fill({ newUsers: 0, completed: 0 }),
        });
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        const errorMessage =
          err.response?.data?.message || err.code === 'ERR_NETWORK'
            ? 'Serveur indisponible. Vérifiez si le backend est démarré sur localhost:3001.'
            : 'Erreur lors de la récupération des statistiques.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') fetchStats();
  }, [user, API_BASE_URL]);

  // Pie Chart Data
  const pieChartData = {
    labels:
      Object.keys(stats.usersByRole).length > 0
        ? Object.keys(stats.usersByRole)
        : ['Étudiants', 'Enseignants', 'Admins'],
    datasets: [
      {
        data:
          Object.keys(stats.usersByRole).length > 0 ? Object.values(stats.usersByRole) : [0, 0, 0],
        backgroundColor: [
          colors.fuschia || '#f13544',
          colors.lightFuschia || '#ff6b74',
          colors.navy || '#010b40',
          colors.lightNavy || '#1a237e',
          '#4A90E2',
          '#7B68EE',
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
        labels: { color: colors.white || '#ffffff', font: { size: 12 } },
      },
      title: {
        display: true,
        text: 'Répartition des utilisateurs par rôle',
        color: colors.white || '#ffffff',
        font: { size: 16, weight: 'bold' },
      },
    },
  };

  // Bar Chart Data
  const barChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: stats.coursesData.map((d) => d.newUsers || 0),
        backgroundColor: `${colors.fuschia || '#f13544'}cc`,
        borderColor: colors.fuschia || '#f13544',
        borderWidth: 2,
      },
      {
        label: 'Cours complétés',
        data: stats.coursesData.map((d) => d.completed || 0),
        backgroundColor: `${colors.lightFuschia || '#ff6b74'}cc`,
        borderColor: colors.lightFuschia || '#ff6b74',
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: colors.white || '#ffffff', font: { size: 12 } } },
      title: {
        display: true,
        text: 'Activité mensuelle',
        color: colors.white || '#ffffff',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: colors.white || '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: colors.white || '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Alert severity='error' sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <DashboardContainer>
        {/* Background Decorations */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${colors.fuschia || '#f13544'}0a 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.05,
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
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 100,
            left: 50,
            width: 80,
            height: 80,
            background: `linear-gradient(135deg, ${colors.lightFuschia || '#ff6b74'}, ${colors.fuschia || '#f13544'})`,
            borderRadius: '50%',
            opacity: 0.1,
            animation: `${floatingAnimation} 5s ease-in-out infinite`,
          }}
        />

        <Container maxWidth={false} disableGutters>
          {/* Header */}
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <DashboardIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Box>
              <Typography
                variant='h3'
                sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}
              >
                Tableau de Bord Administrateur
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Bienvenue {user?.nom || 'Administrateur'}
              </Typography>
            </Box>
            <Chip
              label='Admin'
              sx={{
                bgcolor: `${colors.fuschia || '#f13544'}33`,
                color: colors.white || '#ffffff',
                border: `1px solid ${colors.fuschia || '#f13544'}`,
              }}
            />
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ p: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <IconWrapper>
                    <PeopleIcon />
                  </IconWrapper>
                  <Typography sx={{ color: colors.white || '#ffffff' }}>Utilisateurs</Typography>
                  <Typography variant='h4' sx={{ color: colors.fuschia || '#f13544', mt: 1 }}>
                    {stats.totalUsers}
                  </Typography>
                  <StyledButton component={Link} to='/admin/users' sx={{ mt: 2 }}>
                    Gérer
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <IconWrapper>
                    <SchoolIcon />
                  </IconWrapper>
                  <Typography sx={{ color: colors.white || '#ffffff' }}>Cours</Typography>
                  <Typography variant='h4' sx={{ color: colors.fuschia || '#f13544', mt: 1 }}>
                    {stats.totalCourses}
                  </Typography>
                  <StyledButton component={Link} to='/admin/courses' sx={{ mt: 2 }}>
                    Gérer
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <IconWrapper>
                    <TrendingUpIcon />
                  </IconWrapper>
                  <Typography sx={{ color: colors.white || '#ffffff' }}>
                    Taux de complétion
                  </Typography>
                  <Typography variant='h4' sx={{ color: colors.fuschia || '#f13544', mt: 1 }}>
                    {stats.completionRate}%
                  </Typography>
                  <StyledButton component={Link} to='/admin/reports' sx={{ mt: 2 }}>
                    Rapports
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ p: 4 }}>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Box sx={{ height: 300 }}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </Box>
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Box sx={{ height: 300 }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </Box>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <ChartCard sx={{ p: 4, mb: 4 }}>
            <Typography variant='h5' sx={{ color: colors.white || '#ffffff', mb: 3 }}>
              Actions rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  component={Link}
                  to='/admin/users/create'
                  startIcon={<PeopleIcon />}
                >
                  Ajouter utilisateur
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  component={Link}
                  to='/admin/courses/create'
                  startIcon={<SchoolIcon />}
                >
                  Créer cours
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  component={Link}
                  to='/admin/reports'
                  startIcon={<AssessmentIcon />}
                >
                  Rapports
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  component={Link}
                  to='/admin/settings'
                  startIcon={<SettingsIcon />}
                >
                  Paramètres
                </QuickActionButton>
              </Grid>
            </Grid>
          </ChartCard>

          {/* Recent Activities */}
          {stats.recentActivities.length > 0 && (
            <ChartCard sx={{ p: 4 }}>
              <Typography variant='h5' sx={{ color: colors.white || '#ffffff', mb: 3 }}>
                Activités récentes
              </Typography>
              <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
              {stats.recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    py: 2,
                    borderBottom:
                      index < stats.recentActivities.length - 1
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : 'none',
                  }}
                >
                  <Typography sx={{ color: colors.white || '#ffffff' }}>
                    {activity.description}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {new Date(activity.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </ChartCard>
          )}
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default AdminDashboard;
