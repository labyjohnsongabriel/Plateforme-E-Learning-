import React, { forwardRef } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  FormHelperText,
  OutlinedInput,
  InputLabel,
  FilledInput,
  Box
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { colors } from '../utils/colors';

const Input = forwardRef(({
  label,
  variant = 'outlined',
  size = 'medium',
  error,
  helperText,
  fullWidth = true,
  required = false,
  disabled = false,
  type = 'text',
  startIcon,
  endIcon,
  onClear,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const commonProps = {
    fullWidth,
    disabled,
    required,
    error: !!error,
    size,
    variant,
    inputRef: ref,
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontFamily: 'Century Gothic, sans-serif',
        '&:hover fieldset': {
          borderColor: colors.primary.main,
        },
        '&.Mui-focused fieldset': {
          borderColor: colors.primary.main,
          borderWidth: 2,
        },
        '&.Mui-error fieldset': {
          borderColor: colors.error.main,
        },
      },
      '& .MuiInputLabel-root': {
        fontFamily: 'Ubuntu, sans-serif',
        fontWeight: 500,
        '&.Mui-focused': {
          color: colors.primary.main,
        },
        '&.Mui-error': {
          color: colors.error.main,
        },
      },
      '& .MuiFormHelperText-root': {
        fontFamily: 'Century Gothic, sans-serif',
        '&.Mui-error': {
          color: colors.error.main,
        },
      },
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
            sx={{ color: colors.grey[500] }}
          >
            <ClearIcon />
          </IconButton>
        </InputAdornment>
      );
    }

    if (showPasswordToggle && type === 'password') {
      adornments.push(
        <InputAdornment position="end" key="password">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            edge="end"
            sx={{ color: colors.grey[500] }}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
        {startIcon}
      </InputAdornment>
    ) : null;
  };

  if (variant === 'filled' || variant === 'standard') {
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

  // Variante outlined avec plus de personnalisation
  return (
    <FormControl fullWidth={fullWidth} error={!!error} variant={variant}>
      {label && (
        <InputLabel 
          shrink 
          required={required}
          sx={{ 
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 500,
            color: colors.text.primary,
            '&.Mui-focused': {
              color: colors.primary.main,
            }
          }}
        >
          {label}
        </InputLabel>
      )}
      <OutlinedInput
        type={getInputType()}
        startAdornment={renderStartAdornment()}
        endAdornment={renderEndAdornment()}
        notched
        {...commonProps}
      />
      {helperText && (
        <FormHelperText sx={{ ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

// Composants spécialisés
export const SearchInput = (props) => (
  <Input
    startIcon={<SearchIcon sx={{ color: colors.grey[500] }} />}
    placeholder="Rechercher..."
    {...props}
  />
);

export const PasswordInput = (props) => (
  <Input
    type="password"
    showPasswordToggle
    {...props}
  />
);

export const EmailInput = (props) => (
  <Input
    type="email"
    placeholder="exemple@email.com"
    {...props}
  />
);

Input.displayName = 'Input';

export default Input;