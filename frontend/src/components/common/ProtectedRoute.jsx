import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  isAuthenticated: false,
  isLoading: false,
  error: null,
});

// Custom hook to use the AuthContext
export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          throw new Error("Identifiants incorrects");
        }

        const data = await response.json();
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          token: data.token,
          level: data.level || "beta",
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate(`/${data.role}/dashboard`);
      } catch (err) {
        setError(err.message || "Erreur de connexion");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

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
          throw new Error("Erreur lors de l'inscription");
        }

        navigate("/login");
      } catch (err) {
        setError(err.message || "Erreur serveur");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
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
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: theme.palette.primary.main + "90",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress
              size={40}
              thickness={4}
              sx={{ color: theme.palette.secondary.main, mb: 2 }}
            />
            <Typography variant="h6" color="white">
              Chargement...
            </Typography>
          </Box>
        </Box>
      )}
      {error && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            backgroundColor: theme.palette.error.main,
            color: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
