// frontend/src/components/common/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Box, Fab, Zoom, CssBaseline } from '@mui/material';
import { KeyboardArrowUp as ArrowUpIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import Navbar from './Navbar';
import Footer from './Footer';

const HEADER_HEIGHT = 64;

// Palette de couleurs
const colors = {
  primary: '#010b40',
  secondary: '#f13544',
  accent: '#f13544',
  accentHover: '#d91f2e',
  white: '#FFFFFF',
  gray100: '#F8FAFC',
  gray200: '#E2E8F0',
  gray700: '#334155',
  gray800: '#1E293B',
};

// Animations professionnelles
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const gradientAnimation = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// Composants stylisés
const MainContainer = styled(Box)(({ theme, fullScreen }) => ({
  flex: 1,
  marginTop: fullScreen ? 0 : `${HEADER_HEIGHT}px`,
  minHeight: fullScreen ? '100vh' : `calc(100vh - ${HEADER_HEIGHT}px)`,
  position: 'relative',
  animation: `${fadeIn} 0.6s ease-out`,
  backgroundColor: colors.gray100,
  transition: 'all 0.3s ease',
}));

const AnimatedFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
  backgroundSize: '200% 200%',
  animation: `${gradientAnimation} 3s ease infinite`,
  color: colors.white,
  boxShadow: `0 8px 24px ${colors.accent}40, 0 0 0 1px ${colors.accent}20`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1200,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.accentHover}, ${colors.accent})`,
    boxShadow: `0 12px 32px ${colors.accent}60, 0 0 0 1px ${colors.accent}40`,
    transform: 'translateY(-4px) scale(1.05)',
    animation: `${pulse} 1.5s ease-in-out infinite`,
  },
  '&:active': {
    transform: 'translateY(-2px) scale(1.02)',
  },
}));

const PageTransition = styled(Box)(({ theme }) => ({
  animation: `${slideUp} 0.5s ease-out`,
  width: '100%',
  height: '100%',
}));

const BackgroundDecorations = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
}));

const DecorativeBlob = styled(Box)(({ theme, position, size, delay = 0 }) => ({
  position: 'absolute',
  width: size || '600px',
  height: size || '600px',
  borderRadius: '50%',
  filter: 'blur(100px)',
  opacity: 0.15,
  animation: `${float} ${8 + delay * 2}s ease-in-out infinite ${delay}s`,
  ...(position === 'top-right' && {
    top: '-10%',
    right: '-5%',
    background: `radial-gradient(circle, ${colors.accent}, transparent 70%)`,
  }),
  ...(position === 'bottom-left' && {
    bottom: '-15%',
    left: '-10%',
    background: `radial-gradient(circle, ${colors.accentHover}, transparent 70%)`,
  }),
  ...(position === 'center' && {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: `radial-gradient(circle, ${colors.primary}, transparent 70%)`,
  }),
}));

const GridPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    linear-gradient(${colors.accent}08 1px, transparent 1px),
    linear-gradient(90deg, ${colors.accent}08 1px, transparent 1px)
  `,
  backgroundSize: '50px 50px',
  opacity: 0.5,
  animation: `${float} 30s ease-in-out infinite`,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  width: '100%',
  height: '100%',
}));

const LoadingBar = styled(Box)(({ theme, show }) => ({
  position: 'fixed',
  top: HEADER_HEIGHT,
  left: 0,
  right: 0,
  height: '3px',
  background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentHover}, ${colors.accent})`,
  backgroundSize: '200% 100%',
  animation: show ? `${shimmer} 1.5s linear infinite` : 'none',
  opacity: show ? 1 : 0,
  transition: 'opacity 0.3s ease',
  zIndex: 1300,
  boxShadow: `0 0 10px ${colors.accent}60`,
}));

const Layout = ({
  children,
  headerVariant = 'default',
  footerVariant = 'default',
  fullScreen = false,
  showDecorations = true,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Simuler un chargement de page pour l'animation
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CssBaseline />
      
      {/* Barre de chargement animée */}
      <LoadingBar show={isLoading} />

      {/* Décorations de fond */}
      {showDecorations && (
        <BackgroundDecorations>
          <GridPattern />
          <DecorativeBlob position="top-right" size="700px" delay={0} />
          <DecorativeBlob position="bottom-left" size="800px" delay={1} />
          <DecorativeBlob position="center" size="500px" delay={2} />
        </BackgroundDecorations>
      )}

      {/* Header avec animation */}
      <Box
        sx={{
          position: fullScreen ? 'absolute' : 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          animation: `${slideUp} 0.6s ease-out`,
          backdropFilter: 'blur(10px)',
          backgroundColor: fullScreen ? 'transparent' : `${colors.white}95`,
          boxShadow: fullScreen ? 'none' : `0 2px 20px ${colors.primary}10`,
          transition: 'all 0.3s ease',
        }}
      >
        <Navbar variant={headerVariant} />
      </Box>

      {/* Main Content avec transition */}
      <MainContainer component="main" fullScreen={fullScreen}>
        <ContentWrapper>
          <PageTransition>
            {children || <Outlet />}
          </PageTransition>
        </ContentWrapper>
      </MainContainer>

      {/* Footer avec animation */}
      {!fullScreen && footerVariant !== 'hidden' && (
        <Box
          sx={{
            animation: `${fadeIn} 0.8s ease-out 0.3s both`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Footer variant={footerVariant} />
        </Box>
      )}

      {/* Bouton Scroll to Top amélioré */}
      <Zoom in={showScrollTop} timeout={300}>
        <AnimatedFab
          onClick={handleScrollToTop}
          size="medium"
          aria-label="Retour en haut"
        >
          <ArrowUpIcon sx={{ fontSize: 28 }} />
        </AnimatedFab>
      </Zoom>

      {/* Particules flottantes décoratives */}
      {showDecorations && showScrollTop && (
        <>
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'fixed',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: colors.accent,
                bottom: `${100 + i * 80}px`,
                right: `${32 + i * 15}px`,
                opacity: 0.6,
                animation: `${float} ${3 + i}s ease-in-out infinite ${i * 0.5}s`,
                boxShadow: `0 0 10px ${colors.accent}`,
                zIndex: 1150,
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
};

// Variantes prédéfinies avec configurations optimisées
export const DashboardLayout = (props) => (
  <Layout 
    footerVariant="minimal" 
    showDecorations={true}
    {...props} 
  />
);

export const AuthLayout = (props) => (
  <Layout 
    headerVariant="minimal" 
    footerVariant="minimal" 
    showDecorations={false}
    {...props} 
  /> 
);

export const PublicLayout = (props) => (
  <Layout 
    showDecorations={true}
    {...props} 
  />
);

export const MinimalLayout = (props) => (
  <Layout 
    headerVariant="transparent" 
    footerVariant="hidden" 
    fullScreen 
    showDecorations={false}
    {...props} 
  />
);

export const CourseLayout = (props) => (
  <Layout 
    footerVariant="minimal" 
    showDecorations={true}
    {...props} 
  />
);

export const LandingLayout = (props) => (
  <Layout 
    headerVariant="transparent" 
    footerVariant="default" 
    showDecorations={true}
    {...props} 
  />
);

export default Layout;