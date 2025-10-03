import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import '../../styles/variables.css';

// Styled Button avec notre design system
const StyledButton = styled(MuiButton)(({ theme, variant, size, color }) => {
    const baseStyles = {
    fontFamily: 'var(--font-primary)',
    fontWeight: 'var(--font-semibold)',
    textTransform: 'none',
    borderRadius: 'var(--radius-xl)',
    transition: 'all var(--transition-base)',
    position: 'relative',
    overflow: 'hidden',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none !important',
    },
    '&::before': {
            content: '""',
      position: 'absolute',
            top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      transition: 'left var(--transition-slow)',
    },
    '&:hover::before': {
      left: '100%',
    },
  };

  const sizeStyles = {
    small: {
      padding: 'var(--space-2) var(--space-4)',
      fontSize: 'var(--text-sm)',
      minHeight: '36px',
    },
    medium: {
      padding: 'var(--space-3) var(--space-6)',
      fontSize: 'var(--text-base)',
      minHeight: '44px',
    },
    large: {
      padding: 'var(--space-4) var(--space-8)',
      fontSize: 'var(--text-lg)',
      minHeight: '52px',
    },
  };

  const variantStyles = {
    contained: {
      primary: {
        background: 'var(--gradient-primary)',
        color: 'var(--white)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid transparent',
        '&:hover': {
          background: 'linear-gradient(135deg, var(--primary-navy-dark) 0%, var(--primary-navy) 100%)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-lg)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      secondary: {
        background: 'var(--gradient-secondary)',
        color: 'var(--white)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid transparent',
        '&:hover': {
          background: 'linear-gradient(135deg, var(--secondary-red-dark) 0%, var(--secondary-red) 100%)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-glow)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      success: {
        background: 'var(--gradient-success)',
        color: 'var(--white)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid transparent',
        '&:hover': {
          background: 'linear-gradient(135deg, var(--success-dark) 0%, var(--success) 100%)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-lg)',
        },
      },
      warning: {
        background: 'linear-gradient(135deg, var(--warning) 0%, var(--warning-dark) 100%)',
        color: 'var(--white)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid transparent',
        '&:hover': {
          background: 'linear-gradient(135deg, var(--warning-dark) 0%, var(--warning) 100%)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-lg)',
        },
      },
      error: {
        background: 'linear-gradient(135deg, var(--error) 0%, var(--error-dark) 100%)',
        color: 'var(--white)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid transparent',
        '&:hover': {
          background: 'linear-gradient(135deg, var(--error-dark) 0%, var(--error) 100%)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-lg)',
        },
      },
    },
    outlined: {
      primary: {
        background: 'transparent',
        color: 'var(--primary-navy)',
        border: '2px solid var(--primary-navy)',
        '&:hover': {
          background: 'var(--primary-navy)',
          color: 'var(--white)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      },
      secondary: {
        background: 'transparent',
        color: 'var(--secondary-red)',
        border: '2px solid var(--secondary-red)',
        '&:hover': {
          background: 'var(--secondary-red)',
          color: 'var(--white)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-glow)',
        },
      },
      success: {
        background: 'transparent',
        color: 'var(--success)',
        border: '2px solid var(--success)',
        '&:hover': {
          background: 'var(--success)',
          color: 'var(--white)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      },
      warning: {
        background: 'transparent',
        color: 'var(--warning)',
        border: '2px solid var(--warning)',
        '&:hover': {
          background: 'var(--warning)',
          color: 'var(--white)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      },
      error: {
        background: 'transparent',
        color: 'var(--error)',
        border: '2px solid var(--error)',
        '&:hover': {
          background: 'var(--error)',
          color: 'var(--white)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      },
    },
    text: {
      primary: {
        background: 'transparent',
        color: 'var(--primary-navy)',
        border: 'none',
        '&:hover': {
          background: 'var(--primary-navy-50)',
          transform: 'translateY(-1px)',
        },
      },
      secondary: {
        background: 'transparent',
        color: 'var(--secondary-red)',
        border: 'none',
        '&:hover': {
          background: 'var(--secondary-red-50)',
          transform: 'translateY(-1px)',
        },
      },
    },
    ghost: {
      primary: {
        background: 'var(--primary-navy-50)',
        color: 'var(--primary-navy)',
        border: '1px solid var(--primary-navy-200)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          background: 'var(--primary-navy-100)',
          borderColor: 'var(--primary-navy-300)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      },
      secondary: {
        background: 'var(--secondary-red-50)',
        color: 'var(--secondary-red)',
        border: '1px solid var(--secondary-red-200)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          background: 'var(--secondary-red-100)',
          borderColor: 'var(--secondary-red-300)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      },
    },
    glass: {
      primary: {
        background: 'rgba(1, 11, 64, 0.1)',
        color: 'var(--primary-navy)',
        border: '1px solid rgba(1, 11, 64, 0.2)',
        backdropFilter: 'blur(20px)',
        '&:hover': {
          background: 'rgba(1, 11, 64, 0.2)',
          borderColor: 'rgba(1, 11, 64, 0.3)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-lg)',
        },
      },
      secondary: {
        background: 'rgba(241, 53, 68, 0.1)',
        color: 'var(--secondary-red)',
        border: '1px solid rgba(241, 53, 68, 0.2)',
        backdropFilter: 'blur(20px)',
        '&:hover': {
          background: 'rgba(241, 53, 68, 0.2)',
          borderColor: 'rgba(241, 53, 68, 0.3)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-glow)',
        },
      },
    },
  };

  const currentVariant = variant || 'contained';
  const currentColor = color || 'primary';
  const currentSize = size || 'medium';

        return {
    ...baseStyles,
    ...sizeStyles[currentSize],
    ...variantStyles[currentVariant]?.[currentColor],
  };
});

const Button = React.forwardRef(({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  ...props
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
            sx={{
              color: 'currentColor',
              mr: 1,
            }}
          />
          Chargement...
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button;
