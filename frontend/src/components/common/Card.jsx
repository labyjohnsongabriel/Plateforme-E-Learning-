import React from "react";
import {
  Card as MuiCard,
  CardContent,
  CardMedia,
  CardActions,
  CardHeader,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,x
  ButtonBase,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  PlayCircle as PlayIcon,
  Schedule as ScheduleIcon,
  School as LevelIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { colors, gradients, shadows } from "../../utils/colors";

// Logo Youth Computing pour les cartes
const YouthComputingBadge = ({ size = "small" }) => {
  const dimensions =
    size === "small" ? { width: 24, height: 24 } : { width: 32, height: 32 };

  return (
    <Box
      sx={{
        ...dimensions,
        background: gradients.primary,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: size === "small" ? "12px" : "16px",
        fontWeight: "bold",
      }}
    >
      YC
    </Box>
  );
};

const Card = ({
  children,
  variant = "elevation",
  elevation = 1,
  hoverEffect = true,
  onClick,
  interactive = false,
  ...props
}) => {
  return (
    <MuiCard
      variant={variant}
      elevation={elevation}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: `1px solid ${colors.grey[200]}`,
        background: "white",
        position: "relative",
        ...(hoverEffect && {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: shadows.cardHover,
            borderColor: colors.primary.light,
            "& .yc-card-media": {
              transform: "scale(1.05)",
            },
          },
        }),
        ...(onClick && {
          cursor: "pointer",
          "&:active": {
            transform: "translateY(-1px)",
          },
        }),
        ...(interactive && {
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: gradients.primaryToSecondary,
          },
        }),
        ...props.sx,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </MuiCard>
  );
};

