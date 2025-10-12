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
import { styled, keyframes, alpha } from "@mui/material/styles";
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

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 300,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 300,
    boxSizing: "border-box",
    border: "none",
    background: "linear-gradient(135deg, #0B0B40 0%, #1A0A3E 100%)",
    backdropFilter: "blur(20px)",
    color: "white",
    overflowX: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    animation: `${slideInLeft} 0.6s ease-out forwards`,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: alpha("#ffffff", 0.1),
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#ff6b74",
      borderRadius: "10px",
      "&:hover": {
        background: "#ff8a92",
      },
    },
  },
}));

const Sidebar = ({ open, onClose, variant = "persistent" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer le rôle et le type d'utilisateur
  const userRole = user?.role?.toUpperCase() || "";
  const isStudent = userRole === "ETUDIANT";
  const isInstructor = userRole === "ENSEIGNANT";
  const isAdmin = userRole === "ADMIN";

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

  // Obtenir le label du rôle en français
  const getRoleLabel = () => {
    switch (userRole) {
      case "ETUDIANT":
        return "Étudiant";
      case "ENSEIGNANT":
        return "Enseignant";
      case "ADMIN":
        return "Administrateur";
      default:
        return "Utilisateur";
    }
  };

  // Obtenir la couleur du rôle
  const getRoleColor = () => {
    switch (userRole) {
      case "ADMIN":
        return "#ff1744";
      case "ENSEIGNANT":
        return "#2979ff";
      case "ETUDIANT":
        return "#00e676";
      default:
        return "#9c27b0";
    }
  };

  // Navigation items basés sur le rôle
  const getNavigationItems = () => {
    const items = [];

    // Commun à tous
    items.push({
      text: "Tableau de bord",
      icon: <DashboardIcon />,
      path: `/${user?.role?.toLowerCase()}/dashboard`,
      roles: ["etudiant", "enseignant", "admin"],
    });

    // Étudiants
    if (isStudent) {
      items.push(
        {
          text: "Mes Cours",
          icon: <CourseIcon />,
          path: "/etudiant/courses",
          roles: ["etudiant"],
        },
        {
          text: "Ma Progression",
          icon: <ProgressIcon />,
          path: "/etudiant/progress",
          roles: ["etudiant"],
        },
        {
          text: "Mes Certificats",
          icon: <CertificateIcon />,
          path: "/etudiant/certificates",
          roles: ["etudiant"],
        }
      );
    }

    // Enseignants
    if (isInstructor) {
      items.push(
        {
          text: "Gestion des Cours",
          icon: <ContentIcon />,
          path: "/enseignant/courses",
          roles: ["enseignant"],
        },
        {
          text: "Créer un Cours",
          icon: <CourseIcon />,
          path: "/enseignant/courses/create",
          roles: ["enseignant"],
        },
        {
          text: "Analytiques",
          icon: <AnalyticsIcon />,
          path: "/enseignant/analytics",
          roles: ["enseignant"],
        }
      );
    }

    // Administrateurs
    if (isAdmin) {
      items.push(
        {
          text: "Utilisateurs",
          icon: <UsersIcon />,
          path: "/admin/users",
          roles: ["admin"],
        },
        {
          text: "Gestion des Cours",
          icon: <ContentIcon />,
          path: "/admin/courses",
          roles: ["admin"],
        },
        {
          text: "Analytiques",
          icon: <AnalyticsIcon />,
          path: "/admin/analytics",
          roles: ["admin"],
        }
      );
    }

    return items;
  };

  const commonItems = [
    {
      text: "Mon Profil",
      icon: <ProfileIcon />,
      path: "/profile",
    },
    {
      text: "Paramètres",
      icon: <SettingsIcon />,
      path: "/settings",
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
              borderBottom: `1px solid ${alpha("#ffffff", 0.1)}`,
              background: `linear-gradient(135deg, ${alpha("#ffffff", 0.1)} 0%, ${alpha("#ffffff", 0.05)} 100%)`,
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
                  fontFamily: "'Poppins', 'Ubuntu', sans-serif",
                  fontWeight: 800,
                  color: "white",
                  mb: 2,
                  fontSize: { xs: "1.5rem", sm: "1.8rem" },
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                Youth Computing
              </Typography>
              <Chip
                label={getRoleLabel()}
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${getRoleColor()} 0%, ${alpha(getRoleColor(), 0.8)} 100%)`,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxShadow: `0 4px 12px ${alpha(getRoleColor(), 0.3)}`,
                  border: `1px solid ${alpha("#ffffff", 0.2)}`,
                }}
              />
            </Box>
          </Box>

          {/* User Info */}
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderBottom: `1px solid ${alpha("#ffffff", 0.1)}`,
              background: `linear-gradient(135deg, ${alpha("#ffffff", 0.05)} 0%, ${alpha("#ffffff", 0.02)} 100%)`,
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: `linear-gradient(135deg, ${getRoleColor()} 0%, ${alpha(getRoleColor(), 0.7)} 100%)`,
                color: "white",
                fontSize: "2rem",
                fontWeight: "bold",
                margin: "0 auto 1.5rem",
                border: `3px solid ${alpha("#ffffff", 0.2)}`,
                boxShadow: `0 8px 24px ${alpha(getRoleColor(), 0.3)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: `0 12px 32px ${alpha(getRoleColor(), 0.4)}`,
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
                fontWeight: 600,
                color: "white",
                fontSize: "1.1rem",
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
                color: "white",
                fontSize: "0.875rem",
                mb: 2,
              }}
            >
              {user?.email || "email@exemple.com"}
            </Typography>

            {/* Stats - Afficher le niveau UNIQUEMENT pour les étudiants */}
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
              {isStudent && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: "16px !important" }} />}
                  label={`Niveau ${user?.level || "1"}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "#8b5cf6",
                    color: "#8b5cf6",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    background: alpha("#8b5cf6", 0.1),
                    backdropFilter: "blur(5px)",
                    "& .MuiChip-icon": {
                      color: "#8b5cf6",
                    },
                  }}
                />
              )}

              {isStudent && user?.points && (
                <Chip
                  label={`${user.points} pts`}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #00e676 0%, #00c853 100%)",
                    color: "white",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    boxShadow: "0 4px 12px rgba(0, 230, 118, 0.3)",
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
                    borderRadius: "12px",
                    backgroundColor: isActive(item.path)
                      ? alpha("#ff6b74", 0.15)
                      : "transparent",
                    border: isActive(item.path)
                      ? `1px solid ${alpha("#ff6b74", 0.4)}`
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: alpha("#ff6b74", 0.12),
                      transform: "translateX(6px)",
                      boxShadow: `0 8px 16px ${alpha("#ff6b74", 0.2)}`,
                      borderColor: alpha("#ff6b74", 0.4),
                    },
                    py: 1.5,
                    px: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isActive(item.path) ? "4px" : "0px",
                      backgroundColor: "#ff6b74",
                      borderRadius: "0 8px 8px 0",
                      transition: "width 0.3s ease",
                    },
                  }}
                  aria-label={item.text}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? "#ff6b74" : "white",
                      minWidth: 44,
                      fontSize: "24px",
                      transition: "all 0.3s ease",
                      transform: isActive(item.path) ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 500,
                      fontSize: "1rem",
                      color: isActive(item.path) ? "#ff6b74" : "white",
                      fontFamily: "'Poppins', 'Ubuntu', sans-serif",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider
            sx={{
              backgroundColor: alpha("#ffffff", 0.1),
              margin: "1.5rem 1.5rem",
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
                    borderRadius: "12px",
                    backgroundColor: isActive(item.path)
                      ? alpha("#ff6b74", 0.15)
                      : "transparent",
                    border: isActive(item.path)
                      ? `1px solid ${alpha("#ff6b74", 0.4)}`
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: alpha("#ff6b74", 0.12),
                      transform: "translateX(6px)",
                      boxShadow: `0 8px 16px ${alpha("#ff6b74", 0.2)}`,
                      borderColor: alpha("#ff6b74", 0.4),
                    },
                    py: 1.5,
                    px: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isActive(item.path) ? "4px" : "0px",
                      backgroundColor: "#ff6b74",
                      borderRadius: "0 8px 8px 0",
                      transition: "width 0.3s ease",
                    },
                  }}
                  aria-label={item.text}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? "#ff6b74" : "white",
                      minWidth: 44,
                      fontSize: "24px",
                      transition: "all 0.3s ease",
                      transform: isActive(item.path) ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 500,
                      fontSize: "1rem",
                      color: isActive(item.path) ? "#ff6b74" : "white",
                      fontFamily: "'Poppins', 'Ubuntu', sans-serif",
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
                  borderRadius: "12px",
                  border: `1px solid ${alpha("#ff6b74", 0.4)}`,
                  backgroundColor: alpha("#ff6b74", 0.1),
                  "&:hover": {
                    backgroundColor: alpha("#ff6b74", 0.15),
                    transform: "translateX(6px) scale(1.02)",
                    boxShadow: `0 12px 24px ${alpha("#ff6b74", 0.3)}`,
                  },
                  py: 1.5,
                  px: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                aria-label="Déconnexion"
              >
                <ListItemIcon
                  sx={{
                    color: "#ff6b74",
                    minWidth: 44,
                    fontSize: "24px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{
                    color: "#ff6b74",
                    fontWeight: 600,
                    fontSize: "1rem",
                    fontFamily: "'Poppins', 'Ubuntu', sans-serif",
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
              borderTop: `1px solid ${alpha("#ffffff", 0.1)}`,
              background: `linear-gradient(135deg, ${alpha("#ffffff", 0.1)} 0%, ${alpha("#ffffff", 0.05)} 100%)`,
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
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 500,
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
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 500,
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
                    borderRadius: "50%",
                    backgroundColor: "#00e676",
                    boxShadow: "0 0 8px #00e676",
                    animation: `${pulse} 2s infinite`,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 500,
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