// src/components/instructor/ManageCourses.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  ThemeProvider,
  Chip,
  createTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import { School as SchoolIcon, Edit as EditIcon, CheckCircle as ApprovedIcon, Pending as PendingIcon, Cancel as RejectedIcon } from '@mui/icons-material';

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

const CourseCard = styled(Card)(({ theme }) => ({
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

const ManageCourses = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (!user) throw new Error('Utilisateur non authentifié');
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/instructor/${user.id}/courses`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setCourses(response.data.data || []);
      } catch (err) {
        console.error('Erreur lors de la récupération des cours:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des cours. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'ENSEIGNANT') fetchCourses();
  }, [user]);

  const getStatusChip = (status) => {
    let icon;
    let color;
    switch (status) {
      case 'APPROVED':
        icon = <ApprovedIcon />;
        color = 'success';
        break;
      case 'PENDING':
        icon = <PendingIcon />;
        color = 'warning';
        break;
      case 'REJECTED':
        icon = <RejectedIcon />;
        color = 'error';
        break;
      default:
        icon = null;
        color = 'default';
    }
    return <Chip icon={icon} label={status} color={color} sx={{ mt: 1 }} />;
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
            <SchoolIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Typography variant="h3" sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
              Gestion des Cours
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ p: 4 }}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <CourseCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: colors.white || '#ffffff' }}>
                      {course.titre}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Niveau: {course.niveau}
                    </Typography>
                    {getStatusChip(course.statutApprobation)}
                  </CardContent>
                  <CardActions>
                    <StyledButton component={Link} to={`/instructor/edit-course/${course._id}`} startIcon={<EditIcon />}>
                      Modifier
                    </StyledButton>
                  </CardActions>
                </CourseCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default ManageCourses;