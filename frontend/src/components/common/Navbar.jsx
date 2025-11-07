import React, { useState, useEffect, useCallback } from 'react';
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
  useMediaQuery,
  CircularProgress,
  Paper,
  Stack,
  Alert,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
  KeyboardArrowDown as ArrowDownIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Warning as WarningIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import axios from 'axios';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger({ threshold: 50 });
  return (
    <Slide appear={false} direction='down' in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = ({ onToggleSidebar }) => {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const notificationsContext = useNotifications();
  const {
    notifications = [],
    unreadCount = 0,
    fetchNotifications = () => {},
    markAsRead = () => {},
    markAllAsRead = () => {},
    deleteNotification = () => {},
    isLoading: loadingNotifications = false,
  } = notificationsContext || {};

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isAuthenticated = Boolean(user && user.token);

  const userRole = (profileData?.role || user?.role || 'ETUDIANT').toUpperCase();
  const isStudent = userRole === 'ETUDIANT';

  const ROLES = {
    ALL: 'ALL',
    STUDENT: 'ETUDIANT',
    INSTRUCTOR: 'ENSEIGNANT',
    ADMIN: 'ADMIN',
  };

  const PATH_PREFIXES = {
    [ROLES.STUDENT]: 'student',
    [ROLES.INSTRUCTOR]: 'instructor',
    [ROLES.ADMIN]: 'admin',
  };

  const showNotification = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user?.token) {
      setProfileData(null);
      return;
    }
    setLoadingProfile(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = response.data.data || response.data;
      setProfileData(data);
    } catch (error) {
      console.error('Erreur profil:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        showNotification('Session expirée, veuillez vous reconnecter', 'error');
      } else {
        showNotification('Erreur lors du chargement du profil', 'error');
      }
      setProfileData(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [user, logout, navigate, showNotification]);

  const fetchNotificationsWithFallback = useCallback(async () => {
    if (!user?.token || !fetchNotifications) return;
    try {
      await fetchNotifications();
    } catch (err) {
      console.warn('Erreur récupération notifications:', err);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (user?.token) {
      fetchProfile();
      fetchNotificationsWithFallback();

      const interval = setInterval(() => {
        if (document.visibilityState === 'visible' && user?.token) {
          fetchNotificationsWithFallback();
        }
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setProfileData(null);
    }
  }, [user, fetchNotificationsWithFallback, fetchProfile]);

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    fetchNotificationsWithFallback();
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
    showNotification('Déconnexion réussie', 'success');
  };

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      handleClose();
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(notificationId);
      showNotification('Notification marquée comme lue', 'success');
    } catch (error) {
      console.error('Erreur marquage:', error);
      showNotification('Erreur lors du marquage', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      showNotification('Notification supprimée', 'success');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showNotification('Toutes les notifications marquées comme lues', 'success');
    } catch (error) {
      console.error('Erreur marquage global:', error);
      showNotification('Erreur lors du marquage global', 'error');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.lu) {
      await handleMarkAsRead(notification._id);
    }

    switch (notification.type) {
      case 'COURSE_ACCESS':
      case 'COURSE_UPDATE':
        if (notification.courseId) {
          navigate(`/student/course/${notification.courseId}`);
        }
        break;
      case 'CERTIFICATE_READY':
        navigate('/student/certificates');
        break;
      case 'PROGRESS_UPDATE':
        navigate('/student/progress');
        break;
      case 'SYSTEM_ALERT':
        if (notification.link) {
          navigate(notification.link);
        }
        break;
      case 'NEW_COURSE':
        navigate('/catalog');
        break;
      default:
        if (notification.link) {
          navigate(notification.link);
        }
        break;
    }
    handleClose();
  };

  const isActiveRoute = (path) => {
    if (!path) return false;
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavItems = useCallback(() => {
    if (!isAuthenticated) {
      return [
        { label: 'Accueil', path: '/', roles: [ROLES.ALL] },
        { label: 'Catalogue', path: '/catalog', roles: [ROLES.ALL] },
        { label: 'À propos', path: '/about', roles: [ROLES.ALL] },
        { label: 'Contact', path: '/contact', roles: [ROLES.ALL] },
      ];
    }

    const baseItems = [
      { label: 'Accueil', path: '/', roles: [ROLES.ALL] },
      { label: 'Catalogue', path: '/catalog', roles: [ROLES.STUDENT] },
      { label: 'À propos', path: '/about', roles: [ROLES.STUDENT] },
      { label: 'Contact', path: '/contact', roles: [ROLES.STUDENT] },
      {
        label: 'Tableau de bord',
        path: `/${PATH_PREFIXES[userRole] || 'student'}/dashboard`,
        roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN],
      },
      {
        label: 'Mes Cours',
        path: '/student/courses',
        roles: [ROLES.STUDENT],
      },
      {
        label: 'Progression',
        path: '/student/progress',
        roles: [ROLES.STUDENT],
      },
      {
        label: 'Certificats',
        path: '/student/certificates',
        roles: [ROLES.STUDENT],
      },
      {
        label: 'Créer un Cours',
        path: '/instructor/courses/create',
        roles: [ROLES.INSTRUCTOR],
      },
      {
        label: 'Analytiques',
        path: '/instructor/analytics',
        roles: [ROLES.INSTRUCTOR],
      },
      {
        label: 'Gestion des cours',
        path: '/instructor/manageCourses',
        roles: [ROLES.INSTRUCTOR],
      },
      {
        label: 'Utilisateurs',
        path: '/admin/users',
        roles: [ROLES.ADMIN],
      },
      {
        label: 'Cours',
        path: '/admin/courses',
        roles: [ROLES.ADMIN],
      },
      {
        label: 'Rapports',
        path: '/admin/reports',
        roles: [ROLES.ADMIN],
      },
      {
        label: 'Configuration',
        path: '/admin/config',
        roles: [ROLES.ADMIN],
      },
    ];

    return baseItems.filter(
      (item) => item.roles.includes(ROLES.ALL) || (userRole && item.roles.includes(userRole))
    );
  }, [userRole, isAuthenticated]);

  const navItems = getNavItems();

  const getUserInitials = useCallback(() => {
    const data = profileData || user;
    if (data?.prenom && data?.nom) {
      return `${data.prenom[0]}${data.nom[0]}`.toUpperCase();
    }
    return data?.email?.[0]?.toUpperCase() || 'U';
  }, [profileData, user]);

  const getUserFullName = useCallback(() => {
    const data = profileData || user;
    if (data?.prenom && data?.nom) {
      return `${data.prenom} ${data.nom}`;
    }
    return data?.email || 'Utilisateur';
  }, [profileData, user]);

  // Fonction simplifiée pour obtenir l'avatar
  const getAvatarUrl = useCallback(() => {
    const data = profileData || user;

    // Vérifier si on a un avatar valide
    if (data?.avatar && typeof data.avatar === 'string' && data.avatar.trim()) {
      // Si c'est une URL complète
      if (data.avatar.startsWith('http://') || data.avatar.startsWith('https://')) {
        return data.avatar;
      }
      // Si c'est un chemin relatif, construire l'URL complète
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
      const cleanPath = data.avatar.startsWith('/') ? data.avatar : `/${data.avatar}`;
      return `${API_BASE_URL}${cleanPath}`;
    }

    // Fallback: avatar généré avec les initiales
    return null;
  }, [profileData, user]);

  // Statut utilisateur avec badge visuel
  const getUserStatus = useCallback(() => {
    const data = profileData || user;
    const status = data?.status || data?.accountStatus || 'active';

    const statusConfig = {
      active: {
        label: 'Actif',
        color: '#10b981',
        icon: <VerifiedIcon sx={{ fontSize: 14 }} />,
      },
      inactive: {
        label: 'Inactif',
        color: '#6b7280',
        icon: <CircleIcon sx={{ fontSize: 14 }} />,
      },
      suspended: {
        label: 'Suspendu',
        color: '#ef4444',
        icon: <WarningIcon sx={{ fontSize: 14 }} />,
      },
      pending: {
        label: 'En attente',
        color: '#f59e0b',
        icon: <CircleIcon sx={{ fontSize: 14 }} />,
      },
    };

    return statusConfig[status] || statusConfig.active;
  }, [profileData, user]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return '#ff1744';
      case 'ENSEIGNANT':
        return '#2979ff';
      case 'ETUDIANT':
        return '#00e676';
      default:
        return theme.palette.secondary.main;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ETUDIANT':
        return 'Étudiant';
      case 'ENSEIGNANT':
        return 'Enseignant';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return role || 'Utilisateur';
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      COURSE_ACCESS: <BookmarkIcon sx={{ color: '#3b82f6', fontSize: 20 }} />,
      COURSE_UPDATE: <BookmarkIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />,
      CERTIFICATE_READY: <FavoriteIcon sx={{ color: '#10b981', fontSize: 20 }} />,
      PROGRESS_UPDATE: <DashboardIcon sx={{ color: '#f59e0b', fontSize: 20 }} />,
      SYSTEM_ALERT: <WarningIcon sx={{ color: '#ef4444', fontSize: 20 }} />,
      NEW_COURSE: <SchoolIcon sx={{ color: '#06b6d4', fontSize: 20 }} />,
    };
    return (
      icons[type] || <NotificationsIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
    );
  };

  const getNotificationColor = (type) => {
    const colors = {
      COURSE_ACCESS: '#3b82f6',
      COURSE_UPDATE: '#8b5cf6',
      CERTIFICATE_READY: '#10b981',
      PROGRESS_UPDATE: '#f59e0b',
      SYSTEM_ALERT: '#ef4444',
      NEW_COURSE: '#06b6d4',
    };
    return colors[type] || theme.palette.primary.main;
  };

  const formatNotificationTime = (dateString) => {
    if (!dateString) return 'Inconnu';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Inconnu';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      HIGH: { label: 'Haute', color: '#ef4444' },
      MEDIUM: { label: 'Moyenne', color: '#f59e0b' },
      LOW: { label: 'Basse', color: '#10b981' },
    };
    return priorities[priority] || { label: 'Normale', color: '#6b7280' };
  };

  const navbarStyles = {
    background: scrolled
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.98)} 0%, ${alpha(theme.palette.primary.dark, 0.98)} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
    boxShadow: scrolled ? '0 8px 32px rgba(1, 11, 64, 0.3)' : '0 2px 8px rgba(1, 11, 64, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    borderBottom: scrolled ? `1px solid ${alpha('#fff', 0.1)}` : 'none',
  };

  const userStatus = getUserStatus();
  const avatarUrl = getAvatarUrl();

  return (
    <HideOnScroll>
      <AppBar position='fixed' sx={navbarStyles} elevation={scrolled ? 4 : 0}>
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: { xs: '64px !important', md: '72px !important' },
            px: { xs: 2, sm: 3, md: 4, lg: 6 },
            maxWidth: '1920px',
            mx: 'auto',
            width: '100%',
          }}
        >
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ mt: 8 }}
          >
            <Alert
              severity={snackbarSeverity}
              onClose={() => setSnackbarOpen(false)}
              sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {isAuthenticated && (
              <IconButton
                color='inherit'
                onClick={onToggleSidebar}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  mr: 1,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.15),
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                aria-label='Ouvrir le menu latéral'
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover .logo-icon': { transform: 'rotate(360deg)' },
                '&:hover .brand-text': { backgroundPosition: '200% center' },
              }}
              onClick={() => navigate('/')}
            >
              <SchoolIcon
                className='logo-icon'
                sx={{
                  fontSize: { xs: 32, md: 38 },
                  mr: 1.5,
                  color: theme.palette.secondary.main,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              <Typography
                className='brand-text'
                variant='h5'
                component='div'
                sx={{
                  fontFamily: "'Poppins', 'Ubuntu', sans-serif",
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #ffffff 0%, #ff6b74 50%, #ffffff 100%)',
                  backgroundSize: '200% auto',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { xs: '1.3rem', md: '1.6rem' },
                  letterSpacing: '0.5px',
                  transition: 'background-position 0.5s ease',
                }}
              >
                Youth Computing
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 4 }}>
              {navItems.map((item, index) => (
                <Tooltip key={item.path || index} title={item.label} arrow placement='bottom'>
                  <Button
                    color='inherit'
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      px: 2.5,
                      py: 1,
                      borderRadius: 2.5,
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: isActiveRoute(item.path)
                        ? alpha('#fff', 0.2)
                        : 'transparent',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: isActiveRoute(item.path) ? '80%' : '0%',
                        height: '3px',
                        backgroundColor: theme.palette.secondary.main,
                        borderRadius: '3px 3px 0 0',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.15),
                        transform: 'translateY(-2px)',
                        '&::before': { width: '80%' },
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: isActiveRoute(item.path) ? 700 : 500,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      letterSpacing: '0.3px',
                    }}
                    aria-label={item.label}
                  >
                    {item.label}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {!isAuthenticated ? (
              <>
                <Button
                  variant='outlined'
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    color: 'white',
                    borderColor: alpha('#fff', 0.3),
                    borderWidth: 2,
                    px: 3,
                    py: 1,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: alpha('#fff', 0.6),
                      backgroundColor: alpha('#fff', 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(255,255,255,0.15)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Connexion
                </Button>
                <Button
                  variant='contained'
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/register')}
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(241, 53, 68, 0.3)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(241, 53, 68, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  S'inscrire
                </Button>
                <IconButton
                  color='inherit'
                  onClick={handleMobileMenuOpen}
                  sx={{
                    display: { xs: 'flex', sm: 'none' },
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.15),
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Tooltip title={`${unreadCount} notification${unreadCount > 1 ? 's' : ''}`} arrow>
                  <IconButton
                    color='inherit'
                    onClick={handleNotificationOpen}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.15),
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color='secondary'
                      overlap='circular'
                      sx={{
                        '& .MuiBadge-badge': {
                          animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                          boxShadow: '0 0 0 2px rgba(255,255,255,0.3)',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          '@keyframes pulse': {
                            '0%, 100%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.15)' },
                          },
                        },
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <IconButton
                  color='inherit'
                  onClick={handleMobileMenuOpen}
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.15),
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <AccountCircle />
                </IconButton>

                <Tooltip title='Mon compte' arrow>
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      p: 1,
                      pl: 1.5,
                      pr: 1.5,
                      borderRadius: 3,
                      border: `1.5px solid ${alpha('#fff', 0.2)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.15),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                        borderColor: alpha('#fff', 0.4),
                      },
                    }}
                    onClick={handleProfileOpen}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: theme.palette.secondary.main,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          border: `2px solid ${alpha('#fff', 0.4)}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                        src={avatarUrl || undefined}
                      >
                        {getUserInitials()}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: userStatus.color,
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <Typography
                        variant='subtitle2'
                        fontWeight={700}
                        lineHeight={1.2}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '150px',
                          color: 'white',
                        }}
                      >
                        {getUserFullName()}
                      </Typography>
                      <Chip
                        label={getRoleLabel(userRole)}
                        size='small'
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: alpha(getRoleColor(userRole), 0.25),
                          color: 'white',
                          mt: 0.5,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </Box>
                    <ArrowDownIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                  </Box>
                </Tooltip>
              </>
            )}
          </Box>

          {/* Menu Notifications */}
          {isAuthenticated && (
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 2,
                  minWidth: 420,
                  maxWidth: 500,
                  maxHeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  p: 2.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant='h6' fontWeight={800} sx={{ letterSpacing: '0.3px' }}>
                      Notifications
                    </Typography>
                    <Typography variant='caption' sx={{ opacity: 0.95, fontWeight: 500 }}>
                      {unreadCount} non {unreadCount === 1 ? 'lue' : 'lues'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {loadingNotifications && (
                      <CircularProgress size={20} color='inherit' thickness={5} />
                    )}
                    {unreadCount > 0 && (
                      <Tooltip title='Tout marquer comme lu'>
                        <IconButton
                          size='small'
                          onClick={handleMarkAllAsRead}
                          sx={{
                            color: 'white',
                            bgcolor: alpha('#fff', 0.2),
                            '&:hover': { bgcolor: alpha('#fff', 0.3) },
                          }}
                        >
                          <MarkEmailReadIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification, index) => {
                    const priority = getPriorityBadge(notification.priority);
                    return (
                      <MenuItem
                        key={notification._id || index}
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          py: 2,
                          px: 2.5,
                          borderBottom:
                            index < notifications.length - 1
                              ? `1px solid ${theme.palette.grey[100]}`
                              : 'none',
                          backgroundColor: !notification.lu
                            ? alpha(getNotificationColor(notification.type), 0.08)
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: alpha(getNotificationColor(notification.type), 0.12),
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                          <Box sx={{ mt: 0.5 }}>{getNotificationIcon(notification.type)}</Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant='body2'
                                fontWeight={notification.lu ? 500 : 700}
                                sx={{ flex: 1, pr: 1 }}
                              >
                                {notification.message || 'Notification'}
                              </Typography>
                              {!notification.lu && (
                                <CircleIcon
                                  sx={{
                                    fontSize: 9,
                                    color: getNotificationColor(notification.type),
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                            </Box>

                            {notification.priority && notification.priority !== 'LOW' && (
                              <Chip
                                label={priority.label}
                                size='small'
                                sx={{
                                  height: 16,
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  bgcolor: priority.color,
                                  color: 'white',
                                  mb: 0.5,
                                  '& .MuiChip-label': { px: 1 },
                                }}
                              />
                            )}

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                              >
                                {formatNotificationTime(notification.createdAt)}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {!notification.lu && (
                                  <Tooltip title='Marquer comme lu'>
                                    <IconButton
                                      size='small'
                                      onClick={(e) => handleMarkAsRead(notification._id, e)}
                                      sx={{
                                        p: 0.5,
                                        '&:hover': {
                                          bgcolor: alpha(theme.palette.success.main, 0.1),
                                        },
                                      }}
                                    >
                                      <CheckCircleIcon
                                        sx={{ fontSize: 17, color: theme.palette.success.main }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title='Supprimer'>
                                  <IconButton
                                    size='small'
                                    onClick={(e) => handleDeleteNotification(notification._id, e)}
                                    sx={{
                                      p: 0.5,
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                      },
                                    }}
                                  >
                                    <DeleteIcon
                                      sx={{ fontSize: 17, color: theme.palette.error.main }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })
                ) : (
                  <Box
                    sx={{
                      py: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 56, color: theme.palette.grey[300] }} />
                    <Typography variant='body2' color='text.secondary' fontWeight={500}>
                      Aucune notification
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Les nouvelles notifications apparaîtront ici
                    </Typography>
                  </Box>
                )}
              </Box>

              {notifications && notifications.length > 0 && (
                <Box
                  sx={{
                    borderTop: `1px solid ${theme.palette.grey[200]}`,
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Button
                    size='small'
                    onClick={() => handleNavigation('/notifications')}
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                    }}
                  >
                    Voir tout
                  </Button>
                </Box>
              )}
            </Menu>
          )}

          {/* Menu Profile Desktop */}
          {isAuthenticated && (
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 2,
                  minWidth: 320,
                  borderRadius: 3,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: theme.palette.secondary.main,
                      mx: 'auto',
                      mb: 2,
                      fontSize: '2rem',
                      fontWeight: 800,
                      border: `4px solid ${alpha('#fff', 0.3)}`,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    }}
                    src={avatarUrl || undefined}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: '50%',
                      transform: 'translateX(28px)',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      bgcolor: userStatus.color,
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ color: 'white', fontSize: 10 }}>{userStatus.icon}</Box>
                  </Box>
                </Box>
                {loadingProfile ? (
                  <CircularProgress size={24} color='inherit' thickness={5} />
                ) : (
                  <>
                    <Typography
                      variant='h6'
                      fontWeight={800}
                      sx={{ letterSpacing: '0.3px', color: 'white', mb: 0.5 }}
                    >
                      {getUserFullName()}
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.95, mb: 1.5, fontWeight: 500 }}>
                      {profileData?.email || user?.email || 'email@example.com'}
                    </Typography>
                    <Stack
                      direction='row'
                      spacing={1}
                      justifyContent='center'
                      sx={{ flexWrap: 'wrap', gap: 1 }}
                    >
                      <Chip
                        label={getRoleLabel(userRole)}
                        size='small'
                        sx={{
                          bgcolor: alpha(getRoleColor(userRole), 0.25),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        icon={userStatus.icon}
                        label={userStatus.label}
                        size='small'
                        sx={{
                          bgcolor: alpha(userStatus.color, 0.25),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          '& .MuiChip-icon': { color: 'white' },
                        }}
                      />
                      {isStudent && (profileData?.level || user?.level) && (
                        <Chip
                          label={`Niveau ${profileData?.level || user?.level}`}
                          size='small'
                          sx={{
                            bgcolor: alpha('#fff', 0.25),
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Stack>
                  </>
                )}
              </Paper>
              <Box sx={{ p: 1.5 }}>
                <MenuItem
                  onClick={() =>
                    handleNavigation(`/${PATH_PREFIXES[userRole] || 'student'}/profil`)
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    mb: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <ProfileIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText primary='Mon Profil' primaryTypographyProps={{ fontWeight: 600 }} />
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation(`/${PATH_PREFIXES[userRole] || 'student'}/settings`)
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    mb: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText primary='Paramètres' primaryTypographyProps={{ fontWeight: 600 }} />
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation(`/${PATH_PREFIXES[userRole] || 'student'}/dashboard`)
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    mb: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary='Tableau de bord'
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    color: theme.palette.error.main,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize='small' sx={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary='Déconnexion'
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </MenuItem>
              </Box>
            </Menu>
          )}

          {/* Menu Mobile */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 2,
                minWidth: 300,
                maxWidth: '90vw',
                borderRadius: 3,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              },
            }}
          >
            {isAuthenticated ? (
              <Paper
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: theme.palette.secondary.main,
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      border: `3px solid ${alpha('#fff', 0.3)}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                    src={avatarUrl || undefined}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: userStatus.color,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  {loadingProfile ? (
                    <CircularProgress size={20} color='inherit' thickness={5} />
                  ) : (
                    <>
                      <Typography
                        variant='subtitle1'
                        fontWeight={800}
                        sx={{ letterSpacing: '0.3px', color: 'white' }}
                      >
                        {getUserFullName()}
                      </Typography>
                      <Typography variant='caption' sx={{ opacity: 0.95, fontWeight: 500 }}>
                        {getRoleLabel(userRole)} • {userStatus.label}
                        {isStudent &&
                          (profileData?.level || user?.level) &&
                          ` • Niveau ${profileData?.level || user?.level}`}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  p: 2.5,
                  textAlign: 'center',
                }}
              >
                <SchoolIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.9 }} />
                <Typography variant='h6' fontWeight={800} sx={{ letterSpacing: '0.3px', mb: 0.5 }}>
                  Youth Computing
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Plateforme d'apprentissage en ligne
                </Typography>
              </Paper>
            )}

            <Box sx={{ p: 1.5 }}>
              {navItems.length > 0 ? (
                navItems.map((item, index) => (
                  <MenuItem
                    key={item.path || index}
                    onClick={() => handleNavigation(item.path)}
                    selected={isActiveRoute(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      mb: 0.5,
                      backgroundColor: isActiveRoute(item.path)
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemText>
                      <Typography fontWeight={isActiveRoute(item.path) ? 700 : 500}>
                        {item.label}
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                ))
              ) : (
                <Typography
                  variant='body2'
                  sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}
                >
                  Aucun élément
                </Typography>
              )}

              {!isAuthenticated ? (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <MenuItem
                    onClick={() => handleNavigation('/login')}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      mb: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LoginIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Connexion'
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigation('/register')}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon>
                      <RegisterIcon fontSize='small' sx={{ color: theme.palette.secondary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="S'inscrire"
                      primaryTypographyProps={{
                        fontWeight: 700,
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </MenuItem>
                </>
              ) : (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <MenuItem
                    onClick={() =>
                      handleNavigation(`/${PATH_PREFIXES[userRole] || 'student'}/profil`)
                    }
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      mb: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <ProfileIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Mon Profil'
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleNavigation(`/${PATH_PREFIXES[userRole] || 'student'}/settings`)
                    }
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      mb: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <SettingsIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Paramètres'
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      color: theme.palette.error.main,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize='small' sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Déconnexion'
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </MenuItem>
                </>
              )}
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;
