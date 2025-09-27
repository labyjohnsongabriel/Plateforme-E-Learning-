import { useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext"; // Updated to default import

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    user,
    login: contextLogin,
    logout: contextLogout,
    register: contextRegister,
    isLoading,
    error,
  } = context;

  const login = useCallback(
    async (email, password) => {
      try {
        const success = await contextLogin(email, password);
        return success;
      } catch (err) {
        console.error("Login failed:", err);
        throw err;
      }
    },
    [contextLogin]
  );

  const logout = useCallback(() => {
    contextLogout();
    // Additional cleanup if needed
  }, [contextLogout]);

  const register = useCallback(
    async (name, email, password) => {
      try {
        await contextRegister(name, email, password);
      } catch (err) {
        console.error("Registration failed:", err);
        throw err;
      }
    },
    [contextRegister]
  );

  return {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
};
