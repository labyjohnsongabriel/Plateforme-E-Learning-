import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, Fade } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import axios from "axios";
import { School as SchoolIcon } from "@mui/icons-material";

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Couleurs principales
const colors = {
  navy: "#010b40",
  lightNavy: "#1a237e",
  red: "#f13544",
  pink: "#ff6b74",
  purple: "#8b5cf6",
};

// Styled Components
const CourseCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  border: `1px solid ${colors.red}33`,
  padding: "24px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
});

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:3001/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Erreur lors du chargement du cours"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, token]);

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

  if (!course) return null;

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
          {course.title}
        </Typography>
      </Fade>
      <CourseCard elevation={0}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <SchoolIcon sx={{ color: colors.red, fontSize: "32px", mr: 2 }} />
          <Typography
            variant="h5"
            sx={{
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "1.5rem",
            }}
          >
            Détails du Cours
          </Typography>
        </Box>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "1.1rem",
            mb: 2,
            lineHeight: 1.6,
          }}
        >
          {course.description || "Aucune description disponible."}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "1rem",
            mb: 2,
          }}
        >
          Niveau: {course.level || "Non spécifié"}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "1rem",
            mb: 3,
          }}
        >
          Durée: {course.duration || "Non spécifiée"}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/learner/progress/${id}`)}
          sx={{
            background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
            borderRadius: "12px",
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            py: 1.5,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `0 8px 24px ${colors.red}4d`,
            },
          }}
        >
          Voir ma progression
        </Button>
      </CourseCard>
    </Box>
  );
};

export default CourseView;
