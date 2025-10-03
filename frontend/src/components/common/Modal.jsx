import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { X } from 'lucide-react';
import '../../styles/variables.css';

// Styled Dialog avec notre design system
const StyledDialog = styled(Dialog)(({ theme, variant, size }) => {
  const sizeStyles = {
    xs: { maxWidth: '400px' },
    sm: { maxWidth: '500px' },
    md: { maxWidth: '700px' },
    lg: { maxWidth: '900px' },
    xl: { maxWidth: '1200px' },
    fullscreen: { maxWidth: 'none', width: '100vw', height: '100vh' },
  };

  const variantStyles = {
    default: {
      '& .MuiDialog-paper': {
        borderRadius: 'var(--radius-3xl)',
        boxShadow: 'var(--shadow-2xl)',
        border: '1px solid var(--gray-200)',
        backgroundColor: 'var(--white)',
        backgroundImage: 'none',
      },
    },
    glass: {
      '& .MuiDialog-paper': {
        borderRadius: 'var(--radius-3xl)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'var(--shadow-2xl)',
        color: 'var(--white)',
      },
    },
    gradient: {
      '& .MuiDialog-paper': {
        borderRadius: 'var(--radius-3xl)',
        background: 'var(--gradient-primary)',
        border: 'none',
        boxShadow: 'var(--shadow-2xl)',
        color: 'var(--white)',
      },
    },
    minimal: {
      '& .MuiDialog-paper': {
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-lg)',
        border: 'none',
        backgroundColor: 'var(--white)',
      },
    },
  };

  const currentVariant = variant || 'default';
  const currentSize = size || 'md';

  return {
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    },
    '& .MuiDialog-container': {
      '& .MuiDialog-paper': {
        margin: 'var(--space-4)',
        width: '100%',
        ...sizeStyles[currentSize],
        ...variantStyles[currentVariant]['& .MuiDialog-paper'],
      },
    },
  };
});

const StyledDialogTitle = styled(DialogTitle)(({ theme, variant }) => ({
  fontFamily: 'var(--font-primary)',
  fontWeight: 'var(--font-bold)',
  fontSize: 'var(--text-2xl)',
  color: variant === 'glass' || variant === 'gradient' ? 'var(--white)' : 'var(--primary-navy)',
  padding: 'var(--space-6) var(--space-6) var(--space-4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${variant === 'glass' || variant === 'gradient'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'var(--gray-200)'
    }`,
}));

const StyledDialogContent = styled(DialogContent)(({ theme, variant }) => ({
  padding: 'var(--space-6)',
  color: variant === 'glass' || variant === 'gradient' ? 'var(--white)' : 'var(--gray-700)',
  fontSize: 'var(--text-base)',
  lineHeight: 'var(--leading-relaxed)',
  '&.MuiDialogContent-dividers': {
    borderTop: `1px solid ${variant === 'glass' || variant === 'gradient'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'var(--gray-200)'
      }`,
    borderBottom: `1px solid ${variant === 'glass' || variant === 'gradient'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'var(--gray-200)'
      }`,
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme, variant }) => ({
  padding: 'var(--space-4) var(--space-6) var(--space-6)',
  gap: 'var(--space-3)',
  borderTop: `1px solid ${variant === 'glass' || variant === 'gradient'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'var(--gray-200)'
    }`,
}));

const CloseButton = styled(IconButton)(({ theme, variant }) => ({
  color: variant === 'glass' || variant === 'gradient' ? 'var(--white)' : 'var(--gray-500)',
  backgroundColor: 'transparent',
  border: `1px solid ${variant === 'glass' || variant === 'gradient'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'var(--gray-300)'
    }`,
  borderRadius: 'var(--radius-lg)',
  width: '40px',
  height: '40px',
  transition: 'all var(--transition-fast)',
  '&:hover': {
    backgroundColor: variant === 'glass' || variant === 'gradient'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'var(--gray-100)',
    borderColor: variant === 'glass' || variant === 'gradient'
      ? 'rgba(255, 255, 255, 0.3)'
      : 'var(--gray-400)',
    transform: 'scale(1.05)',
  },
}));

// Composants de transition
const transitions = {
  fade: Fade,
  slide: (props) => <Slide direction="up" {...props} />,
  zoom: Zoom,
};

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  variant = 'default',
  size = 'md',
  transition = 'fade',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscapeKeyDown = true,
  dividers = false,
  fullScreen = false,
  ...props
}) => {
  const TransitionComponent = transitions[transition] || Fade;

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' && !closeOnBackdropClick) return;
    if (reason === 'escapeKeyDown' && !closeOnEscapeKeyDown) return;
    onClose?.(event, reason);
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      variant={variant}
      size={fullScreen ? 'fullscreen' : size}
      fullScreen={fullScreen}
      TransitionComponent={TransitionComponent}
      TransitionProps={{
        timeout: 300,
      }}
      {...props}
    >
      {title && (
        <StyledDialogTitle variant={variant}>
          <Box component="span">{title}</Box>
            {showCloseButton && (
            <CloseButton
              onClick={(e) => onClose?.(e, 'closeButton')}
              variant={variant}
              aria-label="Fermer"
            >
              <X size={20} />
            </CloseButton>
          )}
        </StyledDialogTitle>
      )}

      <StyledDialogContent
        variant={variant}
        dividers={dividers}
      >
        {children}
      </StyledDialogContent>

      {actions && (
        <StyledDialogActions variant={variant}>
            {actions}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

// Export des sous-composants pour une utilisation flexible
Modal.Title = StyledDialogTitle;
Modal.Content = StyledDialogContent;
Modal.Actions = StyledDialogActions;

export default Modal;
