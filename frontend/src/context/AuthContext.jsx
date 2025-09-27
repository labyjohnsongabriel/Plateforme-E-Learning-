// src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Backdrop,
  CircularProgress,
  Alert,
  Snackbar,
  Typography,
} from "@mui/material";

/**
 * AuthContext for managing user authentication state
 * @type {Object}
 * @property {Object|null} user - The authenticated user object with id, email, firstName, lastName, role, token, and optional level
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  /**
   * Handle user login
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Identifiants incorrects");
        }

        const data = await response.json();
        const userData = {
          id: data.id,
          email: data.email,
          firstName: data.firstName || data.name.split(" ")[0] || data.name, // Extract firstName
          lastName:
            data.lastName || data.name.split(" ").slice(1).join(" ") || "", // Extract lastName
          role: data.role,
          token: data.token,
          level: data.level || "beta",
        };

        // Optimistic update
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate(`/${data.role}/dashboard`, { replace: true });
      } catch (err) {
        setError(err.message || "Erreur de connexion");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Handle user registration
   * @param {string} name - User's full name
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const register = useCallback(
    async (name, email, password) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erreur lors de l'inscription");
        }

        navigate("/login", { replace: true });
      } catch (err) {
        setError(err.message || "Erreur serveur");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Handle user logout
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }, [navigate]);

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
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};
