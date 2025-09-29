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
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Animations
const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Couleurs
const colors = {
  navy: "#010b40",
  lightNavy: "#1a237e",
  red: "#f13544",
  pink: "#ff6b74",
  purple: "#8b5cf6",
};

// Styled Components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 280,
    boxSizing: "border-box",
    border: "none",
    background: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
    backdropFilter: "blur(20px)",
    color: "#ffffff",
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    animation: `${fadeInLeft} 0.6s ease-out forwards`,
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
              borderBottom: `1px solid ${colors.red}33`,
              backgroundColor: `${colors.navy}b3`,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Ubuntu, sans-serif",
                fontWeight: 700,
                color: "#ffffff",
                mb: 1,
                fontSize: { xs: "1.5rem", sm: "1.8rem" },
              }}
            >
              Youth Computing
            </Typography>
            <Chip
              label={user?.role?.toUpperCase() || "UTILISATEUR"}
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            />
          </Box>

          {/* User Info */}
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              borderBottom: `1px solid ${colors.red}33`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#ffffff",
                fontSize: "1.2rem",
              }}
            >
              {getUserFullName()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                color: "#ffffff",
                fontSize: "0.9rem",
                mt: 0.5,
              }}
            >
              {user?.email || "email@exemple.com"}
            </Typography>
            <Chip
              label={`Niveau ${user?.level || "1"}`}
              size="small"
              variant="outlined"
              sx={{
                mt: 1,
                borderColor: colors.purple,
                color: colors.purple,
                fontWeight: 500,
                fontSize: "0.8rem",
              }}
            />
          </Box>

          {/* Main Navigation */}
          <List sx={{ flex: 1, p: 2, overflowY: "auto" }}>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: "12px",
                    backgroundColor: isActive(item.path)
                      ? `${colors.red}33`
                      : "transparent",
                    "&:hover": {
                      backgroundColor: `${colors.red}4d`,
                      transform: "translateX(4px)",
                    },
                    py: 1.5,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  aria-label={item.text}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? colors.red : "#ffffff",
                      minWidth: 40,
                      fontSize: "24px",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 400,
                      fontSize: "1.1rem",
                      color: "#ffffff",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ backgroundColor: `${colors.red}33` }} />

          {/* Secondary Navigation */}
          <List sx={{ p: 2 }}>
            {commonItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: "12px",
                    backgroundColor: isActive(item.path)
                      ? `${colors.red}33`
                      : "transparent",
                    "&:hover": {
                      backgroundColor: `${colors.red}4d`,
                      transform: "translateX(4px)",
                    },
                    py: 1.5,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  aria-label={item.text}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? colors.red : "#ffffff",
                      minWidth: 40,
                      fontSize: "24px",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 400,
                      fontSize: "1.1rem",
                      color: "#ffffff",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {/* Logout */}
            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: `${colors.red}4d`,
                    transform: "translateX(4px)",
                  },
                  py: 1.5,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                aria-label="Déconnexion"
              >
                <ListItemIcon
                  sx={{ color: colors.red, minWidth: 40, fontSize: "24px" }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{
                    color: colors.red,
                    fontWeight: 500,
                    fontSize: "1.1rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Footer Sidebar */}
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              borderTop: `1px solid ${colors.red}33`,
              backgroundColor: `${colors.navy}b3`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.6, color: "#ffffff", fontSize: "0.8rem" }}
            >
              Version 1.0.0
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                opacity: 0.6,
                color: "#ffffff",
                mt: 0.5,
                fontSize: "0.8rem",
              }}
            >
              © {new Date().getFullYear()} Youth Computing
            </Typography>
          </Box>
        </Box>
      </Fade>
    </StyledDrawer>
  );
};

export default Sidebar;