// frontend/src/components/common/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Box, Fab, Zoom, CssBaseline } from '@mui/material';
import { KeyboardArrowUp as ArrowUpIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const HEADER_HEIGHT = 64;

const Layout = ({
  children,
  headerVariant = 'default',
  footerVariant = 'default',
  fullScreen = false,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <Navbar variant={headerVariant} />

      {/* Main Content */}
      <Box 
        component="main"
        sx={{ 
          flex: 1,
          marginTop: fullScreen ? 0 : `${HEADER_HEIGHT}px`,
          minHeight: fullScreen ? '100vh' : `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        {children || <Outlet />}
      </Box>

      {/* Footer */}
      {!fullScreen && footerVariant !== 'hidden' && (
        <Footer variant={footerVariant} />
      )}

      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <Fab
          onClick={handleScrollToTop}
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <ArrowUpIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

// Variantes prédéfinies
export const DashboardLayout = (props) => (
  <Layout footerVariant="minimal" {...props} />
);

export const AuthLayout = (props) => (
  <Layout headerVariant="minimal" footerVariant="minimal" {...props} /> 
);

export const PublicLayout = (props) => (
  <Layout {...props} />
);

export const MinimalLayout = (props) => (
  <Layout headerVariant="transparent" footerVariant="hidden" fullScreen {...props} />
);

export default Layout;