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
import { useAuth } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

// Role constants
const RoleUtilisateur = {
  ETUDIANT: "ETUDIANT",
  ENSEIGNANT: "ENSEIGNANT",
  ADMIN: "ADMIN",
};

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
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

const isTokenExpired = (token) => {
  try {
    if (!token || typeof token !== "string") {
      console.error("Invalid token format");
      return true;
    }
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Token decoding error:", error);
    return true;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    // Skip fetching for ETUDIANT role if backend restricts access
    if (!user?.token || isTokenExpired(user.token) || user.role === RoleUtilisateur.ETUDIANT) {
      if (user?.role === RoleUtilisateur.ETUDIANT) {
        console.log("Skipping notification fetch for ETUDIANT role due to restricted access");
        setNotifications([]);
        localStorage.setItem("notifications", JSON.stringify([]));
        setIsLoading(false);
        return;
      }
      console.error("Invalid or missing token");
      setError("Token d’authentification manquant, invalide ou expiré");
      navigate("/login");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching notifications with token:", user.token.substring(0, 10) + "...");
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
        params: { role: user.role },
      });
      console.log("Notifications response:", response.data, "Status:", response.status);
      if (response.headers["content-type"].includes("application/json")) {
        const fetchedNotifications = Array.isArray(response.data) ? response.data : [];
        setNotifications(fetchedNotifications);
        localStorage.setItem("notifications", JSON.stringify(fetchedNotifications));
      } else {
        throw new Error("Réponse serveur non-JSON");
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      let errorMessage;
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Session expirée, veuillez vous reconnecter";
            navigate("/login");
            break;
          case 403:
            errorMessage = "Accès aux notifications non autorisé pour ce rôle.";
            setNotifications([]);
            localStorage.setItem("notifications", JSON.stringify([]));
            break;
          case 404:
            errorMessage = "Service de notifications non disponible";
            break;
          default:
            errorMessage =
              err.response.data?.message ||
              "Erreur lors du chargement des notifications";
        }
      } else {
        errorMessage = "Impossible de se connecter au serveur";
      }
      setError(errorMessage);
      setNotifications([]);
      localStorage.setItem("notifications", JSON.stringify([]));
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, navigate, user]);

  useEffect(() => {
    if (user?.token && !isTokenExpired(user.token) && user.role !== RoleUtilisateur.ETUDIANT) {
      fetchNotifications();
      // Polling only for ADMIN role
      if (user?.role === RoleUtilisateur.ADMIN) {
        const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds for admins
        return () => clearInterval(interval);
      }
    } else {
      setNotifications([]);
      localStorage.setItem("notifications", JSON.stringify([]));
    }
  }, [user, fetchNotifications]);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const addNotification = useCallback(
    async (message, severity = "info", role = user?.role) => {
      if (!user?.token || isTokenExpired(user.token) || user.role === RoleUtilisateur.ETUDIANT) {
        console.error("Invalid or missing token or restricted role");
        setError("Action non autorisée pour ce rôle ou session invalide");
        if (user?.role !== RoleUtilisateur.ETUDIANT) {
          navigate("/login");
        }
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const newNotification = {
        message,
        severity,
        role,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        read: false,
      };
      try {
        setNotifications((prev) => {
          const updatedNotifications = [...prev, newNotification];
          localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
        const response = await axios.post(
          `${API_BASE_URL}/api/notifications`,
          newNotification,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Add notification response:", response.data);
        if (response.headers["content-type"].includes("application/json")) {
          setNotifications((prev) => {
            const updatedNotifications = prev.map((n) =>
              n.id === newNotification.id ? response.data : n
            );
            localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
            return updatedNotifications;
          });
        } else {
          throw new Error("Réponse serveur non-JSON");
        }
      } catch (err) {
        console.error("Add notification error:", err);
        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expirée, veuillez vous reconnecter";
              navigate("/login");
              break;
            case 403:
              errorMessage = "Accès non autorisé pour ajouter une notification";
              break;
            default:
              errorMessage =
                err.response.data?.message ||
                "Erreur lors de l'ajout de la notification";
          }
        } else {
          errorMessage = "Impossible de se connecter au serveur";
        }
        setError(errorMessage);
        if (err.response?.status !== 401) {
          setNotifications((prev) => {
            const updatedNotifications = prev.filter((n) => n.id !== newNotification.id);
            localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
            return updatedNotifications;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, user, navigate]
  );

  const markAsRead = useCallback(
    async (id) => {
      if (!user?.token || isTokenExpired(user.token) || user.role === RoleUtilisateur.ETUDIANT) {
        setError("Action non autorisée pour ce rôle ou session invalide");
        if (user?.role !== RoleUtilisateur.ETUDIANT) {
          navigate("/login");
        }
        return;
      }
      if (!/^[0-9a-fA-F]{24}$/.test(id) && !crypto.randomUUID().match(id)) {
        setError("ID de notification invalide");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        setNotifications((prev) => {
          const updatedNotifications = prev.map((n) =>
            n._id === id || n.id === id ? { ...n, read: true } : n
          );
          localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
        const response = await axios.put(
          `${API_BASE_URL}/api/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        console.log("Mark as read response:", response.data);
      } catch (err) {
        console.error("Mark as read error:", err);
        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expirée, veuillez vous reconnecter";
              navigate("/login");
              break;
            case 403:
              errorMessage = "Accès non autorisé pour modifier la notification";
              break;
            default:
              errorMessage =
                err.response.data?.message ||
                "Erreur lors de la mise à jour de la notification";
          }
        } else {
          errorMessage = "Impossible de se connecter au serveur";
        }
        setError(errorMessage);
        if (err.response?.status !== 401) {
          setNotifications((prev) => {
            const updatedNotifications = prev.map((n) =>
              n._id === id || n.id === id ? { ...n, read: false } : n
            );
            localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
            return updatedNotifications;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, user, navigate]
  );

  const markAllAsRead = useCallback(
    async () => {
      if (!user?.token || isTokenExpired(user.token) || user.role === RoleUtilisateur.ETUDIANT) {
        setError("Action non autorisée pour ce rôle ou session invalide");
        if (user?.role !== RoleUtilisateur.ETUDIANT) {
          navigate("/login");
        }
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        setNotifications((prev) => {
          const updatedNotifications = prev.map((n) => ({ ...n, read: true }));
          localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
        const response = await axios.put(
          `${API_BASE_URL}/api/notifications/read-all`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        console.log("Mark all as read response:", response.data);
      } catch (err) {
        console.error("Mark all as read error:", err);
        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expirée, veuillez vous reconnecter";
              navigate("/login");
              break;
            case 403:
              errorMessage = "Accès non autorisé pour modifier les notifications";
              break;
            default:
              errorMessage =
                err.response.data?.message ||
                "Erreur lors de la mise à jour des notifications";
          }
        } else {
          errorMessage = "Impossible de se connecter au serveur";
        }
        setError(errorMessage);
        if (err.response?.status !== 401) {
          setNotifications((prev) => {
            const updatedNotifications = prev.map((n) => ({ ...n, read: n.read }));
            localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
            return updatedNotifications;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, user, navigate]
  );

  const clearNotifications = useCallback(
    async () => {
      if (!user?.token || isTokenExpired(user.token) || user.role === RoleUtilisateur.ETUDIANT) {
        setError("Action non autorisée pour ce rôle ou session invalide");
        if (user?.role !== RoleUtilisateur.ETUDIANT) {
          navigate("/login");
        }
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        setNotifications([]);
        localStorage.removeItem("notifications");
        const response = await axios.delete(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log("Clear notifications response:", response.data);
      } catch (err) {
        console.error("Clear notifications error:", err);
        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expirée, veuillez vous reconnecter";
              navigate("/login");
              break;
            case 403:
              errorMessage = "Accès non autorisé pour supprimer les notifications";
              break;
            default:
              errorMessage =
                err.response.data?.message ||
                "Erreur lors de la suppression des notifications";
          }
        } else {
          errorMessage = "Impossible de se connecter au serveur";
        }
        setError(errorMessage);
        fetchNotifications();
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, user, navigate, fetchNotifications]
  );

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

  // Limit notifications to 3 for non-admin roles, show all for admins
  const maxNotifications = user?.role === RoleUtilisateur.ADMIN ? notifications.length : 3;
  const visibleNotifications = notifications.slice(0, maxNotifications);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {Array.isArray(visibleNotifications) &&
        visibleNotifications.map((notification) => (
          <Snackbar
            key={notification.id || notification._id}
            open
            autoHideDuration={6000}
            onClose={() => markAsRead(notification._id || notification.id)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => markAsRead(notification._id || notification.id)}
              severity={notification.severity}
              sx={{ width: "100%", maxWidth: "600px" }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      <Backdrop
        open={isLoading}
        sx={{
          zIndex: 9999,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(135deg, #010b40 0%, #1a237e 100%)",
        }}
      >
        <img
          src="/assets/images/Youth Computing.png" // Adjusted path for public assets
          alt="Youth Computing Logo"
          style={{ width: "100px", height: "100px", marginBottom: "20px" }}
        />
        <CircularProgress
          color="inherit"
          size={50}
          thickness={5}
          sx={{
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <Typography
          variant="h6"
          sx={{ mt: 2, fontFamily: "Ubuntu, sans-serif", fontWeight: 500 }}
        >
          Chargement des notifications...
        </Typography>
      </Backdrop>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%", maxWidth: "600px" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};