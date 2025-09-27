// CoursePlayer.jsx - Lecteur cours professionnel avec fond immersif gradient
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import DocumentViewer from './DocumentViewer';
import QuizComponent from './QuizComponent';
import {
  Box,
  Container,
  Typography,
  Fade,
  CircularProgress,
  Button,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
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
const ContentCard = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '24px',
  padding: '24px',
  maxWidth: '900px',
  margin: 'auto',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
});

const CoursePlayer = () => {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { from: `/course/${courseId}/learn/${contentId}` } });
          return;
        }

        // Récupérer les détails du cours
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(courseResponse.data);

        // Récupérer tous les contenus du cours
        const contentsResponse = await axios.get(`${API_BASE_URL}/contenu`, {
          params: { courseId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setContents(contentsResponse.data);

        // Récupérer le contenu spécifique
        const contentResponse = await axios.get(`${API_BASE_URL}/contenu/${contentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContent(contentResponse.data);
        setIsCompleted(contentResponse.data.isCompleted || false);

        // Récupérer la progression globale
        const progressResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgress(progressResponse.data.progress || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du contenu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, contentId, navigate]);

  const handleCompleteContent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/contenu/${contentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsCompleted(true);

      // Mettre à jour la progression
      const progressResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(progressResponse.data.progress || 0);

      // Passer au contenu suivant si disponible
      const currentIndex = contents.findIndex((c) => c.id === contentId);
      if (currentIndex < contents.length - 1) {
        navigate(`/course/${courseId}/learn/${contents[currentIndex + 1].id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la complétion du contenu');
    }
  };

  const handleQuizSubmit = async (answers) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/contenu/${contentId}/submit-quiz`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCompleteContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission du quiz');
    }
  };

  const handleNavigation = (direction) => {
    const currentIndex = contents.findIndex((c) => c.id === contentId);
    if (direction === 'prev' && currentIndex > 0) {
      navigate(`/course/${courseId}/learn/${contents[currentIndex - 1].id}`);
    } else if (direction === 'next' && currentIndex < contents.length - 1) {
      navigate(`/course/${courseId}/learn/${contents[currentIndex + 1].id}`);
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
        <CircularProgress sx={{ color: colors.red }} />
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Liste des contenus */}
            <Box sx={{ width: { xs: '100%', md: '300px' }, mb: { xs: 4, md: 0 } }}>
              <Typography
                variant="h5"
                sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}
              >
                Contenu du cours
              </Typography>
              <List sx={{ backgroundColor: `${colors.navy}33`, borderRadius: '12px', p: 2 }}>
                {contents.map((c, index) => (
                  <React.Fragment key={c.id}>
                    <ListItem
                      button
                      selected={c.id === contentId}
                      onClick={() => navigate(`/course/${courseId}/learn/${c.id}`)}
                      sx={{
                        borderRadius: '8px',
                        '&.Mui-selected': {
                          backgroundColor: `${colors.red}33`,
                        },
                      }}
                    >
                      <ListItemText
                        primary={c.title}
                        secondary={c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                        primaryTypographyProps={{ color: '#ffffff', fontWeight: 500 }}
                        secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      />
                      {c.isCompleted && <CheckCircle size={20} color={colors.red} />}
                    </ListItem>
                    {index < contents.length - 1 && <Divider sx={{ backgroundColor: `${colors.red}33` }} />}
                  </React.Fragment>
                ))}
              </List>
            </Box>

            {/* Contenu principal */}
            <ContentCard>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 2,
                }}
              >
                {course.title} - {content.title}
              </Typography>

              {/* Progression */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: '#ffffff', fontSize: '1rem', mb: 1 }}>
                  Progression du cours: {progress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    backgroundColor: `${colors.navy}66`,
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    },
                  }}
                />
              </Box>

              {/* Affichage du contenu */}
              {content.type === 'video' && <VideoPlayer url={content.url} />}
              {content.type === 'document' && <DocumentViewer url={content.url} />}
              {content.type === 'quiz' && (
                <QuizComponent
                  questions={content.questions}
                  onSubmit={handleQuizSubmit}
                  disabled={isCompleted}
                />
              )}

              {/* Boutons de navigation */}
              <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => handleNavigation('prev')}
                  disabled={contents.findIndex((c) => c.id === contentId) === 0}
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
                  Précédent
                </Button>
                {!isCompleted && content.type !== 'quiz' && (
                  <Button
                    variant="contained"
                    onClick={handleCompleteContent}
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
                  >
                    Marquer comme terminé
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => handleNavigation('next')}
                  disabled={contents.findIndex((c) => c.id === contentId) === contents.length - 1}
                  sx={{
                    borderColor: `${colors.red}4d`,
                    color: '#ffffff',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: `${colors.red}33`,
                    },
                  }}
                  endIcon={<ArrowRight size={20} />}
                >
                  Suivant
                </Button>
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
            </ContentCard>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

// Optimisation avec React.memo
export default React.memo(CoursePlayer);