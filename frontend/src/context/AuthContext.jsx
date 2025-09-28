import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { Backdrop, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { useNotifications } from "./NotificationContext";
import { useNavigate } from "react-router-dom";

/**
 * AuthContext for managing user authentication state
 * @type {Object}
 * @property {Object|null} user - The authenticated user object with id, prenom, nom, email, role, token
 * @property {Function} login - Function to log in a user
 * @property {Function} logout - Function to log out a user
 * @property {Function} register - Function to register a new user
 * @property {boolean} isAuthenticated - Whether a user is authenticated
 * @property {boolean} isLoading - Whether an auth operation is in progress
 * @property {string|null} error - Error message, if any
 */
export const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  isAuthenticated: false,
  isLoading: false,
  error: null,
});

/**
 * Custom hook to access AuthContext
 * @returns {Object} AuthContext value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider component to wrap the application and provide auth context
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check stored user
  const [error, setError] = useState(null);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Initialize user from localStorage and verify token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Verify token with the backend
          const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${userData.token}` },
          });
          setUser({ ...response.data, token: userData.token });
        } catch (err) {
          console.error("Failed to verify user:", err);
          localStorage.removeItem("user");
          setUser(null);
          addNotification(
            "Session invalide, veuillez vous reconnecter.",
            "error"
          );
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [addNotification, API_BASE_URL]);

  /**
   * Handle user login
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {boolean} rememberMe - Whether to remember the user
   */
  const login = useCallback(
    async (email, password, rememberMe) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email,
          password,
          rememberMe,
        });
        const { token, user: userData } = response.data;
        const formattedUser = {
          id: userData._id,
          prenom: userData.prenom || userData.name?.split(" ")[0] || "Étudiant",
          nom:
            userData.nom || userData.name?.split(" ").slice(1).join(" ") || "",
          email: userData.email,
          role: userData.role,
          token,
        };
        setUser(formattedUser);
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(formattedUser));
        }
        addNotification("Connexion réussie", "success");
        return formattedUser;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Erreur de connexion";
        setError(errorMessage);
        addNotification(errorMessage, "error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, API_BASE_URL]
  );

  /**
   * Handle user registration
   * @param {string} nom - User's last name
   * @param {string} prenom - User's first name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {boolean} rememberMe - Whether to remember the user
   */
  const register = useCallback(
    async (nom, prenom, email, password, rememberMe) => {
      setIsLoading(true);
      setError(null);
      try {
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          nom,
          prenom,
          email,
          password,
          rememberMe,
        });
        addNotification("Inscription réussie", "success");
        return true;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Erreur lors de l'inscription";
        setError(errorMessage);
        addNotification(errorMessage, "error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, API_BASE_URL]
  );

  /**
   * Handle user logout
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    addNotification("Déconnexion réussie", "success");
    navigate("/login");
  }, [navigate, addNotification]);

  const contextValue = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
          Chargement...
        </Typography>
      </Backdrop>
    </AuthContext.Provider>
  );
};
