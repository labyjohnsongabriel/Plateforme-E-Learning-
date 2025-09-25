import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Fade,
  Backdrop
} from '@mui/material';
//import { colors } from '../utils/colors';

// Loading global (fullscreen)
export const GlobalLoading = ({ open = false, message = "Chargement..." }) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 999,
        backgroundColor: 'rgba(1, 11, 64, 0.9)'
      }}
      open={open}
    >
      <Fade in={open} timeout={500}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: colors.secondary.main,
              mb: 2
            }} 
          />
          <Typography variant="h6" color="white">
            {message}
          </Typography>
        </Box>
      </Fade>
    </Backdrop>
  );
};

// Loading inline pour les composants
export const InlineLoading = ({ size = 24, thickness = 4, message }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
      <CircularProgress 
        size={size} 
        thickness={thickness}
        sx={{ color: colors.primary.main }}
      />
      {message && (
        <Typography variant="body2" color={colors.text.secondary}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Loading avec skeleton pour le contenu
export const SkeletonLoading = ({ count = 3, height = 60 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from(new Array(count)).map((_, index) => (
        <Box
          key={index}
          sx={{
            height,
            backgroundColor: 'rgba(1, 11, 64, 0.05)',
            borderRadius: 1,
            mb: 1,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 }
            }
          }}
        />
      ))}
    </Box>
  );
};

// Loading pour les boutons
export const ButtonLoading = ({ size = 20 }) => {
  return (
    <CircularProgress 
      size={size} 
      thickness={4}
      sx={{ color: 'inherit' }}
    />
  );
};

export default GlobalLoading;