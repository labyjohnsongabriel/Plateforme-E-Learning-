// src/components/admin/EditCourse.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Alert,
  ThemeProvider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { colors } from "../../utils/colors";


const EditCourseContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100vw",
  background: `linear-gradient(135deg, ${colors.navy || "#010b40"}, ${
    colors.lightNavy || "#1a237e"
  })`,
  padding: theme.spacing(4),
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
}));

const EditCourse = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const { coursId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") {
      setError("Accès non autorisé.");
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/courses/${coursId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFormData({
          title: response.data.title || "",
          description: response.data.description || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors de la récupération des données"
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') {
      fetchCourse();
    }
  }, [user, coursId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/courses/${coursId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess("Cours mis à jour avec succès");
      setTimeout(() => navigate("/admin/courses"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la mise à jour du cours"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          bgcolor: colors.navy || "#010b40",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: colors.white || "#ffffff",
          }}
        >
          <CircularProgress
            sx={{ color: colors.fuschia || "#f13544" }}
            size={32}
          />
          <Typography variant="h5">Chargement...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <EditCourseContainer>
        <Container maxWidth="sm">
          <Box
            sx={{
              bgcolor: `${colors.navy || "#010b40"}cc`,
              p: 4,
              borderRadius: 2,
              mt: 4,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: colors.white || "#ffffff",
                mb: 3,
                textAlign: "center",
              }}
            >
              Modifier un Cours
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                label="Titre"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
                sx={{ mb: 3 }}
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  background: colors.fuschia || "#f13544",
                  "&:hover": { background: colors.lightFuschia || "#ff6b74" },
                }}
                fullWidth
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </form>
          </Box>
        </Container>
      </EditCourseContainer>
    </ThemeProvider>
  );
};

export default EditCourse;
