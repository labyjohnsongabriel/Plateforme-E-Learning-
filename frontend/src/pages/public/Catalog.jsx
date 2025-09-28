// src/components/Catalog.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Stack,
  CircularProgress,
  Chip,
  Paper,
  Fade,
  Slide,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { Link } from "react-router-dom";
import {
  Star,
  BookOpen,
  Filter,
  ChevronRight,
  Globe,
  Award,
  Users,
} from "lucide-react";
import axios from "axios";
import { useNotifications } from "../../context/NotificationContext";

// Configuration de l'API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
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
  navy: "#010b40",
  lightNavy: "#1a237e",
  red: "#f13544",
  pink: "#ff6b74",
};

// Styled Components
const HeroSection = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.navy}cc 100%)`,
  position: "relative",
  overflow: "hidden",
  minHeight: "100vh",
  width: "100vw",
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

const CourseCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: `1px solid ${colors.red}33`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: `0 25px 60px ${colors.navy}4d`,
  },
});

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [domains, setDomains] = useState([
    { id: "all", nom: "Tous les domaines" },
  ]);
  const [stats, setStats] = useState({
    courses: "500+",
    learners: "1,200+",
    satisfaction: "95%",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterDomain, setFilterDomain] = useState("all");
  const [isVisible, setIsVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 9;
  const { addNotification } = useNotifications();

  // Fetch data on mount and when page changes
  useEffect(() => {
    setIsVisible(true);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsResponse, coursesResponse, domainsResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/stats`).catch(() => ({
              data: {
                courses: "500+",
                learners: "1,200+",
                satisfaction: "95%",
              },
            })),
            axios
              .get(`${API_BASE_URL}/courses`, {
                params: { page, limit: coursesPerPage },
              })
              .catch(() => ({ data: { data: [], totalPages: 1 } })),
            axios
              .get(`${API_BASE_URL}/courses/domaine`)
              .catch(() => ({ data: { data: [] } })),
          ]);

        setStats(statsResponse.data);
        setCourses(coursesResponse.data.data || []);
        setTotalPages(coursesResponse.data.totalPages || 1);
        setDomains([
          { id: "all", nom: "Tous les domaines" },
          ...(domainsResponse.data.data || []),
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMessage =
          err.response?.data?.message || "Échec du chargement des données.";
        setError(errorMessage);
        addNotification(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, addNotification]);

  // Memoize filtered courses to prevent unnecessary re-renders
  const filteredCourses = useMemo(
    () =>
      courses
        .filter(
          (course) =>
            filterLevel === "all" ||
            course.level === filterLevel ||
            (course.niveau && course.niveau.nom === filterLevel) // Handle populated niveau if present
        )
        .filter(
          (course) =>
            filterDomain === "all" ||
            course.domaineId === filterDomain ||
            (course.domaineId && course.domaineId._id === filterDomain) // Handle populated domaineId
        ),
    [courses, filterLevel, filterDomain]
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ overflow: "hidden", width: "100vw", minHeight: "100vh" }}>
      {/* Hero Section */}
      <HeroSection>
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
        <Container
          maxWidth={false}
          sx={{ position: "relative", zIndex: 10, px: { xs: 2, md: 4 } }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={7}>
              <Fade in={isVisible} timeout={1000}>
                <Box>
                  <Chip
                    icon={<Star size={20} color={colors.red} />}
                    label="Explorez nos formations gratuites"
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
                    }}
                  >
                    Catalogue des{" "}
                    <Box
                      component="span"
                      sx={{
                        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Formations
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
                    Découvrez notre sélection de cours certifiants en
                    informatique, communication et multimédia.
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    {["all", "ALFA", "BÊTA"].map((level) => (
                      <Button
                        key={level}
                        variant={
                          filterLevel === level ? "contained" : "outlined"
                        }
                        sx={{
                          background:
                            filterLevel === level
                              ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                              : "transparent",
                          borderColor: `${colors.red}4d`,
                          color: "#ffffff",
                          borderRadius: "16px",
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "1.1rem",
                          "&:hover": {
                            background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => setFilterLevel(level)}
                        startIcon={
                          level === "all" ? <Filter size={24} /> : null
                        }
                      >
                        {level === "all" ? "Tous" : `Niveau ${level}`}
                      </Button>
                    ))}
                  </Stack>
                  <FormControl sx={{ minWidth: 200, mb: 4 }}>
                    <InputLabel sx={{ color: "#ffffff" }}>Domaine</InputLabel>
                    <Select
                      value={filterDomain}
                      onChange={(e) => setFilterDomain(e.target.value)}
                      sx={{
                        color: "#ffffff",
                        borderColor: `${colors.red}4d`,
                        "& .MuiSvgIcon-root": { color: "#ffffff" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: `${colors.red}4d`,
                        },
                      }}
                    >
                      {domains.map((domain) => (
                        <MenuItem key={domain.id} value={domain.id}>
                          {domain.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Slide direction="left" in={isVisible} timeout={1200}>
                <GlassCard
                  sx={{
                    p: 4,
                    textAlign: "center",
                    animation: `${floatingAnimation} 6s ease-in-out infinite`,
                  }}
                >
                  <Box
                    sx={{
                      width: 220,
                      height: 220,
                      background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(20px)",
                      border: `2px solid ${colors.red}4d`,
                      animation: `${rotateAnimation} 20s linear infinite`,
                      mx: "auto",
                      mb: 3,
                    }}
                  >
                    <Stack alignItems="center" spacing={2}>
                      <Globe size={72} color={colors.red} />
                      <Typography
                        sx={{
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: "1.8rem",
                        }}
                      >
                        {stats.courses}
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontWeight: 500,
                          fontSize: "1.2rem",
                        }}
                      >
                        Cours disponibles
                      </Typography>
                    </Stack>
                  </Box>
                </GlassCard>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Statistics Section */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          width: "100vw",
          minHeight: "50vh",
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            {[
              {
                number: stats.courses,
                label: "Cours disponibles",
                icon: BookOpen,
                color: colors.red,
              },
              {
                number: stats.learners,
                label: "Apprenants inscrits",
                icon: Users,
                color: colors.navy,
              },
              {
                number: stats.satisfaction,
                label: "Taux de satisfaction",
                icon: Award,
                color: "#4caf50",
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Slide
                  direction="up"
                  in={isVisible}
                  timeout={800 + index * 200}
                >
                  <GlassCard sx={{ p: 4, textAlign: "center", height: "100%" }}>
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
                        "&:hover": { transform: "scale(1.1) rotate(5deg)" },
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

      {/* Courses Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
          width: "100vw",
          minHeight: "100vh",
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
                Nos Cours
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
                Explorez une variété de formations conçues pour booster vos
                compétences numériques.
              </Typography>
            </Box>
            {loading && (
              <Fade in={loading} timeout={1000}>
                <CircularProgress
                  sx={{
                    color: colors.red,
                    animation: `${rotateAnimation} 2s linear infinite`,
                  }}
                />
              </Fade>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <>
                <Grid container spacing={4}>
                  {filteredCourses.map((course, index) => (
                    <Grid item xs={12} sm={6} md={4} key={course._id || index}>
                      <Slide
                        direction="up"
                        in={isVisible}
                        timeout={1000 + index * 200}
                      >
                        <CourseCard elevation={0}>
                          <Box sx={{ p: 4 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: "#ffffff",
                                mb: 2,
                                fontSize: "1.4rem",
                              }}
                            >
                              {course.title}
                            </Typography>
                            <Chip
                              label={`Niveau: ${
                                course.level || course.niveau?.nom || "N/A"
                              }`}
                              size="small"
                              sx={{
                                backgroundColor: `${colors.navy}33`,
                                color: "#ffffff",
                                fontWeight: 500,
                                mb: 2,
                                fontSize: "0.9rem",
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(255, 255, 255, 0.6)",
                                lineHeight: 1.5,
                                mb: 3,
                                fontSize: "1rem",
                              }}
                            >
                              {course.description ||
                                "Description du cours à venir..."}
                            </Typography>
                            <Button
                              component={Link}
                              to={`/course/${course._id}`}
                              variant="contained"
                              sx={{
                                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                                borderRadius: "16px",
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: "none",
                                fontSize: "1.1rem",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: `0 12px 40px ${colors.red}66`,
                                },
                              }}
                              endIcon={<ChevronRight size={24} />}
                            >
                              Découvrir
                            </Button>
                          </Box>
                        </CourseCard>
                      </Slide>
                    </Grid>
                  ))}
                </Grid>
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Button
                      key={index + 1}
                      variant={page === index + 1 ? "contained" : "outlined"}
                      sx={{
                        background:
                          page === index + 1
                            ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                            : "transparent",
                        borderColor: `${colors.red}4d`,
                        color: "#ffffff",
                        borderRadius: "12px",
                        minWidth: "40px",
                        "&:hover": {
                          background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                        },
                      }}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
          textAlign: "center",
          width: "100vw",
          minHeight: "50vh",
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
              Commencez votre apprentissage dès aujourd'hui
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
              Rejoignez notre communauté et développez vos compétences avec nos
              formations gratuites et certifiantes.
            </Typography>
            <Button
              component={Link}
              to="/register"
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
              endIcon={<ChevronRight size={28} />}
            >
              S'inscrire maintenant
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Catalog;
