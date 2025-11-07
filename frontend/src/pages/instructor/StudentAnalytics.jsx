// src/components/instructor/StudentAnalytics.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  LinearProgress,
  Fade,
  Button,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Award, 
  BarChart3,
  Activity,
  Target,
  Zap,
  RefreshCw,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

// === ANIMATIONS PROFESSIONNELLES ===
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(241, 53, 68, 0.3); }
  50% { box-shadow: 0 0 30px rgba(241, 53, 68, 0.6); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// === COULEURS PROFESSIONNELLES ===
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

// === COMPOSANTS STYLISÉS ===
const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  padding: theme.spacing(3.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink}, ${colors.purple})`,
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 3s ease infinite`,
  },
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
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
    animation: `${shimmer} 3s infinite`,
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
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
}));

const StudentAnalytics = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    averageProgress: 0,
    totalCourses: 0,
    activeStudents: 0,
    studentProgress: [],
    courseDistribution: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchAnalytics = async (isRefresh = false) => {
    if (!user || !user.token || !user.id) {
      setError('Utilisateur non authentifié');
      setIsLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');

    try {
      const profileResponse = await axios.get(`${API_URL}/api/instructeurs/${user.id}/profile`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (profileResponse.data.success && profileResponse.data.data) {
        const instructorData = profileResponse.data.data;
        const courses = instructorData.coursCrees || [];

        let totalStudents = 0;
        let totalProgress = 0;
        const studentProgress = [];
        const courseDistribution = [];

        courses.forEach((course) => {
          const students = course.etudiantsInscrits || [];
          const courseStudents = students.length;
          totalStudents += courseStudents;

          let courseTotalProgress = 0;

          if (students.length > 0 && typeof students[0] === 'object') {
            students.forEach((student) => {
              const progress = student.progression || course.progression || 0;
              courseTotalProgress += progress;

              studentProgress.push({
                name: student.prenom
                  ? `${student.prenom} ${student.nom}`
                  : `Étudiant ${student._id || student.id}`,
                progress: progress,
                course: course.titre,
              });
            });
          } else {
            const avgProgress = course.progression || 50;
            courseTotalProgress += avgProgress * courseStudents;

            studentProgress.push({
              name: `Étudiants de ${course.titre}`,
              progress: avgProgress,
              course: course.titre,
            });
          }

          const avgCourseProgress = courseStudents > 0 ? courseTotalProgress / courseStudents : 0;
          totalProgress += avgCourseProgress;

          courseDistribution.push({
            course: course.titre,
            students: courseStudents,
            progress: Math.round(avgCourseProgress),
          });
        });

        const averageProgress = courses.length > 0 ? totalProgress / courses.length : 0;

        setAnalytics({
          totalStudents,
          averageProgress: Math.round(averageProgress),
          totalCourses: courses.length,
          activeStudents: studentProgress.filter((s) => s.progress > 0).length,
          studentProgress: studentProgress.slice(0, 10),
          courseDistribution: courseDistribution.slice(0, 6),
        });
      } else {
        throw new Error('Données du profil instructeur non disponibles');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des analytics:', err);
      if (err.response?.status === 404) {
        setError('Endpoint non trouvé. Vérifiez la configuration des routes API.');
      } else if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError(
          err.response?.data?.message ||
            'Erreur lors de la récupération des analytics. Veuillez réessayer.'
        );
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ENSEIGNANT' || user.role === 'ADMIN')) {
      fetchAnalytics();
    } else if (user && user.role !== 'ENSEIGNANT') {
      setError('Accès réservé aux instructeurs.');
      setIsLoading(false);
    }
  }, [user, API_URL]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // === CONFIGURATION GRAPHIQUES PROFESSIONNELS ===
  
  // Graphique en barres avec dégradé
  const barChartData = {
    labels: analytics.studentProgress.map((item) => item.name),
    datasets: [
      {
        label: 'Progression (%)',
        data: analytics.studentProgress.map((item) => item.progress),
        backgroundColor: analytics.studentProgress.map((_, i) => {
          const gradient = `rgba(241, 53, 68, ${0.8 - i * 0.05})`;
          return gradient;
        }),
        borderColor: colors.red,
        borderWidth: 2,
        borderRadius: 12,
        hoverBackgroundColor: colors.pink,
        hoverBorderWidth: 3,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 13, weight: '600' },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        cornerRadius: 12,
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        borderColor: colors.red,
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `Progression: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 12, weight: '500' },
          callback: function (value) {
            return value + '%';
          },
          stepSize: 20,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
          lineWidth: 1,
          drawBorder: false,
        },
        border: { display: false },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11, weight: '500' },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { display: false },
        border: { display: false },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  // Graphique Doughnut moderne
  const doughnutData = {
    labels: analytics.courseDistribution.map((item) => item.course),
    datasets: [
      {
        data: analytics.courseDistribution.map((item) => item.students),
        backgroundColor: [
          `${colors.red}dd`,
          `${colors.pink}dd`,
          `${colors.purple}dd`,
          `${colors.success}dd`,
          `${colors.warning}dd`,
          `${colors.info}dd`,
        ],
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 3,
        hoverOffset: 20,
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 13, weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        cornerRadius: 12,
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        borderColor: colors.red,
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} étudiants (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  // Graphique Line pour tendances
  const lineChartData = {
    labels: analytics.courseDistribution.map((item) => item.course.substring(0, 15)),
    datasets: [
      {
        label: 'Progression moyenne (%)',
        data: analytics.courseDistribution.map((item) => item.progress),
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, `${colors.red}60`);
          gradient.addColorStop(1, `${colors.red}05`);
          return gradient;
        },
        borderColor: colors.red,
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: colors.pink,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: colors.red,
        pointHoverBorderWidth: 4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 13, weight: '600' },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        cornerRadius: 12,
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        borderColor: colors.red,
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `Progression: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 12, weight: '500' },
          callback: function (value) {
            return value + '%';
          },
          stepSize: 25,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
          lineWidth: 1,
          drawBorder: false,
        },
        border: { display: false },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11, weight: '500' },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { display: false },
        border: { display: false },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  if (authLoading || isLoading) {
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
          sx={{ color: colors.red, animation: `${pulseGlow} 2s infinite` }}
        />
        <Typography sx={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 600, mt: 3 }}>
          Chargement des analytics...
        </Typography>
      </Box>
    );
  }

  if (!user || (user.role !== 'ENSEIGNANT' && user.role !== 'ADMIN')) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Alert
          severity="error"
          sx={{
            maxWidth: 500,
            background: `${colors.red}15`,
            color: colors.red,
            borderRadius: '12px',
            border: `1px solid ${colors.red}33`,
          }}
        >
          Accès réservé aux instructeurs et administrateurs.
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
      {/* En-tête */}
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
              variant="h3"
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
              Analytics Étudiants
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 500,
              }}
            >
              Statistiques de performance et engagement de vos étudiants
            </Typography>
          </Box>
          <Tooltip title="Actualiser les données">
            <ActionButton
              onClick={handleRefresh}
              disabled={refreshing}
              startIcon={<RefreshCw size={18} />}
            >
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </ActionButton>
          </Tooltip>
        </Box>
      </Fade>

      {/* Alertes */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            bgcolor: `${colors.red}15`,
            color: colors.red,
            borderRadius: '12px',
            border: `1px solid ${colors.red}33`,
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        <Grid item xs={6} sm={3}>
          <StatCard color={colors.red}>
            <Users size={36} color={colors.red} style={{ marginBottom: '16px' }} />
            <Typography sx={{ color: colors.red, fontWeight: 800, fontSize: '2.2rem', mb: 0.5 }}>
              {analytics.totalStudents}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
              Étudiants Totaux
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard color={colors.purple}>
            <TrendingUp size={36} color={colors.purple} style={{ marginBottom: '16px' }} />
            <Typography sx={{ color: colors.purple, fontWeight: 800, fontSize: '2.2rem', mb: 0.5 }}>
              {analytics.averageProgress}%
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
              Progrès Moyen
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard color={colors.success}>
            <BookOpen size={36} color={colors.success} style={{ marginBottom: '16px' }} />
            <Typography sx={{ color: colors.success, fontWeight: 800, fontSize: '2.2rem', mb: 0.5 }}>
              {analytics.totalCourses}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
              Cours Actifs
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard color={colors.info}>
            <Award size={36} color={colors.info} style={{ marginBottom: '16px' }} />
            <Typography sx={{ color: colors.info, fontWeight: 800, fontSize: '2.2rem', mb: 0.5 }}>
              {analytics.activeStudents}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
              Étudiants Actifs
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* Graphiques Principaux */}
      <Grid container spacing={{ xs: 3, sm: 4 }}>
        {/* Graphique en barres */}
        <Grid item xs={12} lg={8}>
          <DashboardCard elevation={0}>
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                mb: 3,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Activity size={28} color={colors.red} />
              Progression des Étudiants
            </Typography>
            <Box sx={{ height: 450 }}>
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
                    gap: 2,
                  }}
                >
                  <Activity size={48} style={{ opacity: 0.5, color: 'rgba(255, 255, 255, 0.3)' }} />
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Aucune donnée de progression
                  </Typography>
                </Box>
              )}
            </Box>
          </DashboardCard>
        </Grid>

        {/* Graphique Doughnut */}
        <Grid item xs={12} lg={4}>
          <DashboardCard elevation={0}>
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                mb: 3,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Target size={28} color={colors.red} />
              Distribution
            </Typography>
            <Box sx={{ height: 450 }}>
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
                    gap: 2,
                  }}
                >
                  <Target size={48} style={{ opacity: 0.5, color: 'rgba(255, 255, 255, 0.3)' }} />
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Aucun cours
                  </Typography>
                </Box>
              )}
            </Box>
          </DashboardCard>
        </Grid>

        {/* Graphique Line */}
        <Grid item xs={12}>
          <DashboardCard elevation={0}>
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                mb: 3,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Zap size={28} color={colors.red} />
              Tendances de Performance par Cours
            </Typography>
            <Box sx={{ height: 400 }}>
              {analytics.courseDistribution.length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Zap size={48} style={{ opacity: 0.5, color: 'rgba(255, 255, 255, 0.3)' }} />
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Aucune tendance disponible
                  </Typography>
                </Box>
              )}
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Détails des cours */}
      {analytics.courseDistribution.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <DashboardCard elevation={0}>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  mb: 4,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <BarChart3 size={28} color={colors.red} />
                Détails par Cours
              </Typography>
              <Grid container spacing={3}>
                {analytics.courseDistribution.map((course, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: `${colors.glass}`,
                        border: `1px solid ${colors.border}`,
                        transition: 'all 0.3s ease',
                        animation: `${fadeInUp} ${0.5 + index * 0.1}s ease-out`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                        },
                        '&:hover': {
                          background: `${colors.red}1a`,
                          borderColor: colors.red,
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 30px ${colors.red}33`,
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '12px',
                              background: `${colors.red}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              animation: `${float} 3s ease-in-out infinite`,
                            }}
                          >
                            <BookOpen size={24} color={colors.red} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                color: '#ffffff',
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

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography
                              sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}
                            >
                              Étudiants
                            </Typography>
                            <Typography
                              sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.5rem' }}
                            >
                              {course.students}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}
                            >
                              Progrès
                            </Typography>
                            <Typography
                              sx={{ color: colors.red, fontWeight: 700, fontSize: '1.5rem' }}
                            >
                              {course.progress}%
                            </Typography>
                          </Box>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                              borderRadius: 5,
                              boxShadow: `0 0 10px ${colors.red}40`,
                            },
                          }}
                        />

                        <Chip
                          label={
                            course.progress >= 80
                              ? '🔥 Excellent engagement'
                              : course.progress >= 60
                                ? '✨ Bon engagement'
                                : course.progress >= 40
                                  ? '💡 Engagement moyen'
                                  : '⚠️ Engagement faible'
                          }
                          size="small"
                          sx={{
                            background:
                              course.progress >= 80
                                ? `${colors.success}33`
                                : course.progress >= 60
                                  ? `${colors.warning}33`
                                  : course.progress >= 40
                                    ? `${colors.info}33`
                                    : `${colors.red}33`,
                            color:
                              course.progress >= 80
                                ? colors.success
                                : course.progress >= 60
                                  ? colors.warning
                                  : course.progress >= 40
                                    ? colors.info
                                    : colors.red,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            height: '32px',
                            borderRadius: '8px',
                            border:
                              course.progress >= 80
                                ? `1px solid ${colors.success}66`
                                : course.progress >= 60
                                  ? `1px solid ${colors.warning}66`
                                  : course.progress >= 40
                                    ? `1px solid ${colors.info}66`
                                    : `1px solid ${colors.red}66`,
                          }}
                        />
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </DashboardCard>
          </Grid>
        </Grid>
      )}

      {/* Section Performance Globale */}
      {analytics.totalStudents > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <DashboardCard elevation={0}>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  mb: 4,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Award size={28} color={colors.red} />
                Performance Globale
              </Typography>

              <Grid container spacing={3}>
                {/* Taux de participation */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: `${colors.glass}`,
                      border: `1px solid ${colors.border}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 2 }}
                    >
                      Taux de Participation
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={(analytics.activeStudents / analytics.totalStudents) * 100}
                        size={120}
                        thickness={6}
                        sx={{
                          color: colors.success,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{ color: '#ffffff', fontWeight: 700 }}
                        >
                          {Math.round((analytics.activeStudents / analytics.totalStudents) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', mt: 2 }}
                    >
                      {analytics.activeStudents} / {analytics.totalStudents} étudiants actifs
                    </Typography>
                  </Box>
                </Grid>

                {/* Progression moyenne */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: `${colors.glass}`,
                      border: `1px solid ${colors.border}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 2 }}
                    >
                      Progression Moyenne
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={analytics.averageProgress}
                        size={120}
                        thickness={6}
                        sx={{
                          color:
                            analytics.averageProgress >= 70
                              ? colors.success
                              : analytics.averageProgress >= 50
                                ? colors.warning
                                : colors.red,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{ color: '#ffffff', fontWeight: 700 }}
                        >
                          {analytics.averageProgress}%
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={
                        analytics.averageProgress >= 70
                          ? 'Excellent'
                          : analytics.averageProgress >= 50
                            ? 'Bon'
                            : 'À améliorer'
                      }
                      size="small"
                      sx={{
                        mt: 2,
                        background:
                          analytics.averageProgress >= 70
                            ? `${colors.success}33`
                            : analytics.averageProgress >= 50
                              ? `${colors.warning}33`
                              : `${colors.red}33`,
                        color:
                          analytics.averageProgress >= 70
                            ? colors.success
                            : analytics.averageProgress >= 50
                              ? colors.warning
                              : colors.red,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>

                {/* Engagement par cours */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: `${colors.glass}`,
                      border: `1px solid ${colors.border}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 2 }}
                    >
                      Moyenne Étudiants/Cours
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={Math.min((analytics.totalStudents / analytics.totalCourses / 50) * 100, 100)}
                        size={120}
                        thickness={6}
                        sx={{
                          color: colors.purple,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{ color: '#ffffff', fontWeight: 700 }}
                        >
                          {Math.round(analytics.totalStudents / analytics.totalCourses)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', mt: 2 }}
                    >
                      étudiants par cours en moyenne
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DashboardCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StudentAnalytics;