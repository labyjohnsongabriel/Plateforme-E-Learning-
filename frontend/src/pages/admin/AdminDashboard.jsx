// src/components/admin/AdminDashboard.jsx
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

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Création du thème personnalisé
const adminTheme = createTheme({
  palette: {
    primary: {
      main: colors.fuschia || '#f13544',
      light: colors.lightFuschia || '#ff6b74',
    },
    secondary: {
      main: colors.navy || '#010b40',
      light: colors.lightNavy || '#1a237e',
    },
    background: {
      default: colors.navy || '#010b40',
      paper: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
    },
    text: {
      primary: colors.white || '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
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

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${colors.lightNavy || '#1a237e'})`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}cc, ${colors.lightNavy || '#1a237e'}cc)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}4d`,
    border: `1px solid ${colors.fuschia || '#f13544'}66`,
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
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  animation: `${fadeIn} 0.8s ease-out`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
  borderRadius: '12px',
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: `0 4px 16px ${colors.fuschia || '#f13544'}4d`,
  color: colors.white || '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}cc, ${colors.lightFuschia || '#ff6b74'}cc)`,
    boxShadow: `0 6px 20px ${colors.fuschia || '#f13544'}66`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}80, ${colors.lightFuschia || '#ff6b74'}80)`,
    cursor: 'not-allowed',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    fontSize: '0.9rem',
  },
}));

const IconWrapper = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}33, ${colors.lightFuschia || '#ff6b74'}33)`,
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
    color: colors.fuschia || '#f13544',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '12px',
  padding: theme.spacing(2),
  color: colors.white || '#ffffff',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}33, ${colors.lightFuschia || '#ff6b74'}33)`,
    border: `1px solid ${colors.fuschia || '#f13544'}66`,
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
    usersByRole: {},
    recentActivities: [],
    coursesData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Vérification des droits admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      setError('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [user, authLoading, navigate]);

  // Chargement des statistiques
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats/global`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(
          response.data || {
            totalUsers: 0,
            totalCourses: 0,
            completionRate: 0,
            usersByRole: {},
            recentActivities: [],
            coursesData: [],
          }
        );
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques');
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') {
      fetchStats();
    }
  }, [user]);

  // Données pour le graphique en camembert (Pie Chart)
  const pieChartData = {
    labels: Object.keys(stats.usersByRole || {}),
    datasets: [
      {
        data: Object.values(stats.usersByRole || {}),
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
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Répartition des utilisateurs par rôle',
        color: colors.white || '#ffffff',
        font: { size: 18, weight: 'bold' },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: colors.navy || '#010b40',
        titleColor: colors.white || '#ffffff',
        bodyColor: colors.white || '#ffffff',
        borderColor: colors.fuschia || '#f13544',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
  };

  // Données pour le graphique en barres (Bar Chart) - Exemple avec des cours
  const barChartData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: `${colors.fuschia || '#f13544'}cc`,
        borderColor: colors.fuschia || '#f13544',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Cours complétés',
        data: [8, 14, 12, 18, 16, 24],
        backgroundColor: `${colors.lightFuschia || '#ff6b74'}cc`,
        borderColor: colors.lightFuschia || '#ff6b74',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.white || '#ffffff',
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Activité mensuelle',
        color: colors.white || '#ffffff',
        font: { size: 18, weight: 'bold' },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: colors.navy || '#010b40',
        titleColor: colors.white || '#ffffff',
        bodyColor: colors.white || '#ffffff',
        borderColor: colors.fuschia || '#f13544',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: colors.white || '#ffffff',
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: colors.white || '#ffffff',
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} size={48} />
          <Typography variant='h5' sx={{ color: colors.white || '#ffffff', fontWeight: 500 }}>
            Chargement du tableau de bord...
          </Typography>
        </Box>
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
            backgroundImage: `
              linear-gradient(${colors.fuschia || '#f13544'}1a 1px, transparent 1px),
              linear-gradient(90deg, ${colors.fuschia || '#f13544'}1a 1px, transparent 1px)
            `,
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

        <Container maxWidth='xl'>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <DashboardIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 700,
                  color: colors.white || '#ffffff',
                  mb: 0.5,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                }}
              >
                Tableau de Bord Administrateur
              </Typography>
              <Typography
                variant='body1'
                sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.875rem', md: '1rem' } }}
              >
                Bienvenue {user?.nom || 'Administrateur'} - Vue d'ensemble du système
              </Typography>
            </Box>
            <Chip
              label='Administrateur'
              sx={{
                bgcolor: `${colors.fuschia || '#f13544'}33`,
                color: colors.white || '#ffffff',
                fontWeight: 600,
                border: `1px solid ${colors.fuschia || '#f13544'}`,
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            />
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Statistiques principales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <IconWrapper>
                    <PeopleIcon />
                  </IconWrapper>
                  <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Utilisateurs inscrits
                  </Typography>
                  <Typography
                    variant='h3'
                    sx={{ color: colors.fuschia || '#f13544', fontWeight: 700, mb: 2 }}
                  >
                    {stats.totalUsers || 0}
                  </Typography>
                  <StyledButton
                    component={Link}
                    to='/admin/users'
                    fullWidth
                    aria-label='Gérer les utilisateurs'
                  >
                    Gérer les utilisateurs
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
                  <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Cours disponibles
                  </Typography>
                  <Typography
                    variant='h3'
                    sx={{ color: colors.fuschia || '#f13544', fontWeight: 700, mb: 2 }}
                  >
                    {stats.totalCourses || 0}
                  </Typography>
                  <StyledButton
                    component={Link}
                    to='/admin/courses'
                    fullWidth
                    aria-label='Gérer les cours'
                  >
                    Gérer les cours
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
                  <Typography variant='h6' sx={{ color: colors.white || '#ffffff', mb: 1 }}>
                    Taux de complétion moyen
                  </Typography>
                  <Typography
                    variant='h3'
                    sx={{ color: colors.fuschia || '#f13544', fontWeight: 700, mb: 2 }}
                  >
                    {(stats.completionRate || 0).toFixed(1)}%
                  </Typography>
                  <StyledButton
                    component={Link}
                    to='/admin/reports'
                    fullWidth
                    aria-label='Voir les rapports'
                  >
                    Voir les rapports
                  </StyledButton>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Actions rapides */}
          <ChartCard sx={{ mb: 4 }}>
            <Typography
              variant='h5'
              sx={{ color: colors.white || '#ffffff', fontWeight: 600, mb: 3 }}
            >
              Actions rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  component={Link}
                  to='/admin/users/create'
                  startIcon={<PeopleIcon />}
                >
                  Ajouter un utilisateur
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  component={Link}
                  to='/admin/courses/create'
                  startIcon={<SchoolIcon />}
                >
                  Créer un cours
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  component={Link}
                  to='/admin/reports'
                  startIcon={<AssessmentIcon />}
                >
                  Générer un rapport
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  component={Link}
                  to='/admin/settings'
                  startIcon={<SettingsIcon />}
                >
                  Paramètres
                </QuickActionButton>
              </Grid>
            </Grid>
          </ChartCard>

          {/* Graphiques */}
          <Grid container spacing={3}>
            {/* Graphique en camembert */}
            {stats.usersByRole && Object.keys(stats.usersByRole).length > 0 && (
              <Grid item xs={12} md={6}>
                <ChartCard>
                  <Box sx={{ height: 400 }}>
                    <Pie data={pieChartData} options={pieChartOptions} />
                  </Box>
                </ChartCard>
              </Grid>
            )}

            {/* Graphique en barres */}
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Box sx={{ height: 400 }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </Box>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Activités récentes */}
          {stats.recentActivities && stats.recentActivities.length > 0 && (
            <ChartCard sx={{ mt: 4 }}>
              <Typography
                variant='h5'
                sx={{ color: colors.white || '#ffffff', fontWeight: 600, mb: 3 }}
              >
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
                  <Typography variant='body1' sx={{ color: colors.white || '#ffffff' }}>
                    {activity.description}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {activity.date}
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
