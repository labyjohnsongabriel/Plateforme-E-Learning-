import React from 'react';
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
  Avatar,
  ButtonBase
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  PlayCircle as PlayIcon,
  Schedule as ScheduleIcon,
  School as LevelIcon
} from '@mui/icons-material';
import { colors, gradients } from '../utils/colors';

const Card = ({
  children,
  variant = 'elevation',
  elevation = 1,
  hoverEffect = true,
  onClick,
  ...props
}) => {
  return (
    <MuiCard
      variant={variant}
      elevation={elevation}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: `1px solid ${colors.grey[200]}`,
        background: 'white',
        ...(hoverEffect && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 32px rgba(1, 11, 64, 0.15)`,
            borderColor: colors.primary.light,
          },
        }),
        ...(onClick && {
          cursor: 'pointer',
          '&:active': {
            transform: 'translateY(-1px)',
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

// Carte de cours spécialisée
export const CourseCard = ({
  image,
  title,
  instructor,
  duration,
  level,
  category,
  progress,
  isEnrolled = false,
  isFavorite = false,
  onFavorite,
  onShare,
  onMenuClick,
  onClick,
  ...props
}) => {
  const getLevelColor = (level) => {
    const colorsMap = {
      alfa: colors.info,
      beta: colors.success,
      gamma: colors.warning,
      delta: colors.secondary,
      epsilon: colors.primary
    };
    return colorsMap[level] || colors.grey;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      informatique: '💻',
      communication: '📢',
      multimedia: '🎬'
    };
    return icons[category] || '📚';
  };

  return (
    <Card hoverEffect onClick={onClick} {...props}>
      {/* Image du cours */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={image || '/placeholder-course.jpg'}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Overlay avec informations */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          p: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <Chip
            label={level.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: getLevelColor(level).main,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'white' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
            >
              <FavoriteIcon 
                fontSize="small" 
                sx={{ 
                  color: isFavorite ? colors.secondary.main : colors.grey[500] 
                }} 
              />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'white' }
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

        {/* Badge de catégorie */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: -12, 
          right: 16 
        }}>
          <Avatar sx={{ 
            width: 40, 
            height: 40, 
            backgroundColor: colors.primary.main,
            fontSize: '1.2rem'
          }}>
            {getCategoryIcon(category)}
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
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 600,
            lineHeight: 1.3,
            height: 48,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {title}
        </Typography>

        <Typography 
          variant="body2" 
          color={colors.text.secondary}
          sx={{ mb: 2, fontFamily: 'Century Gothic, sans-serif' }}
        >
          Par {instructor}
        </Typography>

        {/* Métadonnées */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
              borderColor: colors.primary.main,
              color: colors.primary.main,
              fontSize: '0.7rem'
            }}
          />
        </Box>

        {/* Barre de progression */}
        {isEnrolled && progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" fontWeight={500}>
                Progression
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {progress}%
              </Typography>
            </Box>
            <Box sx={{ 
              width: '100%', 
              height: 4, 
              backgroundColor: colors.grey[200],
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Box 
                sx={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  background: gradients.primary,
                  transition: 'width 0.3s ease'
                }} 
              />
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <ButtonBase
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: colors.primary.main,
            fontWeight: 600,
            fontSize: '0.9rem',
            '&:hover': {
              color: colors.primary.dark,
            }
          }}
          onClick={onClick}
        >
          <PlayIcon />
          {isEnrolled ? 'Continuer' : 'Démarrer'}
        </ButtonBase>
      </CardActions>
    </Card>
  );
};

// Carte de statistiques
export const StatsCard = ({ title, value, subtitle, icon, color = 'primary', trend, ...props }) => {
  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <Card {...props}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography 
              variant="h3" 
              component="div" 
              fontWeight={700}
              color={selectedColor.main}
              gutterBottom
            >
              {value}
            </Typography>
            <Typography 
              variant="h6" 
              component="div" 
              color={colors.text.primary}
              fontWeight={600}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color={colors.text.secondary}>
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Avatar sx={{ 
            width: 56, 
            height: 56, 
            backgroundColor: `${selectedColor.main}15`,
            color: selectedColor.main
          }}>
            {icon}
          </Avatar>
        </Box>

        {trend && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: trend.value > 0 ? colors.success.main : colors.error.main
          }}>
            <Typography variant="caption" fontWeight={600}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
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

// Carte de certificat
export const CertificateCard = ({ title, date, level, course, image, onClick, ...props }) => {
  return (
    <Card hoverEffect onClick={onClick} {...props}>
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            backgroundColor: colors.primary.main,
            fontSize: '2rem'
          }}
        >
          🏆
        </Avatar>
        
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color={colors.text.secondary} gutterBottom>
          {course}
        </Typography>
        
        <Chip
          label={`Niveau ${level}`}
          size="small"
          sx={{
            backgroundColor: colors.secondary.main,
            color: 'white',
            fontWeight: 600,
            mb: 2
          }}
        />
        
        <Typography variant="caption" color={colors.text.secondary}>
          Obtenu le {new Date(date).toLocaleDateString('fr-FR')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Card;