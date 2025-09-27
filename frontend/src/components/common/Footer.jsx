// src/components/Footer.jsx - Pied de page professionnel avec animations et style cohérent
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Avatar,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  School as SchoolIcon,
  Email,
  Phone,
  LocationOn,
  Language as WebIcon,
  YouTube,
} from '@mui/icons-material';

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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
const StyledFooter = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
  color: '#ffffff',
  padding: '48px 0',
  marginTop: 'auto',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, ${colors.red}1a 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${colors.purple}1a 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
});

const StyledAvatar = styled(Avatar)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  boxShadow: `0 8px 32px ${colors.navy}4d`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
});

const StyledIconButton = styled(IconButton)({
  color: '#ffffff',
  backgroundColor: `${colors.red}33`,
  border: `1px solid ${colors.red}33`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: colors.red,
    borderColor: colors.red,
    transform: 'translateY(-2px) scale(1.1)',
    boxShadow: `0 8px 32px ${colors.red}4d`,
  },
});

// Logo Youth Computing pour le footer
const YouthComputingLogo = ({ size = 48 }) => (
  <Fade in timeout={1000}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <StyledAvatar sx={{ width: size, height: size }}>
        <SchoolIcon sx={{ fontSize: size * 0.6, color: '#ffffff' }} />
      </StyledAvatar>
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 700,
            color: '#ffffff',
            fontSize: { xs: '1.5rem', sm: '1.8rem' },
          }}
        >
          Youth Computing
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}
        >
          Plateforme E-Learning
        </Typography>
      </Box>
    </Box>
  </Fade>
);

const Footer = () => {
  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com/youthcomputing', label: 'Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com/youthcomputing', label: 'Twitter' },
    { icon: <LinkedIn />, url: 'https://linkedin.com/company/youthcomputing', label: 'LinkedIn' },
    { icon: <Instagram />, url: 'https://instagram.com/youthcomputing', label: 'Instagram' },
    { icon: <YouTube />, url: 'https://youtube.com/@youthcomputing', label: 'YouTube' },
    { icon: <WebIcon />, url: 'https://youthcomputing.org', label: 'Site Web' },
  ];

  const quickLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/catalog' },
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Aide', href: '/help' },
  ];

  const categoryLinks = [
    { label: 'Informatique', href: '/catalog?category=informatique' },
    { label: 'Communication', href: '/catalog?category=communication' },
    { label: 'Multimédia', href: '/catalog?category=multimedia' },
    { label: 'Design', href: '/catalog?category=design' },
    { label: 'Marketing', href: '/catalog?category=marketing' },
  ];

  const legalLinks = [
    { label: 'Confidentialité', href: '/privacy' },
    { label: 'Conditions d\'utilisation', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Mentions légales', href: '/legal' },
  ];

  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1200}>
          <Grid container spacing={4}>
            {/* Logo et Description */}
            <Grid item xs={12} md="4">
              <YouthComputingLogo />
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  mb: 3,
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                  maxWidth: '300px',
                  fontSize: '1rem',
                }}
              >
                Plateforme e-learning innovante pour le développement des compétences numériques. Nous offrons des cours gratuits accessibles à tous, organisés par niveaux de progression.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: `${colors.red}1a`,
                  border: `1px solid ${colors.red}33`,
                  backdropFilter: 'blur(10px)',
                  animation: `${floatingAnimation} 3s ease-in-out infinite`,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: '100%',
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    borderRadius: '4px',
                    minHeight: 40,
                  }}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: colors.purple, fontWeight: 600, fontSize: '1rem' }}
                  >
                    Notre Mission
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}
                  >
                    Inclusion • Innovation • Collaboration
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Liens rapides */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  color: colors.red,
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  mb: 2,
                }}
              >
                Navigation
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      padding: '4px 0',
                      borderRadius: '8px',
                      '&:hover': {
                        color: colors.red,
                        paddingLeft: 1,
                        backgroundColor: `${colors.red}1a`,
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Catégories */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  color: colors.red,
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  mb: 2,
                }}
              >
                Domaines
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {categoryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      padding: '4px 0',
                      borderRadius: '8px',
                      '&:hover': {
                        color: colors.red,
                        paddingLeft: 1,
                        backgroundColor: `${colors.red}1a`,
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Contact */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  color: colors.red,
                  fontFamily: 'Ubuntu, sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  mb: 2,
                }}
              >
                Contact & Localisation
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '12px',
                    backgroundColor: `${colors.red}1a`,
                    border: `1px solid ${colors.red}33`,
                  }}
                >
                  <LocationOn sx={{ color: colors.red, fontSize: '24px', mt: 0.2 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: '#ffffff', fontWeight: 500, fontSize: '1rem' }}
                    >
                      Siège Social
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}
                    >
                      Anteurderry V, Libreville
                      <br />
                      Gabon, Afrique Centrale
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '12px',
                    backgroundColor: `${colors.red}1a`,
                    border: `1px solid ${colors.red}33`,
                  }}
                >
                  <Phone sx={{ color: colors.red, fontSize: '24px', mt: 0.2 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: '#ffffff', fontWeight: 500, fontSize: '1rem' }}
                    >
                      Téléphones
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}
                    >
                      +241 20 01 794 44
                      <br />
                      +241 23 34 523 43
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '12px',
                    backgroundColor: `${colors.red}1a`,
                    border: `1px solid ${colors.red}33`,
                  }}
                >
                  <Email sx={{ color: colors.red, fontSize: '24px', mt: 0.2 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: '#ffffff', fontWeight: 500, fontSize: '1rem' }}
                    >
                      Email Support
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem',
                        wordBreak: 'break-word',
                      }}
                    >
                      contact@youthcomputing.org
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* Réseaux sociaux */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.red,
                    fontFamily: 'Ubuntu, sans-serif',
                    fontWeight: 600,
                    fontSize: { xs: '1.4rem', sm: '1.6rem' },
                    mb: 2,
                  }}
                >
                  Suivez-nous
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {socialLinks.map((social) => (
                    <StyledIconButton
                      key={social.label}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      sx={{ fontSize: '24px' }}
                    >
                      {social.icon}
                    </StyledIconButton>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Fade>

        <Divider sx={{ my: 4, backgroundColor: `${colors.red}33` }} />

        {/* Section Copyright et liens légaux */}
        <Fade in timeout={1400}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}
              >
                © {new Date().getFullYear()} Youth Computing. Tous droits réservés.
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}
              >
                Développé avec ❤️ au Gabon pour l'Afrique
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  color="inherit"
                  underline="none"
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      color: colors.red,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Badge de certification/partenariat */}
        <Fade in timeout={1600}>
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${colors.red}33`,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
              }}
            >
              Plateforme certifiée pour l'éducation numérique en Afrique
            </Typography>
          </Box>
        </Fade>
      </Container>
    </StyledFooter>
  );
};

export default Footer;