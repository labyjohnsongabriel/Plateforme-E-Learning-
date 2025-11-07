// Corrected Catalog.jsx - Modern and Professional Design
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Stack,
  CircularProgress,
  Chip,
  Paper,
  Fade,
  Slide,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  alpha,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  BookOpen, 
  Filter, 
  ChevronRight, 
  Globe, 
  Award, 
  Users, 
  Search, 
  X,
  Clock,
  PlayCircle,
  BarChart3,
  Eye
} from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

// ✅ URLs d'API corrigées
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const COURSES_API_URL = `${API_BASE_URL}/courses`;
const LEARNING_API_URL = `${API_BASE_URL}/learning`;

// Palette de couleurs fixe
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  white: '#ffffff',
  lightGray: '#f8f9fa',
  darkGray: '#2d3748',
};

// Animations améliorées
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

const floatingAnimation = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-20px) rotate(5deg); 
  }
`;

const shimmerAnimation = keyframes`
  0% { 
    background-position: -200px 0; 
  }
  100% { 
    background-position: 200px 0; 
  }
`;

const pulseAnimation = keyframes`
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.7; 
  }
`;

// Composants stylisés modernes
const HeroSection = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, #2d1b69 100%)`,
  position: 'relative',
  overflow: 'hidden',
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 20%, ${colors.red}26 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${colors.pink}1a 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, ${colors.lightNavy}33 0%, transparent 50%)
    `,
  }
});

const GlassCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.navy, 0.9)}, ${alpha(colors.lightNavy, 0.9)})`,
  backdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: '24px',
  border: `1px solid ${alpha(colors.red, 0.2)}`,
  boxShadow: `0 8px 32px ${alpha(colors.navy, 0.3)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 32px 80px ${alpha(colors.navy, 0.4)}`,
    border: `1px solid ${alpha(colors.red, 0.4)}`,
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.navy, 0.95)}, ${alpha(colors.lightNavy, 0.95)})`,
  backdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: '20px',
  border: `1px solid ${alpha(colors.red, 0.15)}`,
  boxShadow: `0 4px 24px ${alpha(colors.navy, 0.2)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  height: '100%',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
    transform: 'scaleX(0)',
    transition: 'transform 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 25px 60px ${alpha(colors.navy, 0.4)}`,
    border: `1px solid ${alpha(colors.red, 0.3)}`,
    '&::before': {
      transform: 'scaleX(1)',
    },
    '& .course-image': {
      transform: 'scale(1.1)',
    }
  },
}));

const SearchBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${alpha(colors.navy, 0.9)}, ${alpha(colors.lightNavy, 0.9)})`,
  borderRadius: '16px',
  padding: '12px 24px',
  border: `1px solid ${alpha(colors.red, 0.2)}`,
  backdropFilter: 'blur(10px) saturate(180%)',
  marginBottom: '24px',
  transition: 'all 0.3s ease',
  '&:focus-within': {
    border: `1px solid ${alpha(colors.red, 0.6)}`,
    boxShadow: `0 0 0 3px ${alpha(colors.red, 0.1)}`,
  },
});

const LevelBadge = styled(Chip)(({ level }) => {
  const levelColors = {
    ALFA: { bg: alpha('#4CAF50', 0.2), color: '#4CAF50', border: alpha('#4CAF50', 0.3) },
    BETA: { bg: alpha('#2196F3', 0.2), color: '#2196F3', border: alpha('#2196F3', 0.3) },
    GAMMA: { bg: alpha('#FF9800', 0.2), color: '#FF9800', border: alpha('#FF9800', 0.3) },
    DELTA: { bg: alpha('#F44336', 0.2), color: '#F44336', border: alpha('#F44336', 0.3) },
  };
  
  const colors = levelColors[level] || { bg: alpha(colors.red, 0.2), color: colors.red, border: alpha(colors.red, 0.3) };
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '24px',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  };
});

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [domains, setDomains] = useState([{ _id: 'all', nom: 'Tous les domaines' }]);
  const [stats, setStats] = useState({
    courses: '500+',
    learners: '1,200+',
    satisfaction: '95%',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const coursesPerPage = 9;
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    fetchCatalogData();
  }, [page, filterLevel, filterDomain, searchTerm]);

  const fetchCatalogData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token') || user?.token || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [statsResponse, coursesResponse, domainsResponse] = await Promise.all([
        axios.get(`${COURSES_API_URL}/stats`, { headers }).catch(() => ({
          data: { courses: '500+', learners: '1,200+', satisfaction: '95%' },
        })),
        axios.get(`${COURSES_API_URL}/public`, {
          params: {
            page,
            limit: coursesPerPage,
            level: filterLevel !== 'all' ? filterLevel : undefined,
            domain: filterDomain !== 'all' ? filterDomain : undefined,
            search: searchTerm || undefined,
          },
          headers,
        }),
        axios.get(`${COURSES_API_URL}/domaine`, { headers }).catch(() => ({
          data: { data: [] }
        })),
      ]);

      setStats(statsResponse.data);
      const coursesData = coursesResponse.data.data || coursesResponse.data || [];
      const domainsData = domainsResponse.data.data || domainsResponse.data || [];
      
      setDomains([{ _id: 'all', nom: 'Tous les domaines' }, ...domainsData]);

      const normalizedCourses = coursesData
        .filter(course => course && course._id)
        .map((course) => {
          let domaineNom = 'N/A';
          
          if (course.domaineId?._id && course.domaineId?.nom) {
            domaineNom = course.domaineId.nom;
          } else if (typeof course.domaineId === 'string') {
            const matchingDomain = domainsData.find((d) => d._id === course.domaineId);
            domaineNom = matchingDomain ? matchingDomain.nom : 'Domaine non défini';
          } else if (course.domaineNom) {
            domaineNom = course.domaineNom;
          }

          return {
            ...course,
            domaineNom,
            title: course.titre || course.title || 'Titre non disponible',
            description: course.description || 'Description non disponible',
            level: course.niveau || course.level || 'N/A',
            _id: course._id && typeof course._id === 'string' ? course._id : course._id?.toString(),
            duration: course.duration || '6h',
            students: course.students || Math.floor(Math.random() * 500) + 50,
            rating: course.rating || (Math.random() * 0.5 + 4.5).toFixed(1),
            lessons: course.lessons || Math.floor(Math.random() * 20) + 5,
          };
        });
      
      setCourses(normalizedCourses);
      setTotalPages(Math.max(1, coursesResponse.data.totalPages || 1));
      
      console.log('✅ Catalogue chargé:', {
        coursesCount: normalizedCourses.length,
        domainsCount: domainsData.length,
        totalPages: coursesResponse.data.totalPages
      });

    } catch (err) {
      console.error('❌ Erreur lors du chargement des données:', err);
      const errorMessage =
        err.response?.data?.message || 'Impossible de charger le catalogue. Veuillez réessayer.';
      
      if (err.response?.status === 401) {
        setError('Veuillez vous connecter pour accéder au catalogue.');
        addNotification('Session expirée. Veuillez vous reconnecter.', 'warning');
        navigate('/login');
      } else {
        setError(errorMessage);
        addNotification(errorMessage, 'error', { autoHideDuration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (!course?._id) return false;
      
      const courseLevel = course.level || 'N/A';
      const courseDomain = course.domaineId?._id || course.domaineId || 'all';
      const matchesLevel = filterLevel === 'all' || courseLevel === filterLevel;
      const matchesDomain = filterDomain === 'all' || courseDomain === filterDomain;
      const matchesSearch =
        searchTerm === '' ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesLevel && matchesDomain && matchesSearch;
    });
  }, [courses, filterLevel, filterDomain, searchTerm]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchCatalogData();
  };

  const handleDiscover = (courseId) => {
    if (courseId) {
      navigate(`/course/${courseId}`);
    } else {
      addNotification('Erreur: Cours non valide', 'error');
    }
  };

  const handleEnrollClick = (course) => {
    if (!course?._id) {
      console.error('❌ Cours invalide pour inscription:', course);
      addNotification('Erreur: Cours non valide', 'error');
      return;
    }

    if (!user) {
      addNotification('Veuillez vous connecter pour vous inscrire', 'warning');
      navigate('/login', { state: { returnUrl: `/course/${course._id}` } });
      return;
    }

    setSelectedCourse(course);
    setEnrollDialogOpen(true);
  };

  const handleEnrollConfirm = async () => {
    if (!selectedCourse?._id) {
      console.error('❌ Aucun cours sélectionné pour inscription');
      addNotification('Erreur: Aucun cours sélectionné', 'error');
      setEnrollDialogOpen(false);
      return;
    }

    setEnrollLoading(true);
    
    try {
      const token = localStorage.getItem('token') || user?.token;
      if (!token) {
        addNotification('Veuillez vous connecter pour vous inscrire', 'warning');
        navigate('/login', { state: { returnUrl: `/course/${selectedCourse._id}` } });
        setEnrollDialogOpen(false);
        return;
      }

      const response = await axios.post(
        `${LEARNING_API_URL}/enroll`,
        { 
          coursId: selectedCourse._id 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      addNotification(
        `Inscription au cours "${selectedCourse.title}" réussie !`, 
        'success',
        { autoHideDuration: 6000 }
      );
      
      setEnrollDialogOpen(false);
      setSelectedCourse(null);
      
      setTimeout(() => {
        navigate('/student/courses');
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur d\'inscription:', err);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      let notificationType = 'error';
      let shouldRedirect = false;
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.message || 'Données invalides pour l\'inscription';
            break;
          case 401:
            errorMessage = 'Session expirée, veuillez vous reconnecter';
            notificationType = 'warning';
            shouldRedirect = true;
            break;
          case 403:
            errorMessage = 'Vous n\'avez pas accès à ce cours';
            break;
          case 404:
            errorMessage = 'Cours introuvable ou non disponible';
            break;
          case 409:
            errorMessage = 'Vous êtes déjà inscrit à ce cours';
            notificationType = 'info';
            shouldRedirect = true;
            break;
          case 500:
            errorMessage = 'Erreur serveur lors de l\'inscription';
            break;
          default:
            errorMessage = data?.message || `Erreur ${status} lors de l'inscription`;
        }
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      } else {
        errorMessage = err.message || 'Erreur inattendue lors de l\'inscription';
      }

      addNotification(errorMessage, notificationType, { autoHideDuration: 6000 });

      if (shouldRedirect) {
        setTimeout(() => {
          if (err.response?.status === 401) {
            navigate('/login', { state: { returnUrl: `/course/${selectedCourse._id}` } });
          } else if (err.response?.status === 409) {
            navigate('/student/courses');
          }
        }, 2000);
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleEnrollDialogClose = () => {
    if (!enrollLoading) {
      setEnrollDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  const isValidCourse = (course) => {
    return course && 
           course._id && 
           course.title && 
           course.title !== 'Titre non disponible';
  };

  const handleResetFilters = () => {
    setFilterLevel('all');
    setFilterDomain('all');
    setSearchTerm('');
    setPage(1);
  };

  // Fonction pour générer une couleur d'accent basée sur le domaine
  const getDomainColor = (domainName) => {
    const domainColors = {
      'Informatique': '#1a237e',
      'Communication': '#4CAF50',
      'Multimédia': '#FF9800',
      'Design': '#E91E63',
      'Marketing': '#9C27B0',
      'Management': '#607D8B',
    };
    return domainColors[domainName] || colors.red;
  };

  return (
    <Box sx={{ overflow: 'hidden', width: '100vw', minHeight: '100vh' }}>
      {/* Hero Section */}
      <HeroSection>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 20% 20%, ${colors.red}26 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, ${colors.pink}1a 0%, transparent 50%)
            `,
          }}
        />

        {/* Éléments flottants décoratifs */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: 100,
            height: 100,
            background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
            borderRadius: '20px',
            opacity: 0.1,
            animation: `${floatingAnimation} 8s ease-in-out infinite`,
            transform: 'rotate(45deg)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: '30%',
            left: '10%',
            width: 60,
            height: 60,
            background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
            borderRadius: '50%',
            opacity: 0.08,
            animation: `${floatingAnimation} 6s ease-in-out infinite 1s`,
          }}
        />

        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 10, px: { xs: 2, md: 4 } }}>
          <Grid container spacing={6} alignItems='center'>
            <Grid item xs={12} lg={7}>
              <Fade in={isVisible} timeout={1000}>
                <Box>
                  <Chip
                    icon={<Star size={20} color={colors.red} />}
                    label='Explorez nos formations gratuites'
                    sx={{
                      mb: 4,
                      background: `linear-gradient(135deg, ${alpha(colors.navy, 0.9)}, ${alpha(colors.lightNavy, 0.9)})`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(colors.red, 0.3)}`,
                      color: colors.white,
                      borderRadius: '50px',
                      px: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      animation: `${pulseAnimation} 2s ease-in-out infinite`,
                    }}
                  />

                  <Typography
                    variant='h1'
                    sx={{
                      fontSize: { xs: '3rem', md: '4.5rem', lg: '5.5rem' },
                      fontWeight: 800,
                      color: colors.white,
                      lineHeight: 1.1,
                      mb: 3,
                      textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    Catalogue des{' '}
                    <Box
                      component='span'
                      sx={{
                        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'block',
                      }}
                    >
                      Formations
                    </Box>
                  </Typography>

                  <Typography
                    variant='h5'
                    sx={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontWeight: 300,
                      lineHeight: 1.6,
                      maxWidth: 600,
                      mb: 4,
                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                    }}
                  >
                    Découvrez notre sélection de cours certifiants en informatique, communication et
                    multimédia. Développez vos compétences avec nos experts.
                  </Typography>

                  <SearchBox>
                    <Search size={24} color={colors.white} style={{ marginRight: '12px', opacity: 0.8 }} />
                    <input
                      type='text'
                      placeholder='Rechercher un cours, une technologie, un domaine...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: colors.white,
                        fontSize: '1.1rem',
                        width: '100%',
                        outline: 'none',
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.6)',
                        },
                      }}
                    />
                  </SearchBox>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4, alignItems: 'flex-start' }}>
                    <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', flex: 1 }}>
                      {['all', 'ALFA', 'BETA', 'GAMMA', 'DELTA'].map((level) => (
                        <Button
                          key={level}
                          variant={filterLevel === level ? 'contained' : 'outlined'}
                          sx={{
                            background:
                              filterLevel === level
                                ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                                : 'transparent',
                            borderColor: `${alpha(colors.red, 0.3)}`,
                            color: colors.white,
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            mb: 1,
                            minWidth: 'auto',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                              transform: 'translateY(-2px)',
                              borderColor: colors.red,
                            },
                          }}
                          onClick={() => setFilterLevel(level)}
                          startIcon={level === 'all' ? <Filter size={18} /> : null}
                        >
                          {level === 'all' ? 'Tous' : level}
                        </Button>
                      ))}
                    </Stack>

                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel sx={{ color: colors.white, fontWeight: 500 }}>Domaine</InputLabel>
                      <Select
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                        label='Domaine'
                        sx={{
                          color: colors.white,
                          backgroundColor: alpha(colors.navy, 0.8),
                          borderRadius: '12px',
                          '& .MuiSvgIcon-root': { color: colors.white },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(colors.red, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(colors.red, 0.6),
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.red,
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: colors.navy,
                              color: colors.white,
                              borderRadius: '12px',
                              marginTop: '8px',
                            },
                          },
                        }}
                      >
                        {domains.map((domain) => (
                          <MenuItem key={domain._id} value={domain._id}>
                            {domain.nom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Slide direction='left' in={isVisible} timeout={1200}>
                <GlassCard
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    animation: `${floatingAnimation} 6s ease-in-out infinite`,
                  }}
                >
                  <Box
                    sx={{
                      width: 220,
                      height: 220,
                      background: `linear-gradient(135deg, ${alpha(colors.navy, 0.9)}, ${alpha(colors.lightNavy, 0.9)})`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(colors.red, 0.3)}`,
                      animation: `${floatingAnimation} 8s ease-in-out infinite`,
                      mx: 'auto',
                      mb: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        background: `conic-gradient(from 0deg, ${colors.red}, ${colors.pink}, ${colors.red})`,
                        borderRadius: '50%',
                        animation: `${shimmerAnimation} 3s linear infinite`,
                        opacity: 0.1,
                      }
                    }}
                  >
                    <Stack alignItems='center' spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 32px ${alpha(colors.red, 0.4)}`,
                        }}
                      >
                        <Globe size={36} color={colors.white} />
                      </Box>
                      <Typography
                        sx={{
                          color: colors.white,
                          fontWeight: 800,
                          fontSize: '2.5rem',
                          lineHeight: 1,
                        }}
                      >
                        {stats.courses}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                        }}
                      >
                        Cours disponibles
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontStyle: 'italic',
                    }}
                  >
                    Des formations régulièrement mises à jour
                  </Typography>
                </GlassCard>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Statistics Section */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
          width: '100vw',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.red}, transparent)`,
          }
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            {[
              {
                number: stats.courses,
                label: 'Cours disponibles',
                icon: BookOpen,
                color: colors.red,
                description: 'Formations expertes'
              },
              {
                number: stats.learners,
                label: 'Apprenants inscrits',
                icon: Users,
                color: colors.pink,
                description: 'Communauté active'
              },
              {
                number: stats.satisfaction,
                label: 'Taux de satisfaction',
                icon: Award,
                color: '#4caf50',
                description: 'Retours positifs'
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Slide direction='up' in={isVisible} timeout={800 + index * 200}>
                  <GlassCard sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 32px ${alpha(stat.color, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: `0 12px 40px ${alpha(stat.color, 0.4)}`,
                        },
                      }}
                    >
                      <stat.icon size={36} color='white' />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: '2.8rem', md: '3rem' },
                        fontWeight: 800,
                        color: colors.white,
                        mb: 1,
                        lineHeight: 1,
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '1.3rem',
                        mb: 1,
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 400,
                        fontSize: '0.9rem',
                      }}
                    >
                      {stat.description}
                    </Typography>
                  </GlassCard>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Courses Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
          width: '100vw',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack alignItems='center' spacing={6}>
            <Box textAlign='center' sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography
                variant='h2'
                sx={{
                  fontSize: { xs: '3rem', md: '4rem' },
                  fontWeight: 700,
                  color: colors.white,
                  mb: 2,
                }}
              >
                Nos Cours
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  mb: 2,
                }}
              >
                Explorez une variété de formations conçues pour booster vos compétences numériques.
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.6,
                  fontSize: '1.1rem',
                }}
              >
                Des cours pratiques avec des projets réels et un accompagnement personnalisé.
              </Typography>
            </Box>

            {loading && (
              <Fade in={loading} timeout={1000}>
                <Box textAlign='center' sx={{ py: 8 }}>
                  <CircularProgress
                    size={60}
                    sx={{
                      color: colors.red,
                      animation: `${pulseAnimation} 2s ease-in-out infinite`,
                    }}
                  />
                  <Typography sx={{ color: colors.white, mt: 3, fontSize: '1.2rem' }}>
                    Chargement des cours...
                  </Typography>
                </Box>
              </Fade>
            )}

            {error && (
              <Alert
                severity='error'
                sx={{ 
                  mb: 4, 
                  width: '100%', 
                  maxWidth: 600,
                  background: `linear-gradient(135deg, ${alpha('#d32f2f', 0.9)}, ${alpha('#c62828', 0.9)})`,
                  color: colors.white,
                  borderRadius: '12px',
                  '& .MuiAlert-icon': { color: colors.white }
                }}
                action={
                  <Button 
                    color='inherit' 
                    size='small' 
                    onClick={handleRetry}
                    sx={{
                      background: alpha(colors.white, 0.2),
                      borderRadius: '8px',
                      '&:hover': {
                        background: alpha(colors.white, 0.3),
                      }
                    }}
                  >
                    Réessayer
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <>
                <Grid container spacing={4}>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                      isValidCourse(course) && (
                        <Grid item xs={12} sm={6} md={4} key={course._id}>
                          <Slide direction='up' in={isVisible} timeout={1000 + index * 200}>
                            <CourseCard elevation={0}>
                              <Box
                                sx={{
                                  p: 0,
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                {/* En-tête de la carte avec image et badges */}
                                <Box
                                  sx={{
                                    position: 'relative',
                                    height: 160,
                                    background: `linear-gradient(135deg, ${getDomainColor(course.domaineNom)}, ${alpha(getDomainColor(course.domaineNom), 0.7)})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                  }}
                                  className="course-image"
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: `radial-gradient(circle at center, ${alpha(colors.white, 0.1)} 0%, transparent 70%)`,
                                    }}
                                  />
                                  <PlayCircle size={48} color={colors.white} style={{ opacity: 0.9, zIndex: 1 }} />
                                  
                                  {/* Badges en superposition */}
                                  <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <LevelBadge 
                                      level={course.level} 
                                      label={`NIVEAU ${course.level}`}
                                      size="small"
                                    />
                                    <Chip
                                      label={course.domaineNom}
                                      size="small"
                                      sx={{
                                        backgroundColor: alpha(colors.white, 0.2),
                                        color: colors.white,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: '20px',
                                        backdropFilter: 'blur(10px)',
                                      }}
                                    />
                                  </Box>

                                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                                    <Chip
                                      icon={<Star size={14} />}
                                      label={course.rating}
                                      size="small"
                                      sx={{
                                        backgroundColor: alpha(colors.navy, 0.8),
                                        color: colors.white,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: '24px',
                                      }}
                                    />
                                  </Box>
                                </Box>

                                {/* Contenu de la carte */}
                                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                  <Typography
                                    variant='h6'
                                    sx={{
                                      fontWeight: 700,
                                      color: colors.white,
                                      mb: 2,
                                      fontSize: '1.3rem',
                                      minHeight: '64px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {course.title}
                                  </Typography>

                                  <Typography
                                    variant='body2'
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.7)',
                                      lineHeight: 1.5,
                                      mb: 3,
                                      fontSize: '0.95rem',
                                      flexGrow: 1,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {course.description}
                                  </Typography>

                                  {/* Métriques du cours */}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                                      <Clock size={16} style={{ marginRight: 4 }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        {course.duration}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                                      <BarChart3 size={16} style={{ marginRight: 4 }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        {course.lessons} leçons
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                                      <Users size={16} style={{ marginRight: 4 }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        {course.students}+
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Actions */}
                                  <Stack direction='row' spacing={1.5} sx={{ mt: 'auto' }}>
                                    <Button
                                      onClick={() => handleDiscover(course._id)}
                                      variant='contained'
                                      sx={{
                                        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                                        borderRadius: '12px',
                                        px: 2,
                                        py: 1,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '0.9rem',
                                        flex: 1,
                                        minWidth: 0,
                                        '&:hover': {
                                          transform: 'translateY(-2px)',
                                          boxShadow: `0 8px 24px ${alpha(colors.red, 0.4)}`,
                                        },
                                      }}
                                      startIcon={<Eye size={16} />}
                                    >
                                      Voir
                                    </Button>

                                    <Button
                                      onClick={() => handleEnrollClick(course)}
                                      variant='outlined'
                                      sx={{
                                        borderColor: alpha(colors.red, 0.6),
                                        color: colors.white,
                                        borderRadius: '12px',
                                        px: 2,
                                        py: 1,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '0.9rem',
                                        minWidth: 'auto',
                                        '&:hover': {
                                          background: colors.red,
                                          borderColor: colors.red,
                                          transform: 'translateY(-2px)',
                                        },
                                      }}
                                    >
                                      {user ? "S'inscrire" : 'Se connecter'}
                                    </Button>
                                  </Stack>
                                </Box>
                              </Box>
                            </CourseCard>
                          </Slide>
                        </Grid>
                      )
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          background: `linear-gradient(135deg, ${alpha(colors.red, 0.1)}, ${alpha(colors.pink, 0.1)})`,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                        }}
                      >
                        <Search size={48} color={colors.red} />
                      </Box>
                      <Typography variant='h6' sx={{ color: colors.white, mb: 2, fontSize: '1.5rem' }}>
                        Aucun cours trouvé
                      </Typography>
                      <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                        Aucun cours ne correspond à vos critères de recherche.
                      </Typography>
                      <Button
                        variant='outlined'
                        sx={{ 
                          color: colors.white, 
                          borderColor: colors.white,
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          '&:hover': {
                            background: alpha(colors.white, 0.1),
                            borderColor: colors.white,
                            transform: 'translateY(-2px)',
                          }
                        }}
                        onClick={handleResetFilters}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </Box>
                  )}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{ mt: 6, flexWrap: 'wrap', justifyContent: 'center' }}
                  >
                    <Button
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      sx={{
                        color: colors.white,
                        borderColor: alpha(colors.red, 0.3),
                        borderRadius: '8px',
                        minWidth: '40px',
                        mb: 1,
                        '&:hover': {
                          background: alpha(colors.red, 0.1),
                          borderColor: colors.red,
                        },
                        '&:disabled': {
                          opacity: 0.3,
                        }
                      }}
                      variant="outlined"
                    >
                      ‹
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={page === pageNumber ? 'contained' : 'outlined'}
                          sx={{
                            background:
                              page === pageNumber
                                ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                                : 'transparent',
                            borderColor: alpha(colors.red, 0.3),
                            color: colors.white,
                            borderRadius: '8px',
                            minWidth: '40px',
                            mb: 1,
                            '&:hover': {
                              background: page !== pageNumber ? alpha(colors.red, 0.1) : undefined,
                              borderColor: colors.red,
                            },
                          }}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}

                    <Button
                      disabled={page === totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      sx={{
                        color: colors.white,
                        borderColor: alpha(colors.red, 0.3),
                        borderRadius: '8px',
                        minWidth: '40px',
                        mb: 1,
                        '&:hover': {
                          background: alpha(colors.red, 0.1),
                          borderColor: colors.red,
                        },
                        '&:disabled': {
                          opacity: 0.3,
                        }
                      }}
                      variant="outlined"
                    >
                      ›
                    </Button>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
          textAlign: 'center',
          width: '100vw',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 30% 70%, ${alpha(colors.red, 0.05)} 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, ${alpha(colors.pink, 0.05)} 0%, transparent 50%)
            `,
          }
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
          <Stack alignItems='center' spacing={4}>
            <Typography
              variant='h3'
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                color: colors.white,
                mb: 2,
              }}
            >
              Commencez votre{' '}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                apprentissage
              </Box>{' '}
              dès aujourd'hui
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.6,
                maxWidth: 600,
                fontSize: { xs: '1.3rem', md: '1.5rem' },
              }}
            >
              Rejoignez notre communauté et développez vos compétences avec nos formations gratuites
              et certifiantes.
            </Typography>
            <Button
              component={Link}
              to={user ? '/student/courses' : '/register'}
              variant='contained'
              size='large'
              sx={{
                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                borderRadius: '16px',
                px: 6,
                py: 2,
                fontSize: '1.3rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: `0 8px 32px ${alpha(colors.red, 0.3)}`,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 40px ${alpha(colors.red, 0.4)}`,
                  '&::before': {
                    transform: 'translateX(100%)',
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s ease',
                }
              }}
              endIcon={<ChevronRight size={28} />}
            >
              {user ? 'Voir mes cours' : "S'inscrire maintenant"}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Enrollment Dialog */}
      <Dialog
        open={enrollDialogOpen}
        onClose={handleEnrollDialogClose}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
            borderRadius: '24px',
            border: `1px solid ${alpha(colors.red, 0.2)}`,
            backdropFilter: 'blur(20px)',
            maxWidth: '500px',
            width: '90vw',
            boxShadow: `0 32px 80px ${alpha(colors.navy, 0.4)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.white,
            fontWeight: 700,
            borderBottom: `1px solid ${alpha(colors.red, 0.2)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '1.5rem',
            py: 3,
          }}
        >
          Confirmation d'inscription
          <IconButton
            onClick={handleEnrollDialogClose}
            disabled={enrollLoading}
            sx={{ 
              color: colors.white,
              '&:hover': {
                background: alpha(colors.red, 0.1),
              }
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
              Êtes-vous sûr de vouloir vous inscrire au cours :
            </Typography>

            {selectedCourse && (
              <GlassCard sx={{ p: 3 }}>
                <Typography variant='h6' sx={{ color: colors.white, fontWeight: 600, mb: 1 }}>
                  {selectedCourse.title}
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  {selectedCourse.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <LevelBadge 
                    level={selectedCourse.level} 
                    label={`NIVEAU ${selectedCourse.level}`}
                  />
                  <Chip
                    label={selectedCourse.domaineNom}
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.white, 0.1),
                      color: colors.white,
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </GlassCard>
            )}

            <Box sx={{ 
              background: alpha(colors.red, 0.1), 
              borderRadius: '12px', 
              p: 2,
              border: `1px solid ${alpha(colors.red, 0.2)}`,
            }}>
              <Typography
                variant='body2'
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}
              >
                ✓ Accès immédiat et illimité
                <br />
                ✓ Certificat de completion inclus
                <br />
                ✓ Support communautaire et expert
                <br />
                ✓ Contenu régulièrement mis à jour
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleEnrollDialogClose}
            disabled={enrollLoading}
            variant='outlined'
            sx={{
              borderColor: alpha(colors.red, 0.6),
              color: colors.white,
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                background: alpha(colors.red, 0.1),
                borderColor: colors.red,
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleEnrollConfirm}
            disabled={enrollLoading}
            variant='contained'
            sx={{
              background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 8px 24px ${alpha(colors.red, 0.4)}`,
              },
              '&:disabled': {
                opacity: 0.6,
                transform: 'none',
              },
            }}
          >
            {enrollLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                Inscription en cours...
              </Box>
            ) : (
              "Confirmer l'inscription"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Catalog;