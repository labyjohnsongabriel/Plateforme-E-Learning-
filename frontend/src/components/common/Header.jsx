import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  useScrollTrigger,
  Slide
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  School as SchoolIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
//import { useAuth } from '../context/AuthContext';
//import { colors, gradients } from '../utils/colors';

// Header qui disparaît au scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = ({ onToggleSidebar }) => {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleProfileOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setNotificationAnchor(null);
    setProfileAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: gradients.primary,
          boxShadow: '0 4px 20px rgba(1, 11, 64, 0.15)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '70px !important' }}>
          {/* Logo et Navigation Gauche */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton
              color="inherit"
              onClick={onToggleSidebar}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo Youth Computing */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit'
              }}
              onClick={() => navigate('/')}
            >
              <SchoolIcon sx={{ 
                fontSize: 32, 
                mr: 1,
                color: colors.secondary.main 
              }} />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #ffffff 30%, #ff6b74 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Youth Computing
              </Typography>
            </Box>

            {/* Navigation Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                sx={{
                  backgroundColor: isActiveRoute('/') ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Accueil
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/catalog')}
                sx={{
                  backgroundColor: isActiveRoute('/catalog') ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Catalogue
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/about')}
                sx={{
                  backgroundColor: isActiveRoute('/about') ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                À propos
              </Button>
            </Box>
          </Box>

          {/* Actions Droite */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Barre de recherche */}
            <IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <SearchIcon />
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Menu Profil */}
            <IconButton color="inherit" onClick={handleProfileOpen}>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: colors.secondary.main,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
                src={user?.avatar}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>

          {/* Menu Notifications */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 300,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(1, 11, 64, 0.2)'
              }
            }}
          >
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="subtitle2" color={colors.primary.main}>
                  Nouveau cours disponible
                </Typography>
                <Typography variant="body2" color={colors.text.secondary}>
                  Le cours "JavaScript Avancé" est maintenant disponible
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="subtitle2" color={colors.primary.main}>
                  Certificat généré
                </Typography>
                <Typography variant="body2" color={colors.text.secondary}>
                  Votre certificat pour le niveau Beta est prêt
                </Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* Menu Profil */}
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(1, 11, 64, 0.2)'
              }
            }}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 2, color: colors.primary.main }} />
              Mon Profil
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: colors.error.main }}>
              <Typography color="inherit">Déconnexion</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header;