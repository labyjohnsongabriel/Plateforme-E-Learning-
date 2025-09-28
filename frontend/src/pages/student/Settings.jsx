import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Card,
  Fade,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Save as SaveIcon } from "@mui/icons-material";

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
const SettingsCard = styled(Card)({
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

const StyledCheckbox = styled(Checkbox)({
  color: "rgba(255, 255, 255, 0.7)",
  "&.Mui-checked": {
    color: colors.red,
  },
});

const Settings = () => {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL = "http://localhost:3000/api";
  const token = localStorage.getItem("token");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(
        `${API_BASE_URL}/users/settings`,
        { notificationsEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Paramètres sauvegardés avec succès");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la sauvegarde des paramètres"
      );
    } finally {
      setLoading(false);
    }
  };

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
          Paramètres
        </Typography>
      </Fade>
      <SettingsCard elevation={0}>
        {error && (
          <Typography sx={{ color: colors.red, mb: 2, fontSize: "1rem" }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography sx={{ color: colors.purple, mb: 2, fontSize: "1rem" }}>
            {success}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControlLabel
            control={
              <StyledCheckbox
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              />
            }
            label={
              <Typography sx={{ color: "#ffffff", fontSize: "1.1rem" }}>
                Activer les notifications
              </Typography>
            }
          />
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
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
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </Box>
      </SettingsCard>
    </Box>
  );
};

export default Settings;
