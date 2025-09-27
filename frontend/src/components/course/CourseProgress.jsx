// CourseProgress.jsx - Composant de progression de cours professionnel
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  Fade,
  Card,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000/api';

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
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

// Styled Components
const ProgressCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '24px',
  padding: '32px',
  maxWidth: '800px',
  margin: 'auto',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
});

const CourseProgress = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { from: `/course/${courseId}/progress` } });
          return;
        }

        // Récupérer les détails du cours
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(courseResponse.data);

        // Récupérer les contenus du cours avec leur statut
        const contentsResponse = await axios.get(`${API_BASE_URL}/contenu`, {
          params: { courseId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setContents(contentsResponse.data);

        // Récupérer la progression
        const progressResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgress(progressResponse.data.progress || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement de la progression');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  const handleContinueLearning = () => {
    const nextContent = contents.find((content) => !content.isCompleted);
    if (nextContent) {
      navigate(`/course/${courseId}/learn/${nextContent.id}`);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        }}
      >
        <LinearProgress sx={{ width: '100%', maxWidth: '400px', backgroundColor: `${colors.red}33`, '& .MuiLinearProgress-bar': { background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})` } }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        }}
      >
        <Typography sx={{ color: colors.red, fontSize: '1.2rem', fontWeight: 600 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        overflow: 'hidden',
        pt: 8,
        pb: 12,
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.red}1a 1px, transparent 1px),
            linear-gradient(90deg, ${colors.red}1a 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 80,
          right: 40,
          width: 128,
          height: 128,
          background: `linear-gradient(to right, ${colors.red}, ${colors.pink})`,
          borderRadius: '50%',
          opacity: 0.1,
          animation: `${floatingAnimation} 3s ease-in-out infinite`,
        }}
      />

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Fade in timeout={1000}>
          <ProgressCard elevation={0}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                mb: 4,
              }}
            >
              Progression du Cours
            </Typography>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '1.4rem',
                textAlign: 'center',
                mb: 2,
              }}
            >
              {course?.title || 'Cours en cours'}
            </Typography>

            {/* Barre de progression globale */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ color: '#ffffff', fontSize: '1.2rem', mb: 1 }}>
                Progression globale: {progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: `${colors.red}33`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  },
                }}
              />
            </Box>

            {/* Message de félicitations */}
            {progress === 100 && (
              <Typography
                sx={{
                  color: colors.pink,
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                Félicitations ! Vous avez complété ce cours 🎉
              </Typography>
            )}

            {/* Liste des contenus */}
            {contents.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}
                >
                  Contenus du cours
                </Typography>
                <List sx={{ backgroundColor: `${colors.navy}33`, borderRadius: '12px', p: 2 }}>
                  {contents.map((content, index) => (
                    <React.Fragment key={content.id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/course/${courseId}/learn/${content.id}`)}
                        sx={{
                          borderRadius: '8px',
                          '&:hover': {
                            backgroundColor: `${colors.red}1a`,
                          },
                        }}
                      >
                        <ListItemText
                          primary={content.title}
                          secondary={`${content.type.charAt(0).toUpperCase() + content.type.slice(1)}`}
                          primaryTypographyProps={{ color: '#ffffff', fontWeight: 500 }}
                          secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        />
                        {content.isCompleted && (
                          <Tooltip title="Contenu complété">
                            <CheckCircle size={20} color={colors.red} />
                          </Tooltip>
                        )}
                      </ListItem>
                      {index < contents.length - 1 && <Divider sx={{ backgroundColor: `${colors.red}33` }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Statistiques supplémentaires */}
            <Stack direction="row" spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
              <Typography sx={{ color: '#ffffff', fontSize: '1rem' }}>
                Contenus complétés: {contents.filter((c) => c.isCompleted).length} / {contents.length}
              </Typography>
              {course?.duration && (
                <Typography sx={{ color: '#ffffff', fontSize: '1rem' }}>
                  Durée estimée: {course.duration}
                </Typography>
              )}
            </Stack>

            {/* Boutons d'action */}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/course/${courseId}`)}
                sx={{
                  borderColor: `${colors.red}4d`,
                  color: '#ffffff',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: `${colors.red}33`,
                  },
                }}
                startIcon={<ArrowLeft size={20} />}
              >
                Retour au cours
              </Button>
              {progress < 100 && (
                <Button
                  variant="contained"
                  onClick={handleContinueLearning}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${colors.red}66`,
                    },
                  }}
                  endIcon={<ArrowRight size={20} />}
                >
                  Continuer l'apprentissage
                </Button>
              )}
            </Stack>

            {/* Gestion des erreurs */}
            {error && (
              <Typography
                sx={{
                  color: colors.red,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  mt: 2,
                  textAlign: 'center',
                }}
              >
                {error}
              </Typography>
            )}
          </ProgressCard>
        </Fade>
      </Container>
    </Box>
  );
};

// Optimisation avec React.memo
export default React.memo(CourseProgress);