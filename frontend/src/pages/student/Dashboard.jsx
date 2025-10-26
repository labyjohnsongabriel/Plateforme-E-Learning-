import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Stack,
  LinearProgress,
  Fade,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Download,
  Award,
  BookOpen,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';

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

// === COMPOSANTS STYLISÉS PROFESSIONNELS ===
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

const ActionButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  animation: `${pulseGlow} 2s infinite`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 10px 25px ${colors.red}4d`,
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    animation: 'none',
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

// === COMPOSANT DASHBOARD PRINCIPAL ===
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    user: null,
    progress: 0,
    certificates: [],
    courses: [],
    stats: {
      totalCourses: 0,
      completedCourses: 0,
      totalCertificates: 0,
      totalStudyTime: 0,
      averageProgress: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [invalidEnrollments, setInvalidEnrollments] = useState(0);

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
      : null;
  }, [getAuthToken]);

  // === VALIDATION DES ID ===
  const isValidObjectId = useCallback((id) => {
    return id && /^[0-9a-fA-F]{24}$/.test(id);
  }, []);

  // === CALCUL DES STATISTIQUES AUTOMATIQUES ===
  const calculateStats = useCallback((courses, certificates, userProgress) => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter((course) => course.progress === 100).length;
    const totalCertificates = certificates.length;

    // Calcul du temps d'étude total (exemple)
    const totalStudyTime = courses.reduce((total, course) => {
      return total + (course.duree || 0); // Supposons que course.duree est en minutes
    }, 0);

    // Calcul de la progression moyenne
    const averageProgress =
      totalCourses > 0
        ? Math.round(
            courses.reduce((sum, course) => sum + (course.progress || 0), 0) / totalCourses
          )
        : 0;

    return {
      totalCourses,
      completedCourses,
      totalCertificates,
      totalStudyTime,
      averageProgress,
      completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
    };
  }, []);

  // === RÉCUPÉRATION DES DONNÉES DU DASHBOARD ===
  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);
        setInvalidEnrollments(0);

        const token = getAuthToken();
        if (!token) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const headers = getAuthHeaders();

        // Récupération parallèle des données pour de meilleures performances
        const [userResponse, enrollmentsResponse, certificatesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/auth/me`, { headers }),
          axios.get(`${API_BASE_URL}/learning/enrollments`, { headers }),
          axios.get(`${API_BASE_URL}/learning/certificates`, { headers }),
        ]);

        const userData = userResponse.data;
        const enrolledCourses = Array.isArray(enrollmentsResponse.data)
          ? enrollmentsResponse.data
          : [];
        const certificatesData = Array.isArray(certificatesResponse.data?.data)
          ? certificatesResponse.data.data
          : Array.isArray(certificatesResponse.data)
            ? certificatesResponse.data
            : [];

        // Filtrage des inscriptions valides
        const validEnrollments = enrolledCourses.filter((enrollment) => {
          const coursId = enrollment.cours?._id || enrollment.cours;
          if (!isValidObjectId(coursId)) {
            setInvalidEnrollments((prev) => prev + 1);
            return false;
          }
          return true;
        });

        // Récupération des progressions en parallèle
        const progressPromises = validEnrollments.map(async (enrollment) => {
          const coursId = enrollment.cours?._id || enrollment.cours;
          try {
            const progressResponse = await axios.get(
              `${API_BASE_URL}/learning/progress/${coursId}`,
              { headers }
            );
            return {
              ...enrollment,
              progress: progressResponse.data.data?.pourcentage || 0,
              title: enrollment.cours?.title || 'Cours sans titre',
              duree: enrollment.cours?.duree || 0,
              _id: enrollment._id,
            };
          } catch (err) {
            console.warn(`Erreur progression cours ${coursId}:`, err.message);
            return {
              ...enrollment,
              progress: 0,
              title: enrollment.cours?.title || 'Cours sans titre',
              duree: enrollment.cours?.duree || 0,
              _id: enrollment._id,
            };
          }
        });

        const coursesWithProgress = await Promise.all(progressPromises);

        // Calcul automatique de toutes les statistiques
        const calculatedStats = calculateStats(coursesWithProgress, certificatesData);

        // Mise à jour de l'état avec toutes les données
        setDashboardData({
          user: userData,
          progress: calculatedStats.averageProgress,
          certificates: certificatesData,
          courses: coursesWithProgress,
          stats: calculatedStats,
        });

        // Logs de développement
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Statistiques calculées:', calculatedStats);
          console.log('📚 Cours chargés:', coursesWithProgress.length);
          console.log('🏆 Certificats:', certificatesData.length);
        }
      } catch (err) {
        console.error('❌ Erreur chargement dashboard:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement des données du tableau de bord';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_BASE_URL, getAuthToken, getAuthHeaders, isValidObjectId, calculateStats]
  );

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // === TÉLÉCHARGEMENT DE CERTIFICAT ===
  const handleDownloadCertificate = async (certId, coursTitle) => {
    try {
      setDownloadingId(certId);
      const headers = getAuthHeaders();

      if (!headers) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.get(`${API_BASE_URL}/learning/certificate/${certId}/download`, {
        headers,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificat_${coursTitle || 'Certificat'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Erreur téléchargement certificat:', err);
      setError('Erreur lors du téléchargement du certificat');
    } finally {
      setDownloadingId(null);
    }
  };

  // === ACTUALISATION DES DONNÉES ===
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

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
          animation: `${fadeInUp} 0.5s ease-out`,
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
          Chargement de votre tableau de bord...
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            mt: 1,
          }}
        >
          Préparation de vos statistiques d'apprentissage
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
      {/* En-tête avec bouton d'actualisation */}
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
              Bienvenue, {dashboardData.user?.prenom || 'Étudiant'} 👋
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 500,
              }}
            >
              Suivez votre progression et vos réalisations
            </Typography>
          </Box>

          <Tooltip title='Actualiser les données'>
            <RefreshButton onClick={handleRefresh} disabled={refreshing} size='large'>
              <RefreshCw size={20} />
            </RefreshButton>
          </Tooltip>
        </Box>
      </Fade>

      {/* Alertes */}
      {invalidEnrollments > 0 && (
        <Alert
          severity='warning'
          sx={{
            mb: 3,
            bgcolor: `${colors.warning}15`,
            color: colors.warning,
            borderRadius: '12px',
            border: `1px solid ${colors.warning}33`,
            '& .MuiAlert-icon': { color: colors.warning },
          }}
          onClose={() => setInvalidEnrollments(0)}
        >
          {invalidEnrollments} inscription(s) ignorée(s) - données de cours invalides
        </Alert>
      )}

      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            bgcolor: `${colors.red}15`,
            color: colors.red,
            borderRadius: '12px',
            border: `1px solid ${colors.red}33`,
            '& .MuiAlert-icon': { color: colors.red },
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* CARTES DE STATISTIQUES AUTOMATIQUES */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        {/* Progression Moyenne */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.red}>
            <TrendingUp size={36} color={colors.red} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.red,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.averageProgress}%
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Progression Moyenne
            </Typography>
          </StatCard>
        </Grid>

        {/* Total des Cours */}
        <Grid item xs={6} sm={4} md={3}>
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
              {dashboardData.stats.totalCourses}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Total des Cours
            </Typography>
          </StatCard>
        </Grid>

        {/* Cours Complétés */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.success}>
            <Award size={36} color={colors.success} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.success,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.completedCourses}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Cours Complétés
            </Typography>
          </StatCard>
        </Grid>

        {/* Total des Certificats */}
        <Grid item xs={6} sm={4} md={3}>
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
              {dashboardData.stats.totalCertificates}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Total Certificats
            </Typography>
          </StatCard>
        </Grid>

        {/* Taux de Réussite */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.info}>
            <BarChart3 size={36} color={colors.info} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.info,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {dashboardData.stats.completionRate}%
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Taux de Réussite
            </Typography>
          </StatCard>
        </Grid>

        {/* Temps d'Étude Total */}
        <Grid item xs={6} sm={4} md={3}>
          <StatCard color={colors.warning}>
            <Clock size={36} color={colors.warning} style={{ marginBottom: '16px' }} />
            <Typography
              sx={{
                color: colors.warning,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
              }}
            >
              {Math.round(dashboardData.stats.totalStudyTime / 60)}h
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
              }}
            >
              Temps d'Étude
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* CONTENU PRINCIPAL */}
      <Grid container spacing={{ xs: 3, sm: 4, md: 4 }}>
        {/* PROGRESSION GLOBALE */}
        <Grid item xs={12} lg={6}>
          <DashboardCard elevation={0}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography
                variant='h5'
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', sm: '1.6rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <TrendingUp size={28} color={colors.red} />
                Aperçu de la Progression
              </Typography>
              <Chip
                label={`${dashboardData.stats.averageProgress}% Moyenne`}
                sx={{
                  backgroundColor: `${colors.red}33`,
                  color: colors.red,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              />
            </Box>

            <LinearProgress
              variant='determinate'
              value={dashboardData.stats.averageProgress}
              sx={{
                height: 16,
                borderRadius: 8,
                backgroundColor: `${colors.red}33`,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  borderRadius: 8,
                  animation: `${pulseGlow} 2s infinite`,
                },
              }}
            />

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}
            >
              <Typography
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Progression globale sur {dashboardData.stats.totalCourses} cours
              </Typography>
              <Typography sx={{ color: colors.red, fontSize: '0.9rem', fontWeight: 700 }}>
                {dashboardData.stats.averageProgress}%
              </Typography>
            </Box>
          </DashboardCard>
        </Grid>

        {/* CERTIFICATS */}
        <Grid item xs={12} lg={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Award size={28} color={colors.pink} />
              Mes Certificats ({dashboardData.stats.totalCertificates})
            </Typography>

            <Stack spacing={2}>
              {dashboardData.certificates.length > 0 ? (
                dashboardData.certificates.map((cert) => (
                  <Box
                    key={cert._id}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
                      borderRadius: '12px',
                      p: 2.5,
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        background: `${colors.red}1a`,
                        borderColor: colors.red,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {cert.cours?.title || cert.title || 'Certificat de formation'}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        }}
                      >
                        Émis le{' '}
                        {new Date(cert.dateEmission).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>

                    <ActionButton
                      size='small'
                      disabled={downloadingId === cert._id}
                      onClick={() =>
                        handleDownloadCertificate(cert._id, cert.cours?.title || cert.title)
                      }
                      startIcon={
                        downloadingId === cert._id ? (
                          <CircularProgress size={16} sx={{ color: '#ffffff' }} />
                        ) : (
                          <Download size={16} />
                        )
                      }
                    >
                      {downloadingId === cert._id ? 'Télé...' : 'PDF'}
                    </ActionButton>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255, 255, 255, 0.5)' }}>
                  <Award size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                    Aucun certificat pour le moment
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    Complétez vos cours pour obtenir des certificats
                  </Typography>
                </Box>
              )}
            </Stack>
          </DashboardCard>
        </Grid>

        {/* COURS INSCRITS */}
        <Grid item xs={12}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <BookOpen size={28} color={colors.purple} />
              Mes Cours ({dashboardData.stats.totalCourses})
            </Typography>

            <Stack spacing={2.5}>
              {dashboardData.courses.length > 0 ? (
                dashboardData.courses.map((course, index) => (
                  <Box
                    key={course._id}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
                      borderRadius: '16px',
                      p: { xs: 2.5, sm: 3 },
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `${slideIn} 0.5s ease-out ${index * 0.1}s forwards`,
                      opacity: 0,
                      '&:hover': {
                        background: `${colors.red}1a`,
                        transform: 'translateY(-4px)',
                        borderColor: colors.red,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          fontWeight: 700,
                          flex: 1,
                          mr: 2,
                        }}
                      >
                        {course.title}
                      </Typography>

                      <Chip
                        label={`${course.progress || 0}%`}
                        sx={{
                          backgroundColor:
                            course.progress === 100 ? `${colors.success}33` : `${colors.red}33`,
                          color: course.progress === 100 ? colors.success : colors.red,
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          minWidth: '70px',
                        }}
                      />
                    </Box>

                    <LinearProgress
                      variant='determinate'
                      value={course.progress || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: `${colors.red}33`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                          borderRadius: 5,
                        },
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        {course.progress === 100
                          ? '🎉 Formation terminée !'
                          : '📚 En progression...'}
                      </Typography>

                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        Durée: {course.duree || 0} min
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 5, color: 'rgba(255, 255, 255, 0.5)' }}>
                  <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
                    Aucun cours inscrit pour le moment
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem' }}>
                    Explorez notre catalogue pour commencer votre apprentissage
                  </Typography>
                </Box>
              )}
            </Stack>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
