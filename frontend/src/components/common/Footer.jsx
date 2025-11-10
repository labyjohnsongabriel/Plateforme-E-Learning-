// Code original fourni, sans changements
import React, { useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  School as SchoolIcon,
  Email,
  Phone,
  LocationOn,
  ArrowForward,
  YouTube,
} from "@mui/icons-material";

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components
const StyledFooter = styled(Box)(({ theme, variant }) => ({
  background: "linear-gradient(135deg, #010b40 0%, #1a237e 50%, #010b40 100%)",
  backgroundSize: "200% 200%",
  animation: `${gradientAnimation} 15s ease infinite`,

  color: "#ffffff",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2, 0), // Responsive padding

  // Responsive height
  minHeight: variant === "minimal" ? "200px" : "300px",
  maxHeight: variant === "minimal" ? "250px" : "400px",

  [theme.breakpoints.down("sm")]: {
    minHeight: variant === "minimal" ? "150px" : "250px",
    maxHeight: variant === "minimal" ? "200px" : "350px",
    padding: theme.spacing(1, 0),
  },
  [theme.breakpoints.up("md")]: {
    minHeight: variant === "minimal" ? "200px" : "300px",
    maxHeight: variant === "minimal" ? "250px" : "400px",
    padding: theme.spacing(2, 0),
  },

  // Background overlays
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(241, 53, 68, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 107, 116, 0.1) 0%, transparent 70%)
    `,
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: "-2px", // Fixed syntax error
    left: 0,
    right: 0,
    height: "2px",
    background:
      "linear-gradient(90deg, transparent, #f13544, #ff6b74, #f13544, transparent)",
    backgroundSize: "200% 200%",
    animation: `${gradientAnimation} 3s ease infinite`,
  },
}));

const StyledAvatar = styled(Avatar)({
  background: "linear-gradient(135deg, #f13544, #ff6b74)",
  boxShadow: "0 8px 32px rgba(241, 53, 68, 0.4)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-8px) scale(1.05)",
    boxShadow: "0 16px 48px rgba(241, 53, 68, 0.6)",
  },
});

const StyledIconButton = styled(IconButton)({
  color: "#ffffff",
  backgroundColor: "rgba(241, 53, 68, 0.15)",
  border: "1px solid rgba(241, 53, 68, 0.3)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "#f13544",
    borderColor: "#f13544",
    transform: "translateY(-4px) scale(1.15)",
    boxShadow: "0 12px 40px rgba(241, 53, 68, 0.5)",
  },
});

const AnimatedLink = styled(Link)({
  color: "rgba(255, 255, 255, 0.85)",
  fontSize: "0.875rem",
  cursor: "pointer",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  borderRadius: "8px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "0",
    height: "200%",
    background: "linear-gradient(90deg, #f13544, #ff6b74)",
    transition: "width 0.3s ease",
  },
  "&:hover": {
    color: "#ffffff",
    backgroundColor: "rgba(241, 53, 68, 0.1)",
    paddingLeft: "18px",
    "&::before": {
      width: "4px",
    },
    "& .arrow-icon": {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
  "& .arrow-icon": {
    opacity: 0,
    transform: "translateX(-10px)",
    transition: "all 0.3s ease",
    fontSize: "14px",
  },
});

const InfoCard = styled(Box)({
  padding: "12px",
  borderRadius: "10px",
  backgroundColor: "rgba(241, 53, 68, 0.08)",
  border: "1px solid rgba(241, 53, 68, 0.2)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeInUp} 0.6s ease-out`,
  "&:hover": {
    backgroundColor: "rgba(241, 53, 68, 0.15)",
    borderColor: "rgba(241, 53, 68, 0.4)",
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(241, 53, 68, 0.2)",
  },
});

const SectionTitle = styled(Typography)({
  color: "#f13544",
  fontFamily: "Ubuntu, sans-serif",
  fontWeight: 700,
  fontSize: "1.1rem",
  marginBottom: "16px",
  position: "relative",
  paddingBottom: "6px",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "40px",
    height: "3px",
    background: "linear-gradient(90deg, #f13544, #ff6b74)",
    borderRadius: "2px",
  },
});

