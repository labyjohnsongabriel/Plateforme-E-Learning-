// Frontend: DocumentViewer.jsx (professional corrected code with consistent API, property names, and error handling)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Container,
  Typography,
  Fade,
  LinearProgress,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Configurer le worker pour react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
const ViewerBox = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '20px',
  maxWidth: '900px',
  margin: 'auto',
  padding: '24px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
});

const DocumentViewer = () => {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
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

        const headers = { Authorization: `Bearer ${token}` };

        // Récupérer les détails du cours
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, { headers });
        setCourse(courseResponse.data);

        // Récupérer tous les contenus du cours
        const contentsResponse = await axios.get(`${API_BASE_URL}/contenu`, {
          params: { courseId },
          headers,
        });
        const contentsData = contentsResponse.data.data || contentsResponse.data;
        setContents(contentsData);

        // Récupérer le contenu spécifique
        const contentResponse = await axios.get(`${API_BASE_URL}/contenu/${contentId}`, { headers });
        setContent(contentResponse.data);
        setIsCompleted(contentResponse.data.isCompleted || false);

        // Récupérer la progression globale
        const progressResponse = await axios.get(`${API_BASE_URL}/learning/progress/${courseId}`, { headers });
        setProgress(progressResponse.data.progress || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du document');
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
      const progressResponse = await axios.get(`${API_BASE_URL}/learning/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(progressResponse.data.progress || 0);

      // Passer au contenu suivant si disponible
      const currentIndex = contents.findIndex((c) => c._id === contentId);
      if (currentIndex < contents.length - 1) {
        navigate(`/course/${courseId}/learn/${contents[currentIndex + 1]._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la complétion du contenu');
    }
  };

  const handleNavigation = (direction) => {
    const currentIndex = contents.findIndex((c) => c._id === contentId);
    if (direction === 'prev' && currentIndex > 0) {
      navigate(`/course/${courseId}/learn/${contents[currentIndex - 1]._id}`);
    } else if (direction === 'next' && currentIndex < contents.length - 1) {
      navigate(`/course/${courseId}/learn/${contents[currentIndex + 1]._id}`);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
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

  if (error || !content?.url) {
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
          {error || 'Document non disponible'}
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
                  <React.Fragment key={c._id}>
                    <ListItem
                      button
                      selected={c._id === contentId}
                      onClick={() => navigate(`/course/${courseId}/learn/${c._id}`)}
                      sx={{
                        borderRadius: '8px',
                        '&.Mui-selected': {
                          backgroundColor: `${colors.red}33`,
                        },
                      }}
                    >
                      <ListItemText
                        primary={c.titre}
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

            {/* Visionneuse de document */}
            <ViewerBox>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 2,
                }}
              >
                {course?.titre} - {content?.titre}
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

              {/* Affichage du document */}
              <Box sx={{ maxHeight: '500px', overflow: 'auto', borderRadius: '12px' }}>
                <Document
                  file={content.url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={() => setError('Erreur lors du chargement du document')}
                >
                  <Page pageNumber={pageNumber} width={800} />
                </Document>
              </Box>

              {/* Navigation dans le document */}
              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
                <IconButton
                  onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                  sx={{ color: '#ffffff' }}
                  aria-label="Page précédente"
                >
                  <ArrowLeft size={20} />
                </IconButton>
                <Typography sx={{ color: '#ffffff' }}>
                  Page {pageNumber} / {numPages || 1}
                </Typography>
                <IconButton
                  onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))}
                  disabled={pageNumber >= numPages}
                  sx={{ color: '#ffffff' }}
                  aria-label="Page suivante"
                >
                  <ArrowRight size={20} />
                </IconButton>
              </Stack>

              {/* Boutons de navigation et complétion */}
              <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => handleNavigation('prev')}
                  disabled={contents.findIndex((c) => c._id === contentId) === 0}
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
                {!isCompleted && (
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
                  disabled={contents.findIndex((c) => c._id === contentId) === contents.length - 1}
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
            </ViewerBox>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

// Optimisation avec React.memo
export default React.memo(DocumentViewer);