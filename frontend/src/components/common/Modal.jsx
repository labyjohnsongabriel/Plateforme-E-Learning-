import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Slide,
  Fade,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { colors } from '../utils/colors';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  disableBackdropClick = false,
  showCloseButton = true,
  transition = 'slide', // 'slide', 'fade', or 'none'
  padding = 3,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getTransitionComponent = () => {
    switch (transition) {
      case 'slide':
        return Transition;
      case 'fade':
        return Fade;
      default:
        return undefined;
    }
  };

  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen || isMobile}
      TransitionComponent={getTransitionComponent()}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          boxShadow: '0 16px 48px rgba(1, 11, 64, 0.3)',
          background: 'white',
          overflow: 'hidden'
        }
      }}
      {...props}
    >
      {/* Header avec titre et bouton fermer */}
      {title && (
        <DialogTitle 
          sx={{ 
            m: 0, 
            p: 3, 
            pb: 2,
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
            color: 'white',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box 
              component="h2" 
              sx={{ 
                m: 0,
                fontSize: '1.5rem',
                fontWeight: 600,
                fontFamily: 'Ubuntu, sans-serif'
              }}
            >
              {title}
            </Box>
            
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      {/* Contenu */}
      <DialogContent 
        sx={{ 
          p: padding,
          '&:first-of-type': { paddingTop: title ? 2 : padding }
        }}
      >
        {children}
      </DialogContent>

      {/* Actions (boutons) */}
      {actions && (
        <DialogActions 
          sx={{ 
            p: 3, 
            pt: 0,
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

// Variantes spécialisées
export const ConfirmModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmColor = "error",
  ...props 
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={
        <>
          <Button variant="outlined" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant="contained" 
            onClick={onConfirm}
            sx={{ 
              backgroundColor: confirmColor === 'error' ? colors.error.main : colors.primary.main,
              '&:hover': {
                backgroundColor: confirmColor === 'error' ? colors.error.dark : colors.primary.dark,
              }
            }}
          >
            {confirmText}
          </Button>
        </>
      }
      {...props}
    >
      <Typography>{message}</Typography>
    </Modal>
  );
};

export const SuccessModal = ({ open, onClose, title = "Succès", message, ...props }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={
        <Button variant="contained" onClick={onClose}>
          OK
        </Button>
      }
      {...props}
    >
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: colors.success.main, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color={colors.text.secondary}>
          {message}
        </Typography>
      </Box>
    </Modal>
  );
};

export default Modal;