// Home.jsx - Page d'accueil professionnelle
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Stack,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Fade,
  Slide,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import {
  Star,
  BookOpen,
  Users,
  Award,
  Zap,
  Play,
  Code,
  Monitor,
  Palette,
  ChevronRight,
  Globe,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
} from 'lucide-react';

// Animations sophistiquées
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(40px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
`;

const fadeInScale = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.9);
  }
  to { 
    opacity: 1; 
    transform: scale(1);
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(241, 53, 68, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(241, 53, 68, 0.6);
  }
`;

// Couleurs principales
const colors = {
  navy: '#010b40',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  lightNavy: '#1a237e',
};

// Styled Components
const AnimatedBox = styled(Box)({
  animation: `${fadeInUp} 0.8s ease-out forwards`,
});

const FloatingCard = styled(Card)(({ theme }) => ({
  animation: `${fadeInScale} 0.8s ease-out 0.3s forwards, ${floatingAnimation} 6s ease-in-out infinite`,
  opacity: 0,
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '24px',
  boxShadow: `0 20px 60px ${colors.navy}33`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 32px 80px ${colors.navy}4d`,
  },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '20px',
  padding: '32px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
    transform: 'translateY(-4px)',
  },
}));

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
  borderRadius: '16px',
  padding: '16px 32px',
  fontSize: '1.2rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: `0 8px 32px ${colors.red}4d`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  color: '#ffffff',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.red}cc, ${colors.pink}cc)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 40px ${colors.red}66`,
  },
});

const OutlinedButton = styled(Button)({
  border: `2px solid ${colors.red}4d`,
  borderRadius: '16px',
  padding: '14px 32px',
  fontSize: '1.2rem',
  fontWeight: 600,
  textTransform: 'none',
  color: '#ffffff',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.red}1a, ${colors.red}33)`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
  },
});

const Home = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const levels = ['ALFA', 'BÊTA', 'GAMMA', 'DELTA'];
  
  const domains = [
    {
      name: 'Informatique',
      icon: Code,
      gradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
      courses: 150,
      progress: 68,
      students: '1.2K+',
      description: 'Programmation, développement web, bases de données',
    },
    {
      name: 'Communication',
      icon: Monitor,
      gradient: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
      courses: 120,
      progress: 45,
      students: '980+',
      description: 'Marketing digital, réseaux sociaux, stratégie',
    },
    {
      name: 'Multimédia',
      icon: Palette,
      gradient: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purple}cc 100%)`,
      courses: 100,
      progress: 82,
      students: '750+',
      description: 'Design graphique, vidéo, animation 3D',
    },
  ];

  const stats = [
    { number: '500+', label: 'Cours gratuits', icon: BookOpen, color: colors.red },
    { number: '1,200+', label: 'Étudiants actifs', icon: Users, color: colors.navy },
    { number: '850+', label: 'Certificats délivrés', icon: Award, color: colors.red },
    { number: '95%', label: 'Taux de réussite', icon: TrendingUp, color: '#4caf50' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Qualité garantie',
      description: 'Formations certifiantes reconnues par les professionnels',
      color: colors.navy,
    },
    {
      icon: Clock,
      title: 'Apprentissage flexible',
      description: 'Étudiez à votre rythme, 24h/24 et 7j/7',
      color: colors.red,
    },
    {
      icon: Target,
      title: 'Suivi personnalisé',
      description: 'Accompagnement individuel et feedback détaillé',
      color: colors.purple,
    },
    {
      icon: Lightbulb,
      title: 'Innovation continue',
      description: 'Contenus mis à jour selon les dernières tendances',
      color: '#ff9800',
    },
  ];

  useEffect(() => {
    setIsAnimated(true);
    const interval = setInterval(() => {
      setCurrentLevel((prev) => (prev + 1) % levels.length);
    }, 3000);

    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(featureInterval);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.navy}cc 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Arrière-plan décoratif sophistiqué */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${colors.red}26 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${colors.red}1a 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, ${colors.purple}1a 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Grille subtile */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.red}0d 1px, transparent 1px),
            linear-gradient(90deg, ${colors.red}0d 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Éléments flottants */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: 120,
          height: 120,
          background: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
          borderRadius: '30px',
          opacity: 0.1,
          animation: `${floatingAnimation} 8s ease-in-out infinite`,
          transform: 'rotate(45deg)',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: 80,
          height: 80,
          background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purple}cc 100%)`,
          borderRadius: '20px',
          opacity: 0.15,
          animation: `${floatingAnimation} 6s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 10, py: { xs: 8, md: 12 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" sx={{ minHeight: '100vh' }}>
          {/* Section gauche - Contenu principal */}
          <Grid item xs={12} lg={6}>
            <Fade in={isAnimated} timeout={1000}>
              <Box>
                {/* Badge professionnel */}
                <Chip
                  icon={<Star size={20} color={colors.red} />}
                  label="🚀 Plateforme E-Learning Nouvelle Génération"
                  sx={{
                    mb: 4,
                    background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${colors.red}4d`,
                    color: '#ffffff',
                    borderRadius: '50px',
                    px: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: `0 8px 32px ${colors.red}33`,
                  }}
                />

                {/* Titre principal avec animation */}
                <Stack spacing={3} sx={{ mb: 6 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                      fontWeight: 800,
                      color: '#ffffff',
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Maîtrisez l'
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        background: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 50%, ${colors.purple} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: `${pulseGlow} 3s ease-in-out infinite`,
                      }}
                    >
                      avenir numérique
                    </Box>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem', lg: '2.8rem' },
                        fontWeight: 400,
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'block',
                        mt: 2,
                      }}
                    >
                      avec Youth Computing
                    </Typography>
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                      color: 'rgba(255, 255, 255, 0.75)',
                      maxWidth: 600,
                      lineHeight: 1.6,
                      fontWeight: 300,
                    }}
                  >
                    Formations gratuites certifiantes de haute qualité dans l'informatique, 
                    la communication et le multimédia. Rejoignez une communauté de plus de 
                    1200 apprenants passionnés.
                  </Typography>
                </Stack>

                {/* Boutons d'action */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={3} 
                  sx={{ mb: 8 }}
                >
                  <GradientButton
                    component={Link}
                    to="/catalog"
                    size="large"
                    startIcon={<Zap size={28} />}
                    endIcon={<ArrowRight size={24} />}
                  >
                    Commencer maintenant
                  </GradientButton>
                  
                  <OutlinedButton
                    size="large"
                    startIcon={<Play size={28} />}
                  >
                    Découvrir en vidéo
                  </OutlinedButton>
                </Stack>

                {/* Statistiques en grille */}
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Slide direction="up" in={isAnimated} timeout={800 + index * 200}>
                        <GlassCard
                          elevation={0}
                          sx={{
                            textAlign: 'center',
                            p: { xs: 2, md: 3 },
                            '&:hover': {
                              '& .stat-icon': {
                                transform: 'scale(1.2) rotate(5deg)',
                                color: stat.color,
                              },
                            },
                          }}
                        >
                          <Box
                            className="stat-icon"
                            sx={{
                              width: { xs: 48, md: 56 },
                              height: { xs: 48, md: 56 },
                              background: `linear-gradient(135deg, ${stat.color}33, ${stat.color}4d)`,
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <stat.icon size={28} color={stat.color} />
                          </Box>
                          
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: '#ffffff',
                              fontSize: { xs: '1.8rem', md: '2rem' },
                              mb: 0.5,
                            }}
                          >
                            {stat.number}
                          </Typography>
                          
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: { xs: '0.9rem', md: '1rem' },
                              fontWeight: 500,
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </GlassCard>
                      </Slide>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
          </Grid>

          {/* Section droite - Dashboard interactif */}
          <Grid item xs={12} lg={6}>
            <FloatingCard
              sx={{
                p: { xs: 3, md: 5 },
                opacity: isAnimated ? 1 : 0,
                height: 'fit-content',
                maxWidth: { xs: '100%', lg: '600px' },
                mx: 'auto',
              }}
            >
              {/* En-tête du dashboard */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
                      boxShadow: `0 8px 24px ${colors.red}4d`,
                    }}
                  >
                    <Globe size={32} color="white" />
                  </Avatar>
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#ffffff', 
                        fontWeight: 700, 
                        fontSize: '1.6rem',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Youth Computing
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontWeight: 500,
                        fontSize: '1rem',
                      }}
                    >
                      Tableau de bord étudiant
                    </Typography>
                  </Box>
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: '#4caf50',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#4caf50',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    Connecté
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ mb: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              {/* Domaines de formation */}
              <Typography 
                sx={{ 
                  color: '#ffffff', 
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  mb: 3,
                }}
              >
                🎯 Domaines de formation
              </Typography>
              
              <Stack spacing={2}>
                {domains.map((domain, index) => (
                  <Paper
                    key={domain.name}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                      border: `1px solid ${colors.red}33`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`,
                        borderColor: `${colors.red}4d`,
                        transform: 'translateX(8px) scale(1.02)',
                        boxShadow: `0 12px 40px ${colors.navy}33`,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          background: domain.gradient,
                          borderRadius: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 24px ${colors.navy}4d`,
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.1) rotate(5deg)' },
                        }}
                      >
                        <domain.icon size={32} color="white" />
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '1.3rem',
                            }}
                          >
                            {domain.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography 
                              sx={{ 
                                color: colors.red, 
                                fontWeight: 700,
                                fontSize: '1.2rem',
                              }}
                            >
                              {domain.progress}%
                            </Typography>
                            <ChevronRight size={24} color={colors.red} />
                          </Stack>
                        </Stack>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            mb: 2,
                            fontSize: '1rem',
                          }}
                        >
                          {domain.description}
                        </Typography>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={2}>
                            <Chip
                              size="small"
                              label={`${domain.courses} cours`}
                              sx={{
                                backgroundColor: `${colors.navy}33`,
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                              }}
                            />
                            <Chip
                              size="small"
                              label={`${domain.students} étudiants`}
                              sx={{
                                backgroundColor: `${colors.red}33`,
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                              }}
                            />
                          </Stack>
                          
                          <LinearProgress
                            variant="determinate"
                            value={domain.progress}
                            sx={{
                              width: 100,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: `${colors.navy}33`,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: domain.gradient,
                              },
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              {/* Section des fonctionnalités */}
              <Box sx={{ mt: 4 }}>
                <Typography 
                  sx={{ 
                    color: '#ffffff', 
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    mb: 3,
                  }}
                >
                  ⚡ Pourquoi nous choisir
                </Typography>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${features[activeFeature].color}1a, ${features[activeFeature].color}0d)`,
                    border: `1px solid ${features[activeFeature].color}33`,
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${features[activeFeature].color}, ${features[activeFeature].color}cc)`,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${features[activeFeature].color}4d`,
                      }}
                    >
                     
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '1.3rem',
                          mb: 1,
                        }}
                      >
                        {features[activeFeature].title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.5,
                          fontSize: '1rem',
                        }}
                      >
                        {features[activeFeature].description}
                      </Typography>
                    </Box>
                    
                    <CheckCircle size={28} color={features[activeFeature].color} />
                  </Stack>
                </Paper>
                
                <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                  {features.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: index === activeFeature ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: index === activeFeature 
                          ? `linear-gradient(135deg, ${features[activeFeature].color}, ${features[activeFeature].color}cc)`
                          : `${colors.navy}33`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => setActiveFeature(index)}
                    />
                  ))}
                </Stack>
              </Box>
            </FloatingCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;