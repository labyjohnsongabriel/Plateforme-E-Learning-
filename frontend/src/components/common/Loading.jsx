import React from "react";
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Fade,
  Backdrop,
  Paper,
  Avatar,
  Skeleton,
} from "@mui/material";
import { School as SchoolIcon } from "@mui/icons-material";
import { colors, gradients, shadows } from "../../utils/colors";

// Logo Youth Computing animé
const YouthComputingLoader = ({ size = 60 }) => (
  <Box
    sx={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress
      size={size + 10}
      thickness={3}
      sx={{
        color: colors.primary.main,
        position: "absolute",
        animation: "spin 2s linear infinite",
        "@keyframes spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      }}
    />
    <CircularProgress
      size={size}
      thickness={4}
      sx={{
        color: colors.secondary.main,
        position: "absolute",
        animation: "spin-reverse 1.5s linear infinite",
        "@keyframes spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      }}
    />
    <Avatar
      sx={{
        width: size - 20,
        height: size - 20,
        background: gradients.primary,
        animation: "pulse 2s ease-in-out infinite",
        "@keyframes pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      }}
    >
      <SchoolIcon sx={{ color: "white", fontSize: (size - 20) * 0.6 }} />
    </Avatar>
  </Box>
);

// Loading global avec le branding Youth Computing
export const GlobalLoading = ({
  open = false,
  message = "Chargement en cours...",
  submessage = "Veuillez patienter",
  showProgress = false,
  progress = 0,
}) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 999,
        background: `linear-gradient(135deg, ${colors.primary.main}F0 0%, ${colors.primary.dark}F0 100%)`,
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
      open={open}
    >
      <Fade in={open} timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${colors.primary.light}20`,
            boxShadow: shadows.modal,
            maxWidth: 400,
          }}
        >
          <YouthComputingLoader size={80} />

          <Typography
            variant="h6"
            sx={{
              mt: 3,
              mb: 1,
              color: colors.text.primary,
              fontFamily: "Ubuntu, sans-serif",
              fontWeight: 600,
            }}
          >
            {message}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: colors.text.secondary,
              mb: showProgress ? 2 : 0,
            }}
          >
            {submessage}
          </Typography>

          {showProgress && (
            <Box sx={{ width: "100%", mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.grey[200],
                  "& .MuiLinearProgress-bar": {
                    background: gradients.primary,
                    borderRadius: 3,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ mt: 1, color: colors.text.secondary }}
              >
                {progress}% terminé
              </Typography>
            </Box>
          )}
        </Paper>
      </Fade>
    </Backdrop>
  );
};

// Loading inline pour les composants
export const InlineLoading = ({
  size = 24,
  thickness = 4,
  message,
  variant = "circular", // 'circular', 'linear', 'dots'
  color = "primary",
}) => {
  const colorMap = {
    primary: colors.primary.main,
    secondary: colors.secondary.main,
    success: colors.success.main,
    warning: colors.warning.main,
    error: colors.error.main,
  };

  if (variant === "linear") {
    return (
      <Box sx={{ width: "100%", p: 2 }}>
        <LinearProgress
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.grey[200],
            "& .MuiLinearProgress-bar": {
              backgroundColor: colorMap[color],
              borderRadius: 2,
            },
          }}
        />
        {message && (
          <Typography
            variant="body2"
            color={colors.text.secondary}
            sx={{ mt: 1, textAlign: "center" }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  if (variant === "dots") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {[1, 2, 3].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: colorMap[color],
                animation: `bounce 1.4s ease-in-out ${
                  (dot - 1) * 0.16
                }s infinite both`,
                "@keyframes bounce": {
                  "0%, 80%, 100%": {
                    transform: "scale(0)",
                    opacity: 0.5,
                  },
                  "40%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
        {message && (
          <Typography variant="body2" color={colors.text.secondary}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        justifyContent: "center",
      }}
    >
      <CircularProgress
        size={size}
        thickness={thickness}
        sx={{ color: colorMap[color] }}
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
export const SkeletonLoading = ({
  count = 3,
  height = 60,
  variant = "rounded", // 'rounded', 'rectangular', 'circular', 'text'
  animation = "pulse", // 'pulse', 'wave'
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      {Array.from(new Array(count)).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          height={height}
          animation={animation}
          sx={{
            mb: 1,
            backgroundColor: colors.grey[100],
            "&::after": {
              background: `linear-gradient(90deg, transparent, ${colors.grey[200]}, transparent)`,
            },
          }}
        />
      ))}
    </Box>
  );
};

// Loading pour les cartes de cours
export const CourseCardSkeleton = ({ count = 4 }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
    {Array.from(new Array(count)).map((_, index) => (
      <Box
        key={index}
        sx={{
          width: {
            xs: "100%",
            sm: "calc(50% - 12px)",
            md: "calc(33.33% - 16px)",
          },
        }}
      >
        <Paper sx={{ p: 0, borderRadius: 3, overflow: "hidden" }}>
          <Skeleton variant="rectangular" height={160} />
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" height={28} width="80%" />
            <Skeleton variant="text" height={20} width="60%" sx={{ mt: 1 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Skeleton variant="text" width="40%" />
              <Skeleton
                variant="rectangular"
                width={60}
                height={24}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    ))}
  </Box>
);

// Loading pour les listes
export const ListSkeleton = ({ count = 5, showAvatar = true }) => (
  <Box sx={{ width: "100%" }}>
    {Array.from(new Array(count)).map((_, index) => (
      <Box
        key={index}
        sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}
      >
        {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" height={24} width="70%" />
          <Skeleton variant="text" height={20} width="50%" />
        </Box>
        <Skeleton
          variant="rectangular"
          width={80}
          height={32}
          sx={{ borderRadius: 1 }}
        />
      </Box>
    ))}
  </Box>
);

// Loading pour les boutons
export const ButtonLoading = ({ size = 20, color = "inherit" }) => (
  <CircularProgress
    size={size}
    thickness={4}
    sx={{
      color: color === "inherit" ? "inherit" : colors[color]?.main || color,
    }}
  />
);

// Loading pour les tableaux
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box sx={{ width: "100%" }}>
    {Array.from(new Array(rows)).map((_, rowIndex) => (
      <Box
        key={rowIndex}
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          borderBottom: `1px solid ${colors.grey[200]}`,
        }}
      >
        {Array.from(new Array(columns)).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            height={24}
            sx={{ flex: 1 }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

// Loading spécifique pour Youth Computing avec message personnalisé
export const YouthComputingLoading = ({
  message = "Chargement des cours...",
  tips = [
    "Saviez-vous que nos cours sont organisés par niveaux ?",
    "Découvrez notre système de progression unique !",
    "Tous nos cours sont gratuits et accessibles à tous.",
    "Rejoignez notre communauté d'apprenants motivés !",
  ],
}) => {
  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [tips]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        textAlign: "center",
        p: 4,
      }}
    >
      <YouthComputingLoader size={100} />

      <Typography
        variant="h5"
        sx={{
          mt: 3,
          mb: 2,
          color: colors.text.primary,
          fontFamily: "Ubuntu, sans-serif",
          fontWeight: 600,
        }}
      >
        {message}
      </Typography>

      <Fade key={currentTip} in timeout={500}>
        <Typography
          variant="body2"
          sx={{
            color: colors.text.secondary,
            fontStyle: "italic",
            maxWidth: 400,
            minHeight: 40,
            display: "flex",
            alignItems: "center",
          }}
        >
          💡 {tips[currentTip]}
        </Typography>
      </Fade>
    </Box>
  );
};

export default GlobalLoading;
