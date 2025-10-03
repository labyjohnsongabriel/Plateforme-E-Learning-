import React, { useState, forwardRef } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import '../../styles/variables.css';

// Styled TextField avec notre design system
const StyledTextField = styled(TextField)(({ theme, variant, error, success }) => {
  const baseStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--radius-xl)',
      backgroundColor: 'var(--white)',
      fontFamily: 'var(--font-secondary)',
      fontSize: 'var(--text-base)',
      transition: 'all var(--transition-fast)',
      '& fieldset': {
        borderColor: 'var(--gray-300)',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: 'var(--gray-400)',
      },
      '&.Mui-focused fieldset': {
        borderColor: success ? 'var(--success)' : error ? 'var(--error)' : 'var(--secondary-red)',
        borderWidth: '2px',
      },
      '&.Mui-error fieldset': {
        borderColor: 'var(--error)',
      },
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'var(--font-primary)',
      fontWeight: 'var(--font-medium)',
      fontSize: 'var(--text-base)',
      color: 'var(--gray-600)',
      '&.Mui-focused': {
        color: success ? 'var(--success)' : error ? 'var(--error)' : 'var(--secondary-red)',
      },
      '&.Mui-error': {
        color: 'var(--error)',
      },
    },
    '& .MuiInputBase-input': {
      padding: 'var(--space-3) var(--space-4)',
      '&::placeholder': {
        color: 'var(--gray-500)',
        opacity: 1,
      },
    },
    '& .MuiFormHelperText-root': {
      fontFamily: 'var(--font-secondary)',
      fontSize: 'var(--text-sm)',
      marginTop: 'var(--space-2)',
      marginLeft: 'var(--space-1)',
    },
  };

  const variantStyles = {
    outlined: {
      ...baseStyles,
    },
    filled: {
      '& .MuiFilledInput-root': {
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--gray-100)',
        border: '2px solid transparent',
        transition: 'all var(--transition-fast)',
        '&:hover': {
          backgroundColor: 'var(--gray-200)',
        },
        '&.Mui-focused': {
          backgroundColor: 'var(--white)',
          borderColor: success ? 'var(--success)' : error ? 'var(--error)' : 'var(--secondary-red)',
        },
        '&::before, &::after': {
          display: 'none',
        },
      },
    },
    glass: {
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        '& fieldset': {
          border: 'none',
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
        '&.Mui-focused': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderColor: success ? 'var(--success)' : error ? 'var(--error)' : 'var(--secondary-red)',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.8)',
        '&.Mui-focused': {
          color: 'var(--white)',
        },
      },
      '& .MuiInputBase-input': {
        color: 'var(--white)',
        '&::placeholder': {
          color: 'rgba(255, 255, 255, 0.6)',
        },
      },
    },
  };

  const statusStyles = {
    success: {
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'var(--success)',
        },
        '&:hover fieldset': {
          borderColor: 'var(--success)',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'var(--success)',
          boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'var(--success)',
        '&.Mui-focused': {
          color: 'var(--success)',
        },
      },
    },
    error: {
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'var(--error)',
        },
        '&:hover fieldset': {
          borderColor: 'var(--error)',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'var(--error)',
          boxShadow: '0 0 0 3px rgba(244, 67, 54, 0.1)',
        },
      },
    },
  };

  const currentVariant = variant || 'outlined';

  return {
    ...variantStyles[currentVariant],
    ...(success && statusStyles.success),
    ...(error && statusStyles.error),
  };
});

const StyledFormLabel = styled(FormLabel)({
  fontFamily: 'var(--font-primary)',
  fontWeight: 'var(--font-medium)',
  fontSize: 'var(--text-sm)',
  color: 'var(--primary-navy)',
  marginBottom: 'var(--space-2)',
  display: 'block',
});

const StyledFormHelperText = styled(FormHelperText)(({ error, success }) => ({
  fontFamily: 'var(--font-secondary)',
  fontSize: 'var(--text-sm)',
  marginTop: 'var(--space-2)',
  marginLeft: 'var(--space-1)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  color: success ? 'var(--success)' : error ? 'var(--error)' : 'var(--gray-600)',
}));

const Input = forwardRef(({
  label,
  helperText,
  error = false,
  success = false,
  required = false,
  type = 'text',
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  startIcon,
  endIcon,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const startAdornment = startIcon ? (
        <InputAdornment position="start">
      <Box sx={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center' }}>
            {startIcon}
          </Box>
        </InputAdornment>
      ) : null;

  const endAdornment = (startIcon || endIcon || (type === 'password' && showPasswordToggle)) ? (
    <InputAdornment position="end">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {endIcon && (
          <Box sx={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center' }}>
            {endIcon}
          </Box>
        )}
        {type === 'password' && showPasswordToggle && (
          <IconButton
            onClick={handleTogglePassword}
            edge="end"
            size="small"
              sx={{
              color: 'var(--gray-500)',
              '&:hover': {
                color: 'var(--secondary-red)',
                backgroundColor: 'var(--secondary-red-50)',
                },
              }}
            >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </IconButton>
        )}
        {success && (
          <CheckCircle size={20} color="var(--success)" />
        )}
        {error && (
          <AlertCircle size={20} color="var(--error)" />
        )}
      </Box>
    </InputAdornment>
  ) : null;

    return (
    <FormControl fullWidth={fullWidth} error={error}>
      {label && (
        <StyledFormLabel required={required}>
          {label}
        </StyledFormLabel>
      )}

      <StyledTextField
        ref={ref}
        type={inputType}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        error={error}
        success={success}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        InputProps={{
          startAdornment,
          endAdornment,
        }}
      sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              boxShadow: focused ? (
                success ? '0 0 0 3px rgba(76, 175, 80, 0.1)' :
                  error ? '0 0 0 3px rgba(244, 67, 54, 0.1)' :
                    '0 0 0 3px var(--secondary-red-100)'
              ) : 'none',
          },
        },
      }}
      {...props}
    />

      {helperText && (
        <StyledFormHelperText error={error} success={success}>
          {error && <AlertCircle size={16} />}
          {success && <CheckCircle size={16} />}
          <Typography component="span" sx={{ fontSize: 'inherit' }}>
            {helperText}
          </Typography>
        </StyledFormHelperText>
      )}
    </FormControl>
  );
});

Input.displayName = 'Input';

export default Input;
