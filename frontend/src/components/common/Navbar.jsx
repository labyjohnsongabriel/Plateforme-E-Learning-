 // frontend/src/components/Navbar.jsx
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
} from "@mui/material";
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
  Bookmark as BookmarkIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";

function HideOnScroll({ children }) {
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
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");

  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    isLoading: loadingNotifications,
    error: notificationsError,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const defaultAvatar = "/images/default-avatar.png";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user || !user.token) {
      console.log("No user or token, skipping profile fetch");
      setProfileData(null);
      return;
    }

    setLoadingProfile(true);
    try {
      const response = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfileData(response.data.data || response.data);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Impossible de charger les données du profil";
      if (error.response?.status === 401) {
        errorMessage = "Session expirée, veuillez vous reconnecter";
        logout();
        navigate("/login");
      }
      setError(errorMessage);
      setProfileData(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [user, logout, navigate]);

  useEffect(() => {
    if (user && user.token) {
      fetchProfile();
      fetchNotifications();
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchNotifications();
        }
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setProfileData(null);
    }
  }, [user, fetchNotifications, fetchProfile]);

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    fetchNotifications();
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
    setError("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleClose();
  };

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      handleClose();
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      setError("Impossible de marquer la notification comme lue");
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Impossible de supprimer la notification");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.lu) {
      await handleMarkAsRead(notification._id, { stopPropagation: () => {} });
    }

    switch (notification.type) {
      case "RAPPEL_COURS":
        if (notification.courseId) {
          navigate(`/course/${notification.courseId}`);
        }
        break;
      case "CERTIFICAT":
        navigate("/certificates");
        break;
      case "PROGRESSION":
        navigate("/progress");
        break;
      default:
        break;
    }
    handleClose();
  };

  const isActiveRoute = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const getNavItems = useCallback(() => {
    const ROLES = {
      ALL: "all",
      LEARNER: "ETUDIANT",
      INSTRUCTOR: "ENSEIGNANT",
      ADMIN: "ADMIN",
    };

    const baseItems = [
      { label: "Accueil", path: "/", roles: [ROLES.ALL] },
      { label: "Catalogue", path: "/catalog", roles: [ROLES.ALL] },
      {
        label: "Tableau de bord",
        path: `/${user?.role?.toLowerCase() || "user"}/dashboard`,
        roles: [ROLES.LEARNER, ROLES.INSTRUCTOR, ROLES.ADMIN],
      },
      {
        label: "Mes Cours",
        path: `/${user?.role?.toLowerCase() || "user"}/courses`,
        roles: [ROLES.LEARNER],
      },
      {
        label: "Gestion des Cours",
        path: `/${user?.role?.toLowerCase() || "user"}/courses`,
        roles: [ROLES.INSTRUCTOR],
      },
      {
        label: "Analytiques",
        path: `/${user?.role?.toLowerCase() || "user"}/analytics`,
        roles: [ROLES.INSTRUCTOR, ROLES.ADMIN],
      },
      { label: "Utilisateurs", path: "/admin/users", roles: [ROLES.ADMIN] },
    ];

    return baseItems.filter(
      (item) =>
        item.roles.includes(ROLES.ALL) ||
        (user?.role && item.roles.includes(user.role.toUpperCase()))
    );
  }, [user]);

  const navItems = getNavItems();

  const getUserInitials = useCallback(() => {
    const data = profileData || user;
    if (data?.prenom && data?.nom) {
      return `${data.prenom[0]}${data.nom[0]}`.toUpperCase();
    }
    return "U";
  }, [profileData, user]);

  const getUserFullName = useCallback(() => {
    const data = profileData || user;
    if (data?.prenom && data?.nom) {
      return `${data.prenom} ${data.nom}`;
    }
    return "Utilisateur";
  }, [profileData, user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "RAPPEL_COURS":
        return <BookmarkIcon sx={{ color: "#3b82f6" }} />;
      case "CERTIFICAT":
        return <FavoriteIcon sx={{ color: "#10b981" }} />;
      case "PROGRESSION":
        return <DashboardIcon sx={{ color: "#f59e0b" }} />;
      default:
        return <NotificationsIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };

  const formatNotificationTime = (dateString) => {
    if (!dateString) return "Inconnu";
    const date = new Date(dateString);
    if (isNaN(date)) return "Inconnu";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const navbarStyles = {
    background: scrolled
      ? `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.95
        )} 0%, ${alpha(theme.palette.primary.dark, 0.95)} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    backdropFilter: scrolled ? "blur(20px)" : "none",
    boxShadow: scrolled
      ? "0 8px 32px rgba(1, 11, 64, 0.2)"
      : "0 2px 10px rgba(1, 11, 64, 0.1)",
    transition: "all 0.3s ease-in-out",
    borderBottom: scrolled
      ? `1px solid ${alpha(theme.palette.primary.light, 0.2)}`
      : "none",
  };

  return (
    <HideOnScroll>
      <AppBar position="fixed" sx={navbarStyles}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: "60px !important", md: "70px !important" },
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                position: "absolute",
                top: 80,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2000,
                maxWidth: "90%",
              }}
            >
              {error}
            </Alert>
          )}
          {notificationsError && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                position: "absolute",
                top: 80,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2000,
                maxWidth: "90%",
              }}
            >
              {notificationsError}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 3 },
            }}
          >
            <IconButton
              color="inherit"
              onClick={onToggleSidebar}
              sx={{
                display: { xs: "flex", md: "none" },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
              aria-label="Ouvrir le menu latéral"
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                textDecoration: "none",
                color: "inherit",
                "&:hover": { opacity: 0.9 },
              }}
              onClick={() => navigate("/")}
            >
              <SchoolIcon
                sx={{
                  fontSize: { xs: 28, md: 32 },
                  mr: 1,
                  color: theme.palette.secondary.main,
                }}
              />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontFamily: "Ubuntu, sans-serif",
                  fontWeight: 700,
                  background:
                    "linear-gradient(45deg, #ffffff 30%, #ff6b74 90%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: { xs: "none", sm: "block" },
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                Youth Computing
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, ml: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path || item.label}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: isActiveRoute(item.path)
                      ? alpha(theme.palette.secondary.main, 0.2)
                      : "transparent",
                    border: isActiveRoute(item.path)
                      ? `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      borderColor: alpha(theme.palette.secondary.main, 0.2),
                    },
                    transition: "all 0.2s ease",
                    fontWeight: isActiveRoute(item.path) ? 600 : 400,
                    fontSize: "0.9rem",
                  }}
                  aria-label={item.label}
                >
                  {item.label || "Sans nom"}
                </Button>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            <IconButton
              color="inherit"
              onClick={() => navigate("/search")}
              sx={{
                display: { xs: "none", sm: "flex" },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
              aria-label="Rechercher"
            >
              <SearchIcon />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{
                "&:hover": {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
              aria-label={`Notifications (${unreadCount} non lues)`}
            >
              <Badge
                badgeContent={unreadCount}
                color="secondary"
                overlap="circular"
                sx={{
                  "& .MuiBadge-badge": {
                    animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)" },
                      "50%": { transform: "scale(1.1)" },
                      "100%": { transform: "scale(1)" },
                    },
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{
                display: { xs: "flex", md: "none" },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
              aria-label="Menu utilisateur"
            >
              <AccountCircle />
            </IconButton>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  transform: "translateY(-2px)",
                },
              }}
              onClick={handleProfileOpen}
              aria-label="Ouvrir le menu du profil"
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.secondary.main,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: `2px solid ${alpha("#fff", 0.3)}`,
                }}
                src={profileData?.avatar || user?.avatar || defaultAvatar}
                imgProps={{ onError: () => getUserInitials() }}
              >
                {getUserInitials()}
              </Avatar>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="subtitle2" fontWeight={600} lineHeight={1}>
                  {getUserFullName()}
                </Typography>
                <Chip
                  label={profileData?.role || user?.role || "Utilisateur"}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: "0.6rem",
                    bgcolor: alpha(theme.palette.secondary.main, 0.2),
                    color: "white",
                    mt: 0.3,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 380,
                maxWidth: 450,
                maxHeight: 500,
                borderRadius: 3,
                boxShadow: "0 20px 60px rgba(1, 11, 64, 0.4)",
                overflow: "hidden",
              },
            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Notifications
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {unreadCount} non {unreadCount === 1 ? "lue" : "lues"}
                </Typography>
              </Box>
              {loadingNotifications && (
                <CircularProgress size={20} color="inherit" />
              )}
            </Box>

            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <MenuItem
                    key={notification._id || `notification-${index}`}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderBottom:
                        index < notifications.length - 1
                          ? `1px solid ${theme.palette.grey[100]}`
                          : "none",
                      backgroundColor: !notification.lu
                        ? alpha(theme.palette.primary.main, 0.04)
                        : "transparent",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.08
                        ),
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box sx={{ display: "flex", width: "100%", gap: 1.5 }}>
                      <Box
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={notification.lu ? 500 : 700}
                            sx={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {notification.message ||
                              "Notification sans contenu"}
                          </Typography>
                          {!notification.lu && (
                            <CircleIcon
                              sx={{
                                fontSize: 8,
                                color: theme.palette.secondary.main,
                                ml: 1,
                              }}
                            />
                          )}
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {formatNotificationTime(notification.createdAt)}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {!notification.lu && (
                              <IconButton
                                size="small"
                                onClick={(e) =>
                                  handleMarkAsRead(notification._id, e)
                                }
                                sx={{
                                  p: 0.5,
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      theme.palette.success.main,
                                      0.1
                                    ),
                                  },
                                }}
                                aria-label="Marquer comme lu"
                              >
                                <CheckCircleIcon
                                  sx={{
                                    fontSize: 16,
                                    color: theme.palette.success.main,
                                  }}
                                />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleDeleteNotification(notification._id, e)
                              }
                              sx={{
                                p: 0.5,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                },
                              }}
                              aria-label="Supprimer la notification"
                            >
                              <DeleteIcon
                                sx={{
                                  fontSize: 16,
                                  color: theme.palette.error.main,
                                }}
                              />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <Box
                  sx={{
                    py: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <NotificationsIcon
                    sx={{ fontSize: 48, color: theme.palette.grey[300] }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Aucune notification
                  </Typography>
                </Box>
              )}
            </Box>

            {notifications.length > 0 && (
              <Box
                sx={{
                  borderTop: `1px solid ${theme.palette.grey[200]}`,
                  p: 1.5,
                  textAlign: "center",
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Button
                  size="small"
                  onClick={() => handleNavigation("/notifications")}
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  Voir toutes les notifications
                </Button>
              </Box>
            )}
          </Menu>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: 3,
                boxShadow: "0 20px 60px rgba(1, 11, 64, 0.4)",
                overflow: "hidden",
              },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                p: 2.5,
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: theme.palette.secondary.main,
                  mx: "auto",
                  mb: 1.5,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  border: `3px solid ${alpha("#fff", 0.3)}`,
                }}
                src={profileData?.avatar || user?.avatar || defaultAvatar}
                imgProps={{ onError: () => getUserInitials() }}
              >
                {getUserInitials()}
              </Avatar>
              {loadingProfile ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <Typography variant="h6" fontWeight={700}>
                    {getUserFullName()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    {profileData?.email ||
                      user?.email ||
                      "Email non disponible"}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip
                      label={profileData?.role || user?.role || "Utilisateur"}
                      size="small"
                      sx={{
                        bgcolor: alpha("#fff", 0.2),
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                    {(profileData?.level || user?.level) && (
                      <Chip
                        label={`Niveau ${profileData?.level || user?.level}`}
                        size="small"
                        sx={{
                          bgcolor: alpha("#fff", 0.2),
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Stack>
                </>
              )}
            </Paper>
            <Box sx={{ p: 1 }}>
              <MenuItem
                onClick={() => handleNavigation("/profile")}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <ProfileIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Mon Profil"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </MenuItem>
              <MenuItem
                onClick={() => handleNavigation("/settings")}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <SettingsIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Paramètres"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </MenuItem>
              <MenuItem
                onClick={() =>
                  handleNavigation(
                    `/${user?.role?.toLowerCase() || "user"}/dashboard`
                  )
                }
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <DashboardIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Tableau de bord"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  color: theme.palette.error.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon
                    fontSize="small"
                    sx={{ color: theme.palette.error.main }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>
            </Box>
          </Menu>

          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: 3,
                boxShadow: "0 20px 60px rgba(1, 11, 64, 0.4)",
                overflow: "hidden",
              },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: theme.palette.secondary.main,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  border: `2px solid ${alpha("#fff", 0.3)}`,
                }}
                src={profileData?.avatar || user?.avatar || defaultAvatar}
                imgProps={{ onError: () => getUserInitials() }}
              >
                {getUserInitials()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                {loadingProfile ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {getUserFullName()}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {(profileData?.role || user?.role || "Utilisateur") +
                        " • Niveau " +
                        (profileData?.level || user?.level || "N/A")}
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
            <Box sx={{ p: 1 }}>
              {navItems.length > 0 ? (
                navItems.map((item) => (
                  <MenuItem
                    key={item.path || item.label}
                    onClick={() => handleNavigation(item.path)}
                    selected={isActiveRoute(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      mb: 0.5,
                      backgroundColor: isActiveRoute(item.path)
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.12
                        ),
                      },
                    }}
                  >
                    <ListItemText>
                      <Typography
                        fontWeight={isActiveRoute(item.path) ? 600 : 400}
                      >
                        {item.label || "Sans nom"}
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ p: 2, color: "text.secondary" }}
                >
                  Aucun élément de navigation disponible
                </Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <MenuItem
                onClick={() => handleNavigation("/profile")}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <ProfileIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Mon Profil"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </MenuItem>
              <MenuItem
                onClick={() => handleNavigation("/settings")}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <SettingsIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Paramètres"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  color: theme.palette.error.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon
                    fontSize="small"
                    sx={{ color: theme.palette.error.main }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;
