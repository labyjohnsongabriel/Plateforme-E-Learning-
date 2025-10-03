import React, { createContext, useState, useContext } from "react";
import { createTheme } from "@mui/material/styles"; // Assuming MUI integration

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * ThemeProvider component to manage theme state and provide MUI-compatible themes
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  // Define theme configurations for light and dark modes
  const getTheme = (mode) => {
    return createTheme({
      palette: {
        mode,
        ...(mode === "light"
          ? {
              primary: { main: "#010b40" },
              secondary: { main: "#f13544" },
              background: { default: "#fafafa", paper: "#ffffff" },
              text: { primary: "#010b40", secondary: "#808080" },
            }
          : {
              primary: { main: "#bbdefb" },
              secondary: { main: "#ff8a80" },
              background: { default: "#1a237e", paper: "#121f4a" },
              text: { primary: "#ffffff", secondary: "#bbbbbb" },
            }),
      },
      typography: {
        fontFamily: 'Ubuntu, "Century Gothic", "Roboto", sans-serif',
      },
    });
  };

  const theme = getTheme(mode);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Fallback to light theme if mode is invalid
  if (!["light", "dark"].includes(mode)) {
    console.warn(`Invalid theme mode "${mode}". Falling back to "light".`);
    setMode("light");
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
