import React from "react";
import {
  Button as MuiButton,
  CircularProgress,
  Box,
  alpha,
} from "@mui/material";
import { colors, gradients, shadows } from "../../utils/colors";

const YouthComputingLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 100 100"
    style={{ marginRight: "8px" }}
  >
    <circle cx="50" cy="50" r="45" fill={colors.primary.main} />
    <path d="M30 35 L50 25 L70 35 L50 45 Z" fill={colors.secondary.main} />
    <rect x="35" y="45" width="30" height="20" fill="white" rx="3" />
    <circle cx="42" cy="55" r="3" fill={colors.primary.main} />
    <circle cx="58" cy="55" r="3" fill={colors.secondary.main} />
    <path
      d="M40 75 Q50 80 60 75"
      stroke={colors.primary.main}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const Button = ({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  gradient = false,
  hoverEffect = true,
  showLogo = false,
  ...props
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 2,
      textTransform: "none",
      fontWeight: 600,
      fontFamily: "Ubuntu, sans-serif",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "none",
      position: "relative",
      overflow: "hidden",
      "&::before": gradient
        ? {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transition: "left 0.5s ease",
          }
        : {},
      "&:hover::before": gradient
        ? {
            left: "100%",
          }
        : {},
      "&:hover": hoverEffect
        ? {
            boxShadow: shadows.button,
            transform: "translateY(-2px)",
          }
        : {},
      "&:active": {
        transform: "translateY(0)",
      },
    };

    switch (variant) {
      case "contained":
        if (gradient) {
          return {
            ...baseStyles,
            background:
              color === "primary"
                ? gradients.primary
                : color === "secondary"
                ? gradients.secondary
                : gradients.primaryToSecondary,
            color: "white",
            "&:hover": {
              ...baseStyles["&:hover"],
              background:
                color === "primary"
                  ? `linear-gradient(135deg, ${colors.primary.dark} 0%, ${alpha(
                      colors.primary.main,
                      0.9
                    )} 100%)`
                  : `linear-gradient(135deg, ${
                      colors.secondary.dark
                    } 0%, ${alpha(colors.secondary.main, 0.9)} 100%)`,
            },
            "&.Mui-disabled": {
              background: colors.grey[300],
              color: colors.grey[500],
            },
          };
        }
        return {
          ...baseStyles,
          backgroundColor:
            color === "primary" ? colors.primary.main : colors.secondary.main,
          color: "white",
          "&:hover": {
            ...baseStyles["&:hover"],
            backgroundColor:
              color === "primary" ? colors.primary.dark : colors.secondary.dark,
          },
          "&.Mui-disabled": {
            backgroundColor: colors.grey[300],
            color: colors.grey[500],
          },
        };

      case "outlined":
        return {
          ...baseStyles,
          border: `2px solid ${
            color === "primary" ? colors.primary.main : colors.secondary.main
          }`,
          color:
            color === "primary" ? colors.primary.main : colors.secondary.main,
          backgroundColor: "transparent",
          "&:hover": {
            ...baseStyles["&:hover"],
            backgroundColor: alpha(
              color === "primary" ? colors.primary.main : colors.secondary.main,
              0.1
            ),
            borderColor:
              color === "primary" ? colors.primary.dark : colors.secondary.dark,
          },
          "&.Mui-disabled": {
            borderColor: colors.grey[300],
            color: colors.grey[500],
          },
        };

      case "text":
        return {
          ...baseStyles,
          color:
            color === "primary" ? colors.primary.main : colors.secondary.main,
          backgroundColor: "transparent",
          "&:hover": {
            ...baseStyles["&:hover"],
            backgroundColor: alpha(
              color === "primary" ? colors.primary.main : colors.secondary.main,
              0.08
            ),
          },
          "&.Mui-disabled": {
            color: colors.grey[500],
          },
        };

      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          padding: "6px 16px",
          fontSize: "0.875rem",
          minHeight: "32px",
        };
      case "large":
        return {
          padding: "12px 32px",
          fontSize: "1.1rem",
          minHeight: "48px",
        };
      default:
        return {
          padding: "10px 24px",
          fontSize: "1rem",
          minHeight: "40px",
        };
    }
  };

  return (
    <MuiButton
      variant={variant}
      disabled={disabled || loading}
      startIcon={
        !loading ? showLogo ? <YouthComputingLogo /> : startIcon : undefined
      }
      endIcon={!loading ? endIcon : undefined}
      fullWidth={fullWidth}
      sx={{
        ...getButtonStyles(),
        ...getSizeStyles(),
        ...props.sx,
      }}
      {...props}
    >
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress
            size={size === "small" ? 16 : size === "large" ? 24 : 20}
            thickness={4}
            sx={{ color: "inherit" }}
          />
          Chargement...
        </Box>
      ) : (
        children
      )}
    </MuiButton>
  );
};

// Boutons spécialisés avec logo Youth Computing
export const PrimaryButton = (props) => (
  <Button color="primary" gradient showLogo {...props} />
);

export const SecondaryButton = (props) => (
  <Button color="secondary" gradient {...props} />
);

export const SuccessButton = (props) => (
  <Button
    sx={{
      backgroundColor: colors.success.main,
      "&:hover": { backgroundColor: colors.success.dark },
    }}
    {...props}
  />
);

export const ErrorButton = (props) => (
  <Button
    sx={{
      backgroundColor: colors.error.main,
      "&:hover": { backgroundColor: colors.error.dark },
    }}
    {...props}
  />
);

export const YouthComputingButton = (props) => (
  <Button
    gradient
    showLogo
    sx={{
      background: gradients.primaryToSecondary,
      "&:hover": {
        background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
        transform: "translateY(-2px) scale(1.02)",
      },
    }}
    {...props}
  />
);

// Bouton avec icône seulement
export const IconButton = ({ icon, size = "medium", ...props }) => {
  const sizeMap = {
    small: { width: 32, height: 32, fontSize: "1rem" },
    medium: { width: 40, height: 40, fontSize: "1.25rem" },
    large: { width: 48, height: 48, fontSize: "1.5rem" },
  };

  return (
    <MuiButton
      variant="text"
      sx={{
        minWidth: "auto",
        padding: 1,
        borderRadius: "50%",
        ...sizeMap[size],
        "&:hover": {
          backgroundColor: alpha(colors.primary.main, 0.1),
          transform: "scale(1.1)",
        },
        transition: "all 0.2s ease",
      }}
      {...props}
    >
      {icon}
    </MuiButton>
  );
};

// Bouton flottant Youth Computing
export const FloatingActionButton = ({ children, ...props }) => (
  <Button
    variant="contained"
    gradient
    sx={{
      borderRadius: "50%",
      width: 56,
      height: 56,
      minWidth: "auto",
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 1000,
      boxShadow: shadows.cardHover,
      "&:hover": {
        transform: "scale(1.1)",
        boxShadow: "0 12px 40px rgba(1, 11, 64, 0.25)",
      },
    }}
    {...props}
  >
    {children}
  </Button>
);

export default Button;
