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
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import { 
  Assessment as AssessmentIcon, 
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon
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

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !user.token) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        console.log('📊 Chargement des analytics...');
        
        // Récupérer les cours de l'instructeur
        const coursesResponse = await axios.get(
          `${API_BASE_URL}/instructor/${user.id}/courses`,
          { 
            headers: { 
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        const courses = coursesResponse.data.data || coursesResponse.data || [];
        console.log('📚 Cours récupérés:', courses);

        // Calculer les statistiques
        let totalStudents = 0;
        let totalProgress = 0;
        let studentCount = 0;
        const studentProgress = [];
        const courseDistribution = [];

        // Parcourir chaque cours pour calculer les statistiques
        courses.forEach(course => {
          const students = course.etudiants || [];
          const courseStudents = students.length;
          
          totalStudents += courseStudents;
          
          // Calculer la progression moyenne du cours
          let courseTotalProgress = 0;
          students.forEach(student => {
            // Si les données de progression sont disponibles
            const progress = student.progression || course.progression || 0;
            courseTotalProgress += progress;
            
            studentProgress.push({
              name: student.prenom ? `${student.prenom} ${student.nom}` : `Étudiant ${student._id}`,
              progress: progress,
              course: course.titre
            });
          });

          const avgCourseProgress = courseStudents > 0 ? (courseTotalProgress / courseStudents) : 0;
          totalProgress += avgCourseProgress;
          studentCount += courseStudents;

          courseDistribution.push({
            course: course.titre,
            students: courseStudents,
            progress: avgCourseProgress
          });
        });

        const averageProgress = studentCount > 0 ? (totalProgress / courses.length) : 0;

        setAnalytics({
          totalStudents,
          averageProgress: Math.round(averageProgress),
          totalCourses: courses.length,
          activeStudents: studentProgress.filter(s => s.progress > 0).length,
          studentProgress: studentProgress.slice(0, 10), // Limiter pour le graphique
          courseDistribution
        });

        console.log('✅ Analytics calculés:', {
          totalStudents,
          averageProgress,
          totalCourses: courses.length,
          studentProgress: studentProgress.length
        });

      } catch (err) {
        console.error('❌ Erreur lors de la récupération des analytics:', err);
        
        if (err.response?.status === 404) {
          setError('Aucun cours trouvé pour cet instructeur.');
        } else if (err.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
          setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
        } else {
          setError(err.response?.data?.message || 'Erreur lors de la récupération des analytics. Veuillez réessayer.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && (user.role === 'ENSEIGNANT' || user.role === 'ADMIN')) {
      fetchAnalytics();
    }
  }, [user, API_BASE_URL]);

  // Données pour le graphique de progression des étudiants
  const barChartData = {
    labels: analytics.studentProgress.map(item => item.name),
    datasets: [
      {
        label: 'Progrès (%)',
        data: analytics.studentProgress.map(item => item.progress),
        backgroundColor: `${colors.fuschia || '#f13544'}cc`,
        borderColor: colors.fuschia || '#f13544',
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
          font: { size: 12 } 
        } 
      },
      title: {
        display: true,
        text: 'Progrès des Étudiants',
        color: colors.white || '#ffffff',
        font: { size: 16, weight: 'bold' },
      },
      tooltip: {
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
          color: colors.white || '#ffffff',
          callback: function(value) {
            return value + '%';
          }
        }, 
        grid: { color: 'rgba(255, 255, 255, 0.1)' } 
      },
      x: { 
        ticks: { 
          color: colors.white || '#ffffff',
          maxRotation: 45,
          minRotation: 45
        }, 
        grid: { color: 'rgba(255, 255, 255, 0.1)' } 
      },
    },
  };

  // Données pour le graphique de distribution par cours
  const doughnutData = {
    labels: analytics.courseDistribution.map(item => item.course),
    datasets: [
      {
        data: analytics.courseDistribution.map(item => item.students),
        backgroundColor: [
          `${colors.fuschia || '#f13544'}cc`,
          `${colors.lightFuschia || '#ff6b74'}cc`,
          `${colors.navy || '#010b40'}cc`,
          `${colors.lightNavy || '#1a237e'}cc`,
          '#10b981cc',
          '#f59e0bcc'
        ],
        borderColor: colors.white || '#ffffff',
        borderWidth: 2,
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
          color: colors.white || '#ffffff',
          font: { size: 11 }
        } 
      },
      title: {
        display: true,
        text: 'Répartition des Étudiants par Cours',
        color: colors.white || '#ffffff',
        font: { size: 16, weight: 'bold' },
      },
    },
  };

  if (authLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        width: '100vw', 
        bgcolor: colors.navy || '#010b40', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  if (error && !isLoading) {
    return (
      <ThemeProvider theme={instructorTheme}>
        <DashboardContainer>
          <Container maxWidth={false} disableGutters>
            <Box sx={{ p: 4 }}>
              <Alert 
                severity="error" 
                sx={{ 
                  maxWidth: 500, 
                  margin: '0 auto',
                  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
                  color: colors.white || '#ffffff'
                }}
              >
                {error}
              </Alert>
            </Box>
          </Container>
        </DashboardContainer>
      </ThemeProvider>
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
          opacity: 0.05 
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
          animation: `${floatingAnimation} 4s ease-in-out infinite` 
        }} />
        
        <Box sx={{ 
          position: 'absolute', 
          top: 100, 
          left: 50, 
          width: 80, 
          height: 80, 
          background: `linear-gradient(135deg, ${colors.lightFuschia || '#ff6b74'}, ${colors.fuschia || '#f13544'})`, 
          borderRadius: '50%', 
          opacity: 0.1, 
          animation: `${floatingAnimation} 5s ease-in-out infinite` 
        }} />
        
        <Container maxWidth={false} disableGutters>
          {/* En-tête */}
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Typography variant="h3" sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
              Analytics Étudiants
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
              <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>
                Chargement des analytics...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Cartes de statistiques */}
              <Grid container spacing={3} sx={{ p: 4, pt: 0 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 48, color: colors.fuschia || '#f13544', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Étudiants Totaux
                      </Typography>
                      <Typography variant="h3" sx={{ color: colors.fuschia || '#f13544', mt: 1, fontWeight: 'bold' }}>
                        {analytics.totalStudents}
                      </Typography>
                    </CardContent>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <TrendingUpIcon sx={{ fontSize: 48, color: colors.fuschia || '#f13544', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Progrès Moyen
                      </Typography>
                      <Typography variant="h3" sx={{ color: colors.fuschia || '#f13544', mt: 1, fontWeight: 'bold' }}>
                        {analytics.averageProgress}%
                      </Typography>
                    </CardContent>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <SchoolIcon sx={{ fontSize: 48, color: colors.fuschia || '#f13544', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Cours Actifs
                      </Typography>
                      <Typography variant="h3" sx={{ color: colors.fuschia || '#f13544', mt: 1, fontWeight: 'bold' }}>
                        {analytics.totalCourses}
                      </Typography>
                    </CardContent>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <AssessmentIcon sx={{ fontSize: 48, color: colors.fuschia || '#f13544', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Étudiants Actifs
                      </Typography>
                      <Typography variant="h3" sx={{ color: colors.fuschia || '#f13544', mt: 1, fontWeight: 'bold' }}>
                        {analytics.activeStudents}
                      </Typography>
                    </CardContent>
                  </StatCard>
                </Grid>
              </Grid>

              {/* Graphiques */}
              <Grid container spacing={3} sx={{ p: 4, pt: 0 }}>
                {analytics.studentProgress.length > 0 && (
                  <Grid item xs={12} lg={8}>
                    <ChartCard>
                      <Box sx={{ height: 400 }}>
                        <Bar data={barChartData} options={barChartOptions} />
                      </Box>
                    </ChartCard>
                  </Grid>
                )}

                {analytics.courseDistribution.length > 0 && (
                  <Grid item xs={12} lg={4}>
                    <ChartCard>
                      <Box sx={{ height: 400 }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                      </Box>
                    </ChartCard>
                  </Grid>
                )}

                {analytics.totalStudents === 0 && (
                  <Grid item xs={12}>
                    <ChartCard>
                      <Box sx={{ 
                        height: 200, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        textAlign: 'center'
                      }}>
                        <PeopleIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Aucun étudiant inscrit à vos cours
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                          Les analytics seront disponibles lorsque des étudiants s'inscriront à vos cours.
                        </Typography>
                      </Box>
                    </ChartCard>
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default StudentAnalytics;