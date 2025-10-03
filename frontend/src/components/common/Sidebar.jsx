import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Chip,
  Fade,
  Avatar,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
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
  AccountCircle as ProfileIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Import du design system
import '../../styles/variables.css';

// Animations
const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Styled Components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 300,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 300,
    boxSizing: "border-box",
    border: "none",
    background: "var(--gradient-primary)",
    backdropFilter: "blur(20px)",
    color: "var(--white)",
    overflowX: "hidden",
    boxShadow: "var(--shadow-2xl)",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    animation: `${slideInLeft} 0.6s ease-out forwards`,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "var(--radius-full)",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "var(--secondary-red)",
      borderRadius: "var(--radius-full)",
      "&:hover": {
        background: "var(--secondary-red-light)",
      },
    },
  },
}));

const Sidebar = ({ open, onClose, variant = "persistent" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    } else if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  // Obtenir le nom complet de l'utilisateur
  const getUserFullName = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom} ${user.nom}`;
    } else if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return "Utilisateur";
  };

  // Navigation items basés sur le rôle
  const getNavigationItems = () => {
    const baseItems = [
      {
        text: "Tableau de bord",
        icon: <DashboardIcon />,
        path: `/${user?.role?.toLowerCase()}/dashboard`,
        roles: ["learner", "instructor", "admin"],
      },
      {
        text: "Mes Cours",
        icon: <CourseIcon />,
        path: `/${user?.role?.toLowerCase()}/courses`,
        roles: ["learner"],
      },
      {
        text: "Gestion des Cours",
        icon: <ContentIcon />,
        path: `/${user?.role?.toLowerCase()}/courses`,
        roles: ["instructor", "admin"],
      },
      {
        text: "Ma Progression",
        icon: <ProgressIcon />,
        path: `/${user?.role?.toLowerCase()}/progress`,
        roles: ["learner"],
      },
      {
        text: "Analytiques",
        icon: <AnalyticsIcon />,
        path: `/${user?.role?.toLowerCase()}/analytics`,
        roles: ["instructor", "admin"],
      },
      {
        text: "Mes Certificats",
        icon: <CertificateIcon />,
        path: `/${user?.role?.toLowerCase()}/certificates`,
        roles: ["learner", "instructor"],
      },
      {
        text: "Utilisateurs",
        icon: <UsersIcon />,
        path: "/admin/users",
        roles: ["admin"],
      },
    ];

    return baseItems.filter((item) =>
      item.roles.includes(user?.role?.toLowerCase())
    );
  };

  const commonItems = [
    {
      text: "Mon Profil",
      icon: <ProfileIcon />,
      path: `/${user?.role?.toLowerCase()}/profile`,
      roles: ["learner", "instructor", "admin"],
    },
    {
      text: "Paramètres",
      icon: <SettingsIcon />,
      path: `/${user?.role?.toLowerCase()}/settings`,
      roles: ["learner", "instructor", "admin"],
    },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = getNavigationItems();

  return (
    <StyledDrawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Fade in timeout={800}>
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header Sidebar */}
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background pattern */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>')`,
                opacity: 0.3,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "var(--font-primary)",
                  fontWeight: "var(--font-extrabold)",
                  color: "var(--white)",
                  mb: 2,
                  fontSize: { xs: "1.5rem", sm: "1.8rem" },
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                Youth Computing
              </Typography>
              <Chip
                label={user?.role?.toUpperCase() || "UTILISATEUR"}
                size="small"
                sx={{
                  background: "var(--gradient-secondary)",
                  color: "var(--white)",
                  fontWeight: "var(--font-semibold)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            </Box>
          </Box>

          {/* User Info */}
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: "var(--gradient-accent)",
                color: "var(--white)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-bold)",
                margin: "0 auto var(--space-3)",
                border: "3px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "var(--shadow-lg)",
                transition: "all var(--transition-base)",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "var(--shadow-glow)",
                },
              }}
              src={user?.avatar}
              alt={getUserFullName()}
            >
              {getUserInitials()}
            </Avatar>

            <Typography
              variant="h6"
              sx={{
                fontWeight: "var(--font-semibold)",
                color: "var(--white)",
                fontSize: "var(--text-lg)",
                mb: 1,
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              }}
            >
              {getUserFullName()}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                color: "var(--white)",
                fontSize: "var(--text-sm)",
                mb: 2,
              }}
            >
              {user?.email || "email@exemple.com"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip
                icon={<StarIcon sx={{ fontSize: "16px !important" }} />}
                label={`Niveau ${user?.level || "1"}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "var(--accent-purple)",
                  color: "var(--accent-purple)",
                  fontWeight: "var(--font-medium)",
                  fontSize: "var(--text-xs)",
                  background: "rgba(139, 92, 246, 0.1)",
                  backdropFilter: "blur(5px)",
                  "& .MuiChip-icon": {
                    color: "var(--accent-purple)",
                  },
                }}
              />

              {user?.points && (
                <Chip
                  label={`${user.points} pts`}
                  size="small"
                  sx={{
                    background: "var(--gradient-success)",
                    color: "var(--white)",
                    fontWeight: "var(--font-medium)",
                    fontSize: "var(--text-xs)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Main Navigation */}
          <List sx={{ flex: 1, p: 2, overflowY: "auto", scrollbarWidth: "thin" }}>
            {navigationItems.map((item, index) => (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  mb: 1,
                  animation: `${slideInLeft} ${0.6 + index * 0.1}s ease-out forwards`,
                  opacity: 0,
                }}
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: "var(--radius-xl)",
                    backgroundColor: isActive(item.path)
                      ? "var(--secondary-red-200)"
                      : "transparent",
                    border: isActive(item.path)
                      ? "1px solid var(--secondary-red-300)"
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: "var(--secondary-red-100)",
                      transform: "translateX(6px)",
                      boxShadow: "var(--shadow-md)",
                      border: "1px solid var(--secondary-red-300)",
                    },
                    py: 1.5,
                    px: 2,
                    transition: "all var(--transition-base)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isActive(item.path) ? "4px" : "0px",
                      backgroundColor: "var(--secondary-red)",
                      borderRadius: "0 var(--radius-base) var(--radius-base) 0",
                      transition: "width var(--transition-base)",
                    },
                  }}
                  aria-label={item.text}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? "var(--secondary-red)" : "var(--white)",
                      minWidth: 44,
                      fontSize: "24px",
                      transition: "all var(--transition-base)",
                      transform: isActive(item.path) ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? "var(--font-semibold)" : "var(--font-normal)",
                      fontSize: "var(--text-base)",
                      color: isActive(item.path) ? "var(--secondary-red)" : "var(--white)",
                      fontFamily: "var(--font-primary)",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              margin: "var(--space-4) var(--space-6)",
            }}
          />

          {/* Secondary Navigation */}
          <List sx={{ p: 2 }}>
            {commonItems.map((item, index) => (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  mb: 1,
                  animation: `${slideInLeft} ${0.8 + index * 0.1}s ease-out forwards`,
                  opacity: 0,
                }}
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: "var(--radius-xl)",
                    backgroundColor: isActive(item.path)
                      ? "var(--secondary-red-200)"
                      : "transparent",
                    border: isActive(item.path)
                      ? "1px solid var(--secondary-red-300)"
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: "var(--secondary-red-100)",
                      transform: "translateX(6px)",
                      boxShadow: "var(--shadow-md)",
                      border: "1px solid var(--secondary-red-300)",
                    },
                    py: 1.5,
                    px: 2,
                    transition: "all var(--transition-base)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isActive(item.path) ? "4px" : "0px",
                      backgroundColor: "var(--secondary-red)",
                      borderRadius: "0 var(--radius-base) var(--radius-base) 0",
                      transition: "width var(--transition-base)",
                    },
                  }}
                  aria-label={item.text}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? "var(--secondary-red)" : "var(--white)",
                      minWidth: 44,
                      fontSize: "24px",
                      transition: "all var(--transition-base)",
                      transform: isActive(item.path) ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? "var(--font-semibold)" : "var(--font-normal)",
                      fontSize: "var(--text-base)",
                      color: isActive(item.path) ? "var(--secondary-red)" : "var(--white)",
                      fontFamily: "var(--font-primary)",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {/* Logout */}
            <ListItem
              disablePadding
              sx={{
                mt: 2,
                animation: `${slideInLeft} 1s ease-out forwards`,
                opacity: 0,
              }}
            >
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--secondary-red-300)",
                  backgroundColor: "var(--secondary-red-100)",
                  "&:hover": {
                    backgroundColor: "var(--secondary-red-200)",
                    transform: "translateX(6px) scale(1.02)",
                    boxShadow: "var(--shadow-glow)",
                  },
                  py: 1.5,
                  px: 2,
                  transition: "all var(--transition-base)",
                }}
                aria-label="Déconnexion"
              >
                <ListItemIcon
                  sx={{
                    color: "var(--secondary-red)",
                    minWidth: 44,
                    fontSize: "24px",
                    transition: "all var(--transition-base)",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{
                    color: "var(--secondary-red)",
                    fontWeight: "var(--font-semibold)",
                    fontSize: "var(--text-base)",
                    fontFamily: "var(--font-primary)",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Footer Sidebar */}
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background pattern */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="lines" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 0 5 L 10 5" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23lines)"/></svg>')`,
                opacity: 0.3,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  color: "var(--white)",
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--font-medium)",
                  display: "block",
                  mb: 0.5,
                }}
              >
                Version 1.0.0
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  color: "var(--white)",
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--font-medium)",
                }}
              >
                © {new Date().getFullYear()} Youth Computing
              </Typography>

              {/* Status indicator */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--success)",
                    boxShadow: "0 0 8px var(--success)",
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    color: "var(--white)",
                    fontSize: "var(--text-xs)",
                    fontWeight: "var(--font-medium)",
                  }}
                >
                  En ligne
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </StyledDrawer>
  );
};

export default Sidebar;