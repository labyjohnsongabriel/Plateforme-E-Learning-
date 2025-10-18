// Corrected Catalog.jsx
// Fixes:
// - Changed API_BASE_URL default to match Courses.jsx for consistency.
// - Changed public courses endpoint to /public to match new route.
// - Added robust error handling and logging.
// - Ensured published courses are fetched and displayed correctly.
// - Fixed 404 by assuming new route, and improved filtering conditions.

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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Filter, ChevronRight, Globe, Award, Users, Search, X } from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/courses';

// Animations
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
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-15px); 
  }
`;

const rotateAnimation = keyframes`
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
`;

const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  white: '#ffffff',
};

const HeroSection = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.navy}cc 100%)`,
  position: 'relative',
  overflow: 'hidden',
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const GlassCard = styled(Paper)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${colors.red}33`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 32px 80px ${colors.navy}4d`,
  },
});

const CourseCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1px solid ${colors.red}33`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 25px 60px ${colors.navy}4d`,
  },
});

const SearchBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  borderRadius: '16px',
  padding: '12px 20px',
  border: `1px solid ${colors.red}33`,
  backdropFilter: 'blur(10px)',
  marginBottom: '24px',
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
        axios.get(`${API_BASE_URL}/stats`, { headers }).catch(() => ({
          data: { courses: '500+', learners: '1,200+', satisfaction: '95%' },
        })),
        axios.get(`${API_BASE_URL}/public`, {
          params: {
            page,
            limit: coursesPerPage,
            level: filterLevel !== 'all' ? filterLevel : undefined,
            domain: filterDomain !== 'all' ? filterDomain : undefined,
            search: searchTerm || undefined,
          },
          headers,
        }),
        axios.get(`${API_BASE_URL}/domaine`, { headers }),
      ]);

      setStats(statsResponse.data);
      const coursesData = coursesResponse.data.data || [];
      const domainsData = domainsResponse.data.data || domainsResponse.data || [];
      setDomains([{ _id: 'all', nom: 'Tous les domaines' }, ...domainsData]);

      const normalizedCourses = coursesData.map((course) => {
        let domaineNom = 'N/A';
        if (course.domaineId?._id && course.domaineId?.nom) {
          domaineNom = course.domaineId.nom;
        } else if (typeof course.domaineId === 'string') {
          const matchingDomain = domainsData.find((d) => d._id === course.domaineId);
          domaineNom = matchingDomain ? matchingDomain.nom : 'Domaine non défini';
        }
        return {
          ...course,
          domaineNom,
          title: course.titre || 'Titre non disponible',
          description: course.description || 'Description non disponible',
          level: course.niveau || 'N/A',
        };
      });
      setCourses(normalizedCourses);
      setTotalPages(Math.max(1, coursesResponse.data.totalPages || 1));
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
      }
      addNotification(errorMessage, 'error', { autoHideDuration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
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
      addNotification('Erreur: Aucun cours sélectionné', 'error');
      setEnrollDialogOpen(false);
      return;
    }

    setEnrollLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        addNotification('Veuillez vous connecter pour vous inscrire', 'warning');
        navigate('/login', { state: { returnUrl: `/course/${selectedCourse._id}` } });
        setEnrollDialogOpen(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL.replace('/courses', '')}/learning/enroll`, // Correction pour endpoint learning
        { coursId: selectedCourse._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      addNotification(`Inscription au cours "${selectedCourse.title}" réussie !`, 'success');
      setEnrollDialogOpen(false);
      setSelectedCourse(null);
      navigate('/student/courses');
    } catch (err) {
      let errorMessage = 'Erreur lors de l’inscription';
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || 'Données invalides';
            break;
          case 401:
            errorMessage = 'Session expirée, veuillez vous reconnecter';
            navigate('/login', { state: { returnUrl: `/course/${selectedCourse._id}` } });
            break;
          case 403:
            errorMessage = 'Vous n’avez pas accès à ce cours';
            break;
          case 404:
            errorMessage = 'Cours introuvable';
            break;
          case 409:
            errorMessage = 'Vous êtes déjà inscrit à ce cours';
            break;
          default:
            errorMessage = err.response.data?.message || 'Erreur serveur';
        }
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur';
      }
      addNotification(errorMessage, 'error');
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
              radial-gradient(circle at 80% 80%, ${colors.red}1a 0%, transparent 50%)
            `,
          }}
        />

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
                      background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${colors.red}4d`,
                      color: colors.white,
                      borderRadius: '50px',
                      px: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
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
                      }}
                    >
                      Formations
                    </Box>
                  </Typography>

                  <Typography
                    variant='h5'
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
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
                    <Search size={24} color={colors.white} style={{ marginRight: '12px' }} />
                    <input
                      type='text'
                      placeholder='Rechercher un cours...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: colors.white,
                        fontSize: '1.1rem',
                        width: '100%',
                        outline: 'none',
                      }}
                    />
                  </SearchBox>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                    <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
                      {['all', 'Alfa', 'BETA', 'GAMMA'].map((level) => (
                        <Button
                          key={level}
                          variant={filterLevel === level ? 'contained' : 'outlined'}
                          sx={{
                            background:
                              filterLevel === level
                                ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                                : 'transparent',
                            borderColor: `${colors.red}4d`,
                            color: colors.white,
                            borderRadius: '16px',
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            mb: 1,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                              transform: 'translateY(-2px)',
                            },
                          }}
                          onClick={() => setFilterLevel(level)}
                          startIcon={level === 'all' ? <Filter size={24} /> : null}
                        >
                          {level === 'all' ? 'Tous les niveaux' : `Niveau ${level}`}
                        </Button>
                      ))}
                    </Stack>

                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel sx={{ color: colors.white }}>Domaine</InputLabel>
                      <Select
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                        label='Domaine'
                        sx={{
                          color: colors.white,
                          borderColor: `${colors.red}4d`,
                          '& .MuiSvgIcon-root': { color: colors.white },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: `${colors.red}4d`,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: `${colors.red}80`,
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
                      background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${colors.red}4d`,
                      animation: `${rotateAnimation} 20s linear infinite`,
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Stack alignItems='center' spacing={2}>
                      <Globe size={72} color={colors.red} />
                      <Typography
                        sx={{
                          color: colors.white,
                          fontWeight: 700,
                          fontSize: '1.8rem',
                        }}
                      >
                        {stats.courses}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 500,
                          fontSize: '1.2rem',
                        }}
                      >
                        Cours disponibles
                      </Typography>
                    </Stack>
                  </Box>
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
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          width: '100vw',
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
              },
              {
                number: stats.learners,
                label: 'Apprenants inscrits',
                icon: Users,
                color: colors.navy,
              },
              {
                number: stats.satisfaction,
                label: 'Taux de satisfaction',
                icon: Award,
                color: '#4caf50',
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Slide direction='up' in={isVisible} timeout={800 + index * 200}>
                  <GlassCard sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 8px 32px ${stat.color}4d`,
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.1) rotate(5deg)' },
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
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 600,
                        fontSize: '1.2rem',
                      }}
                    >
                      {stat.label}
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
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack alignItems='center' spacing={6}>
            <Box textAlign='center'>
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
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                }}
              >
                Explorez une variété de formations conçues pour booster vos compétences numériques.
              </Typography>
            </Box>

            {loading && (
              <Fade in={loading} timeout={1000}>
                <Box textAlign='center'>
                  <CircularProgress
                    sx={{
                      color: colors.red,
                      animation: `${rotateAnimation} 2s linear infinite`,
                    }}
                  />
                  <Typography sx={{ color: colors.white, mt: 2 }}>
                    Chargement des cours...
                  </Typography>
                </Box>
              </Fade>
            )}

            {error && (
              <Alert
                severity='error'
                sx={{ mb: 4, width: '100%', maxWidth: 600 }}
                action={
                  <Button color='inherit' size='small' onClick={handleRetry}>
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
                      <Grid item xs={12} sm={6} md={4} key={course._id || index}>
                        <Slide direction='up' in={isVisible} timeout={1000 + index * 200}>
                          <CourseCard elevation={0}>
                            <Box
                              sx={{
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Typography
                                variant='h6'
                                sx={{
                                  fontWeight: 700,
                                  color: colors.white,
                                  mb: 2,
                                  fontSize: '1.4rem',
                                  minHeight: '64px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {course.title}
                              </Typography>

                              <Chip
                                label={`Niveau: ${course.level}`}
                                size='small'
                                sx={{
                                  backgroundColor: `${colors.navy}33`,
                                  color: colors.white,
                                  fontWeight: 500,
                                  mb: 1,
                                  fontSize: '0.9rem',
                                  alignSelf: 'flex-start',
                                }}
                              />
                              <Chip
                                label={`Domaine: ${course.domaineNom}`}
                                size='small'
                                sx={{
                                  backgroundColor: `${colors.navy}33`,
                                  color: colors.white,
                                  fontWeight: 500,
                                  mb: 2,
                                  fontSize: '0.9rem',
                                  alignSelf: 'flex-start',
                                }}
                              />

                              <Typography
                                variant='body2'
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  lineHeight: 1.5,
                                  mb: 3,
                                  fontSize: '1rem',
                                  flexGrow: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {course.description}
                              </Typography>

                              <Stack direction='row' spacing={2} sx={{ mt: 'auto' }}>
                                <Button
                                  onClick={() => handleDiscover(course._id)}
                                  variant='contained'
                                  sx={{
                                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                                    borderRadius: '16px',
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    flex: 1,
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: `0 12px 40px ${colors.red}66`,
                                    },
                                  }}
                                  endIcon={<ChevronRight size={20} />}
                                >
                                  Découvrir
                                </Button>

                                <Button
                                  onClick={() => handleEnrollClick(course)}
                                  variant='outlined'
                                  sx={{
                                    borderColor: colors.red,
                                    color: colors.white,
                                    borderRadius: '16px',
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    minWidth: '120px',
                                    '&:hover': {
                                      background: colors.red,
                                      borderColor: colors.red,
                                      transform: 'translateY(-2px)',
                                    },
                                  }}
                                >
                                  {user ? "S'inscrire" : 'Se connecter pour s’inscrire'}
                                </Button>
                              </Stack>
                            </Box>
                          </CourseCard>
                        </Slide>
                      </Grid>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
                      <Typography variant='h6' sx={{ color: colors.white }}>
                        Aucun cours trouvé avec les critères sélectionnés.
                      </Typography>
                      <Button
                        variant='outlined'
                        sx={{ mt: 2, color: colors.white, borderColor: colors.white }}
                        onClick={() => {
                          setFilterLevel('all');
                          setFilterDomain('all');
                          setSearchTerm('');
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </Box>
                  )}
                </Grid>

                {totalPages > 1 && (
                  <Stack
                    direction='row'
                    spacing={2}
                    sx={{ mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}
                  >
                    {Array.from({ length: totalPages }, (_, index) => (
                      <Button
                        key={index + 1}
                        variant={page === index + 1 ? 'contained' : 'outlined'}
                        sx={{
                          background:
                            page === index + 1
                              ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                              : 'transparent',
                          borderColor: `${colors.red}4d`,
                          color: colors.white,
                          borderRadius: '12px',
                          minWidth: '40px',
                          mb: 1,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                          },
                        }}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
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
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          textAlign: 'center',
          width: '100vw',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
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
              Commencez votre apprentissage dès aujourd'hui
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
                maxWidth: 500,
                fontSize: { xs: '1.3rem', md: '1.5rem' },
              }}
            >
              Rejoignez notre communauté et développez vos compétences avec nos formations gratuites
              et certifiantes.
            </Typography>
            <Button
              component={Link}
              to='/register'
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
                boxShadow: `0 8px 32px ${colors.red}4d`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${colors.red}66`,
                },
              }}
              endIcon={<ChevronRight size={28} />}
            >
              S'inscrire maintenant
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
            border: `1px solid ${colors.red}33`,
            backdropFilter: 'blur(20px)',
            maxWidth: '500px',
            width: '90vw',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.white,
            fontWeight: 700,
            borderBottom: `1px solid ${colors.red}33`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Confirmation d'inscription
          <IconButton
            onClick={handleEnrollDialogClose}
            disabled={enrollLoading}
            sx={{ color: colors.white }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Êtes-vous sûr de vouloir vous inscrire au cours :
            </Typography>

            {selectedCourse && (
              <GlassCard sx={{ p: 3 }}>
                <Typography variant='h6' sx={{ color: colors.white, fontWeight: 600, mb: 1 }}>
                  {selectedCourse.title || 'Titre non disponible'}
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {selectedCourse.description || 'Description non disponible'}
                </Typography>
                <Chip
                  label={`Niveau: ${selectedCourse.level || selectedCourse.niveau?.nom || 'N/A'}`}
                  size='small'
                  sx={{
                    backgroundColor: `${colors.red}33`,
                    color: colors.white,
                    fontWeight: 500,
                    mt: 2,
                  }}
                />
              </GlassCard>
            )}

            <Typography
              variant='body2'
              sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}
            >
              ✓ Accès immédiat et illimité
              <br />
              ✓ Certificat de completion inclus
              <br />✓ Support communautaire
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleEnrollDialogClose}
            disabled={enrollLoading}
            variant='outlined'
            sx={{
              borderColor: colors.red,
              color: colors.white,
              borderRadius: '12px',
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: `${colors.red}33`,
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
              py: 1,
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 8px 24px ${colors.red}66`,
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            {enrollLoading ? 'Inscription en cours...' : "Confirmer l'inscription"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Catalog;
