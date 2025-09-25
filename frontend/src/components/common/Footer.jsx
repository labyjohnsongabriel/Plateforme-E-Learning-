import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  School as SchoolIcon,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';


const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        background: gradients.primary,
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo et Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1, color: colors.secondary.main }} />
              <Typography variant="h5" fontWeight={700}>
                Youth Computing
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Plateforme e-learning innovante pour le développement des compétences numériques. 
              Nous offrons des cours gratuits accessibles à tous, organisés par niveaux de progression.
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
              Inclusion • Innovation • Collaboration
            </Typography>
          </Grid>

          {/* Liens rapides */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" sx={{ cursor: 'pointer' }}>
                Accueil
              </Link>
              <Link href="/catalog" color="inherit" underline="hover" sx={{ cursor: 'pointer' }}>
                Catalogue
              </Link>
              <Link href="/about" color="inherit" underline="hover" sx={{ cursor: 'pointer' }}>
                À propos
              </Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ cursor: 'pointer' }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Catégories */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Domaines
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/catalog?category=informatique" color="inherit" underline="hover">
                Informatique
              </Link>
              <Link href="/catalog?category=communication" color="inherit" underline="hover">
                Communication
              </Link>
              <Link href="/catalog?category=multimedia" color="inherit" underline="hover">
                Multimédia
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: colors.secondary.main }} />
                <Typography variant="body2">
                  Anteurderry V, Libreville, Gabon
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: colors.secondary.main }} />
                <Typography variant="body2">
                  +241 20 01 794 44 • +241 23 34 523 43
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: colors.secondary.main }} />
                <Typography variant="body2">
                  contact@youthcomputing.org
                </Typography>
              </Box>
            </Box>

            {/* Réseaux sociaux */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Suivez-nous
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { backgroundColor: colors.secondary.main }
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { backgroundColor: colors.secondary.main }
                  }}
                >
                  <Twitter />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { backgroundColor: colors.secondary.main }
                  }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { backgroundColor: colors.secondary.main }
                  }}
                >
                  <Instagram />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        {/* Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Youth Computing. Tous droits réservés.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, sm: 0 } }}>
            <Link href="/privacy" color="inherit" underline="hover" variant="body2">
              Confidentialité
            </Link>
            <Link href="/terms" color="inherit" underline="hover" variant="body2">
              Conditions d'utilisation
            </Link>
            <Link href="/cookies" color="inherit" underline="hover" variant="body2">
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;