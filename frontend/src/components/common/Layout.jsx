// frontend/src/components/common/Layout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Fab, Zoom, CssBaseline, GlobalStyles, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowUp as ArrowUpIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import "../../styles/components.css";

// Constantes pour les dimensions
const DRAWER_WIDTH = 240; // Corrigé de 20 à 240
const HEADER_HEIGHT = 64; // Corrigé de 20 à 64

// Styles globaux pour l'application
const globalStyles = {
  '@keyframes fadeInUp': {
    from: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  },
  '@keyframes fadeInLeft': {
    from: { opacity: 0, transform: 'translate3d(-20px, 0, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
  '*': {
    scrollBehavior: 'smooth',
    boxSizing: 'border-box',
  },
  'html, body': {
    margin: 0,
    padding: 0,
    fontFamily: 'var(--font-primary)',
    backgroundColor: 'var(--gray-50)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  '#root': {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  '::selection': {
    backgroundColor: 'var(--secondary-red-200)',
    color: 'var(--primary-navy)',
  },
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: 'var(--gray-100)',
    borderRadius: 'var(--radius-full)',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--gray-400)',
    borderRadius: 'var(--radius-full)',
    transition: 'background var(--transition-fast)',
    '&:hover': { backgroundColor: 'var(--secondary-red)' },
  },
  '.fade-in-up': { animation: '$fadeInUp 0.6s ease-out' },
  '.fade-in-left': { animation: '$fadeInLeft 0.6s ease-out' },
  '.fade-in': { animation: '$fadeIn 0.3s ease-out' },
  '.pulse': { animation: '$pulse 2s ease-in-out infinite' },
  '.focus-visible': {
    outline: '2px solid var(--secondary-red)',
    outlineOffset: '2px',
    borderRadius: 'var(--radius-base)',
  },
};

// Styled Components
const LayoutContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
});

const MainContainer = styled(Box)({
  display: 'flex',
  flex: 1,
  width: '100%',
  minHeight: 'calc(100vh - 64px)', // Hauteur totale moins le header
  position: 'relative',
});

const ContentWrapper = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  width: '100%',
  transition: 'all 0.3s ease-in-out',
});

const PageContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 128px)', // Hauteur moins header et footer
  width: '100%',
  overflow: 'auto',
});

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  animation: 'fadeInUp 0.8s ease-out',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const FooterWrapper = styled(Box)({
  width: '100%',
  flexShrink: 0,
  marginTop: 'auto',
});

const StyledFab = styled(Fab)({
  background: 'var(--gradient-secondary)',
  color: 'var(--white)',
  boxShadow: 'var(--shadow-lg)',
  '&:hover': {
    background: 'linear-gradient(135deg, var(--secondary-red-dark) 0%, var(--secondary-red) 100%)',
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: 'var(--shadow-glow)',
  },
  transition: 'all var(--transition-base)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
});

const Overlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: 1100,
  animation: 'fadeIn 0.3s ease-out',
});

const Layout = ({
  children,
  showSidebar = true,
  sidebarVariant = 'responsive',
  headerVariant = 'default',
  footerVariant = 'default',
  backgroundPattern = false,
  containerMaxWidth = 'xl',
  fullScreen = false,
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (sidebarVariant === 'responsive') {
      setSidebarOpen(isLargeScreen);
    } else if (sidebarVariant === 'permanent') {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isLargeScreen, sidebarVariant]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getSidebarVariant = () => {
    if (sidebarVariant === 'responsive') {
      return isLargeScreen ? 'permanent' : 'temporary';
    }
    const validVariants = ['permanent', 'temporary', 'persistent'];
    return validVariants.includes(sidebarVariant) ? sidebarVariant : 'persistent';
  };

  const getBackgroundStyles = () => {
    if (!backgroundPattern) return {};
    return {
      backgroundImage: `
        radial-gradient(circle at 25% 50%, var(--secondary-red-50) 0%, transparent 50%),
        radial-gradient(circle at 75% 50%, var(--accent-purple)1a 0%, transparent 50%),
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(1,11,64,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')
      `,
      backgroundSize: '600px 600px, 600px 600px, 40px 40px',
      backgroundRepeat: 'no-repeat, no-repeat, repeat',
      backgroundPosition: '0% 0%, 100% 100%, 0 0',
    };
  };

  const getContainerMaxWidth = () => {
    const maxWidths = {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    };
    return maxWidths[containerMaxWidth] || 'xl';
  };

  const currentSidebarVariant = getSidebarVariant();
  const hasSidebar = showSidebar && !fullScreen && sidebarOpen;
  const sidebarWidth = hasSidebar ? DRAWER_WIDTH : 0;

  return (
    <LayoutContainer>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />

      {/* Header */}
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        variant={headerVariant}
        position={fullScreen ? 'absolute' : 'fixed'}
      />

      {/* Main Content Area */}
      <MainContainer>
        {/* Sidebar */}
        {showSidebar && !fullScreen && (
          <Sidebar
            open={sidebarOpen}
            onClose={handleCloseSidebar}
            variant={currentSidebarVariant}
            drawerWidth={DRAWER_WIDTH}
          />
        )}

        {/* Content Wrapper */}
        <ContentWrapper
          sx={{
            marginLeft: {
              xs: 0,
              md: hasSidebar && currentSidebarVariant === 'persistent' ? `${sidebarWidth}px` : 0,
            },
            width: {
              xs: '100%',
              md:
                hasSidebar && currentSidebarVariant === 'persistent'
                  ? `calc(100% - ${sidebarWidth}px)`
                  : '100%',
            },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Page Content */}
          <PageContent
            sx={{
              marginTop: fullScreen ? 0 : `${HEADER_HEIGHT}px`,
              minHeight: fullScreen ? '100vh' : `calc(100vh - ${HEADER_HEIGHT}px)`,
              ...getBackgroundStyles(),
            }}
          >
            <ContentArea
              sx={{
                maxWidth: fullScreen ? '100%' : getContainerMaxWidth(),
                py: fullScreen ? 0 : 3,
              }}
            >
              {children || <Outlet />}
            </ContentArea>
          </PageContent>

          {/* Footer */}
          {!fullScreen && footerVariant !== 'hidden' && (
            <FooterWrapper>
              <Footer variant={footerVariant} />
            </FooterWrapper>
          )}
        </ContentWrapper>
      </MainContainer>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <StyledFab
          onClick={handleScrollToTop}
          size='medium'
          aria-label='Retourner en haut de la page'
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1000,
          }}
        >
          <ArrowUpIcon />
        </StyledFab>
      </Zoom>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && currentSidebarVariant === 'temporary' && !fullScreen && (
        <Overlay onClick={handleCloseSidebar} />
      )}
    </LayoutContainer>
  );
};

// Variantes du Layout
export const DashboardLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={true}
    sidebarVariant='persistent'
    backgroundPattern={true}
    footerVariant='minimal'
    containerMaxWidth='xl'
    {...props}
  >
    {children || <Outlet />}
  </Layout>
);

export const AuthLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={false}
    headerVariant='minimal'
    footerVariant='minimal'
    backgroundPattern={true}
    containerMaxWidth='sm'
    {...props}
  >
    {children || <Outlet />}
  </Layout>
);

export const PublicLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={false}
    headerVariant='default'
    footerVariant='default'
    fullScreen={false}
    {...props}
  >
    {children || <Outlet />}
  </Layout>
);

export const MinimalLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={false}
    headerVariant='transparent'
    footerVariant='hidden'
    backgroundPattern={false}
    fullScreen={true}
    {...props}
  >
    {children || <Outlet />}
  </Layout>
);

export default Layout;
