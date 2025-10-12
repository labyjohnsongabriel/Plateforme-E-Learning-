import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';

// Animation
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Couleurs
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

// Styled Card
const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${colors.red}33`,
  padding: '24px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  },
}));

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer le token du localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Veuillez vous connecter pour accéder au tableau de bord');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Récupérer l'utilisateur actuel
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers });
        setUser(userResponse.data);

        // Récupérer les inscriptions - IMPORTANT: route corrigée
        const enrollmentsResponse = await axios.get(`${API_BASE_URL}/learning/enrollments`, {
          headers,
        });
        const enrolledCourses = Array.isArray(enrollmentsResponse.data)
          ? enrollmentsResponse.data
          : [];

        // Récupérer la progression pour chaque cours
        const progressPromises = enrolledCourses.map(async (enrollment) => {
          try {
            const progressResponse = await axios.get(
              `${API_BASE_URL}/learning/progress/${enrollment.coursId}`,
              { headers }
            );
            return {
              ...enrollment,
              progress: progressResponse.data.pourcentage || 0,
              title: enrollment.coursId?.titre || 'Cours sans titre',
              _id: enrollment._id,
            };
          } catch (err) {
            console.error(
              `Erreur lors de la récupération de la progression pour ${enrollment.coursId}:`,
              err.message
            );
            return {
              ...enrollment,
              progress: 0,
              title: enrollment.coursId?.titre || 'Cours sans titre',
              _id: enrollment._id,
            };
          }
        });

        const coursesWithProgress = await Promise.all(progressPromises);

        // Calculer la progression globale
        const totalProgress =
          coursesWithProgress.length > 0
            ? Math.round(
                coursesWithProgress.reduce((sum, course) => sum + course.progress, 0) /
                  coursesWithProgress.length
              )
            : 0;

        setProgress(totalProgress);
        setCourses(coursesWithProgress);

        // Récupérer les certificats
        const certificatesResponse = await axios.get(`${API_BASE_URL}/learning/certificates`, {
          headers,
        });
        setCertificates(Array.isArray(certificatesResponse.data) ? certificatesResponse.data : []);
      } catch (err) {
        console.error('Erreur lors du chargement du tableau de bord:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Erreur lors du chargement des données du tableau de bord'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: colors.navy,
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: colors.red }} />
        <Typography sx={{ color: '#ffffff', fontSize: '1.2rem' }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh', bgcolor: colors.navy }}>
        <Alert severity='error' sx={{ bgcolor: `${colors.red}1a`, color: colors.red }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh', bgcolor: colors.navy }}>
      <Fade in timeout={800}>
        <Typography
          variant='h4'
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            mb: 4,
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          Bienvenue, {user?.prenom || 'Étudiant'} !
        </Typography>
      </Fade>

      <Grid container spacing={4}>
        {/* Progression Globale */}
        <Grid item xs={12} md={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem',
              }}
            >
              Progression Globale
            </Typography>
            <LinearProgress
              variant='determinate'
              value={progress}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: `${colors.red}33`,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                },
              }}
            />
            <Typography
              sx={{
                color: '#ffffff',
                mt: 2,
                fontSize: '1.1rem',
                textAlign: 'right',
              }}
            >
              {progress}% complété
            </Typography>
          </DashboardCard>
        </Grid>

        {/* Certificats Obtenus */}
        <Grid item xs={12} md={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem',
              }}
            >
              Certificats Obtenus
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
                      '&:hover': {
                        backgroundColor: `${colors.red}1a`,
                        borderColor: colors.red,
                      },
                    }}
                  >
                    <Typography sx={{ color: '#ffffff', fontSize: '1rem', fontWeight: 500 }}>
                      {cert.title || 'Certificat sans titre'}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        mt: 0.5,
                      }}
                    >
                      Obtenu le {new Date(cert.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
                  Aucun certificat pour le moment.
                </Typography>
              )}
            </Stack>
          </DashboardCard>
        </Grid>

        {/* Mes Cours Inscrits */}
        <Grid item xs={12}>
          <DashboardCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 2,
                fontSize: '1.5rem',
              }}
            >
              Mes Cours Inscrits
            </Typography>
            <Stack spacing={2}>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Box
                    key={course._id}
                    sx={{
                      backgroundColor: `${colors.navy}33`,
                      borderRadius: '12px',
                      p: 2,
                      border: `1px solid ${colors.red}33`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                        mb: 1,
                      }}
                    >
                      <Typography sx={{ color: '#ffffff', fontSize: '1rem', fontWeight: 500 }}>
                        {course.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.red,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                        }}
                      >
                        {course.progress || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={course.progress || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: `${colors.red}33`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
                        },
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
                  Aucun cours inscrit pour le moment.
                </Typography>
              )}
            </Stack>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
