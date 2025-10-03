import React from 'react';
import { Card as MuiCard, CardContent, CardActions, CardHeader, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';
import '../../styles/variables.css';

// Styled Card avec notre design system
const StyledCard = styled(MuiCard)(({ theme, variant, elevation, interactive }) => {
  const baseStyles = {
    borderRadius: 'var(--radius-2xl)',
    border: '1px solid var(--gray-200)',
    transition: 'all var(--transition-base)',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--white)',
  };

  const variantStyles = {
    default: {
      boxShadow: 'var(--shadow-md)',
      '&:hover': interactive ? {
        transform: 'translateY(-4px)',
        boxShadow: 'var(--shadow-xl)',
      } : {},
    },
    outlined: {
      boxShadow: 'none',
      border: '2px solid var(--gray-300)',
      '&:hover': interactive ? {
        borderColor: 'var(--secondary-red)',
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-md)',
      } : {},
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: 'var(--shadow-lg)',
      '&:hover': interactive ? {
        background: 'rgba(255, 255, 255, 0.15)',
        transform: 'translateY(-4px)',
        boxShadow: 'var(--shadow-2xl)',
      } : {},
    },
    gradient: {
      background: 'var(--gradient-primary)',
      color: 'var(--white)',
      border: 'none',
      boxShadow: 'var(--shadow-lg)',
      '&:hover': interactive ? {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: 'var(--shadow-2xl)',
      } : {},
      '& .MuiCardContent-root': {
        color: 'var(--white)',
      },
      '& .MuiCardHeader-title': {
        color: 'var(--white)',
      },
      '& .MuiCardHeader-subheader': {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
    feature: {
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      '&::before': {
            content: '""',
        position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
        height: '4px',
        background: 'var(--gradient-secondary)',
        borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
      },
      '&:hover': interactive ? {
        transform: 'translateY(-6px)',
        boxShadow: 'var(--shadow-2xl)',
        '&::before': {
          height: '6px',
        },
      } : {},
    },
    pricing: {
      background: 'var(--white)',
      border: '2px solid var(--gray-200)',
      boxShadow: 'var(--shadow-lg)',
      position: 'relative',
      '&.featured': {
        border: '2px solid var(--secondary-red)',
        transform: 'scale(1.05)',
        '&::before': {
          content: '"Populaire"',
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--gradient-secondary)',
          color: 'var(--white)',
          padding: 'var(--space-1) var(--space-4)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          zIndex: 1,
        },
      },
      '&:hover': interactive ? {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: 'var(--shadow-2xl)',
        borderColor: 'var(--secondary-red)',
      } : {},
    },
  };

  const elevationStyles = {
    0: { boxShadow: 'none' },
    1: { boxShadow: 'var(--shadow-sm)' },
    2: { boxShadow: 'var(--shadow-base)' },
    3: { boxShadow: 'var(--shadow-md)' },
    4: { boxShadow: 'var(--shadow-lg)' },
    5: { boxShadow: 'var(--shadow-xl)' },
    6: { boxShadow: 'var(--shadow-2xl)' },
  };

  const currentVariant = variant || 'default';
  const currentElevation = elevation !== undefined ? elevation : 3;

  return {
    ...baseStyles,
    ...variantStyles[currentVariant],
    ...(currentVariant === 'default' && elevationStyles[currentElevation]),
  };
});

const StyledCardContent = styled(CardContent)({
  padding: 'var(--space-6)',
  '&:last-child': {
    paddingBottom: 'var(--space-6)',
  },
});

const StyledCardActions = styled(CardActions)({
  padding: 'var(--space-6)',
  paddingTop: 0,
  gap: 'var(--space-3)',
});

const StyledCardHeader = styled(CardHeader)({
  padding: 'var(--space-6)',
  paddingBottom: 'var(--space-3)',
  '& .MuiCardHeader-title': {
    fontFamily: 'var(--font-primary)',
    fontWeight: 'var(--font-semibold)',
    fontSize: 'var(--text-xl)',
    color: 'var(--primary-navy)',
  },
  '& .MuiCardHeader-subheader': {
    fontFamily: 'var(--font-secondary)',
    fontSize: 'var(--text-sm)',
    color: 'var(--gray-600)',
    marginTop: 'var(--space-1)',
  },
});

const StyledCardMedia = styled(CardMedia)({
  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
    pointerEvents: 'none',
  },
});

const Card = React.forwardRef(({
  children,
  variant = 'default',
  elevation,
  interactive = false,
  className,
  featured = false,
  ...props
}, ref) => {
  return (
    <StyledCard
      ref={ref}
      variant={variant}
      elevation={elevation}
      interactive={interactive}
      className={`${className || ''} ${featured ? 'featured' : ''}`.trim()}
      {...props}
    >
      {children}
    </StyledCard>
  );
});

Card.displayName = 'Card';

// Export des sous-composants stylés
Card.Content = StyledCardContent;
Card.Actions = StyledCardActions;
Card.Header = StyledCardHeader;
Card.Media = StyledCardMedia;

export default Card;
