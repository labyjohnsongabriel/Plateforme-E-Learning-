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
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
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
  const { id } = useParams();
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
          navigate('/login', { state: { from: `/student/progress/${id}` } });
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${id}`, { headers });
        setCourse(courseResponse.data);

        const contentsResponse = await axios.get(`${API_BASE_URL}/contenu`, {
          params: { courseId: id },
          headers,
        });
        setContents(contentsResponse.data.data || contentsResponse.data);

        const progressResponse = await axios.get(`${API_BASE_URL}/learning/progress/${id}`, {
          headers,
        });
        setProgress(progressResponse.data.pourcentage || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement de la progression');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleContinueLearning = () => {
    const nextContent = contents.find((content) => !content.isCompleted);
    if (nextContent) {
      navigate(`/student/learn/${id}/${nextContent._id}`);
    } else {
      navigate(`/student/certificates`);
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
        <LinearProgress
          sx={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: `${colors.red}33`,
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
            },
          }}
        />
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
        overflow: 'hidden',
        pt: 8,
        pb: 12,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${colors.red}1a 1px, transparent 1px), linear-gradient(90deg, ${colors.red}1a 1px, transparent 1px)`,
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
              variant='h3'
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
            <Typography sx={{ color: '#ffffff', fontSize: '1.4rem', textAlign: 'center', mb: 2 }}>
              {course.titre}
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ color: '#ffffff', fontSize: '1.2rem', mb: 1 }}>
                Progression globale: {progress}%
              </Typography>
              <LinearProgress
                variant='determinate'
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
            {contents.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant='h5' sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
                  Contenus du cours
                </Typography>
                <List sx={{ backgroundColor: `${colors.navy}33`, borderRadius: '12px', p: 2 }}>
                  {contents.map((content, index) => (
                    <React.Fragment key={content._id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/student/learn/${id}/${content._id}`)}
                        sx={{
                          borderRadius: '8px',
                          '&:hover': { backgroundColor: `${colors.red}1a` },
                        }}
                      >
                        <ListItemText
                          primary={content.titre}
                          secondary={content.type}
                          primaryTypographyProps={{ color: '#ffffff', fontWeight: 500 }}
                          secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        />
                        {content.isCompleted && (
                          <Tooltip title='Contenu complété'>
                            <CheckCircle size={20} color={colors.red} />
                          </Tooltip>
                        )}
                      </ListItem>
                      {index < contents.length - 1 && (
                        <Divider sx={{ backgroundColor: `${colors.red}33` }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
            <Stack direction='row' spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
              <Typography sx={{ color: '#ffffff', fontSize: '1rem' }}>
                Contenus complétés: {contents.filter((c) => c.isCompleted).length} /{' '}
                {contents.length}
              </Typography>
              {course.duree && (
                <Typography sx={{ color: '#ffffff', fontSize: '1rem' }}>
                  Durée estimée: {course.duree}
                </Typography>
              )}
            </Stack>
            <Stack direction='row' spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                variant='outlined'
                onClick={() => navigate(`/course/${id}`)}
                sx={{
                  borderColor: `${colors.red}4d`,
                  color: '#ffffff',
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: `${colors.red}33` },
                }}
                startIcon={<ArrowLeft size={20} />}
              >
                Retour au cours
              </Button>
              {progress < 100 && (
                <Button
                  variant='contained'
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

export default React.memo(CourseProgress);
