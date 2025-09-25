import React from 'react';
import {
  Button as MuiButton,
  CircularProgress,
  Box
} from '@mui/material';
import { colors, gradients } from '../utils/colors';

const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  gradient = false,
  hoverEffect = true,
  ...props
}) => {
  // Couleurs personnalisées selon la charte Youth Computing
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: 'Ubuntu, sans-serif',
      transition: 'all 0.3s ease',
      boxShadow: 'none',
      '&:hover': {
        boxShadow: hoverEffect ? '0 8px 24px rgba(1, 11, 64, 0.2)' : 'none',
        transform: hoverEffect ? 'translateY(-2px)' : 'none',
      },
      '&:active': {
        transform: 'translateY(0)',
      }
    };

    // Styles selon la variante
    switch (variant) {
      case 'contained':
        if (gradient) {
          return {
            ...baseStyles,
            background: color === 'primary' ? gradients.primary : gradients.secondary,
            color: 'white',
            '&:hover': {
              ...baseStyles['&:hover'],
              background: color === 'primary' 
                ? `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`
                : `linear-gradient(135deg, ${colors.secondary.dark} 0%, ${colors.secondary.main} 100%)`,
            },
            '&.Mui-disabled': {
              background: colors.grey[300],
              color: colors.grey[500],
            }
          };
        }
        return {
          ...baseStyles,
          backgroundColor: color === 'primary' ? colors.primary.main : colors.secondary.main,
          color: 'white',
          '&:hover': {
            ...baseStyles['&:hover'],
            backgroundColor: color === 'primary' ? colors.primary.dark : colors.secondary.dark,
          },
          '&.Mui-disabled': {
            backgroundColor: colors.grey[300],
            color: colors.grey[500],
          }
        };

      case 'outlined':
        return {
          ...baseStyles,
          border: `2px solid ${color === 'primary' ? colors.primary.main : colors.secondary.main}`,
          color: color === 'primary' ? colors.primary.main : colors.secondary.main,
          backgroundColor: 'transparent',
          '&:hover': {
            ...baseStyles['&:hover'],
            backgroundColor: color === 'primary' 
              ? `${colors.primary.main}15` // 15% opacity
              : `${colors.secondary.main}15`,
            borderColor: color === 'primary' ? colors.primary.dark : colors.secondary.dark,
          },
          '&.Mui-disabled': {
            borderColor: colors.grey[300],
            color: colors.grey[500],
          }
        };

      case 'text':
        return {
          ...baseStyles,
          color: color === 'primary' ? colors.primary.main : colors.secondary.main,
          backgroundColor: 'transparent',
          '&:hover': {
            ...baseStyles['&:hover'],
            backgroundColor: color === 'primary' 
              ? `${colors.primary.main}10`
              : `${colors.secondary.main}10`,
          },
          '&.Mui-disabled': {
            color: colors.grey[500],
          }
        };

      default:
        return baseStyles;
    }
  };

  // Tailles personnalisées
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: '6px 16px', fontSize: '0.875rem' };
      case 'large':
        return { padding: '12px 28px', fontSize: '1.1rem' };
      default: // medium
        return { padding: '10px 24px', fontSize: '1rem' };
    }
  };

  return (
    <MuiButton
      variant={variant}
      disabled={disabled || loading}
      startIcon={!loading ? startIcon : undefined}
      endIcon={!loading ? endIcon : undefined}
      fullWidth={fullWidth}
      sx={{
        ...getButtonStyles(),
        ...getSizeStyles(),
        ...props.sx
      }}
      {...props}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} thickness={4} sx={{ color: 'inherit' }} />
          Chargement...
        </Box>
      ) : (
        children
      )}
    </MuiButton>
  );
};

// Boutons spécialisés
export const PrimaryButton = (props) => <Button color="primary" gradient {...props} />;
export const SecondaryButton = (props) => <Button color="secondary" gradient {...props} />;
export const SuccessButton = (props) => <Button sx={{ backgroundColor: colors.success.main }} {...props} />;
export const ErrorButton = (props) => <Button sx={{ backgroundColor: colors.error.main }} {...props} />;

// Bouton avec icône seulement
export const IconButton = ({ icon, size = 'medium', ...props }) => {
  const sizeMap = {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 48, height: 48 }
  };

  return (
    <MuiButton
      variant="text"
      sx={{
        minWidth: 'auto',
        padding: 1,
        borderRadius: '50%',
        ...sizeMap[size],
        '&:hover': {
          backgroundColor: `${colors.primary.main}10`,
        }
      }}
      {...props}
    >
      {icon}
    </MuiButton>
  );
};

export default Button;