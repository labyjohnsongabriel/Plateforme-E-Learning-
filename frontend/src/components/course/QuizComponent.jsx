// QuizComponent.jsx - Composant quiz professionnel avec fond interactif gradient
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Fade,
  Card,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3001/api';

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
const QuizCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '24px',
  padding: '32px',
  maxWidth: '900px',
  margin: 'auto',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
});

const QuizComponent = () => {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
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

        // Récupérer le contenu spécifique (quiz)
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
        setError(err.response?.data?.message || 'Erreur lors du chargement du quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, contentId, navigate]);

  const handleChange = (qId, value) => {
    if (!isCompleted) {
      setAnswers({ ...answers, [qId]: value });
    }
  };

  const handleSubmit = async () => {
    if (isCompleted) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/contenu/${contentId}/submit-quiz`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(response.data.results);
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

  if (error || !content?.questions) {
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
          {error || 'Quiz non disponible'}
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
                        secondary={`${c.type.charAt(0).toUpperCase() + c.type.slice(1)}`}
                        primaryTypographyProps={{ color: '#ffffff', fontWeight: 500 }}
                        secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      />
                      {c.isCompleted && (
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

            {/* Quiz principal */}
            <QuizCard elevation={0}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 2,
                }}
              >
                {course?.title} - {content?.title}
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
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: `${colors.red}33`,
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    },
                  }}
                />
              </Box>

              {/* Questions du quiz */}
              {!results ? (
                <Stack spacing={4}>
                  {content.questions.map((q, index) => (
                    <Box key={index}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          mb: 2,
                        }}
                      >
                        {index + 1}. {q.text}
                      </Typography>
                      <RadioGroup
                        name={`q${index}`}
                        value={answers[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        disabled={isCompleted}
                      >
                        {q.options.map((opt) => (
                          <FormControlLabel
                            key={opt}
                            value={opt}
                            control={<Radio sx={{ color: colors.red }} />}
                            label={<Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>{opt}</Typography>}
                            disabled={isCompleted}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  ))}
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isCompleted || Object.keys(answers).length < content.questions.length}
                    fullWidth
                    sx={{
                      background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                      borderRadius: '16px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1.2rem',
                      textTransform: 'none',
                      boxShadow: `0 8px 32px ${colors.red}4d`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 40px ${colors.red}66`,
                      },
                    }}
                    endIcon={<ArrowRight size={24} />}
                  >
                    Soumettre
                  </Button>
                </Stack>
              ) : (
                <Box>
                  <Typography
                    sx={{
                      color: colors.pink,
                      fontSize: '1.4rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      mb: 4,
                    }}
                  >
                    Résultats: {results.score}% ({results.correctAnswers} / {content.questions.length} correctes)
                  </Typography>
                  {content.questions.map((q, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        {index + 1}. {q.text}
                      </Typography>
                      <Typography
                        sx={{
                          color: results.answers[index] === q.correctAnswer ? colors.pink : colors.red,
                          fontSize: '1rem',
                        }}
                      >
                        Votre réponse: {results.answers[index]} {results.answers[index] === q.correctAnswer ? '✅' : '❌'}
                      </Typography>
                      {results.answers[index] !== q.correctAnswer && (
                        <Typography sx={{ color: '#ffffff', fontSize: '1rem' }}>
                          Réponse correcte: {q.correctAnswer}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
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
            </QuizCard>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

// Optimisation avec React.memo
export default React.memo(QuizComponent);