// Carte de cours spécialisée Youth Computing
export const CourseCard = ({
  image,
  title,
  instructor,
  duration,
  level,
  category,
  progress,
  price,
  isEnrolled = false,
  isFavorite = false,
  isNew = false,
  difficulty,
  onFavorite,
  onShare,
  onMenuClick,
  onClick,
  ...props
}) => {
  const getLevelColor = (level) => {
    const colorsMap = {
      alfa: { color: colors.info.main, label: "Débutant" },
      beta: { color: colors.success.main, label: "Intermédiaire" },
      gamma: { color: colors.warning.main, label: "Avancé" },
      delta: { color: colors.secondary.main, label: "Expert" },
      epsilon: { color: colors.primary.main, label: "Master" },
    };
    return colorsMap[level] || { color: colors.grey[500], label: "Niveau" };
  };

  const getCategoryInfo = (category) => {
    const categories = {
      informatique: { icon: "💻", color: colors.primary.main },
      communication: { icon: "📢", color: colors.secondary.main },
      multimedia: { icon: "🎬", color: colors.info.main },
    };
    return categories[category] || { icon: "📚", color: colors.grey[500] };
  };

  const levelInfo = getLevelColor(level);
  const categoryInfo = getCategoryInfo(category);

  return (
    <Card hoverEffect interactive onClick={onClick} {...props}>
      {/* Image du cours avec overlay */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="180"
          image={image || "/api/placeholder/400/180"}
          alt={title}
          className="yc-card-media"
          sx={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
        />

        {/* Overlay avec informations */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            p: 2,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 60%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={levelInfo.label}
              size="small"
              sx={{
                backgroundColor: levelInfo.color,
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
            {isNew && (
              <Chip
                label="NOUVEAU"
                size="small"
                sx={{
                  backgroundColor: colors.secondary.main,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  animation: "pulse 2s infinite",
                }}
              />
            )}
            {price === 0 && (
              <Chip
                label="GRATUIT"
                size="small"
                sx={{
                  backgroundColor: colors.success.main,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                "&:hover": {
                  backgroundColor: "white",
                  transform: "scale(1.1)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
            >
              <FavoriteIcon
                fontSize="small"
                sx={{
                  color: isFavorite ? colors.secondary.main : colors.grey[500],
                }}
              />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                "&:hover": {
                  backgroundColor: "white",
                  transform: "scale(1.1)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.();
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Badge Youth Computing */}
        <Box
          sx={{
            position: "absolute",
            bottom: -16,
            right: 16,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: gradients.primary,
              border: "3px solid white",
              fontSize: "1.2rem",
              boxShadow: shadows.card,
            }}
          >
            {categoryInfo.icon}
          </Avatar>
        </Box>
      </Box>

      {/* Contenu */}
      <CardContent sx={{ pt: 3, pb: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontFamily: "Ubuntu, sans-serif",
            fontWeight: 600,
            lineHeight: 1.3,
            height: 56,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: colors.text.primary,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PersonIcon fontSize="small" sx={{ color: colors.grey[500] }} />
          <Typography
            variant="body2"
            color={colors.text.secondary}
            sx={{ fontFamily: "Century Gothic, sans-serif" }}
          >
            {instructor}
          </Typography>
        </Box>

        {/* Métadonnées */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ScheduleIcon fontSize="small" sx={{ color: colors.grey[500] }} />
            <Typography variant="caption" color={colors.text.secondary}>
              {duration} min
            </Typography>
          </Box>

          <Chip
            label={category}
            size="small"
            variant="outlined"
            sx={{
              borderColor: categoryInfo.color,
              color: categoryInfo.color,
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Prix */}
        {price !== undefined && (
          <Typography
            variant="h6"
            color={price === 0 ? colors.success.main : colors.primary.main}
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            {price === 0 ? "Gratuit" : `${price} FCFA`}
          </Typography>
        )}

        {/* Barre de progression */}
        {isEnrolled && progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography
                variant="caption"
                fontWeight={500}
                color={colors.text.primary}
              >
                Progression
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                color={colors.primary.main}
              >
                {progress}%
              </Typography>
            </Box>
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
          </Box>
        )}
      </CardContent>

      <Divider />

      {/* Actions */}
      <CardActions sx={{ p: 2, justifyContent: "space-between" }}>
        <ButtonBase
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: colors.primary.main,
            fontWeight: 600,
            fontSize: "0.9rem",
            padding: "8px 16px",
            borderRadius: 2,
            "&:hover": {
              backgroundColor: `${colors.primary.main}08`,
              color: colors.primary.dark,
            },
          }}
          onClick={onClick}
        >
          <PlayIcon />
          {isEnrolled ? "Continuer" : "Commencer"}
        </ButtonBase>

        <YouthComputingBadge />
      </CardActions>
    </Card>
  );
};

// Carte de statistiques
export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  trend,
  ...props
}) => {
  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <Card interactive {...props}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              component="div"
              fontWeight={700}
              color={selectedColor.main}
              gutterBottom
              sx={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              {value}
            </Typography>
            <Typography
              variant="h6"
              component="div"
              color={colors.text.primary}
              fontWeight={600}
              sx={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color={colors.text.secondary}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${selectedColor.main}15, ${selectedColor.main}25)`,
              color: selectedColor.main,
              border: `2px solid ${selectedColor.main}20`,
            }}
          >
            {icon}
          </Avatar>
        </Box>

        {trend && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              p: 1,
              borderRadius: 1,
              backgroundColor:
                trend.value > 0
                  ? `${colors.success.main}10`
                  : `${colors.error.main}10`,
            }}
          >
            <TrendingUpIcon
              fontSize="small"
              sx={{
                color:
                  trend.value > 0 ? colors.success.main : colors.error.main,
                transform: trend.value < 0 ? "rotate(180deg)" : "none",
              }}
            />
            <Typography
              variant="caption"
              fontWeight={600}
              color={trend.value > 0 ? colors.success.main : colors.error.main}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </Typography>
            <Typography variant="caption" color={colors.text.secondary}>
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Carte de certificat Youth Computing
export const CertificateCard = ({
  title,
  date,
  level,
  course,
  isVerified = true,
  onClick,
  ...props
}) => {
  const levelInfo = {
    alfa: { color: colors.info.main, label: "Alfa" },
    beta: { color: colors.success.main, label: "Beta" },
    gamma: { color: colors.warning.main, label: "Gamma" },
    delta: { color: colors.secondary.main, label: "Delta" },
    epsilon: { color: colors.primary.main, label: "Epsilon" },
  };

  const currentLevel = levelInfo[level] || levelInfo.alfa;

  return (
    <Card hoverEffect interactive onClick={onClick} {...props}>
      <CardContent sx={{ p: 3, textAlign: "center", position: "relative" }}>
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <YouthComputingBadge />
        </Box>

        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            background: gradients.primaryToSecondary,
            fontSize: "2.5rem",
            boxShadow: shadows.card,
          }}
        >
          <TrophyIcon fontSize="large" />
        </Avatar>

        <Typography
          variant="h6"
          fontWeight={600}
          gutterBottom
          color={colors.text.primary}
        >
          {title}
        </Typography>

        <Typography variant="body2" color={colors.text.secondary} gutterBottom>
          {course}
        </Typography>

        <Chip
          label={`Niveau ${currentLevel.label}`}
          size="small"
          sx={{
            backgroundColor: currentLevel.color,
            color: "white",
            fontWeight: 600,
            mb: 2,
          }}
        />

        {isVerified && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: colors.success.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
              >
                ✓
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color={colors.success.main}
              fontWeight={500}
            >
              Vérifié
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color={colors.text.secondary}>
          Obtenu le {new Date(date).toLocaleDateString("fr-FR")}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Card;
