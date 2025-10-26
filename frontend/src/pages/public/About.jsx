import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Stack,
  Avatar,
  Chip,
  Paper,
  Divider,
  IconButton,
  Fade,
  Slide,
  LinearProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { Link } from "react-router-dom";
import {
  Users,
  Target,
  Award,
  Globe,
  Heart,
  Lightbulb,
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Code,
  Palette,
  Monitor,
  UserCheck,
  Calendar,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

// Sample images for team members (replace with actual image paths or URLs in production)
const teamImages = {
  sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
  michael: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
  emma: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
  david: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
};

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
const HeroSection = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.navy}cc 100%)`,
  position: "relative",
  overflow: "hidden",
  minHeight: "100vh",
  width: '100vw',
  display: "flex",
  alignItems: "center",
});

const GlassCard = styled(Paper)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  border: `1px solid ${colors.red}33`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 32px 80px ${colors.navy}4d`,
  },
});

const TeamCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`, // Semi-transparent navy
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: `1px solid ${colors.red}33`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: `0 25px 60px ${colors.navy}4d`,
    "& .team-avatar": {
      transform: "scale(1.1)",
    },
    "& .social-icons": {
      transform: "translateY(0)",
      opacity: 1,
    },
  },
});

const ValueCard = styled(Paper)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: "blur(20px)",
  border: `1px solid ${colors.red}33`,
  borderRadius: "20px",
  padding: "32px",
  height: "100%",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`,
    transform: "translateY(-8px)",
  },
});

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeValue, setActiveValue] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveValue((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      number: "2019",
      label: "Année de création",
      icon: Calendar,
      color: colors.red,
    },
    {
      number: "1,200+",
      label: "Étudiants formés",
      icon: Users,
      color: colors.navy,
    },
    {
      number: "500+",
      label: "Cours disponibles",
      icon: BookOpen,
      color: colors.red,
    },
    {
      number: "95%",
      label: "Taux de satisfaction",
      icon: TrendingUp,
      color: colors.purple,
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description:
        "Nous nous engageons à fournir une formation de qualité supérieure avec des contenus actualisés et pertinents.",
      color: colors.navy,
      gradient: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
    },
    {
      icon: Heart,
      title: "Passion",
      description:
        "Notre équipe est passionnée par l'éducation numérique et l'accompagnement de chaque apprenant vers la réussite.",
      color: colors.red,
      gradient: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Nous intégrons les dernières technologies et méthodes pédagogiques pour une expérience d'apprentissage optimale.",
      color: colors.purple,
      gradient: `linear-gradient(135deg, ${colors.purple}, ${colors.purple}cc)`,
    },
    {
      icon: Globe,
      title: "Accessibilité",
      description:
        "L'éducation de qualité doit être accessible à tous, c'est pourquoi nos formations sont entièrement gratuites.",
      color: colors.red,
      gradient: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Directrice Pédagogique",
      speciality: "Informatique & Innovation",
      avatar: teamImages.sarah,
      description: "10+ années d'expérience dans l'enseignement numérique",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
      name: "Michael Chen",
      role: "Responsable Technique",
      speciality: "Développement & Architecture",
      avatar: teamImages.michael,
      description: "Expert en technologies web modernes et formation",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
      name: "Emma Rodriguez",
      role: "Designer UX/UI",
      speciality: "Design & Multimédia",
      avatar: teamImages.emma,
      description:
        "Spécialisée en design d'interfaces et expérience utilisateur",
      social: { linkedin: "#", twitter: "#", dribbble: "#" },
    },
    {
      name: "David Kumar",
      role: "Expert Communication",
      speciality: "Marketing & Stratégie",
      avatar: teamImages.david,
      description:
        "Consultant en communication digitale et stratégie de marque",
      social: { linkedin: "#", twitter: "#", instagram: "#" },
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "Création de Youth Computing",
      description: "Lancement de la première plateforme",
    },
    {
      year: "2020",
      title: "Premier millier d'étudiants",
      description: "1000 apprenants actifs",
    },
    {
      year: "2021",
      title: "Expansion des domaines",
      description: "Ajout communication et multimédia",
    },
    {
      year: "2022",
      title: "Certification internationale",
      description: "Reconnaissance officielle",
    },
    {
      year: "2023",
      title: "Innovation pédagogique",
      description: "IA et apprentissage adaptatif",
    },
  ];

  return (
    <Box sx={{ overflow: "hidden", width: '100vw', minHeight: '100vh' }}>
      {/* Section Hero */}
      <HeroSection>
        {/* Arrière-plan décoratif */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 20% 20%, ${colors.red}26 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, ${colors.red}1a 0%, transparent 50%)
            `,
          }}
        />

        {/* Éléments flottants */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: 100,
            height: 100,
            background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
            borderRadius: "20px",
            opacity: 0.1,
            animation: `${floatingAnimation} 8s ease-in-out infinite`,
            transform: "rotate(45deg)",
          }}
        />

        <Container maxWidth={false} sx={{ position: "relative", zIndex: 10, px: { xs: 2, md: 4 } }}>
          <Grid container alignItems="center" spacing={6}>
            <Grid item xs={12} md={8}>
              <Fade in={isVisible} timeout={1000}>
                <Box>
                  <Chip
                    icon={<Star size={20} color={colors.red} />}
                    label="🌟 Notre Histoire & Vision"
                    sx={{
                      mb: 4,
                      background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${colors.red}4d`,
                      color: "#ffffff",
                      borderRadius: "50px",
                      px: 3,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  />

                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "3rem", md: "4.5rem", lg: "5.5rem" },
                      fontWeight: 800,
                      color: "#ffffff",
                      lineHeight: 1.1,
                      mb: 3,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    À propos de{" "}
                    <Box
                      component="span"
                      sx={{
                        background: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Youth Computing
                    </Box>
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontWeight: 300,
                      lineHeight: 1.6,
                      maxWidth: 600,
                      mb: 4,
                      fontSize: { xs: "1.3rem", md: "1.5rem" },
                    }}
                  >
                    Nous révolutionnons l'apprentissage numérique en rendant
                    l'éducation technologique accessible, gratuite et de qualité
                    professionnelle pour tous.
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/catalog"
                    sx={{
                      background: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
                      borderRadius: "16px",
                      px: 4,
                      py: 2,
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: `0 8px 32px ${colors.red}4d`,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 40px ${colors.red}66`,
                      },
                    }}
                    endIcon={<ArrowRight size={24} />}
                  >
                    Découvrir nos formations
                  </Button>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="left" in={isVisible} timeout={1200}>
                <Box
                  sx={{
                    position: "relative",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 320,
                      height: 320,
                      background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(20px)",
                      border: `2px solid ${colors.red}4d`,
                      animation: `${rotateAnimation} 20s linear infinite`,
                      mx: "auto",
                    }}
                  >
                    <Stack alignItems="center" spacing={2}>
                      <Globe size={88} color={colors.red} />
                      <Typography
                        sx={{
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: "1.8rem",
                        }}
                      >
                        1200+
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontWeight: 500,
                          fontSize: "1.2rem",
                        }}
                      >
                        Étudiants dans le monde
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Section Statistiques */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          width: '100vw',
          minHeight: '50vh',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Slide
                  direction="up"
                  in={isVisible}
                  timeout={800 + index * 200}
                >
                  <GlassCard
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`,
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        boxShadow: `0 8px 32px ${stat.color}4d`,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1) rotate(5deg)",
                        },
                      }}
                    >
                      <stat.icon size={36} color="white" />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: { xs: "2.8rem", md: "3rem" },
                        fontWeight: 800,
                        color: "#ffffff",
                        mb: 1,
                      }}
                    >
                      {stat.number}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontWeight: 600,
                        fontSize: "1.2rem",
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </GlassCard>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Section Valeurs */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
          position: "relative",
          width: '100vw',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack alignItems="center" spacing={8}>
            <Box textAlign="center">
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "3rem", md: "4rem" },
                  fontWeight: 700,
                  color: "#ffffff",
                  mb: 2,
                }}
              >
                Nos Valeurs
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  maxWidth: 600,
                  mx: "auto",
                  lineHeight: 1.6,
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                }}
              >
                Les principes fondamentaux qui guident notre mission éducative
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {values.map((value, index) => (
                <Grid item xs={12} md={6} lg={3} key={index}>
                  <Fade in={isVisible} timeout={1000 + index * 300}>
                    <ValueCard
                      elevation={0}
                      sx={{
                        textAlign: "center",
                        borderColor:
                          activeValue === index
                            ? `${value.color}50`
                            : `${colors.red}33`,
                        background:
                          activeValue === index
                            ? `linear-gradient(135deg, ${value.color}1a, ${value.color}0d)`
                            : undefined,
                      }}
                    >
                      <Box
                        sx={{
                          width: 88,
                          height: 88,
                          background: value.gradient,
                          borderRadius: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 3,
                          boxShadow: `0 12px 40px ${value.color}4d`,
                          animation:
                            activeValue === index
                              ? `${floatingAnimation} 3s ease-in-out infinite`
                              : "none",
                        }}
                      >
                        <value.icon size={40} color="white" />
                      </Box>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "#ffffff",
                          mb: 2,
                          fontSize: "1.4rem",
                        }}
                      >
                        {value.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.8)",
                          lineHeight: 1.6,
                          fontSize: "1rem",
                        }}
                      >
                        {value.description}
                      </Typography>
                    </ValueCard>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Section Équipe */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          width: '100vw',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack alignItems="center" spacing={6}>
            <Box textAlign="center">
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "3rem", md: "4rem" },
                  fontWeight: 700,
                  color: "#ffffff",
                  mb: 2,
                }}
              >
                Notre Équipe
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  maxWidth: 600,
                  mx: "auto",
                  lineHeight: 1.6,
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                }}
              >
                Des experts passionnés dédiés à votre réussite
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {team.map((member, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Slide
                    direction="up"
                    in={isVisible}
                    timeout={1000 + index * 200}
                  >
                    <TeamCard elevation={0}>
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <Avatar
                          className="team-avatar"
                          src={member.avatar}
                          sx={{
                            width: { xs: 100, sm: 120, md: 140 },
                            height: { xs: 100, sm: 120, md: 140 },
                            mx: "auto",
                            mb: 3,
                            border: `4px solid ${colors.red}33`,
                            boxShadow: `0 8px 32px ${colors.navy}4d`,
                            transition: "transform 0.4s ease",
                            objectFit: "cover",
                          }}
                          imgProps={{
                            style: { objectFit: "cover" },
                            loading: "lazy",
                          }}
                        />

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#ffffff",
                            mb: 1,
                            fontSize: "1.4rem",
                          }}
                        >
                          {member.name}
                        </Typography>

                        <Typography
                          sx={{
                            color: colors.red,
                            fontWeight: 600,
                            mb: 1,
                            fontSize: "1.2rem",
                          }}
                        >
                          {member.role}
                        </Typography>

                        <Chip
                          label={member.speciality}
                          size="small"
                          sx={{
                            backgroundColor: `${colors.red}33`,
                            color: "#ffffff",
                            fontWeight: 500,
                            mb: 2,
                            fontSize: "0.9rem",
                          }}
                        />

                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.8)",
                            lineHeight: 1.5,
                            mb: 3,
                            fontSize: "1rem",
                          }}
                        >
                          {member.description}
                        </Typography>

                        <Stack
                          className="social-icons"
                          direction="row"
                          justifyContent="center"
                          spacing={1}
                          sx={{
                            transform: "translateY(20px)",
                            opacity: 0,
                            transition: "all 0.3s ease",
                          }}
                        >
                          {Object.entries(member.social).map(([platform, url], idx) => (
                            <IconButton
                              key={idx}
                              href={url}
                              size="small"
                              sx={{
                                backgroundColor: `${colors.red}1a`,
                                color: colors.red,
                                "&:hover": {
                                  backgroundColor: colors.red,
                                  color: "#ffffff",
                                },
                              }}
                            >
                              {platform === "linkedin" && <UserCheck size={20} />}
                              {platform === "twitter" && <MapPin size={20} />}
                              {platform === "github" && <Code size={20} />}
                              {platform === "dribbble" && <Palette size={20} />}
                              {platform === "instagram" && <Monitor size={20} />}
                            </IconButton>
                          ))}
                        </Stack>
                      </Box>
                    </TeamCard>
                  </Slide>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Section Timeline */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          width: '100vw',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack alignItems="center" spacing={6}>
            <Box textAlign="center">
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "3rem", md: "4rem" },
                  fontWeight: 700,
                  color: "#ffffff",
                  mb: 2,
                }}
              >
                Notre Parcours
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  lineHeight: 1.6,
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                }}
              >
                L'évolution de Youth Computing depuis sa création
              </Typography>
            </Box>

            <Stack spacing={4} sx={{ width: "100%" }}>
              {milestones.map((milestone, index) => (
                <Fade key={index} in={isVisible} timeout={1200 + index * 300}>
                  <Paper
                    elevation={0}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${colors.red}33`,
                      borderRadius: "20px",
                      p: 4,
                      position: "relative",
                      "&:hover": {
                        transform: "translateX(8px)",
                        borderColor: `${colors.red}4d`,
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: -2,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 4,
                        height: "100%",
                        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                        borderRadius: 2,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={4} alignItems="center">
                      <Box
                        sx={{
                          minWidth: 80,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "2.2rem",
                            fontWeight: 800,
                            color: colors.red,
                          }}
                        >
                          {milestone.year}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#ffffff",
                            mb: 1,
                            fontSize: "1.4rem",
                          }}
                        >
                          {milestone.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.8)",
                            lineHeight: 1.5,
                            fontSize: "1rem",
                          }}
                        >
                          {milestone.description}
                        </Typography>
                      </Box>
                      <CheckCircle size={28} color={colors.red} />
                    </Stack>
                  </Paper>
                </Fade>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Section CTA */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          textAlign: "center",
          width: '100vw',
          minHeight: '50vh',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack alignItems="center" spacing={4}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "#ffffff",
                mb: 2,
              }}
            >
              Prêt à commencer votre parcours ?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.6,
                maxWidth: 500,
                fontSize: { xs: "1.3rem", md: "1.5rem" },
              }}
            >
              Rejoignez notre communauté d'apprenants et développez vos
              compétences numériques
            </Typography>
            <Button
              component={Link}
              to="/catalog"
              variant="contained"
              size="large"
              sx={{
                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                borderRadius: "16px",
                px: 6,
                py: 2,
                fontSize: "1.3rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: `0 8px 32px ${colors.red}4d`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 40px ${colors.red}66`,
                },
              }}
              endIcon={<ArrowRight size={28} />}
            >
              Explorer les formations
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default About;