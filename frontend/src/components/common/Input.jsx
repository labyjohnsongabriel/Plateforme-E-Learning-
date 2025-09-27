import React, { forwardRef, useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  FormHelperText,
  OutlinedInput,
  InputLabel,
  Box,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { colors, gradients, shadows } from "../../utils/colors";

const Input = forwardRef(
  (
    {
      label,
      variant = "outlined",
      size = "medium",
      error,
      helperText,
      fullWidth = true,
      required = false,
      disabled = false,
      type = "text",
      startIcon,
      endIcon,
      onClear,
      showPasswordToggle = false,
      animated = true,
      youthComputingStyle = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const getInputType = () => {
      if (type === "password" && showPasswordToggle) {
        return showPassword ? "text" : "password";
      }
      return type;
    };

    const getYouthComputingStyles = () => {
      if (!youthComputingStyle) return {};

      return {
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          fontFamily: "Century Gothic, sans-serif",
          backgroundColor: alpha("#ffffff", 0.8),
          backdropFilter: "blur(10px)",
          border: `2px solid ${alpha(colors.primary.main, 0.1)}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            borderColor: alpha(colors.primary.main, 0.3),
            backgroundColor: "#ffffff",
            transform: animated ? "translateY(-2px)" : "none",
            boxShadow: animated ? shadows.card : "none",
          },
          "&.Mui-focused": {
            borderColor: colors.primary.main,
            backgroundColor: "#ffffff",
            transform: animated ? "translateY(-2px)" : "none",
            boxShadow: `0 8px 32px ${alpha(colors.primary.main, 0.15)}`,
            "& fieldset": {
              borderWidth: "0px !important",
            },
          },
          "&.Mui-error": {
            borderColor: colors.error.main,
            "&:hover": {
              borderColor: colors.error.dark,
            },
          },
          "& fieldset": {
            border: "none",
          },
        },
      };
    };

    const commonProps = {
      fullWidth,
      disabled,
      required,
      error: !!error,
      size,
      variant,
      inputRef: ref,
      onFocus: (e) => {
        setFocused(true);
        props.onFocus?.(e);
      },
      onBlur: (e) => {
        setFocused(false);
        props.onBlur?.(e);
      },
      sx: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          fontFamily: "Century Gothic, sans-serif",
          transition: "all 0.3s ease",
          "&:hover fieldset": {
            borderColor: colors.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderColor: colors.primary.main,
            borderWidth: 2,
          },
          "&.Mui-error fieldset": {
            borderColor: colors.error.main,
          },
        },
        "& .MuiInputLabel-root": {
          fontFamily: "Ubuntu, sans-serif",
          fontWeight: 500,
          "&.Mui-focused": {
            color: colors.primary.main,
          },
          "&.Mui-error": {
            color: colors.error.main,
          },
        },
        "& .MuiFormHelperText-root": {
          fontFamily: "Century Gothic, sans-serif",
          "&.Mui-error": {
            color: colors.error.main,
          },
        },
        ...getYouthComputingStyles(),
        ...props.sx,
      },
      ...props,
    };

    const renderEndAdornment = () => {
      const adornments = [];

      if (onClear && props.value) {
        adornments.push(
          <InputAdornment position="end" key="clear">
            <IconButton
              aria-label="clear input"
              onClick={onClear}
              edge="end"
              size="small"
              sx={{
                color: colors.grey[500],
                "&:hover": {
                  color: colors.error.main,
                  backgroundColor: alpha(colors.error.main, 0.1),
                },
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        );
      }

      if (showPasswordToggle && type === "password") {
        adornments.push(
          <InputAdornment position="end" key="password">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
              size="small"
              sx={{
                color: colors.grey[500],
                "&:hover": {
                  color: colors.primary.main,
                  backgroundColor: alpha(colors.primary.main, 0.1),
                },
              }}
            >
              {showPassword ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        );
      }

      if (endIcon) {
        adornments.push(
          <InputAdornment position="end" key="end-icon">
            {endIcon}
          </InputAdornment>
        );
      }

      return adornments.length > 0 ? adornments : null;
    };

    const renderStartAdornment = () => {
      return startIcon ? (
        <InputAdornment position="start">
          <Box sx={{ color: focused ? colors.primary.main : colors.grey[500] }}>
            {startIcon}
          </Box>
        </InputAdornment>
      ) : null;
    };

    if (youthComputingStyle) {
      return (
        <FormControl fullWidth={fullWidth} error={!!error} variant={variant}>
          {label && (
            <InputLabel
              shrink
              required={required}
              sx={{
                fontFamily: "Ubuntu, sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                color: colors.text.primary,
                backgroundColor: "white",
                px: 1,
                ml: -0.5,
                "&.Mui-focused": {
                  color: colors.primary.main,
                },
                "&.Mui-error": {
                  color: colors.error.main,
                },
              }}
            >
              {label}
            </InputLabel>
          )}
          <OutlinedInput
            type={getInputType()}
            startAdornment={renderStartAdornment()}
            endAdornment={renderEndAdornment()}
            {...commonProps}
          />
          {helperText && (
            <FormHelperText
              sx={{
                ml: 0,
                fontFamily: "Century Gothic, sans-serif",
                fontSize: "0.75rem",
              }}
            >
              {helperText}
            </FormHelperText>
          )}
        </FormControl>
      );
    }

    return (
      <TextField
        label={label}
        type={getInputType()}
        InputProps={{
          startAdornment: renderStartAdornment(),
          endAdornment: renderEndAdornment(),
        }}
        helperText={helperText}
        {...commonProps}
      />
    );
  }
);

// Composants spécialisés Youth Computing
export const YCSearchInput = (props) => (
  <Input
    startIcon={<SearchIcon />}
    placeholder="Rechercher des cours, instructeurs..."
    youthComputingStyle
    animated
    {...props}
  />
);

export const YCPasswordInput = (props) => (
  <Input
    type="password"
    startIcon={<LockIcon />}
    showPasswordToggle
    youthComputingStyle
    animated
    {...props}
  />
);

export const YCEmailInput = (props) => (
  <Input
    type="email"
    startIcon={<EmailIcon />}
    placeholder="exemple@email.com"
    youthComputingStyle
    animated
    {...props}
  />
);

export const YCNameInput = (props) => (
  <Input
    type="text"
    startIcon={<PersonIcon />}
    youthComputingStyle
    animated
    {...props}
  />
);

export const YCPhoneInput = (props) => (
  <Input
    type="tel"
    startIcon={<PhoneIcon />}
    placeholder="+241 XX XX XX XX"
    youthComputingStyle
    animated
    {...props}
  />
);

// Input avec gradient Youth Computing pour les formulaires spéciaux
export const YCGradientInput = ({ label, ...props }) => (
  <Box sx={{ position: "relative" }}>
    <Input
      label={label}
      youthComputingStyle
      animated
      sx={{
        "& .MuiOutlinedInput-root": {
          background: `linear-gradient(135deg, ${alpha(
            "#ffffff",
            0.9
          )} 0%, ${alpha("#ffffff", 0.7)} 100%)`,
          backdropFilter: "blur(20px)",
          "&:hover": {
            background: "#ffffff",
          },
          "&.Mui-focused": {
            background: "#ffffff",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: gradients.primaryToSecondary,
              borderRadius: "inherit",
              zIndex: -1,
            },
          },
        },
      }}
      {...props}
    />
  </Box>
);

Input.displayName = "Input";

export default Input;

// Input de recherche avancée pour le catalogue
export const YCAdvancedSearchInput = ({
  onFilterClick,
  showFilters = false,
  filterCount = 0,
  ...props
}) => (
  <Box sx={{ position: "relative" }}>
    <YCSearchInput
      endIcon={
        <IconButton
          onClick={onFilterClick}
          size="small"
          sx={{
            color: showFilters ? colors.primary.main : colors.grey[500],
            backgroundColor: showFilters
              ? alpha(colors.primary.main, 0.1)
              : "transparent",
            "&:hover": {
              backgroundColor: alpha(colors.primary.main, 0.15),
              color: colors.primary.main,
            },
          }}
        >
          <Box sx={{ position: "relative" }}>
            🔍
            {filterCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: colors.secondary.main,
                  color: "white",
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {filterCount}
              </Box>
            )}
          </Box>
        </IconButton>
      }
      {...props}
    />
  </Box>
);
