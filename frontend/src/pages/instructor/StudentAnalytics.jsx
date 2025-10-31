// src/components/instructor/StudentAnalytics.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  ThemeProvider,
  Paper,
  createTheme,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import { 
  Assessment as AssessmentIcon, 
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

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
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
});

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Composants stylisés
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
      radial-gradient(circle at 20% 50%, ${colors.fuschia || '#f13544'}15 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${colors.lightFuschia || '#ff6b74'}10 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
}));

const ModernStatCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
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
    background: `linear-gradient(90deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 3s ease infinite`,
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px ${colors.fuschia || '#f13544'}20`,
    border: `1px solid ${colors.fuschia || '#f13544'}40`,
  },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
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

const StudentAnalytics = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    averageProgress: 0,
    totalCourses: 0,
    activeStudents: 0,
    studentProgress: [],
    courseDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !user.token || !user.id) {
        console.log('❌ Utilisateur non authentifié ou ID manquant');
        setError('Utilisateur non authentifié');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        console.log('📊 Chargement des analytics pour l\'instructeur:', user.id);
        
        const profileResponse = await axios.get(`${API_URL}/api/instructeurs/${user.id}/profile`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        console.log('✅ Réponse du profil instructeur:', profileResponse.data);

        if (profileResponse.data.success && profileResponse.data.data) {
          const instructorData = profileResponse.data.data;
          const courses = instructorData.coursCrees || [];
          
          console.log('📚 Cours récupérés:', courses.length);

          let totalStudents = 0;
          let totalProgress = 0;
          let studentCount = 0;
          const studentProgress = [];
          const courseDistribution = [];

          courses.forEach(course => {
            const students = course.etudiantsInscrits || [];
            const courseStudents = students.length;
            
            totalStudents += courseStudents;
            
            let courseTotalProgress = 0;
            
            if (students.length > 0 && typeof students[0] === 'object') {
              students.forEach(student => {
                const progress = student.progression || course.progression || 0;
                courseTotalProgress += progress;
                
                studentProgress.push({
                  name: student.prenom ? `${student.prenom} ${student.nom}` : `Étudiant ${student._id || student.id}`,
                  progress: progress,
                  course: course.titre
                });
              });
            } else {
              const avgProgress = course.progression || 50;
              courseTotalProgress += avgProgress * courseStudents;
              
              studentProgress.push({
                name: `Étudiants de ${course.titre}`,
                progress: avgProgress,
                course: course.titre
              });
            }

            const avgCourseProgress = courseStudents > 0 ? (courseTotalProgress / courseStudents) : 0;
            totalProgress += avgCourseProgress;
            studentCount += courseStudents;

            courseDistribution.push({
              course: course.titre,
              students: courseStudents,
              progress: Math.round(avgCourseProgress)
            });
          });

          const averageProgress = courses.length > 0 ? (totalProgress / courses.length) : 0;

          setAnalytics({
            totalStudents,
            averageProgress: Math.round(averageProgress),
            totalCourses: courses.length,
            activeStudents: studentProgress.filter(s => s.progress > 0).length,
            studentProgress: studentProgress.slice(0, 10),
            courseDistribution: courseDistribution.slice(0, 6)
          });

          console.log('✅ Analytics calculés:', {
            totalStudents,
            averageProgress,
            totalCourses: courses.length,
            studentProgress: studentProgress.length
          });

        } else {
          throw new Error('Données du profil instructeur non disponibles');
        }

      } catch (err) {
        console.error('❌ Erreur lors de la récupération des analytics:', err);
        
        if (err.response) {
          console.log('📡 Statut HTTP:', err.response.status);
          console.log('📡 Données erreur:', err.response.data);
          
          if (err.response.status === 404) {
            setError('Endpoint non trouvé. Vérifiez la configuration des routes API.');
          } else if (err.response.status === 401) {
            setError('Session expirée. Veuillez vous reconnecter.');
          } else if (err.response.status === 403) {
            setError('Accès non autorisé. Seuls les instructeurs peuvent accéder à cette page.');
          } else {
            setError(err.response.data?.message || `Erreur serveur (${err.response.status})`);
          }
        } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 3001.');
        } else if (err.code === 'ERR_NETWORK') {
          setError('Erreur réseau. Vérifiez votre connexion internet.');
        } else if (err.code === 'ECONNABORTED') {
          setError('Timeout de la requête. Le serveur met trop de temps à répondre.');
        } else {
          setError(err.message || 'Erreur lors de la récupération des analytics. Veuillez réessayer.');
        }

        setAnalytics({
          totalStudents: 0,
          averageProgress: 0,
          totalCourses: 0,
          activeStudents: 0,
          studentProgress: [],
          courseDistribution: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && (user.role === 'ENSEIGNANT' || user.role === 'ADMIN')) {
      fetchAnalytics();
    } else if (user && user.role !== 'ENSEIGNANT') {
      setError('Accès réservé aux instructeurs.');
      setIsLoading(false);
    }
  }, [user, API_URL]);

  // Configuration des graphiques
  const barChartData = {
    labels: analytics.studentProgress.map(item => item.name),
    datasets: [
      {
        label: 'Progrès (%)',
        data: analytics.studentProgress.map(item => item.progress),
        backgroundColor: `${colors.fuschia || '#f13544'}dd`,
        borderColor: colors.fuschia || '#f13544',
        borderWidth: 2,
        borderRadius: 12,
        hoverBackgroundColor: colors.lightFuschia || '#ff6b74',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return `Progrès: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        ticks: { 
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 12 },
          callback: function(value) {
            return value + '%';
          }
        }, 
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          lineWidth: 1,
        },
        border: { display: false },
      },
      x: { 
        ticks: { 
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 45
        }, 
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const doughnutData = {
    labels: analytics.courseDistribution.map(item => item.course),
    datasets: [
      {
        data: analytics.courseDistribution.map(item => item.students),
        backgroundColor: [
          `${colors.fuschia || '#f13544'}dd`,
          `${colors.lightFuschia || '#ff6b74'}dd`,
          '#10b981dd',
          '#f59e0bdd',
          '#8b5cf6dd',
          '#ec4899dd'
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 12, weight: '500' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value} étudiant(s)`;
          }
        }
      }
    },
  };

  if (authLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        width: '100vw', 
        background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${colors.lightNavy || '#1a237e'})`,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        gap: 3,
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ color: colors.white || '#ffffff', fontSize: '1.1rem', fontWeight: 500 }}>
          Chargement de l'authentification...
        </Typography>
      </Box>
    );
  }

  if (!user || (user.role !== 'ENSEIGNANT' && user.role !== 'ADMIN')) {
    return (
      <ThemeProvider theme={instructorTheme}>
        <DashboardContainer>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '50vh',
              flexDirection: 'column',
              textAlign: 'center',
              gap: 3,
            }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
                  boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}40`,
                }}
              >
                <AssessmentIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: colors.white || '#ffffff', mb: 2, fontWeight: 700 }}>
                  Accès Non Autorisé
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Cette page est réservée aux instructeurs et administrateurs.
                </Typography>
              </Box>
            </Box>
          </Container>
        </DashboardContainer>
      </ThemeProvider>
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
            background: `radial-gradient(circle, ${colors.fuschia || '#f13544'}15, transparent 70%)`,
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
            background: `radial-gradient(circle, ${colors.lightFuschia || '#ff6b74'}10, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(100px)',
            animation: `${float} 12s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
        
        <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
          {/* En-tête moderne */}
          <Box sx={{ mb: 6, animation: `${scaleIn} 0.5s ease-out` }}>
            <Stack direction='row' spacing={3} alignItems='center' flexWrap='wrap'>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
                  boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}40`,
                }}
              >
                <AssessmentIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: colors.white || '#ffffff',
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                    mb: 1,
                    fontWeight: 700,
                  }}
                >
                  Analytics Étudiants
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.1rem',
                    fontWeight: 400,
                  }}
                >
                  Statistiques de performance et engagement de vos étudiants
                </Typography>
              </Box>
              <Chip
                label='Tableau de bord'
                icon={<ChartIcon />}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.fuschia || '#f13544'}40`,
                  color: colors.white || '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  height: '42px',
                  px: 2,
                  '& .MuiChip-icon': { color: colors.fuschia || '#f13544' },
                }}
              />
            </Stack>
          </Box>

          {/* Message d'erreur */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(10px)',
                color: colors.white || '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '& .MuiAlert-icon': { color: '#ef4444' }
              }}
              onClose={() => setError('')}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Erreur
              </Typography>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '400px',
              flexDirection: 'column',
              gap: 3,
            }}>
              <CircularProgress size={60} thickness={4} sx={{ color: colors.fuschia || '#f13544' }} />
              <Typography sx={{ color: colors.white || '#ffffff', fontSize: '1.1rem', fontWeight: 500 }}>
                Chargement des analytics...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Cartes de statistiques */}
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <ModernStatCard sx={{ animationDelay: '0.1s' }}>
                    <Stack spacing={2}>
                      <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '16px',
                            background: `${colors.fuschia || '#f13544'}20`,
                          }}
                        >
                          <PeopleIcon sx={{ fontSize: 32, color: colors.fuschia || '#f13544' }} />
                        </Box>
                        <Chip
                          label='Total'
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
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 0.5 }}>
                          Étudiants Totaux
                        </Typography>
                        <Typography variant='h3' sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
                          {analytics.totalStudents}
                        </Typography>
                      </Box>
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
                            background: `${colors.fuschia || '#f13544'}20`,
                          }}
                        >
                          <TrendingUpIcon sx={{ fontSize: 32, color: colors.fuschia || '#f13544' }} />
                        </Box>
                        <Chip
                          label={analytics.averageProgress >= 70 ? 'Excellent' : analytics.averageProgress >= 50 ? 'Bon' : 'Moyen'}
                          size='small'
                          sx={{
                            background: analytics.averageProgress >= 70 ? 'rgba(16, 185, 129, 0.2)' : analytics.averageProgress >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: analytics.averageProgress >= 70 ? '#10b981' : analytics.averageProgress >= 50 ? '#f59e0b' : '#ef4444',
                            fontWeight: 600,
                            border: analytics.averageProgress >= 70 ? '1px solid rgba(16, 185, 129, 0.3)' : analytics.averageProgress >= 50 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        />
                      </Stack>
                      <Box>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 0.5 }}>
                          Progrès Moyen
                        </Typography>
                        <Typography variant='h3' sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
                          {analytics.averageProgress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={analytics.averageProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
                            borderRadius: 4,
                          },
                        }}
                      />
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
                            background: `${colors.fuschia || '#f13544'}20`,
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 32, color: colors.fuschia || '#f13544' }} />
                        </Box>
                        <Chip
                          label='Actifs'
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
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 0.5 }}>
                          Cours Actifs
                        </Typography>
                        <Typography variant='h3' sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
                          {analytics.totalCourses}
                        </Typography>
                      </Box>
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
                            background: `${colors.fuschia || '#f13544'}20`,
                          }}
                        >
                          <AssessmentIcon sx={{ fontSize: 32, color: colors.fuschia || '#f13544' }} />
                        </Box>
                        <Chip
                          label='Engagés'
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
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 0.5 }}>
                          Étudiants Actifs
                        </Typography>
                        <Typography variant='h3' sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
                          {analytics.activeStudents}
                        </Typography>
                      </Box>
                    </Stack>
                  </ModernStatCard>
                </Grid>
              </Grid>

              {/* Section graphiques */}
              <Grid container spacing={4}>
                {/* Graphique de progression */}
                <Grid item xs={12} lg={8}>
                  <GlassCard sx={{ height: '100%' }}>
                    <Typography
                      variant='h5'
                      sx={{
                        color: colors.white || '#ffffff',
                        mb: 3,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <TrendingUpIcon sx={{ color: colors.fuschia || '#f13544' }} />
                      Progrès des Étudiants
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      {analytics.studentProgress.length > 0 ? (
                        <Bar data={barChartData} options={barChartOptions} />
                      ) : (
                        <Box
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 100,
                              height: 100,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '2px dashed rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            <TrendingUpIcon sx={{ fontSize: 50, color: 'rgba(255, 255, 255, 0.3)' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                              Aucune donnée de progression
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              Les données de progression des étudiants apparaîtront ici.
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </GlassCard>
                </Grid>

                {/* Graphique de distribution */}
                <Grid item xs={12} lg={4}>
                  <GlassCard sx={{ height: '100%' }}>
                    <Typography
                      variant='h5'
                      sx={{
                        color: colors.white || '#ffffff',
                        mb: 3,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <SchoolIcon sx={{ color: colors.fuschia || '#f13544' }} />
                      Distribution par Cours
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      {analytics.courseDistribution.length > 0 ? (
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                      ) : (
                        <Box
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 100,
                              height: 100,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '2px dashed rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            <SchoolIcon sx={{ fontSize: 50, color: 'rgba(255, 255, 255, 0.3)' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                              Aucun cours avec étudiants
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              La répartition par cours s'affichera ici.
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </GlassCard>
                </Grid>
              </Grid>

              {/* Détails des cours */}
              {analytics.courseDistribution.length > 0 && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <GlassCard>
                      <Typography
                        variant='h5'
                        sx={{
                          color: colors.white || '#ffffff',
                          mb: 4,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <AssessmentIcon sx={{ color: colors.fuschia || '#f13544' }} />
                        Détails par Cours
                      </Typography>
                      <Grid container spacing={3}>
                        {analytics.courseDistribution.map((course, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease',
                                animation: `${fadeInUp} ${0.5 + index * 0.1}s ease-out`,
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}20`,
                                },
                              }}
                            >
                              <Stack spacing={2}>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                  <Avatar
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      background: `${colors.fuschia || '#f13544'}20`,
                                      color: colors.fuschia || '#f13544',
                                    }}
                                  >
                                    <SchoolIcon />
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        color: colors.white || '#ffffff',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {course.course}
                                    </Typography>
                                  </Box>
                                </Stack>
                                
                                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                  <Box>
                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                                      Étudiants
                                    </Typography>
                                    <Typography sx={{ color: colors.white || '#ffffff', fontWeight: 700, fontSize: '1.5rem' }}>
                                      {course.students}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                                      Progrès moyen
                                    </Typography>
                                    <Typography sx={{ color: colors.fuschia || '#f13544', fontWeight: 700, fontSize: '1.5rem' }}>
                                      {course.progress}%
                                    </Typography>
                                  </Box>
                                </Stack>

                                <LinearProgress
                                  variant='determinate'
                                  value={course.progress}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      background: `linear-gradient(90deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
                                      borderRadius: 4,
                                    },
                                  }}
                                />

                                <Chip
                                  label={
                                    course.progress >= 80 ? 'Excellent engagement' :
                                    course.progress >= 60 ? 'Bon engagement' :
                                    course.progress >= 40 ? 'Engagement moyen' :
                                    'Engagement faible'
                                  }
                                  size='small'
                                  sx={{
                                    background: 
                                      course.progress >= 80 ? 'rgba(16, 185, 129, 0.2)' :
                                      course.progress >= 60 ? 'rgba(245, 158, 11, 0.2)' :
                                      course.progress >= 40 ? 'rgba(59, 130, 246, 0.2)' :
                                      'rgba(239, 68, 68, 0.2)',
                                    color: 
                                      course.progress >= 80 ? '#10b981' :
                                      course.progress >= 60 ? '#f59e0b' :
                                      course.progress >= 40 ? '#3b82f6' :
                                      '#ef4444',
                                    fontWeight: 600,
                                    border: 
                                      course.progress >= 80 ? '1px solid rgba(16, 185, 129, 0.3)' :
                                      course.progress >= 60 ? '1px solid rgba(245, 158, 11, 0.3)' :
                                      course.progress >= 40 ? '1px solid rgba(59, 130, 246, 0.3)' :
                                      '1px solid rgba(239, 68, 68, 0.3)',
                                  }}
                                />
                              </Stack>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </GlassCard>
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default StudentAnalytics;