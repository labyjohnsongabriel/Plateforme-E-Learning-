import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, Stack, LinearProgress, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Couleurs principales
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

// Styled Components
const DashboardCard = styled(Card)({
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
});

const Dashboard = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:3000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch progress
        const progressResponse = await axios.get(
          `${API_BASE_URL}/users/${user.id}/progress`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProgress(progressResponse.data.progress || 0);

        // Fetch certificates
        const certificatesResponse = await axios.get(
          `${API_BASE_URL}/users/${user.id}/certificats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCertificates(certificatesResponse.data);

        // Fetch enrolled courses
        const coursesResponse = await axios.get(
          `${API_BASE_URL}/courses/my-courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourses(coursesResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Erreur lors du chargement des données"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id, token]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography sx={{ color: "#ffffff", fontSize: "1.2rem" }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography sx={{ color: colors.red, fontSize: "1.2rem" }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh" }}>
      <Fade in timeout={800}>
        <Typography
          variant="h4"
          sx={{
            color: "#ffffff",
            fontWeight: 700,
            mb: 4,
            fontSize: { xs: "1.8rem", sm: "2.2rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Bienvenue, {user?.prenom || "Étudiant"} !
        </Typography>
      </Fade>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant="h5"
              sx={{
                color: "#ffffff",
                fontWeight: 600,
                mb: 2,
                fontSize: "1.5rem",
              }}
            >
              Progression Globale
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: `${colors.red}33`,
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                },
              }}
            />
            <Typography
              sx={{
                color: "#ffffff",
                mt: 1,
                fontSize: "1.1rem",
                textAlign: "right",
              }}
            >
              {progress}% complété
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardCard elevation={0}>
            <Typography
              variant="h5"
              sx={{
                color: "#ffffff",
                fontWeight: 600,
                mb: 2,
                fontSize: "1.5rem",
              }}
            >
              Certificats Obtenus
            </Typography>
            <Stack spacing={2}>
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <Box
                    key={cert.id}
                    sx={{
                      backgroundColor: `${colors.navy}33`,
                      borderRadius: "12px",
                      p: 2,
                      border: `1px solid ${colors.red}33`,
                    }}
                  >
                    <Typography sx={{ color: "#ffffff", fontSize: "1rem" }}>
                      {cert.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Obtenu le {new Date(cert.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1rem" }}
                >
                  Aucun certificat pour le moment.
                </Typography>
              )}
            </Stack>
          </DashboardCard>
        </Grid>
        <Grid item xs={12}>
          <DashboardCard elevation={0}>
            <Typography
              variant="h5"
              sx={{
                color: "#ffffff",
                fontWeight: 600,
                mb: 2,
                fontSize: "1.5rem",
              }}
            >
              Mes Cours Inscrits
            </Typography>
            <Stack spacing={2}>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Box
                    key={course.id}
                    sx={{
                      backgroundColor: `${colors.navy}33`,
                      borderRadius: "12px",
                      p: 2,
                      border: `1px solid ${colors.red}33`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: `${colors.red}1a`,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Typography sx={{ color: "#ffffff", fontSize: "1rem" }}>
                      {course.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Progression: {course.progress || 0}%
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1rem" }}
                >
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