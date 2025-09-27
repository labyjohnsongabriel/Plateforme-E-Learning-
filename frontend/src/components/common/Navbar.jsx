import React, { useState, useEffect } from 'react';
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
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  School as SchoolIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { colors } from '../../utils/colors';

// Animation de disparition au scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = ({ onToggleSidebar }) => {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleProfileOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setNotificationAnchor(null);
    setProfileAnchor(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  const handleNotificationClick = (notification) => {
    // Redirection selon le type de notification
    if (notification.type === 'course') {
      navigate(`/course/${notification.courseId}`);
    } else if (notification.type === 'certificate') {
      navigate('/certificates');
    }
    handleClose();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Items de navigation selon le rôle
  const getNavItems = () => {
    const baseItems = [
      { label: 'Accueil', path: '/', roles: ['all'] },
      { label: 'Catalogue', path: '/catalog', roles: ['all'] },
      { label: 'Tableau de bord', path: `/${user?.role}/dashboard`, roles: ['student', 'instructor', 'admin'] },
      { label: 'Mes Cours', path: `/${user?.role}/courses`, roles: ['student'] },
      { label: 'Gestion Cours', path: `/${user?.role}/courses`, roles: ['instructor'] },
      { label: 'Analytiques', path: `/${user?.role}/analytics`, roles: ['instructor', 'admin'] },
      { label: 'Utilisateurs', path: '/admin/users', roles: ['admin'] },
    ];

    return baseItems.filter(item => 
      item.roles.includes('all') || item.roles.includes(user?.role)
    );
  };

  const navItems = getNavItems();

  // Styles dynamiques selon le scroll
  const navbarStyles = {
    background: scrolled 
      ? `linear-gradient(135deg, ${alpha(colors.primary.main, 0.95)} 0%, ${alpha(colors.primary.dark, 0.95)} 100%)`
      : gradients.primary,
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    boxShadow: scrolled 
      ? '0 8px 32px rgba(1, 11, 64, 0.2)' 
      : '0 2px 10px rgba(1, 11, 64, 0.1)',
    transition: 'all 0.3s ease-in-out',
    borderBottom: scrolled ? `1px solid ${alpha(colors.primary.light, 0.2)}` : 'none'
  };

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        sx={navbarStyles}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          minHeight: { xs: '60px !important', md: '70px !important' },
          px: { xs: 1, sm: 2, md: 3 }
        }}>
          {/* Section Gauche - Logo et Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
            {/* Bouton Menu Mobile */}
            <IconButton
              color="inherit"
              onClick={onToggleSidebar}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                '&:hover': { 
                  backgroundColor: alpha(colors.secondary.main, 0.1),
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
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
                color: 'inherit',
                '&:hover': { opacity: 0.9 }
              }}
              onClick={() => navigate('/')}
            >
              <SchoolIcon sx={{ 
                fontSize: { xs: 28, md: 32 }, 
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
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}
              >
                Youth Computing
              </Typography>
            </Box>

            {/* Navigation Desktop */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 0.5,
              ml: 2 
            }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: isActiveRoute(item.path) 
                      ? alpha(colors.secondary.main, 0.2) 
                      : 'transparent',
                    border: isActiveRoute(item.path) 
                      ? `1px solid ${alpha(colors.secondary.main, 0.3)}` 
                      : '1px solid transparent',
                    '&:hover': { 
                      backgroundColor: alpha(colors.secondary.main, 0.1),
                      borderColor: alpha(colors.secondary.main, 0.2)
                    },
                    transition: 'all 0.2s ease',
                    fontWeight: isActiveRoute(item.path) ? 600 : 400,
                    fontSize: '0.9rem'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Section Droite - Actions Utilisateur */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1 } 
          }}>
            {/* Barre de recherche (Desktop) */}
            <IconButton 
              color="inherit" 
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { 
                  backgroundColor: alpha(colors.secondary.main, 0.1),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <SearchIcon />
            </IconButton>

            {/* Notifications */}
            <IconButton 
              color="inherit" 
              onClick={handleNotificationOpen}
              sx={{
                '&:hover': { 
                  backgroundColor: alpha(colors.secondary.main, 0.1),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="secondary"
                overlap="circular"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Menu Mobile */}
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{
                display: { xs: 'flex', md: 'none' },
                '&:hover': { 
                  backgroundColor: alpha(colors.secondary.main, 0.1),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <AccountCircle />
            </IconButton>

            {/* Profil Desktop */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                '&:hover': { 
                  backgroundColor: alpha(colors.secondary.main, 0.1) 
                }
              }}
              onClick={handleProfileOpen}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: colors.secondary.main,
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                src={user?.avatar}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight={600} lineHeight={1}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Chip 
                  label={user?.role} 
                  size="small" 
                  sx={{ 
                    height: 16,
                    fontSize: '0.6rem',
                    bgcolor: alpha(colors.secondary.main, 0.2),
                    color: 'white'
                  }} 
                />
              </Box>
            </Box>
          </Box>

          {/* Menu Notifications */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 320,
                maxWidth: 400,
                maxHeight: 400,
                borderRadius: 3,
                boxShadow: '0 16px 48px rgba(1, 11, 64, 0.3)',
                overflow: 'hidden'
              }
            }}
          >
            <MenuItem sx={{ 
              backgroundColor: alpha(colors.primary.main, 0.05),
              borderBottom: `1px solid ${colors.grey[200]}`,
              cursor: 'default'
            }}>
              <Typography variant="subtitle1" fontWeight={600} color={colors.primary.main}>
                Notifications ({unreadCount} non lues)
              </Typography>
            </MenuItem>
            
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification, index) => (
                <MenuItem 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    borderBottom: index < notifications.length - 1 ? `1px solid ${colors.grey[100]}` : 'none',
                    '&:hover': { backgroundColor: alpha(colors.primary.main, 0.03) }
                  }}
                >
                  <ListItemIcon>
                    {notification.type === 'course' ? (
                      <BookmarkIcon sx={{ color: colors.primary.main }} />
                    ) : (
                      <FavoriteIcon sx={{ color: colors.secondary.main }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notification.unread ? 600 : 400}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color={colors.text.secondary}>
                        {notification.message}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))
            ) : (
              <MenuItem sx={{ justifyContent: 'center', py: 3 }}>
                <Typography variant="body2" color={colors.text.secondary}>
                  Aucune notification
                </Typography>
              </MenuItem>
            )}
            
            {notifications.length > 5 && (
              <MenuItem 
                onClick={() => handleNavigation('/notifications')}
                sx={{ 
                  justifyContent: 'center',
                  borderTop: `1px solid ${colors.grey[200]}`,
                  backgroundColor: alpha(colors.primary.main, 0.02)
                }}
              >
                <Typography variant="body2" color={colors.primary.main} fontWeight={600}>
                  Voir toutes les notifications
                </Typography>
              </MenuItem>
            )}
          </Menu>

          {/* Menu Profil Desktop */}
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 3,
                boxShadow: '0 16px 48px rgba(1, 11, 64, 0.3)'
              }
            }}
          >
            <MenuItem sx={{ cursor: 'default', backgroundColor: alpha(colors.primary.main, 0.05) }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color={colors.text.secondary}>
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" sx={{ color: colors.primary.main }} />
              </ListItemIcon>
              <ListItemText>Mon Profil</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: colors.primary.main }} />
              </ListItemIcon>
              <ListItemText>Paramètres</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleNavigation(`/${user?.role}/dashboard`)}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" sx={{ color: colors.primary.main }} />
              </ListItemIcon>
              <ListItemText>Tableau de bord</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout} sx={{ color: colors.error.main }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: colors.error.main }} />
              </ListItemIcon>
              <ListItemText>Déconnexion</ListItemText>
            </MenuItem>
          </Menu>

          {/* Menu Mobile */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 250,
                borderRadius: 3,
                boxShadow: '0 16px 48px rgba(1, 11, 64, 0.3)'
              }
            }}
          >
            {/* En-tête utilisateur mobile */}
            <MenuItem sx={{ cursor: 'default', backgroundColor: alpha(colors.primary.main, 0.05) }}>
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: colors.secondary.main,
                  mr: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
                src={user?.avatar}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color={colors.text.secondary}>
                  {user?.role} • Niveau {user?.level}
                </Typography>
              </Box>
            </MenuItem>
            
            <Divider />
            
            {/* Navigation mobile */}
            {navItems.map((item) => (
              <MenuItem 
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                selected={isActiveRoute(item.path)}
                sx={{
                  backgroundColor: isActiveRoute(item.path) ? alpha(colors.primary.main, 0.05) : 'transparent'
                }}
              >
                <ListItemText>
                  <Typography fontWeight={isActiveRoute(item.path) ? 600 : 400}>
                    {item.label}
                  </Typography>
                </ListItemText>
              </MenuItem>
            ))}
            
            <Divider />
            
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" sx={{ color: colors.primary.main }} />
              </ListItemIcon>
              <ListItemText>Mon Profil</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleLogout} sx={{ color: colors.error.main }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: colors.error.main }} />
              </ListItemIcon>
              <ListItemText>Déconnexion</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;