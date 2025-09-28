import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Mail,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { colors } from "../../utils/colors";

const SystemSettings = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [settings, setSettings] = useState({
    platformName: "EduPlatform",
    contactEmail: "admin@eduplatform.com",
    maintenanceMode: false,
    notifications: {
      newUsers: true,
      newCourses: true,
      certificates: true,
      reports: false,
    },
    security: {
      sessionDuration: 120,
      twoFactorAuth: true,
      advancedLogging: true,
    },
  });
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      addNotification("Paramètres enregistrés avec succès", "success");
    } catch (err) {
      addNotification(
        "Erreur lors de l’enregistrement des paramètres",
        "error"
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Paramètres Système
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, bgcolor: "#ffffff", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Paramètres Généraux
            </Typography>
            <TextField
              label="Nom de la Plateforme"
              fullWidth
              value={settings.platformName}
              onChange={(e) =>
                setSettings({ ...settings, platformName: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email de Contact"
              type="email"
              fullWidth
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                />
              }
              label="Mode Maintenance"
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, bgcolor: "#ffffff", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.notifications.newUsers}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        newUsers: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Nouvelles inscriptions"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.notifications.newCourses}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        newCourses: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Nouveaux cours"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.notifications.certificates}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        certificates: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Certificats délivrés"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.notifications.reports}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        reports: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Rapports système"
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, bgcolor: "#ffffff", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sécurité
            </Typography>
            <TextField
              label="Durée de session (minutes)"
              type="number"
              fullWidth
              value={settings.security.sessionDuration}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    sessionDuration: e.target.value,
                  },
                })
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        twoFactorAuth: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Authentification à deux facteurs"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.security.advancedLogging}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        advancedLogging: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Journalisation avancée"
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, bgcolor: "#ffffff", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              État du Système
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography>Base de données</Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "green.600",
                }}
              >
                <CheckCircle fontSize="small" />
                <Typography>Opérationnelle</Typography>
              </Box>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography>Services de mail</Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "green.600",
                }}
              >
                <CheckCircle fontSize="small" />
                <Typography>Opérationnels</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Stockage</Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "yellow.600",
                }}
              >
                <Warning fontSize="small" />
                <Typography>85% utilisé</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Enregistrer les Paramètres
        </Button>
      </Box>
    </Box>
  );
};

export default SystemSettings;
