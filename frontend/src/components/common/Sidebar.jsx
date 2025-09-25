import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Box,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as CourseIcon,
  TrendingUp as ProgressIcon,
  CardMembership as CertificateIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
  Analytics as AnalyticsIcon,
  LibraryBooks as ContentIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as ProfileIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
//import { useAuth } from '../context/AuthContext';
//import { colors } from '../utils/colors';

const Sidebar = ({ open, onClose, variant = 'persistent' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = 280;

  // Navigation items selon le rôle
  const getNavigationItems = () => {
    const baseItems = [
      {
        text: 'Tableau de bord',
        icon: <DashboardIcon />,
        path: `/${user?.role}/dashboard`,
        roles: ['student', 'instructor', 'admin']
      },
      {
        text: 'Mes Cours',
        icon: <CourseIcon />,
        path: `/${user?.role}/courses`,
        roles: ['student']
      },
      {
        text: 'Gestion des Cours',
        icon: <ContentIcon />,
        path: `/${user?.role}/courses`,
        roles: ['instructor', 'admin']
      },
      {
        text: 'Ma Progression',
        icon: <ProgressIcon />,
        path: `/${user?.role}/progress`,
        roles: ['student']
      },
      {
        text: 'Analytiques',
        icon: <AnalyticsIcon />,
        path: `/${user?.role}/analytics`,
        roles: ['instructor', 'admin']
      },
      {
        text: 'Mes Certificats',
        icon: <CertificateIcon />,
        path: `/${user?.role}/certificates`,
        roles: ['student', 'instructor']
      },
      {
        text: 'Utilisateurs',
        icon: <UsersIcon />,
        path: '/admin/users',
        roles: ['admin']
      }
    ];

    return baseItems.filter(item => item.roles.includes(user?.role));
  };

  const commonItems = [
    {
      text: 'Mon Profil',
      icon: <ProfileIcon />,
      path: `/${user?.role}/profile`,
      roles: ['student', 'instructor', 'admin']
    },
    {
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: `/${user?.role}/settings`,
      roles: ['student', 'instructor', 'admin']
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = getNavigationItems();

  return (
    <Drawer
      variant={isMobile ? 'temporary' : variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          background: `linear-gradient(180deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          color: 'white',
          overflowX: 'hidden'
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {/* Header Sidebar */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography 
          variant="h5" 
          fontWeight={700}
          sx={{
            background: 'linear-gradient(45deg, #ffffff 30%, #ff6b74 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Youth Computing
        </Typography>
        <Chip 
          label={user?.role.toUpperCase()} 
          size="small" 
          sx={{ 
            backgroundColor: colors.secondary.main,
            color: 'white',
            fontWeight: 600
          }} 
        />
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" fontWeight={600}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user?.email}
        </Typography>
        <Chip 
          label={`Niveau ${user?.level}`} 
          size="small" 
          variant="outlined"
          sx={{ 
            mt: 1,
            borderColor: colors.secondary.main,
            color: colors.secondary.light,
            fontWeight: 500
          }} 
        />
      </Box>

      {/* Navigation Principale */}
      <List sx={{ flex: 1, p: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                py: 1.5
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? colors.secondary.main : 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Secondaire */}
      <List sx={{ p: 1 }}>
        {commonItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                py: 1.5
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? colors.secondary.main : 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Déconnexion */}
        <ListItem disablePadding sx={{ mt: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
              },
              py: 1.5
            }}
          >
            <ListItemIcon sx={{ color: colors.error.light, minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Déconnexion" 
              primaryTypographyProps={{ 
                color: colors.error.light,
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer Sidebar */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          Version 1.0.0
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', opacity: 0.6, mt: 0.5 }}>
          © 2024 Youth Computing
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;