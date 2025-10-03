// src/components/admin/AddCourse.jsx
import React, { useState, useContext } from "react";
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
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { colors } from "../../utils/colors";
import { theme } from "../../theme";

const AddCourseContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100vw",
  background: `linear-gradient(135deg, ${colors.navy || "#010b40"}, ${
    colors.lightNavy || "#1a237e"
  })`,
  padding: theme.spacing(4),
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
}));

const AddCourse = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") {
      setError("Accès non autorisé.");
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/courses`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess("Cours créé avec succès");
      setTimeout(() => navigate("/admin/courses"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la création du cours"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AddCourseContainer>
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
              Ajouter un Cours
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
                {isSubmitting ? <CircularProgress size={24} /> : "Créer"}
              </Button>
            </form>
          </Box>
        </Container>
      </AddCourseContainer>
    </ThemeProvider>
  );
};

export default AddCourse;
