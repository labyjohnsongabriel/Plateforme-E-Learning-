import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Card, Fade } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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
  borderRadius: "16px",
  border: `1px solid ${colors.red}33`,
  padding: "16px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 8px 24px ${colors.navy}4d`,
  },
});

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:3001/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/courses/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Erreur lors du chargement des cours"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

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
          Mes Cours
        </Typography>
      </Fade>
      <Stack spacing={3}>
        {courses.length === 0 ? (
          <Typography
            sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1.1rem" }}
          >
            Aucun cours inscrit pour le moment.
          </Typography>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              elevation={0}
              onClick={() => navigate(`/learner/course-view/${course.id}`)}
            >
              <Typography
                sx={{
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "1.2rem",
                }}
              >
                {course.title}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.9rem",
                }}
              >
                Niveau: {course.level || "Non spécifié"}
              </Typography>
            </CourseCard>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default MyCourses;
