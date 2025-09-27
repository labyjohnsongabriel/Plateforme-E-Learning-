// CourseDetail.jsx - Détail cours professionnel avec fond gradient niveau
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Stack,
  CircularProgress,
  Fade,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { ArrowRight, Award, BookOpen } from "lucide-react";
import axios from "axios";

// Configuration de l'API
const API_BASE_URL = "http://localhost:3000/api";

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

// Couleurs principales
const colors = {
  navy: "#010b40",
  lightNavy: "#1a237e",
  red: "#f13544",
  pink: "#ff6b74",
  purple: "#8b5cf6",
  levelALFA: {
    gradient: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
  },
  levelBETA: {
    gradient: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purple}cc 100%)`,
  },
};

// Styled Components
const DetailCard = styled(Card)(({ level }) => ({
  background:
    colors[`level${level}`]?.gradient ||
    `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: "blur(20px)",
  border: `1px solid ${colors.red}33`,
  borderRadius: "24px",
  padding: "32px",
  maxWidth: "900px",
  margin: "auto",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
}));

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [domainName, setDomainName] = useState("Chargement...");
  const [contents, setContents] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Récupérer les détails du cours
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${id}`);
        setCourse(courseResponse.data);

        // Récupérer le nom du domaine
        if (courseResponse.data.domaineId) {
          const domainResponse = await axios.get(
            `${API_BASE_URL}/domaine/${courseResponse.data.domaineId}`
          );
          setDomainName(domainResponse.data.nom || "Domaine inconnu");
        }

        // Récupérer les contenus du cours (hypothétique endpoint)
        const contentsResponse = await axios.get(`${API_BASE_URL}/contenu`, {
          params: { courseId: id },
        });
        setContents(contentsResponse.data);

        // Vérifier l'inscription et la progression (si utilisateur connecté)
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const progressResponse = await axios.get(
              `${API_BASE_URL}/courses/${id}/progress`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setProgress(progressResponse.data.progress || 0);
            setIsEnrolled(
              progressResponse.data.isEnrolled ||
                progressResponse.data.progress > 0
            );
          } catch (err) {
            console.error(
              "Erreur lors de la vérification de la progression:",
              err
            );
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Erreur lors du chargement du cours"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/course/${id}` } });
        return;
      }
      await axios.post(
        `${API_BASE_URL}/courses/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEnrolled(true);
      navigate(`/course/${id}/learn`);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        }}
      >
        <CircularProgress sx={{ color: colors.red }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        }}
      >
        <Typography
          sx={{ color: colors.red, fontSize: "1.2rem", fontWeight: 600 }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        overflow: "hidden",
        pt: 8,
        pb: 12,
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.red}1a 1px, transparent 1px),
            linear-gradient(90deg, ${colors.red}1a 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 80,
          right: 40,
          width: 128,
          height: 128,
          background: `linear-gradient(to right, ${colors.red}, ${colors.pink})`,
          borderRadius: "50%",
          opacity: 0.1,
          animation: `${floatingAnimation} 3s ease-in-out infinite`,
        }}
      />

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Fade in timeout={1000}>
          <DetailCard elevation={0} level={course.level}>
            {/* Image de couverture (si disponible) */}
            {course.imageUrl && (
              <Box
                component="img"
                src={course.imageUrl}
                alt={`Image du cours ${course.title}`}
                sx={{
                  width: "100%",
                  height: 250,
                  objectFit: "cover",
                  borderRadius: "16px",
                  mb: 3,
                }}
              />
            )}

            {/* Badge de certification */}
            {course.isCertifying && (
              <Tooltip title="Cours certifiant">
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    background: colors.red,
                    borderRadius: "50%",
                    p: 1,
                  }}
                >
                  <Award size={24} color="#ffffff" />
                </Box>
              </Tooltip>
            )}

            {/* Titre et informations principales */}
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "#ffffff",
                mb: 2,
              }}
            >
              {course.title}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Chip
                icon={<BookOpen size={16} color={colors.red} />}
                label={`Niveau: ${course.level}`}
                sx={{
                  backgroundColor: `${colors.navy}33`,
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              />
              <Chip
                label={`Domaine: ${domainName}`}
                sx={{
                  backgroundColor: `${colors.navy}33`,
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              />
              {course.duration && (
                <Chip
                  label={`Durée: ${course.duration}`}
                  sx={{
                    backgroundColor: `${colors.navy}33`,
                    color: "#ffffff",
                    fontWeight: 500,
                  }}
                />
              )}
            </Stack>

            {/* Description */}
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "1.2rem",
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              {course.description || "Aucune description disponible."}
            </Typography>

            {/* Progression (si utilisateur connecté) */}
            {progress !== null && (
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: "#ffffff", fontSize: "1rem", mb: 1 }}>
                  Votre progression: {progress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    backgroundColor: `${colors.navy}66`,
                    "& .MuiLinearProgress-bar": {
                      background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    },
                  }}
                />
              </Box>
            )}

            {/* Liste des contenus (leçons) */}
            {contents.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "#ffffff", fontWeight: 600, mb: 2 }}
                >
                  Contenu du cours
                </Typography>
                <List>
                  {contents.map((content, index) => (
                    <React.Fragment key={content.id}>
                      <ListItem>
                        <ListItemText
                          primary={content.title}
                          secondary={
                            <Typography
                              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                            >
                              {content.description || "Aucune description"}
                            </Typography>
                          }
                          primaryTypographyProps={{
                            color: "#ffffff",
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                      {index < contents.length - 1 && (
                        <Divider sx={{ backgroundColor: `${colors.red}33` }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Bouton d'action */}
            <Button
              variant="contained"
              onClick={handleEnroll}
              disabled={isEnrolled && progress === 0}
              sx={{
                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                borderRadius: "16px",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1.2rem",
                textTransform: "none",
                boxShadow: `0 8px 32px ${colors.red}4d`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 40px ${colors.red}66`,
                },
                "&:disabled": {
                  background: "grey",
                  boxShadow: "none",
                },
              }}
              endIcon={<ArrowRight size={24} />}
              aria-label={
                isEnrolled ? "Continuer le cours" : "S'inscrire au cours"
              }
            >
              {isEnrolled ? "Continuer" : "S'inscrire"}
            </Button>
          </DetailCard>
        </Fade>
      </Container>
    </Box>
  );
};

// Optimisation avec React.memo
export default React.memo(CourseDetail);
