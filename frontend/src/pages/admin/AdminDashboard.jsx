import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Stack,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Activity,
  Clock,
  BarChart3,
  RefreshCw,
  UserPlus,
  Plus,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const QuickActionCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  borderRadius: '12px',
  padding: theme.spacing(2.5),
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:hover': {
    background: `${colors.red}1a`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
  },
}));

const ActivityItem = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  borderRadius: '12px',
  padding: theme.spacing(2),
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s ease',
  animation: `${slideIn} 0.5s ease-out forwards`,
  '&:hover': {
    borderColor: `${colors.red}66`,
  },
}));

const ChartBar = styled(Box)(({ value, color }) => ({
  height: '100%',
  width: `${value}%`,
  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
  borderRadius: '8px',
  transition: 'width 1s ease-out',
}));

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    completionRate: 0,
    activeUsers: 0,
    totalCertificates: 0,
    averageProgress: 0,
    usersByRole: { ETUDIANT: 0, ENSEIGNANT: 0, ADMIN: 0 },
    monthlyData: Array(6).fill({ month: '', newUsers: 0, completed: 0 }),
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // === FONCTIONS D'AUTHENTIFICATION ===
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : {};
  }, [getAuthToken]);

  // === RÉCUPÉRATION DES DONNÉES DU DASHBOARD ===
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
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

      console.log('📊 Récupération des statistiques admin depuis:', `${API_BASE_URL}/admin/stats/global`);

      // Appel API pour les statistiques globales
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats/global`, { headers });
      
      const data = statsResponse.data || {};
      console.log('✅ Données reçues:', data);

      // Calcul de la progression moyenne
      const averageProgress = data.completionRate || 0;

      // Préparation des données mensuelles (simulées si non fournies par l'API)
      const monthlyData = data.monthlyData || [
        { month: 'Janvier', newUsers: data.totalUsers ? Math.floor(data.totalUsers * 0.1) : 0, completed: data.totalCourses ? Math.floor(data.totalCourses * 0.15) : 0 },
        { month: 'Février', newUsers: data.totalUsers ? Math.floor(data.totalUsers * 0.12) : 0, completed: data.totalCourses ? Math.floor(data.totalCourses * 0.18) : 0 },
        { month: 'Mars', newUsers: data.totalUsers ? Math.floor(data.totalUsers * 0.15) : 0, completed: data.totalCourses ? Math.floor(data.totalCourses * 0.22) : 0 },
        { month: 'Avril', newUsers: data.totalUsers ? Math.floor(data.totalUsers * 0.18) : 0, completed: data.totalCourses ? Math.floor(data.totalCourses * 0.25) : 0 },
        { month: 'Mai', newUsers: data.totalUsers ? Math.floor(data.totalUsers * 0.22) : 0, completed: data.totalCourses ? Math.floor(data.totalCourses * 0.30) : 0 },
        { month: 'Juin', newUsers: data.totalUsers ? Math.floor(data.totalUsers * 0.25) : 0, completed: data.totalCourses ? Math.floor(data.totalCourses * 0.35) : 0 },
      ];

      // Préparation des activités récentes
      const recentActivities = data.recentActivities || [];

      setStats({
        totalUsers: data.totalUsers || 0,
        totalCourses: data.totalCourses || 0,
        completionRate: Math.round(data.completionRate || 0),
        activeUsers: Math.floor((data.totalUsers || 0) * 0.68), // Estimation: 68% des utilisateurs actifs
        totalCertificates: data.totalCertificates || 0,
        averageProgress: Math.round(averageProgress),
        usersByRole: data.usersByRole || { ETUDIANT: 0, ENSEIGNANT: 0, ADMIN: 0 },
        monthlyData: monthlyData,
        recentActivities: recentActivities,
      });

      console.log('✅ Dashboard admin chargé avec succès');

    } catch (err) {
      console.error('❌ Erreur chargement dashboard admin:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Accès non autorisé. Vous devez être administrateur pour accéder à cette page.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Serveur indisponible. Vérifiez si le backend est démarré sur localhost:3001.');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des statistiques';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE_URL, getAuthToken, getAuthHeaders, navigate]);

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const maxUsers = Math.max(...stats.monthlyData.map(d => d.newUsers), 1);
  const maxCompleted = Math.max(...stats.monthlyData.map(d => d.completed), 1);
  const totalRoleUsers = stats.usersByRole.ETUDIANT + stats.usersByRole.ENSEIGNANT + stats.usersByRole.ADMIN;

  // === AFFICHAGE DU CHARGEMENT ===
  if (loading && !refreshing) {
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
          Chargement du tableau de bord...
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            mt: 1,
          }}
        >
          Récupération des statistiques administrateur
        </Typography>
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
      {/* En-tête */}
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
            Dashboard Administrateur
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 500,
            }}
          >
            Gérez votre plateforme d'apprentissage
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label='Admin'
            sx={{
              backgroundColor: `${colors.red}33`,
              color: colors.red,
              fontWeight: 700,
              fontSize: '0.8rem',
              border: `1px solid ${colors.red}`,
            }}
          />
          <Tooltip title='Actualiser les données'>
            <RefreshButton onClick={handleRefresh} disabled={refreshing} size='large'>
              <RefreshCw size={20} />
            </RefreshButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            bgcolor: `${colors.red}15`,
            color: colors.red,
            borderRadius: '12px',
            border: `1px solid ${colors.red}33`,
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

      {/* STATISTIQUES PRINCIPALES */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard color={colors.red}>
            <Users size={36} color={colors.red} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.red,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {stats.totalUsers}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Utilisateurs
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard color={colors.purple}>
            <BookOpen size={36} color={colors.purple} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.purple,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {stats.totalCourses}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Cours
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard color={colors.success}>
            <TrendingUp size={36} color={colors.success} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.success,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {stats.completionRate}%
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Complétion
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard color={colors.info}>
            <Activity size={36} color={colors.info} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.info,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {stats.activeUsers}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Actifs
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <StatCard color={colors.pink}>
            <Award size={36} color={colors.pink} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.pink,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {stats.totalCertificates}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Certificats
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
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
              {stats.averageProgress}%
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Progression
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* ACTIONS RAPIDES */}
      <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        <Grid item xs={12}>
          <DashboardCard>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
              }}
            >
              Actions Rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard onClick={() => handleNavigate('/admin/users/create')}>
                  <UserPlus size={24} color={colors.red} />
                  <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                    Ajouter Utilisateur
                  </Typography>
                </QuickActionCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard onClick={() => handleNavigate('/admin/courses/create')}>
                  <Plus size={24} color={colors.purple} />
                  <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                    Créer Cours
                  </Typography>
                </QuickActionCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard onClick={() => handleNavigate('/admin/reports')}>
                  <FileText size={24} color={colors.info} />
                  <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                    Voir Rapports
                  </Typography>
                </QuickActionCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard onClick={() => handleNavigate('/admin/settings')}>
                  <Settings size={24} color={colors.warning} />
                  <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                    Paramètres
                  </Typography>
                </QuickActionCard>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* GRAPHIQUES */}
      <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        {/* Répartition des utilisateurs */}
        <Grid item xs={12} lg={6}>
          <DashboardCard>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
              }}
            >
              Répartition des Utilisateurs
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Étudiants
                  </Typography>
                  <Typography sx={{ color: colors.red, fontWeight: 700 }}>
                    {stats.usersByRole.ETUDIANT} ({totalRoleUsers > 0 ? Math.round((stats.usersByRole.ETUDIANT / totalRoleUsers) * 100) : 0}%)
                  </Typography>
                </Box>
                <Box sx={{ height: 40, backgroundColor: `${colors.red}20`, borderRadius: '8px', overflow: 'hidden' }}>
                  <ChartBar value={totalRoleUsers > 0 ? (stats.usersByRole.ETUDIANT / totalRoleUsers) * 100 : 0} color={colors.red} />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Enseignants
                  </Typography>
                  <Typography sx={{ color: colors.purple, fontWeight: 700 }}>
                    {stats.usersByRole.ENSEIGNANT} ({totalRoleUsers > 0 ? Math.round((stats.usersByRole.ENSEIGNANT / totalRoleUsers) * 100) : 0}%)
                  </Typography>
                </Box>
                <Box sx={{ height: 40, backgroundColor: `${colors.purple}20`, borderRadius: '8px', overflow: 'hidden' }}>
                  <ChartBar value={totalRoleUsers > 0 ? (stats.usersByRole.ENSEIGNANT / totalRoleUsers) * 100 : 0} color={colors.purple} />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Administrateurs
                  </Typography>
                  <Typography sx={{ color: colors.info, fontWeight: 700 }}>
                    {stats.usersByRole.ADMIN} ({totalRoleUsers > 0 ? Math.round((stats.usersByRole.ADMIN / totalRoleUsers) * 100) : 0}%)
                  </Typography>
                </Box>
                <Box sx={{ height: 40, backgroundColor: `${colors.info}20`, borderRadius: '8px', overflow: 'hidden' }}>
                  <ChartBar value={totalRoleUsers > 0 ? (stats.usersByRole.ADMIN / totalRoleUsers) * 100 : 0} color={colors.info} />
                </Box>
              </Box>
            </Stack>
          </DashboardCard>
        </Grid>

        {/* Activité mensuelle */}
        <Grid item xs={12} lg={6}>
          <DashboardCard>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
              }}
            >
              Activité Mensuelle
            </Typography>
            <Stack spacing={2.5}>
              {stats.monthlyData.map((data, index) => (
                <Box key={index}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', mb: 1, fontWeight: 600 }}>
                    {data.month}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: colors.red, fontSize: '0.75rem', mb: 0.5 }}>
                        Nouveaux: {data.newUsers}
                      </Typography>
                      <Box sx={{ height: 24, backgroundColor: `${colors.red}20`, borderRadius: '6px', overflow: 'hidden' }}>
                        <ChartBar value={(data.newUsers / maxUsers) * 100} color={colors.red} />
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: colors.purple, fontSize: '0.75rem', mb: 0.5 }}>
                        Complétés: {data.completed}
                      </Typography>
                      <Box sx={{ height: 24, backgroundColor: `${colors.purple}20`, borderRadius: '6px', overflow: 'hidden' }}>
                        <ChartBar value={(data.completed / maxCompleted) * 100} color={colors.purple} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* ACTIVITÉS RÉCENTES */}
      {stats.recentActivities.length > 0 && (
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          <Grid item xs={12}>
            <DashboardCard>
              <Typography
                variant='h5'
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.3rem', sm: '1.6rem' },
                }}
              >
                Activités Récentes
              </Typography>
              <Stack spacing={2}>
                {stats.recentActivities.map((activity, index) => (
                  <ActivityItem key={activity.id || index} sx={{ animationDelay: `${index * 0.1}s` }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: activity.status === 'success' 
                              ? `${colors.success}33` 
                              : activity.status === 'warning'
                              ? `${colors.warning}33`
                              : `${colors.red}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {activity.status === 'success' ? (
                            <CheckCircle size={20} color={colors.success} />
                          ) : activity.status === 'warning' ? (
                            <AlertCircle size={20} color={colors.warning} />
                          ) : (
                            <Clock size={20} color={colors.red} />
                          )}
                        </Box>
                        <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                          {activity.description}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem',
                        }}
                      >
                        {new Date(activity.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </ActivityItem>
                ))}
              </Stack>
            </DashboardCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;