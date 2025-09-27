// utils/colors.js - Configuration des couleurs Youth Computing
export const colors = {
  primary: {
    main: "#010b40", // Bleu marine - Professionnalisme et fiabilité
    light: "#1a237e", // Bleu marine clair
    dark: "#000051", // Bleu marine foncé
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#f13544", // Fuschia - Audace créative
    light: "#ff6b74", // Fuschia clair
    dark: "#d32f2f", // Fuschia foncé
    contrastText: "#ffffff",
  },
  success: {
    main: "#4caf50",
    light: "#81c784",
    dark: "#388e3c",
  },
  warning: {
    main: "#ff9800",
    light: "#ffb74d",
    dark: "#f57c00",
  },
  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
  },
  info: {
    main: "#2196f3",
    light: "#64b5f6",
    dark: "#1976d2",
  },
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
  text: {
    primary: "#010b40",
    secondary: "#757575",
    disabled: "#bdbdbd",
  },
  background: {
    default: "#fafafa",
    paper: "#ffffff",
  },
  divider: "#e0e0e0",
};

// Gradients personnalisés
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
  primaryToSecondary: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  light: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.secondary.light} 100%)`,
  dark: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
};

// Ombres personnalisées
export const shadows = {
  card: "0 4px 20px rgba(1, 11, 64, 0.1)",
  cardHover: "0 8px 32px rgba(1, 11, 64, 0.15)",
  button: "0 2px 8px rgba(1, 11, 64, 0.15)",
  modal: "0 16px 48px rgba(1, 11, 64, 0.3)",
};

// Typographie
export const typography = {
  fontFamily: {
    primary: "Ubuntu, sans-serif",
    secondary: "Century Gothic, sans-serif",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
};

export default colors;
