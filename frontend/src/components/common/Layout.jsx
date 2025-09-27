// src/components/Layout.jsx - Disposition principale professionnelle avec footer fixé en bas et style cohérent
import React, { useState, useEffect } from "react";
import { Box, Fab, Zoom, CssBaseline, GlobalStyles } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { KeyboardArrowUp as ArrowUpIcon } from "@mui/icons-material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Couleurs principales
const colors = {
  navy: "#010b40",
  lightNavy: "#1a237e",
  red: "#f13544",
  pink: "#ff6b74",
  purple: "#8b5cf6",
  grey: { 100: "#f5f5f5" },
  background: { default: "#ffffff" },
};

// Styles globaux pour Youth Computing
const globalStyles = {
  "*": {
    scrollBehavior: "smooth",
  },
  "html, body": {
    margin: 0,
    padding: 0,
    fontFamily: "Ubuntu, sans-serif",
    backgroundColor: colors.background.default,
    minHeight: "100vh",
  },
  "::selection": {
    backgroundColor: `${colors.red}33`,
    color: colors.red,
  },
  "::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "::-webkit-scrollbar-track": {
    backgroundColor: colors.grey[100],
  },
  "::-webkit-scrollbar-thumb": {
    backgroundColor: colors.red,
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: colors.pink,
    },
  },
  // Animations globales
  "@keyframes fadeInUp": {
    "0%": { opacity: 0, transform: "translateY(30px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
  "@keyframes fadeInLeft": {
    "0%": { opacity: 0, transform: "translateX(-30px)" },
    "100%": { opacity: 1, transform: "translateX(0)" },
  },
  "@keyframes pulse": {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.7 },
  },
  // Classes utilitaires pour animations
  ".fade-in-up": {
    animation: "fadeInUp 0.6s ease-out",
  },
  ".fade-in-left": {
    animation: "fadeInLeft 0.6s ease-out",
  },
  ".pulse": {
    animation: "pulse 2s ease-in-out infinite",
  },
  // Styles pour les focus accessibles
  ".focus-visible": {
    outline: `2px solid ${colors.red}`,
    outlineOffset: "2px",
  },
};

// Styled Components
const StyledMain = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  minWidth: 0,
  backgroundColor: colors.background.default,
});

const StyledContent = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
  backdropFilter: "blur(20px)",
});

const StyledFab = styled(Fab)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: "#ffffff",
  boxShadow: `0 8px 32px ${colors.navy}4d`,
  "&:hover": {
    background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
    transform: "scale(1.1)",
    boxShadow: `0 12px 40px ${colors.red}4d`,
  },
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
});

const Layout = ({
  children,
  showSidebar = true,
  sidebarVariant = "responsive", // 'responsive', 'permanent', 'temporary'
  headerVariant = "default", // 'default', 'minimal', 'transparent'
  footerVariant = "default", // 'default', 'minimal', 'hidden'
  backgroundPattern = false,
  containerMaxWidth = "xl",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    sidebarVariant === "permanent" ? true : false
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Détection du scroll pour le bouton "retour en haut"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gestion de la sidebar responsive
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const drawerWidth = 280;
  const headerHeight = 80;

  // Détermination de la variante de sidebar
  const getSidebarVariant = () => {
    if (sidebarVariant === "permanent") return "permanent";
    if (sidebarVariant === "temporary") return "temporary";
    return "persistent";
  };

  // Styles pour le background avec pattern
  const getBackgroundStyles = () => {
    if (!backgroundPattern) return {};

    return {
      backgroundImage: `
        radial-gradient(circle at 25% 50%, ${colors.red}1a 0%, transparent 50%),
        radial-gradient(circle at 75% 50%, ${colors.purple}1a 0%, transparent 50%)
      `,
      backgroundSize: "400px 400px, 400px 400px",
      backgroundRepeat: "no-repeat, no-repeat",
    };
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />

      {/* Header */}
      <Header
        onToggleSidebar={handleToggleSidebar}
        variant={headerVariant}
      />

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          variant={getSidebarVariant()}
        />
      )}

      {/* Main Content */}
      <StyledMain
        component="main"
        sx={{
          width: {
            xs: "100%",
            md:
              showSidebar && sidebarOpen && getSidebarVariant() === "persistent"
                ? `calc(100% - ${drawerWidth}px)`
                : "100%",
          },
          marginLeft: {
            md:
              showSidebar && sidebarOpen && getSidebarVariant() === "persistent"
                ? `${drawerWidth}px`
                : 0,
          },
        }}
      >
        <StyledContent
          sx={{
            marginTop: `${headerHeight}px`,
            ...getBackgroundStyles(),
          }}
        >
          {/* Content Area */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3, md: 4 },
              maxWidth: containerMaxWidth,
              width: "100%",
              mx: "auto",
              animation: `${fadeInUp} 0.8s ease-out`,
            }}
          >
            {children}
          </Box>

          {/* Footer */}
          {footerVariant !== "hidden" && <Footer variant={footerVariant} />}
        </StyledContent>
      </StyledMain>

      {/* Bouton Scroll to Top */}
      <Zoom in={showScrollTop}>
        <StyledFab
          onClick={handleScrollToTop}
          size="medium"
          aria-label="retour en haut"
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1000,
            fontSize: "24px",
          }}
        >
          <ArrowUpIcon />
        </StyledFab>
      </Zoom>

      {/* Overlay pour mobile quand sidebar est ouverte */}
      {sidebarOpen && getSidebarVariant() === "temporary" && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `${colors.navy}80`,
            backdropFilter: "blur(4px)",
            zIndex: 1100,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
          onClick={handleCloseSidebar}
        />
      )}
    </Box>
  );
};

// Variants de layout pour différentes pages
export const DashboardLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={true}
    sidebarVariant="responsive"
    backgroundPattern={true}
    footerVariant="default"
    {...props}
  >
    {children}
  </Layout>
);

export const AuthLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={false}
    headerVariant="minimal"
    footerVariant="minimal"
    backgroundPattern={true}
    containerMaxWidth="sm"
    {...props}
  >
    {children}
  </Layout>
);

export const PublicLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={false}
    headerVariant="default"
    footerVariant="default"
    {...props}
  >
    {children}
  </Layout>
);

export const MinimalLayout = ({ children, ...props }) => (
  <Layout
    showSidebar={false}
    headerVariant="transparent"
    footerVariant="hidden"
    backgroundPattern={true}
    {...props}
  >
    {children}
  </Layout>
);

export default Layout;