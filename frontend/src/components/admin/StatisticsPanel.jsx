// src/pages/admin/StatisticsPanel.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CircularProgress } from "@mui/material";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { colors } from "../../utils/colors";

const StatisticsPanel = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setStats(response.data);
      } catch (err) {
        addNotification("Erreur lors du chargement des statistiques", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, addNotification]);

  return (
    <Card sx={{ bgcolor: colors.globalGradientLight, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Statistiques
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : stats ? (
        <Box>
          <Typography>Cours inscrits: {stats.courseCount}</Typography>
          <Typography>Progression moyenne: {stats.averageProgress}%</Typography>
          <Typography>Certificats obtenus: {stats.certificateCount}</Typography>
        </Box>
      ) : (
        <Typography>Aucune statistique disponible</Typography>
      )}
    </Card>
  );
};

export default StatisticsPanel;
