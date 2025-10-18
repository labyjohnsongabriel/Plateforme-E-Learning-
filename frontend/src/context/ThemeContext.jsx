import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";

// Création du contexte
export const ThemeContext = createContext();

/**
 * Hook personnalisé pour utiliser le thème
 * @returns {Object} Contexte du thème
 * @throws {Error} Si utilisé en dehors de ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * Configuration des couleurs du design system
 */
export const themeColors = {
  // Couleurs primaires
  primary: {
    50: '#f0f4ff',
    100: '#d6e4ff',
    200: '#adc8ff',
    300: '#84a9ff',
    400: '#6690ff',
    500: '#3366ff',
    600: '#254edb',
    700: '#1a3bb7',
    800: '#102693',
    900: '#091c7a',
  },
  secondary: {
    50: '#fff0f0',
    100: '#ffd6d6',
    200: '#ffadad',
    300: '#ff8484',
    400: '#ff6666',
    500: '#ff3333',
    600: '#db2525',
    700: '#b71a1a',
    800: '#931010',
    900: '#7a0909',
  },
  // Couleurs neutres
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // États sémantiques
  success: {
    light: '#d4edda',
    main: '#28a745',
    dark: '#155724',
  },
  warning: {
    light: '#fff3cd',
    main: '#ffc107',
    dark: '#856404',
  },
  error: {
    light: '#f8d7da',
    main: '#dc3545',
    dark: '#721c24',
  },
  info: {
    light: '#d1ecf1',
    main: '#17a2b8',
    dark: '#0c5460',
  },
};

/**
 * Configuration typographique
 */
const typography = {
  fontFamily: [
    'Ubuntu',
    '"Century Gothic"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};

/**
 * Configuration des composants MUI
 */
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      },
    },
  },
};

/**
 * Styles globaux
 */
const globalStyles = (mode) => ({
  html: {
    scrollBehavior: 'smooth',
  },
  body: {
    margin: 0,
    padding: 0,
    fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  '#root': {
    minHeight: '100vh',
  },
});

/**
 * Création du thème MUI basé sur le mode
 * @param {string} mode - 'light' ou 'dark'
 * @returns {Object} Thème MUI
 */
const createAppTheme = (mode) => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        light: themeColors.primary[300],
        main: themeColors.primary[500],
        dark: themeColors.primary[700],
        contrastText: '#ffffff',
      },
      secondary: {
        light: themeColors.secondary[300],
        main: themeColors.secondary[500],
        dark: themeColors.secondary[700],
        contrastText: '#ffffff',
      },
      background: {
        default: isLight ? themeColors.neutral[50] : themeColors.neutral[900],
        paper: isLight ? '#ffffff' : themeColors.neutral[800],
        gradient: isLight 
          ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      text: {
        primary: isLight ? themeColors.neutral[900] : themeColors.neutral[50],
        secondary: isLight ? themeColors.neutral[600] : themeColors.neutral[400],
        disabled: isLight ? themeColors.neutral[400] : themeColors.neutral[600],
      },
      divider: isLight ? themeColors.neutral[200] : themeColors.neutral[700],
      success: themeColors.success,
      warning: themeColors.warning,
      error: themeColors.error,
      info: themeColors.info,
      grey: themeColors.neutral,
    },
    typography,
    components,
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      isLight ? '0 1px 2px 0 rgba(0,0,0,0.05)' : '0 1px 2px 0 rgba(0,0,0,0.2)',
      isLight ? '0 1px 3px 0 rgba(0,0,0,0.1)' : '0 1px 3px 0 rgba(0,0,0,0.3)',
      isLight ? '0 1px 5px 0 rgba(0,0,0,0.1)' : '0 1px 5px 0 rgba(0,0,0,0.3)',
      isLight ? '0 2px 4px -1px rgba(0,0,0,0.1)' : '0 2px 4px -1px rgba(0,0,0,0.3)',
      isLight ? '0 4px 6px -1px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.3)',
      isLight ? '0 10px 15px -3px rgba(0,0,0,0.1)' : '0 10px 15px -3px rgba(0,0,0,0.3)',
      isLight ? '0 20px 25px -5px rgba(0,0,0,0.1)' : '0 20px 25px -5px rgba(0,0,0,0.3)',
      isLight ? '0 25px 50px -12px rgba(0,0,0,0.25)' : '0 25px 50px -12px rgba(0,0,0,0.5)',
      ...Array(17).fill('none'),
    ],
    spacing: 8,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    zIndex: {
      mobileStepper: 1000,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
  });
};

/**
 * ThemeProvider component to manage theme state and provide MUI-compatible themes
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.defaultTheme - Default theme mode ('light' or 'dark')
 * @param {boolean} props.enableSystem - Whether to use system preference
 * @param {string} props.storageKey - Key for localStorage
 */
export const ThemeProvider = ({ 
  children, 
  defaultTheme = 'light',
  enableSystem = true,
  storageKey = 'app-theme-mode'
}) => {
  const [mode, setMode] = useState(() => {
    // Récupération depuis le localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['light', 'dark'].includes(stored)) {
        return stored;
      }
    }

    // Préférence système
    if (enableSystem && typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPrefersDark ? 'dark' : defaultTheme;
    }

    return defaultTheme;
  });

  // Création du thème avec useMemo pour optimiser les performances
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      
      // Sauvegarde dans le localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newMode);
      }
      
      return newMode;
    });
  };

  /**
   * Set theme mode explicitly
   * @param {string} newMode - 'light' or 'dark'
   */
  const setThemeMode = (newMode) => {
    if (!['light', 'dark'].includes(newMode)) {
      console.warn(`Invalid theme mode "${newMode}". Must be "light" or "dark".`);
      return;
    }
    
    setMode(newMode);
    
    // Sauvegarde dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newMode);
    }
  };

  // Écoute des changements de préférence système
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newMode = e.matches ? 'dark' : 'light';
      
      // Ne changer que si l'utilisateur n'a pas explicitement choisi un thème
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
          setMode(newMode);
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [enableSystem, storageKey]);

  // Validation du mode
  useEffect(() => {
    if (!['light', 'dark'].includes(mode)) {
      console.warn(`Invalid theme mode "${mode}". Falling back to "light".`);
      setMode('light');
    }
  }, [mode]);

  // Valeur du contexte
  const contextValue = {
    theme,
    mode,
    toggleTheme,
    setThemeMode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={globalStyles(mode)} />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;