import React, { useState, useEffect } from "react";
import { Box, Typography, LinearProgress, Card, Fade } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
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
const ProgressCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  border: `1px solid ${colors.red}33`,
  padding: "24px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 8px 24px ${colors.navy}4d`,
  },
});

const Progress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:3000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/users/${user.id}/progress`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProgress(response.data.progress || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors du chargement de la progression"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
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
          Ma Progression
        </Typography>
      </Fade>
      <ProgressCard elevation={0}>
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
          Complété : {progress}%
        </Typography>
      </ProgressCard>
    </Box>
  );
};

export default Progress;