const Footer = ({ variant = "default" }) => {
  const socialLinks = useMemo(
    () => [
      {
        icon: <Facebook />,
        url: "https://facebook.com/youthcomputing",
        label: "Facebook",
      },
      {
        icon: <Twitter />,
        url: "https://twitter.com/youthcomputing",
        label: "Twitter",
      },
      {
        icon: <LinkedIn />,
        url: "https://linkedin.com/company/youthcomputing",
        label: "LinkedIn",
      },
      {
        icon: <Instagram />,
        url: "https://instagram.com/youthcomputing",
        label: "Instagram",
      },
      {
        icon: <YouTube />,
        url: "https://youtube.com/@youthcomputing",
        label: "YouTube",
      },
    ],
    []
  );

  const quickLinks = useMemo(
    () => [
      { label: "Accueil", href: "/" },
      { label: "Catalogue de Cours", href: "/catalog" },
      { label: "À Propos", href: "/about" },
      { label: "Blog & Actualités", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
    []
  );

  const categoryLinks = useMemo(
    () => [
      {
        label: "Informatique & Programmation",
        href: "/catalog?category=informatique",
      },
      {
        label: "Communication Digitale",
        href: "/catalog?category=communication",
      },
      { label: "Design & Multimédia", href: "/catalog?category=multimedia" },
      { label: "Bureautique Avancée", href: "/catalog?category=bureautique" },
    ],
    []
  );

  const contactInfo = useMemo(
    () => [
      { icon: <Email />, label: 'Email', value: 'contact@youthcomputing.com' },
      { icon: <Phone />, label: 'Téléphone', value: '+261 34 51 371 61' },
      {
        icon: <LocationOn />,
        label: 'Adresse',
        value: '301, Mahamanina, Fianarantsoa',
      },
    ],
    []
  );

  return (
    <StyledFooter component="footer" variant={variant}>
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          py: variant === "minimal" ? 2 : 4,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Section Principale */}
        <Grid container spacing={2}>
          {/* Logo et Description */}
          <Grid item xs={12} md={3}>
            <Box sx={{ animation: `${fadeInUp} 0.6s ease-out` }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <StyledAvatar sx={{ width: 48, height: 48 }}>
                  <SchoolIcon sx={{ fontSize: 28 }} />
                </StyledAvatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "Ubuntu, sans-serif",
                      fontWeight: 700,
                      background:
                        "linear-gradient(45deg, #ffffff 30%, #ff6b74 90%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Youth Computing
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  mb: 2,
                  fontSize: "0.85rem",
                }}
              >
                Plateforme d'apprentissage pour maîtriser les compétences
                numériques de demain.
              </Typography>
              {variant !== "minimal" && (
                <Stack direction="row" spacing={1}>
                  {socialLinks.map((social) => (
                    <StyledIconButton
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Suivez-nous sur ${social.label}`}
                      size="small"
                    >
                      {social.icon}
                    </StyledIconButton>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          {/* Liens Rapides */}
          <Grid item xs={12} sm={6} md={3}>
            <SectionTitle>Liens Rapides</SectionTitle>
            <Stack spacing={0.5}>
              {quickLinks.map((link) => (
                <AnimatedLink key={link.href} href={link.href} underline="none">
                  {link.label}
                  <ArrowForward className="arrow-icon" />
                </AnimatedLink>
              ))}
            </Stack>
          </Grid>

          {/* Catégories */}
          {variant !== "minimal" && (
            <Grid item xs={12} sm={6} md={3}>
              <SectionTitle>Catégories</SectionTitle>
              <Stack spacing={0.5}>
                {categoryLinks.map((link) => (
                  <AnimatedLink
                    key={link.href}
                    href={link.href}
                    underline="none"
                  >
                    {link.label}
                    <ArrowForward className="arrow-icon" />
                  </AnimatedLink>
                ))}
              </Stack>
            </Grid>
          )}

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <SectionTitle>Contact</SectionTitle>
            <Stack spacing={1.5}>
              {contactInfo.map((info) => (
                <InfoCard key={info.label}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: "#f13544", display: "flex" }}>
                      {info.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          display: "block",
                          fontSize: "0.7rem",
                        }}
                      >
                        {info.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "0.8rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {info.value}
                      </Typography>
                    </Box>
                  </Box>
                </InfoCard>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Section Bas de Page */}
        <Box sx={{ mt: "auto", pt: 3 }}>
          <Divider sx={{ mb: 2, bgcolor: "rgba(241, 53, 68, 0.3)" }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem" }}
            >
              &copy; {new Date().getFullYear()} Youth Computing. Tous droits
              réservés.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <AnimatedLink
                href="/privacy"
                underline="none"
                sx={{ fontSize: "0.8rem" }}
              >
                Politique de confidentialité
              </AnimatedLink>
              <AnimatedLink
                href="/terms"
                underline="none"
                sx={{ fontSize: "0.8rem" }}
              >
                Conditions d'utilisation
              </AnimatedLink>
            </Box>
          </Box>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
