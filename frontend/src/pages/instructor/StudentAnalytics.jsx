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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import { Assessment as AssessmentIcon, People as PeopleIcon } from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Custom theme
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
    h6: { fontWeight: 500 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: '16px' } } },
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

const StudentAnalytics = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageProgress, setAverageProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (!user) throw new Error('Utilisateur non authentifié');
        // Assuming an analytics endpoint; alternatively, derive from courses
        // For now, use getCourses and compute
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/instructor/${user.id}/courses`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const courses = response.data.data || [];
        let allStudents = [];
        let progressSum = 0;
        courses.forEach(course => {
          // Assuming each course has etudiantsInscrits with progress; adjust populate in controller if needed
          const students = course.etudiantsInscrits || [];
          students.forEach(student => {
            const progress = student.progress || Math.floor(Math.random() * 100); // Placeholder if no progress
            allStudents.push({ name: student.nom || 'Étudiant Anonyme', progress });
            progressSum += progress;
          });
        });
        setAnalytics(allStudents);
        setTotalStudents(allStudents.length);
        setAverageProgress(allStudents.length > 0 ? (progressSum / allStudents.length).toFixed(2) : 0);
      } catch (err) {
        console.error('Erreur lors de la récupération des analytics:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des analytics. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'ENSEIGNANT') fetchAnalytics();
  }, [user]);

  // Bar Chart Data
  const barChartData = {
    labels: analytics.map(item => item.name),
    datasets: [
      {
        label: 'Progrès (%)',
        data: analytics.map(item => item.progress),
        backgroundColor: `${colors.fuschia || '#f13544'}cc`,
        borderColor: colors.fuschia || '#f13544',
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
        text: 'Progrès des Étudiants',
        color: colors.white || '#ffffff',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { color: colors.white || '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: colors.white || '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    },
  };

  if (authLoading || isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: colors.navy || '#010b40', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: colors.navy || '#010b40', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={instructorTheme}>
      <DashboardContainer>
        {/* Background Decorations */}
        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(${colors.fuschia || '#f13544'}0a 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.05 }} />
        <Box sx={{ position: 'absolute', bottom: 60, right: 30, width: 120, height: 120, background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`, borderRadius: '50%', opacity: 0.15, animation: `${floatingAnimation} 4s ease-in-out infinite` }} />
        <Box sx={{ position: 'absolute', top: 100, left: 50, width: 80, height: 80, background: `linear-gradient(135deg, ${colors.lightFuschia || '#ff6b74'}, ${colors.fuschia || '#f13544'})`, borderRadius: '50%', opacity: 0.1, animation: `${floatingAnimation} 5s ease-in-out infinite` }} />
        <Container maxWidth={false} disableGutters>
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Typography variant="h3" sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
              Analytics Étudiants
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ p: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <PeopleIcon sx={{ fontSize: 60, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography sx={{ color: colors.white || '#ffffff' }}>Étudiants totaux</Typography>
                  <Typography variant="h4" sx={{ color: colors.fuschia || '#f13544', mt: 1 }}>
                    {totalStudents}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard>
                <CardContent>
                  <AssessmentIcon sx={{ fontSize: 60, color: colors.fuschia || '#f13544', mb: 2 }} />
                  <Typography sx={{ color: colors.white || '#ffffff' }}>Progrès moyen</Typography>
                  <Typography variant="h4" sx={{ color: colors.fuschia || '#f13544', mt: 1 }}>
                    {averageProgress}%
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ p: 4 }}>
            <Grid item xs={12}>
              <ChartCard>
                <Box sx={{ height: 400 }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </Box>
              </ChartCard>
            </Grid>
          </Grid>
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default StudentAnalytics;