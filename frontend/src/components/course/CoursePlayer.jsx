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
  Snackbar,
  Alert,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
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

const BackButton = styled(Button)({
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '10px',
  padding: '8px 16px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  border: `1px solid ${colors.red}33`,
  '&:hover': {
    backgroundColor: `${colors.red}1a`,
    borderColor: `${colors.red}66`,
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (
        !courseId ||
        !contentId ||
        !/^[0-9a-fA-F]{24}$/.test(courseId) ||
        !/^[0-9a-fA-F]{24}$/.test(contentId)
      ) {
        setError('ID de cours ou de contenu invalide');
        setLoading(false);
        navigate('/student/courses');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { from: `/student/learn/${courseId}/${contentId}` } });
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const sanitizedCourseId = courseId.trim();

        // Fetch course data
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${sanitizedCourseId}`, {
          headers,
        });
        if (!courseResponse.data) {
          throw new Error('Cours non trouvé');
        }
        setCourse(courseResponse.data);

        // Fetch course contents
        const contentsResponse = await axios.get(`${API_BASE_URL}/courses/contenu`, {
          params: { courseId: sanitizedCourseId },
          headers,
        });
        const contentsData = Array.isArray(contentsResponse.data) ? contentsResponse.data : [];
        if (!contentsData.length) {
          console.warn('No content found for courseId:', sanitizedCourseId);
        }
        setContents(contentsData);

        // Fetch specific content
        const contentResponse = await axios.get(`${API_BASE_URL}/courses/contenu/${contentId}`, {
          headers,
        });
        if (!contentResponse.data) {
          throw new Error('Contenu non trouvé');
        }
        setContent(contentResponse.data);
        setIsCompleted(contentResponse.data.isCompleted || false);

        // Fetch progress
        const progressResponse = await axios.get(
          `${API_BASE_URL}/courses/learning/progress/${sanitizedCourseId}`,
          { headers }
        );
        setProgress(progressResponse.data.pourcentage || 0);
      } catch (err) {
        console.error(
          'Erreur lors du chargement du contenu:',
          err,
          'Response:',
          err.response?.data
        );
        let errorMessage = 'Erreur lors du chargement du contenu';
        if (err.response) {
          if (err.response.data.errors && err.response.data.errors.length > 0) {
            errorMessage = err.response.data.errors[0].msg || 'Erreur inconnue';
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.status === 400) {
            errorMessage = "Requête invalide. Vérifiez l'ID du cours ou du contenu.";
          } else if (err.response.status === 401) {
            errorMessage = 'Votre session a expiré';
            localStorage.removeItem('token');
            navigate('/login');
            return;
          } else if (err.response.status === 404) {
            errorMessage = 'Cours ou contenu non trouvé.';
          } else if (err.response.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setSnackbarOpen(true);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, contentId, navigate]);

  const handleCompleteContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/student/learn/${courseId}/${contentId}` } });
        return;
      }
      
      const newProgress = progress + (contents.length > 0 ? 100 / contents.length : 0);
      
      await axios.put(
        `${API_BASE_URL}/courses/learning/progress/${courseId}`,
        { pourcentage: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mark this specific content as completed
      await axios.put(
        `${API_BASE_URL}/courses/contenu/${contentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsCompleted(true);
      setProgress(newProgress);
      
      // Update local contents state to reflect completion
      setContents(prevContents => 
        prevContents.map(c => 
          c._id === contentId ? { ...c, isCompleted: true } : c
        )
      );

      // Navigate to next content if available
      const currentIndex = contents.findIndex((c) => c._id === contentId);
      if (currentIndex < contents.length - 1) {
        navigate(`/student/learn/${courseId}/${contents[currentIndex + 1]._id}`);
      }
    } catch (err) {
      console.error('Erreur lors de la complétion du contenu:', err);
      setError('Erreur lors de la complétion du contenu');
      setSnackbarOpen(true);
    }
  };

  const handleQuizSubmit = async (answers) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/student/learn/${courseId}/${contentId}` } });
        return;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/courses/quiz/${contentId}/soumettre`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        handleCompleteContent();
      } else {
        setError('Erreur lors de la soumission du quiz: ' + response.data.message);
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Erreur lors de la soumission du quiz:', err);
      setError('Erreur lors de la soumission du quiz');
      setSnackbarOpen(true);
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

  const handleBack = () => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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

  if (error || !course) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: colors.navy,
          gap: 2,
          p: 3,
        }}
      >
        <Alert
          severity='error'
          sx={{
            width: { xs: '100%', sm: '80%', md: '50%' },
            bgcolor: `${colors.red}1a`,
            color: '#ffffff',
            borderRadius: '12px',
            p: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            '& .MuiAlert-icon': {
              color: colors.red,
              mt: 0.5,
            },
          }}
          icon={<AlertCircle size={24} />}
          action={
            <Button
              size='small'
              onClick={() => window.location.reload()}
              sx={{
                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                color: '#ffffff',
                borderRadius: '10px',
                textTransform: 'none',
              }}
            >
              Réessayer
            </Button>
          }
        >
          <Typography sx={{ fontSize: '0.95rem' }}>{error || 'Cours non trouvé'}</Typography>
        </Alert>
        <BackButton
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/student/courses')}
          aria-label='Retour à mes cours'
        >
          Retour à mes cours
        </BackButton>
      </Box>
    );
  }

  if (!content || contents.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: colors.navy,
          gap: 2,
          p: 3,
        }}
      >
        <Typography sx={{ color: colors.red, fontSize: '1.2rem', fontWeight: 600, textAlign: 'center' }}>
          Aucun contenu disponible pour ce cours.
        </Typography>
        <BackButton
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(`/student/courses/${courseId}`)}
          aria-label='Retour au cours'
        >
          Retour au cours
        </BackButton>
      </Box>
    );
  }

  const currentIndex = contents.findIndex((c) => c._id === contentId);

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
            {/* Header with Progress */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: `linear-gradient(to bottom, ${colors.navy}, transparent)`,
                p: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <BackButton
                startIcon={<ArrowLeft size={18} />}
                onClick={handleBack}
                aria-label='Retour au cours'
                sx={{ mb: 2 }}
              >
                Retour au cours
              </BackButton>
              <Typography sx={{ color: '#ffffff', fontSize: '1.1rem', mb: 1 }}>
                Progression du cours: {Math.round(progress)}%
              </Typography>
              <LinearProgress
                variant='determinate'
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: `${colors.navy}66`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              {/* Sidebar - Course Contents */}
              <Box sx={{ width: { xs: '100%', md: '300px' }, mb: { xs: 4, md: 0 } }}>
                <Typography variant='h5' sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
                  Contenu du cours
                </Typography>
                <List sx={{ backgroundColor: `${colors.navy}33`, borderRadius: '12px', p: 2 }}>
                  {contents.map((c, index) => (
                    <React.Fragment key={c._id || `content-${index}`}>
                      <ListItem
                        button
                        selected={c._id === contentId}
                        onClick={() => navigate(`/student/learn/${courseId}/${c._id}`)}
                        sx={{
                          borderRadius: '8px',
                          mb: 0.5,
                          '&.Mui-selected': { 
                            backgroundColor: `${colors.red}33`,
                            '&:hover': {
                              backgroundColor: `${colors.red}4d`,
                            }
                          },
                          '&:hover': {
                            backgroundColor: `${colors.red}1a`,
                          },
                        }}
                      >
                        <ListItemText
                          primary={c.titre || 'Contenu sans titre'}
                          secondary={c.type}
                          primaryTypographyProps={{ 
                            color: '#ffffff', 
                            fontWeight: c._id === contentId ? 600 : 500,
                            fontSize: '0.9rem'
                          }}
                          secondaryTypographyProps={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.8rem'
                          }}
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

              {/* Main Content Area */}
              <ContentCard>
                <Typography
                  variant='h3'
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    color: '#ffffff',
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  {content.titre}
                </Typography>
                
                <Typography
                  variant='h6'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 3,
                    fontSize: '1.1rem',
                  }}
                >
                  {course.titre}
                </Typography>

                {/* Content-specific components */}
                {content.type.toLowerCase() === 'video' && (
                  <VideoPlayer 
                    videoUrl={content.url} 
                    onEnded={!isCompleted ? handleCompleteContent : null}
                  />
                )}
                
                {content.type.toLowerCase() === 'document' && (
                  <DocumentViewer pdfUrl={content.url} />
                )}
                
                {content.type.toLowerCase() === 'quiz' && (
                  <QuizComponent
                    questions={content.questions || []}
                    onSubmit={handleQuizSubmit}
                    disabled={isCompleted}
                  />
                )}

                {/* Navigation Buttons */}
                <Stack direction='row' spacing={2} sx={{ mt: 4, justifyContent: 'space-between' }}>
                  <Button
                    variant='outlined'
                    onClick={() => handleNavigation('prev')}
                    disabled={currentIndex === 0}
                    sx={{
                      borderColor: `${colors.red}4d`,
                      color: '#ffffff',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { 
                        backgroundColor: `${colors.red}33`,
                        borderColor: `${colors.red}66`,
                      },
                      '&:disabled': {
                        borderColor: `${colors.red}1a`,
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                    startIcon={<ArrowLeft size={20} />}
                  >
                    Précédent
                  </Button>

                  {!isCompleted && content.type.toLowerCase() !== 'quiz' && (
                    <Button
                      variant='contained'
                      onClick={handleCompleteContent}
                      sx={{
                        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                        borderRadius: '12px',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 40px ${colors.red}66`,
                          background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                        },
                      }}
                    >
                      Marquer comme terminé
                    </Button>
                  )}

                  <Button
                    variant='outlined'
                    onClick={() => handleNavigation('next')}
                    disabled={currentIndex === contents.length - 1}
                    sx={{
                      borderColor: `${colors.red}4d`,
                      color: '#ffffff',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { 
                        backgroundColor: `${colors.red}33`,
                        borderColor: `${colors.red}66`,
                      },
                      '&:disabled': {
                        borderColor: `${colors.red}1a`,
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                    endIcon={<ArrowRight size={20} />}
                  >
                    Suivant
                  </Button>
                </Stack>
              </ContentCard>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='error'
          sx={{ 
            boxShadow: 3, 
            bgcolor: `${colors.red}1a`, 
            color: colors.red,
            '& .MuiAlert-icon': {
              color: colors.red,
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(CoursePlayer);