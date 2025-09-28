// src/context/NotificationContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const NotificationContext = createContext({
  notifications: [],
  fetchNotifications: async () => {},
  addNotification: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotifications: async () => {},
  unreadCount: 0,
  isLoading: false,
  error: null,
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const navigate = useNavigate();

  // Calculate unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications from localStorage or API on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (err) {
        console.error("Failed to parse stored notifications:", err);
        localStorage.removeItem("notifications");
      }
    }
    fetchNotifications();
  }, []);

  /**
   * Fetch notifications from the API
   */
  const fetchNotifications = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const token = storedUser ? JSON.parse(storedUser).token : null;
    if (!token) {
      return; // Skip fetching if no token
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data || [];
      setNotifications(data);
      localStorage.setItem("notifications", JSON.stringify(data));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors du chargement des notifications";
      setError(errorMessage);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  /**
   * Add a new notification
   */
  const addNotification = useCallback(
    async (message, severity = "info") => {
      setIsLoading(true);
      setError(null);
      const newNotification = {
        message,
        severity,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      try {
        setNotifications((prev) => {
          const updatedNotifications = [...prev, newNotification];
          localStorage.setItem(
            "notifications",
            JSON.stringify(updatedNotifications)
          );
          return updatedNotifications;
        });

        const storedUser = localStorage.getItem("user");
        const token = storedUser ? JSON.parse(storedUser).token : null;
        if (token) {
          const response = await axios.post(
            `${API_BASE_URL}/api/notifications`,
            newNotification,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const savedNotification = response.data;
          setNotifications((prev) => {
            const updatedNotifications = prev.map((n) =>
              n.id === newNotification.id ? savedNotification : n
            );
            localStorage.setItem(
              "notifications",
              JSON.stringify(updatedNotifications)
            );
            return updatedNotifications;
          });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Erreur lors de l'ajout de la notification";
        setError(errorMessage);
        if (err.response?.status !== 401) {
          // Only rollback if not a 401 error (unauthenticated users skip API call)
          setNotifications((prev) => {
            const updatedNotifications = prev.filter(
              (n) => n.id !== newNotification.id
            );
            localStorage.setItem(
              "notifications",
              JSON.stringify(updatedNotifications)
            );
            return updatedNotifications;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL]
  );

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        setNotifications((prev) => {
          const updatedNotifications = prev.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          localStorage.setItem(
            "notifications",
            JSON.stringify(updatedNotifications)
          );
          return updatedNotifications;
        });

        const storedUser = localStorage.getItem("user");
        const token = storedUser ? JSON.parse(storedUser).token : null;
        if (token) {
          await axios.patch(
            `${API_BASE_URL}/api/notifications/${id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Erreur lors de la mise à jour de la notification";
        setError(errorMessage);
        if (err.response?.status !== 401) {
          setNotifications((prev) => {
            const updatedNotifications = prev.map((n) =>
              n.id === id ? { ...n, isRead: false } : n
            );
            localStorage.setItem(
              "notifications",
              JSON.stringify(updatedNotifications)
            );
            return updatedNotifications;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) => ({ ...n, isRead: true }));
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });

      const storedUser = localStorage.getItem("user");
      const token = storedUser ? JSON.parse(storedUser).token : null;
      if (token) {
        await axios.patch(
          `${API_BASE_URL}/api/notifications/read-all`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors de la mise à jour des notifications";
      setError(errorMessage);
      if (err.response?.status !== 401) {
        setNotifications((prev) => {
          const updatedNotifications = prev.map((n) => ({
            ...n,
            isRead: n.isRead,
          }));
          localStorage.setItem(
            "notifications",
            JSON.stringify(updatedNotifications)
          );
          return updatedNotifications;
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications([]);
      localStorage.removeItem("notifications");

      const storedUser = localStorage.getItem("user");
      const token = storedUser ? JSON.parse(storedUser).token : null;
      if (token) {
        await axios.delete(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors de la suppression des notifications";
      setError(errorMessage);
      fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications, API_BASE_URL]);

  const contextValue = {
    notifications,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
    isLoading,
    error,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Backdrop
        open={isLoading}
        sx={{
          zIndex: 9999,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" size={40} />
        <Typography
          variant="h6"
          sx={{ mt: 2, fontFamily: "Ubuntu, sans-serif" }}
        >
          Chargement des notifications...
        </Typography>
      </Backdrop>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
