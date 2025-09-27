// src/components/Header.jsx
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
  Slide,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  School as SchoolIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Animations sophistiquées
const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Couleurs principales
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

// Styled Components
const StyledAppBar = styled(AppBar)({
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
  backdropFilter: 'blur(20px)',
  boxShadow: `0 8px 32px ${colors.navy}4d`,
  animation: `${fadeInDown} 0.6s ease-out forwards`,
  zIndex: (theme) => theme.zIndex.drawer + 1,
});

const StyledMenu = styled(Menu)({
  '& .MuiPaper-root': {
    background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.red}33`,
    borderRadius: '16px',
    boxShadow: `0 8px 32px ${colors.navy}4d`,
    minWidth: 200,
  },
});

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
      <StyledAppBar position="fixed">
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: { xs: 64, sm: 80 },
            px: { xs: 2, sm: 4 },
          }}
        >
          {/* Logo et Navigation Gauche */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              onClick={onToggleSidebar}
              edge="start"
              sx={{
                display: { xs: 'flex', md: 'none' },
                '&:hover': { backgroundColor: `${colors.red}33` },
                mr: 1,
              }}
              aria-label="Toggle sidebar"
            >
              <MenuIcon sx={{ fontSize: '28px', color: '#ffffff' }} />
            </IconButton>

            {/* Logo Youth Computing */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onClick={() => navigate('/')}
              aria-label="Home"
            >
              <SchoolIcon
                sx={{
                  fontSize: { xs: 32, sm: 36 },
                  mr: 1,
                  color: colors.red,
                }}
              />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 700,
                  color: '#ffffff',
                  fontSize: { xs: '1.5rem', sm: '1.8rem' },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Youth Computing
              </Typography>
            </Box>

            {/* Navigation Desktop */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 2,
                alignItems: 'center',
              }}
            >
              {['/', '/catalog', '/about'].map((path, index) => (
                <Button
                  key={path}
                  color="inherit"
                  onClick={() => navigate(path)}
                  sx={{
                    backgroundColor: isActiveRoute(path)
                      ? `${colors.red}33`
                      : 'transparent',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: `${colors.red}4d`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  aria-label={['Accueil', 'Catalogue', 'À propos'][index]}
                >
                  {['Accueil', 'Catalogue', 'À propos'][index]}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Actions Droite */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Barre de recherche */}
            <IconButton
              color="inherit"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { backgroundColor: `${colors.red}33` },
              }}
              aria-label="Search"
            >
              <SearchIcon sx={{ fontSize: '28px', color: '#ffffff' }} />
            </IconButton>

            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={handleNotificationOpen}
              aria-label="Notifications"
              aria-controls="notification-menu"
              aria-haspopup="true"
              sx={{ '&:hover': { backgroundColor: `${colors.red}33` } }}
            >
              <Badge
                badgeContent={3}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: colors.red,
                    color: '#ffffff',
                  },
                }}
              >
                <NotificationsIcon
                  sx={{ fontSize: '28px', color: '#ffffff' }}
                />
              </Badge>
            </IconButton>

            {/* Menu Profil */}
            <IconButton
              color="inherit"
              onClick={handleProfileOpen}
              aria-label="Profile"
              aria-controls="profile-menu"
              aria-haspopup="true"
              sx={{ '&:hover': { backgroundColor: `${colors.red}33` } }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: colors.purple,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  border: `2px solid ${colors.red}33`,
                }}
                src={user?.avatar}
                alt={user ? `${user.prenom} ${user.nom}` : 'User avatar'}
              >
                {user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}` : ''}
              </Avatar>
            </IconButton>
          </Box>

          {/* Menu Notifications */}
          <StyledMenu
            id="notification-menu"
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.red, fontWeight: 600, fontSize: '1rem' }}
                >
                  Nouveau cours disponible
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}
                >
                  Le cours "JavaScript Avancé" est maintenant disponible
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.red, fontWeight: 600, fontSize: '1rem' }}
                >
                  Certificat généré
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}
                >
                  Votre certificat pour le niveau Beta est prêt
                </Typography>
              </Box>
            </MenuItem>
          </StyledMenu>

          {/* Menu Profil */}
          <StyledMenu
            id="profile-menu"
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={handleProfile}
              sx={{
                color: '#ffffff',
                '&:hover': { backgroundColor: `${colors.red}33` },
              }}
            >
              <AccountCircle sx={{ mr: 2, color: colors.red }} />
              Mon Profil
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: colors.red,
                '&:hover': { backgroundColor: `${colors.red}33` },
              }}
            >
              Déconnexion
            </MenuItem>
          </StyledMenu>
        </Toolbar>
      </StyledAppBar>
    </HideOnScroll>
  );
};

export default Header;