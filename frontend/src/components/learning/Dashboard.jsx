// Corrected Dashboard.jsx - Fixed API URLs, improved error handling, made full screen, professional UI adjustments, fixed certificate and course titles.

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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Download, Award, BookOpen, TrendingUp } from 'lucide-react';
import axios from 'axios';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Palette de couleurs
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  darkBg: '#0a0e27',
  success: '#10b981',
};

// Styled Components
const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
    borderColor: `${colors.red}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '8px 16px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${colors.red}4d`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

const StatCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.purple}1a, ${colors.red}1a)`,
  borderRadius: '12px',
  padding: theme.spacing(2.5),
  border: `1px solid ${colors.purple}33`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: `${colors.purple}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [invalidEnrollments, setInvalidEnrollments] = useState(0);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalCertificates: 0,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Base API

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [getAuthToken]);

  const isValidObjectId = (id) => {
    return id && /^[0-9a-fA-F]{24}$/.test(id);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setInvalidEnrollments(0);

      const token = getAuthToken();
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }

      const headers = getAuthHeaders();

      // Récupérer l'utilisateur actuel
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers });
      setUser(userResponse.data);

      // Récupérer les inscriptions (corrected to /learning/enrollments)
      const enrollmentsResponse = await axios.get(`${API_BASE_URL}/learning/enrollments`, {
        headers,
      });
      const enrolledCourses = Array.isArray(enrollmentsResponse.data?.data)
        ? enrollmentsResponse.data.data
        : enrollmentsResponse.data || [];

      // Filtrer les inscriptions valides
      const validEnrollments = enrolledCourses.filter((enrollment) => {
        const coursId = enrollment.cours?._id || enrollment.cours;
        if (!isValidObjectId(coursId)) {
          console.warn(`Inscription ignorée - cours invalide: ${coursId}`, enrollment);
          setInvalidEnrollments((prev) => prev + 1);
          return false;
        }
        return true;
      });

      // Récupérer la progression pour chaque cours
      const progressPromises = validEnrollments.map(async (enrollment) => {
        const coursId = enrollment.cours?._id || enrollment.cours;
        try {
          const progressResponse = await axios.get(`${API_BASE_URL}/learning/progress/${coursId}`, {
            headers,
          });
          return {
            ...enrollment,
            progress: progressResponse.data.data?.pourcentage || 0,
            title: enrollment.cours?.titre || enrollment.cours?.title || 'Cours sans titre', // Fixed title
            _id: enrollment._id,
          };
        } catch (err) {
          console.warn(`Erreur récupération progression pour cours ${coursId}:`, err.message);
          return {
            ...enrollment,
            progress: 0,
            title: enrollment.cours?.titre || enrollment.cours?.title || 'Cours sans titre',
            _id: enrollment._id,
          };
        }
      });

      const coursesWithProgress = await Promise.all(progressPromises);

      // Calculer les statistiques
      const totalProgress =
        coursesWithProgress.length > 0
          ? Math.round(
              coursesWithProgress.reduce((sum, course) => sum + course.progress, 0) /
                coursesWithProgress.length
            )
          : 0;

      const completedCount = coursesWithProgress.filter((c) => c.progress === 100).length;

      setProgress(totalProgress);
      setCourses(coursesWithProgress);
      setStats({
        totalCourses: coursesWithProgress.length,
        completedCourses: completedCount,
        totalCertificates: 0,
      });

      // Récupérer les certificats
      const certificatesResponse = await axios.get(`${API_BASE_URL}/learning/certificates`, {
        headers,
      });
      const certs = Array.isArray(certificatesResponse.data?.data)
        ? certificatesResponse.data.data
        : Array.isArray(certificatesResponse.data)
          ? certificatesResponse.data
          : [];

      setCertificates(certs);
      setStats((prev) => ({ ...prev, totalCertificates: certs.length }));

      // Log des cours et certificats
      console.log(
        'Cours inscrits:',
        coursesWithProgress.map((course) => course.title)
      );
      console.log(
        'Certificats obtenus:',
        certs.map(
          (cert) => cert.cours?.titre || cert.cours?.title || cert.title || 'Certificat sans titre'
        )
      );
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken, getAuthHeaders]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement certificat:', err);
      setError('Erreur lors du téléchargement du certificat');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: colors.navy,
          animation: `${fadeInUp} 0.5s ease-out`,
        }}
      >
        <CircularProgress sx={{ color: colors.red }} size={60} />
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1rem', sm: '1.2rem' },
            fontWeight: 500,
            mt: 2,
          }}
        >
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: colors.navy,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      {/* Alerte pour inscriptions invalides */}
      {invalidEnrollments > 0 && (
        <Alert
          severity='warning'
          sx={{
            mb: 2,
            bgcolor: `${colors.red}1a`,
            color: colors.red,
            borderRadius: '12px',
            '& .MuiAlert-icon': { color: colors.red },
          }}
          onClose={() => setInvalidEnrollments(0)}
        >
          {invalidEnrollments} inscription(s) ignorée(s) en raison de données de cours invalides.
          Contactez l'administrateur.
        </Alert>
      )}
      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 2,
            bgcolor: `${colors.red}1a`,
            color: colors.red,
            borderRadius: '12px',
            '& .MuiAlert-icon': { color: colors.red },
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant='h3'
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            Bienvenue, {user?.prenom || 'Étudiant'} 👋
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Suivez votre progression d'apprentissage
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard>
            <TrendingUp size={32} color={colors.red} style={{ marginBottom: '12px' }} />
            <Typography
              sx={{ color: colors.red, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.8rem' } }}
            >
              {progress}%
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 1,
              }}
            >
              Progression globale
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={3}>
          <StatCard>
            <BookOpen size={32} color={colors.purple} style={{ marginBottom: '12px' }} />
            <Typography
              sx={{
                color: colors.purple,
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
              }}
            >
              {stats.totalCourses}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 1,
              }}
            >
              Cours inscrits
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={3}>
          <StatCard>
            <Award size={32} color={colors.success} style={{ marginBottom: '12px' }} />
            <Typography
              sx={{
                color: colors.success,
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
              }}
            >
              {stats.completedCourses}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 1,
              }}
            >
              Cours complétés
            </Typography>
          </StatCard>
        </Grid>

        <Grid item xs={6} sm={4} md={3}>
          <StatCard>
            <Award size={32} color={colors.pink} style={{ marginBottom: '12px' }} />
            <Typography
              sx={{ color: colors.pink, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.8rem' } }}
            >
              {stats.totalCertificates}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 1,
              }}
            >
              Certificats
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        <Grid item xs={12} md={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 3,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TrendingUp size={24} color={colors.red} />
              Progression Globale
            </Typography>
            <LinearProgress
              variant='determinate'
              value={progress}
              sx={{
                height: 14,
                borderRadius: 6,
                backgroundColor: `${colors.red}33`,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  borderRadius: 6,
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.9rem', sm: '0.95rem' },
                }}
              >
                {progress}% complété
              </Typography>
              <Chip
                label={progress === 100 ? '✓ Terminé' : 'En cours'}
                sx={{
                  backgroundColor: progress === 100 ? `${colors.success}33` : `${colors.red}33`,
                  color: progress === 100 ? colors.success : colors.red,
                  fontWeight: 600,
                }}
              />
            </Box>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 3,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Award size={24} color={colors.pink} />
              Certificats Obtenus ({certificates.length})
            </Typography>
            <Stack spacing={2}>
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <Box
                    key={cert._id}
                    sx={{
                      backgroundColor: `${colors.navy}33`,
                      borderRadius: '12px',
                      p: 2,
                      border: `1px solid ${colors.red}33`,
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: `${colors.red}1a`,
                        borderColor: colors.red,
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          fontWeight: 500,
                        }}
                      >
                        {cert.cours?.titre ||
                          cert.cours?.title ||
                          cert.title ||
                          'Certificat sans titre'}{' '}
                        // Fixed
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: { xs: '0.8rem', sm: '0.85rem' },
                          mt: 0.5,
                        }}
                      >
                        {new Date(cert.dateEmission).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>
                    <StyledButton
                      size='small'
                      disabled={downloadingId === cert._id}
                      onClick={() =>
                        handleDownloadCertificate(
                          cert._id,
                          cert.cours?.titre || cert.cours?.title || cert.title
                        )
                      }
                      startIcon={
                        downloadingId === cert._id ? (
                          <CircularProgress size={16} sx={{ color: '#ffffff' }} />
                        ) : (
                          <Download size={16} />
                        )
                      }
                    >
                      {downloadingId === cert._id ? 'Téléchargement...' : 'Télécharger'}
                    </StyledButton>
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 3,
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <Award size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    Aucun certificat pour le moment.
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, mt: 1 }}>
                    Complétez vos cours pour obtenir des certificats
                  </Typography>
                </Box>
              )}
            </Stack>
          </DashboardCard>
        </Grid>

        <Grid item xs={12}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 3,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <BookOpen size={24} color={colors.purple} />
              Mes Cours Inscrits ({courses.length})
            </Typography>
            <Stack spacing={2}>
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <Box
                    key={course._id}
                    sx={{
                      backgroundColor: `${colors.navy}33`,
                      borderRadius: '12px',
                      p: { xs: 2, sm: 2.5 },
                      border: `1px solid ${colors.red}33`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `${slideIn} 0.5s ease-out ${index * 0.1}s forwards`,
                      opacity: 0,
                      '&:hover': {
                        backgroundColor: `${colors.red}1a`,
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
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          fontWeight: 600,
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
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={course.progress || 0}
                      sx={{
                        height: 8,
                        borderRadius: 3,
                        backgroundColor: `${colors.red}33`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        }}
                      >
                        {course.progress === 100 ? '✓ Complété' : 'En cours'}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    Aucun cours inscrit pour le moment.
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
