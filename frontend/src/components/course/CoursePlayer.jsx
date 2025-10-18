// Frontend: CoursePlayer.jsx (corrected to fix API endpoints and add error handling)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import DocumentViewer from './DocumentViewer';
import QuizComponent from './QuizComponent';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Fade,
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

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
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { from: `/student/learn/${courseId}/${contentId}` } });
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, { headers });
        setCourse(courseResponse.data);

        const contentsResponse = await axios.get(`${API_BASE_URL}/contenu`, {
          params: { courseId },
          headers,
        });
        setContents(contentsResponse.data.data || contentsResponse.data);

        const contentResponse = await axios.get(`${API_BASE_URL}/contenu/${contentId}`, {
          headers,
        });
        setContent(contentResponse.data);
        setIsCompleted(contentResponse.data.isCompleted || false);

        const progressResponse = await axios.get(`${API_BASE_URL}/learning/progress/${courseId}`, {
          headers,
        });
        setProgress(progressResponse.data.pourcentage || 0);
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
      await axios.put(
        `${API_BASE_URL}/learning/progress/${courseId}`,
        { pourcentage: progress + 100 / contents.length },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsCompleted(true);
      const currentIndex = contents.findIndex((c) => c._id === contentId);
      if (currentIndex < contents.length - 1) {
        navigate(`/student/learn/${courseId}/${contents[currentIndex + 1]._id}`);
      }
    } catch (err) {
      setError('Erreur lors de la complétion');
    }
  };

  const handleQuizSubmit = async (answers) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/quiz/${contentId}/soumettre`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCompleteContent();
    } catch (err) {
      setError('Erreur soumission quiz');
    }
  };

  const handleNavigation = (direction) => {
    const currentIndex = contents.findIndex((c) => c._id === contentId);
    if (direction === 'prev' && currentIndex > 0) {
      navigate(`/student/learn/${courseId}/${contents[currentIndex - 1]._id}`);
    } else if (direction === 'next' && currentIndex < contents.length - 1) {
      navigate(`/student/learn/${courseId}/${contents[currentIndex + 1]._id}`);
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
          bgcolor: colors.navy,
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
          bgcolor: colors.navy,
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
        bgcolor: colors.navy,
        overflow: 'auto',
        pt: 8,
        pb: 12,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${colors.red}1a 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${colors.pink}1a 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth={false} disableGutters>
        <Fade in timeout={800}>
          <Box>
            {/* Barre de progression globale */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: `linear-gradient(to bottom, ${colors.navy}, transparent)`,
                p: 2,
              }}
            >
              <Typography sx={{ color: '#ffffff', fontSize: '1.1rem', mb: 1 }}>
                Progression du cours: {progress}%
              </Typography>
              <LinearProgress
                variant='determinate'
                value={progress}
                sx={{
                  backgroundColor: `${colors.navy}66`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  },
                }}
              />
            </Box>

            {/* Liste des contenus */}
            <Box sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box sx={{ width: { xs: '100%', md: '300px' }, mb: { xs: 4, md: 0 } }}>
                <Typography variant='h5' sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
                  Contenu du cours
                </Typography>
                <List sx={{ backgroundColor: `${colors.navy}33`, borderRadius: '12px', p: 2 }}>
                  {contents.map((c, index) => (
                    <React.Fragment key={c._id}>
                      <ListItem
                        button
                        selected={c._id === contentId}
                        onClick={() => navigate(`/student/learn/${courseId}/${c._id}`)}
                        sx={{
                          borderRadius: '8px',
                          '&.Mui-selected': { backgroundColor: `${colors.red}33` },
                        }}
                      >
                        <ListItemText
                          primary={c.titre}
                          secondary={c.type}
                          primaryTypographyProps={{ color: '#ffffff', fontWeight: 500 }}
                          secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        />
                        {c.isCompleted && <CheckCircle size={20} color={colors.red} />}
                      </ListItem>
                      {index < contents.length - 1 && (
                        <Divider sx={{ backgroundColor: `${colors.red}33` }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>

              {/* Contenu principal */}
              <ContentCard>
                <Typography
                  variant='h3'
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    color: '#ffffff',
                    mb: 2,
                  }}
                >
                  {course.titre} - {content.titre}
                </Typography>
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ color: '#ffffff', fontSize: '1rem', mb: 1 }}>
                    Progression du cours: {progress}%
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={progress}
                    sx={{
                      backgroundColor: `${colors.navy}66`,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                      },
                    }}
                  />
                </Box>
                {content.type === 'video' && (
                  <VideoPlayer videoUrl={content.url} onEnded={handleCompleteContent} />
                )}
                {content.type === 'document' && <DocumentViewer pdfUrl={content.url} />}
                {content.type === 'quiz' && (
                  <QuizComponent
                    questions={content.questions}
                    onSubmit={handleQuizSubmit}
                    disabled={isCompleted}
                  />
                )}
                <Stack direction='row' spacing={2} sx={{ mt: 4, justifyContent: 'space-between' }}>
                  <Button
                    variant='outlined'
                    onClick={() => handleNavigation('prev')}
                    disabled={contents.findIndex((c) => c._id === contentId) === 0}
                    sx={{
                      borderColor: `${colors.red}4d`,
                      color: '#ffffff',
                      borderRadius: '12px',
                      '&:hover': { backgroundColor: `${colors.red}33` },
                    }}
                    startIcon={<ArrowLeft size={20} />}
                  >
                    Précédent
                  </Button>
                  {!isCompleted && content.type !== 'quiz' && (
                    <Button
                      variant='contained'
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
                    variant='outlined'
                    onClick={() => handleNavigation('next')}
                    disabled={contents.findIndex((c) => c._id === contentId) === contents.length - 1}
                    sx={{
                      borderColor: `${colors.red}4d`,
                      color: '#ffffff',
                      borderRadius: '12px',
                      '&:hover': { backgroundColor: `${colors.red}33` },
                    }}
                    endIcon={<ArrowRight size={20} />}
                  >
                    Suivant
                  </Button>
                </Stack>
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
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default React.memo(CoursePlayer);