import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Slide,
  Fade,
  Zoom,
  useMediaQuery,
  useTheme,
  Typography,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { colors, gradients, shadows } from "../utils/colors";

// Transitions personnalisées
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FadeTransition = React.forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

const ZoomTransition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullScreen = false,
  disableBackdropClick = false,
  showCloseButton = true,
  transition = "slide", // 'slide', 'fade', 'zoom', 'none'
  padding = 3,
  headerColor = "primary",
  variant = "default", // 'default', 'youth-computing'
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const getTransitionComponent = () => {
    switch (transition) {
      case "slide":
        return SlideTransition;
      case "fade":
        return FadeTransition;
      case "zoom":
        return ZoomTransition;
      default:
        return undefined;
    }
  };

  const getHeaderBackground = () => {
    if (variant === "youth-computing") {
      return gradients.primaryToSecondary;
    }

    switch (headerColor) {
      case "primary":
        return gradients.primary;
      case "secondary":
        return gradients.secondary;
      case "success":
        return `linear-gradient(135deg, ${colors.success.main} 0%, ${colors.success.dark} 100%)`;
      case "warning":
        return `linear-gradient(135deg, ${colors.warning.main} 0%, ${colors.warning.dark} 100%)`;
      case "error":
        return `linear-gradient(135deg, ${colors.error.main} 0%, ${colors.error.dark} 100%)`;
      default:
        return gradients.primary;
    }
  };

  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === "backdropClick") {
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
          borderRadius: isMobile ? 0 : 3,
          boxShadow: shadows.modal,
          background: "white",
          overflow: "hidden",
          ...(variant === "youth-computing" && {
            border: `2px solid transparent`,
            backgroundImage: `linear-gradient(white, white), ${gradients.primaryToSecondary}`,
            backgroundOrigin: "border-box",
            backgroundClip: "content-box, border-box",
          }),
        },
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
            background: getHeaderBackground(),
            color: "white",
            position: "relative",
            ...(variant === "youth-computing" && {
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              },
            }),
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              component="h2"
              variant="h5"
              sx={{
                m: 0,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600,
                fontFamily: "Ubuntu, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {variant === "youth-computing" && (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  YC
                </Avatar>
              )}
              {title}
            </Typography>

            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    transform: "rotate(90deg)",
                  },
                  transition: "all 0.3s ease",
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
          "&:first-of-type": { paddingTop: title ? 2 : padding },
          ...(variant === "youth-computing" && {
            backgroundColor: "rgba(1, 11, 64, 0.01)",
          }),
        }}
      >
        {children}
      </DialogContent>

      {/* Actions (boutons) */}
      {actions && (
        <>
          <Divider />
          <DialogActions
            sx={{
              p: 3,
              pt: 2,
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              backgroundColor:
                variant === "youth-computing"
                  ? "rgba(1, 11, 64, 0.02)"
                  : "transparent",
            }}
          >
            {actions}
          </DialogActions>
        </>
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
  icon,
  ...props
}) => {
  const getIcon = () => {
    if (icon) return icon;

    switch (confirmColor) {
      case "error":
        return (
          <WarningIcon sx={{ color: colors.warning.main, fontSize: 48 }} />
        );
      case "success":
        return (
          <CheckCircleIcon sx={{ color: colors.success.main, fontSize: 48 }} />
        );
      default:
        return <InfoIcon sx={{ color: colors.info.main, fontSize: 48 }} />;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      variant="youth-computing"
      actions={
        <>
          <Button variant="outlined" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            sx={{
              backgroundColor:
                colors[confirmColor]?.main || colors.primary.main,
              "&:hover": {
                backgroundColor:
                  colors[confirmColor]?.dark || colors.primary.dark,
              },
            }}
          >
            {confirmText}
          </Button>
        </>
      }
      {...props}
    >
      <Box sx={{ textAlign: "center", py: 2 }}>
        {getIcon()}
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>
          {message}
        </Typography>
      </Box>
    </Modal>
  );
};

export const SuccessModal = ({
  open,
  onClose,
  title = "Succès",
  message,
  actionText = "Continuer",
  ...props
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      variant="youth-computing"
      headerColor="success"
      actions={
        <Button variant="contained" onClick={onClose} color="success">
          {actionText}
        </Button>
      }
      {...props}
    >
      <Box sx={{ textAlign: "center", py: 3 }}>
        <CheckCircleIcon
          sx={{ fontSize: 64, color: colors.success.main, mb: 2 }}
        />
        <Typography variant="h6" gutterBottom color={colors.text.primary}>
          {title}
        </Typography>
        <Typography variant="body2" color={colors.text.secondary}>
          {message}
        </Typography>
      </Box>
    </Modal>
  );
};

export const ErrorModal = ({
  open,
  onClose,
  title = "Erreur",
  message,
  actionText = "Fermer",
  ...props
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      variant="youth-computing"
      headerColor="error"
      actions={
        <Button variant="contained" onClick={onClose} color="error">
          {actionText}
        </Button>
      }
      {...props}
    >
      <Box sx={{ textAlign: "center", py: 3 }}>
        <ErrorIcon sx={{ fontSize: 64, color: colors.error.main, mb: 2 }} />
        <Typography variant="h6" gutterBottom color={colors.text.primary}>
          {title}
        </Typography>
        <Typography variant="body2" color={colors.text.secondary}>
          {message}
        </Typography>
      </Box>
    </Modal>
  );
};

export const YouthComputingModal = ({ children, ...props }) => (
  <Modal variant="youth-computing" {...props}>
    {children}
  </Modal>
);

export default Modal;
