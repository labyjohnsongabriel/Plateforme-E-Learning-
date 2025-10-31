import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
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
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Slider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ArrowBack as ArrowLeftIcon,
  ArrowForward as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  Description as FileTextIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as MaximizeIcon,
  GetApp as DownloadIcon,
  RotateLeft as RotateCwIcon,
  WorkspacePremium as AwardIcon,
  TrendingUp as TrendingUpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as ListIcon,
  Visibility as EyeIcon,
  Schedule as ClockIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import axios from 'axios';

// === CONFIGURATION ===
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Configurer le worker pour react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// === ANIMATIONS SOPHISTIQUÉES ===
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(40px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

const slideInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-50px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-20px) rotate(5deg); 
  }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(241, 53, 68, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(241, 53, 68, 0.6);
  }
`;

// === COULEURS PROFESSIONNELLES ===
const colors = {
  navy: '#010b40',
  darkNavy: '#00072d',
  lightNavy: '#1a237e',
  deepSpace: '#0a0f2d',
  red: '#f13544',
  redLight: '#ff6b74',
  redDark: '#c71f2e',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  info: '#3b82f6',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  glassLight: 'rgba(255, 255, 255, 0.12)',
  border: 'rgba(241, 53, 68, 0.25)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.4)',
  },
};

// === STYLED COMPONENTS ===
const ViewerContainer = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(30px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '24px',
  margin: 'auto',
  padding: theme.spacing(4),
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  boxShadow: `
    0 20px 60px ${colors.navy}80,
    0 0 0 1px rgba(255, 255, 255, 0.05) inset
  `,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${colors.red}, transparent)`,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `
      0 30px 80px ${colors.navy}99,
      0 0 0 1px rgba(255, 255, 255, 0.1) inset
    `,
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: '16px',
  },
}));

const SidebarCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glassLight}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '20px',
  animation: `${slideInLeft} 0.6s ease-out`,
  boxShadow: `
    0 10px 40px ${colors.navy}60,
    0 0 0 1px rgba(255, 255, 255, 0.05) inset
  `,
  maxHeight: 'calc(100vh - 150px)',
  position: 'sticky',
  top: 100,
  overflow: 'hidden',
  [theme.breakpoints.down('lg')]: {
    position: 'relative',
    top: 'auto',
    maxHeight: '400px',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: colors.text.primary,
  borderRadius: '12px',
  padding: '12px 28px',
  fontWeight: 600,
  fontSize: '0.95rem',
  border: `1px solid ${colors.border}`,
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: `${colors.red}20`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${colors.red}30`,
  },
  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 20px',
    fontSize: '0.9rem',
  },
}));

const CompleteButton = styled(Button)(({ completed }) => ({
  background: completed
    ? `linear-gradient(135deg, ${colors.success}, ${colors.successLight})`
    : `linear-gradient(135deg, ${colors.red}, ${colors.redLight})`,
  color: colors.text.primary,
  borderRadius: '12px',
  padding: '14px 36px',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: completed ? `0 8px 25px ${colors.success}40` : `0 8px 25px ${colors.red}40`,
  animation: completed ? 'none' : `${pulseGlow} 2s infinite`,
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: completed ? `0 12px 35px ${colors.success}50` : `0 12px 35px ${colors.red}50`,
  },
  '&:disabled': {
    opacity: 0.7,
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 24px',
    fontSize: '0.9rem',
  },
}));

const ContentListItem = styled(ListItem)(({ selected, completed }) => ({
  borderRadius: '12px',
  marginBottom: '10px',
  padding: '14px 16px',
  background: selected
    ? `linear-gradient(135deg, ${colors.red}25, ${colors.red}15)`
    : 'transparent',
  border: selected ? `1px solid ${colors.red}50` : '1px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    borderRadius: '0 4px 4px 0',
    background: completed
      ? `linear-gradient(180deg, ${colors.success}, ${colors.successLight})`
      : selected
        ? `linear-gradient(180deg, ${colors.red}, ${colors.redLight})`
        : 'transparent',
  },
  '&:hover': {
    background: selected
      ? `linear-gradient(135deg, ${colors.red}35, ${colors.red}20)`
      : `${colors.glass}`,
    borderColor: selected ? colors.red : colors.borderLight,
    transform: 'translateX(6px)',
  },
}));

const DocumentWrapper = styled(Box)(({ theme }) => ({
  background: '#1a1a1a',
  borderRadius: '16px',
  overflow: 'auto',
  maxHeight: '700px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '20px',
  position: 'relative',
  boxShadow: `
    0 20px 60px ${colors.navy}99,
    0 0 0 1px rgba(255, 255, 255, 0.05) inset
  `,
  '&::-webkit-scrollbar': {
    width: '12px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
    borderRadius: '10px',
    '&:hover': {
      background: colors.red,
    },
  },
  [theme.breakpoints.down('md')]: {
    maxHeight: '500px',
    padding: '15px',
  },
  [theme.breakpoints.down('sm')]: {
    maxHeight: '400px',
    padding: '10px',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '16px',
  padding: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 10px 30px ${colors.navy}50`,
    borderColor: colors.red,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
}));

const ToolButton = styled(IconButton)({
  color: colors.text.primary,
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '10px',
  width: 44,
  height: 44,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `${colors.red}20`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    opacity: 0.3,
  },
});

// === COMPOSANT PRINCIPAL CORRIGÉ ===
const DocumentViewer = () => {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // États principaux
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // États du PDF
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return token ? { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : null;
  }, []);

  // === CHARGEMENT DES DONNÉES CORRIGÉ ===
  useEffect(() => {
    const fetchData = async () => {
      if (!headers) {
        navigate('/login', { 
          state: { 
            from: `/student/learn/${courseId}/contenu/${contentId}`,
            message: 'Session expirée - Veuillez vous reconnecter'
          } 
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Début du chargement des données du document...');

        // Chargement du cours
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, { 
          headers,
          timeout: 10000 
        });
        
        const courseData = courseResponse.data?.data || courseResponse.data;
        if (!courseData) {
          throw new Error('Données du cours non disponibles');
        }
        setCourse(courseData);
        console.log('✅ Cours chargé:', courseData.titre);

        // Chargement des contenus - CORRECTION ICI
        let contenusData = [];
        try {
          // Essayer d'abord l'endpoint spécifique
          const contenusResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}/contenus`, {
            headers,
            timeout: 10000
          });
          contenusData = contenusResponse.data?.data || contenusResponse.data || [];
          console.log('📚 Contenus chargés via endpoint spécifique:', contenusData.length);
        } catch (contenusError) {
          console.warn('Endpoint spécifique échoué, tentative avec endpoint générique...');
          
          // Fallback vers l'endpoint générique
          try {
            const fallbackResponse = await axios.get(`${API_BASE_URL}/courses/contenu`, {
              params: { courseId },
              headers,
              timeout: 10000
            });
            contenusData = fallbackResponse.data?.data || fallbackResponse.data || [];
            console.log('📚 Contenus chargés via endpoint générique:', contenusData.length);
          } catch (fallbackError) {
            console.error('Erreur endpoint générique:', fallbackError);
            // Si les deux endpoints échouent, essayer de récupérer depuis la structure du cours
            if (courseData.contenu && courseData.contenu.sections) {
              contenusData = courseData.contenu.sections.flatMap(section => 
                section.modules?.map(module => ({
                  ...module,
                  sectionTitre: section.titre,
                  type: module.type || 'document'
                })) || []
              );
              console.log('📚 Contenus extraits de la structure du cours:', contenusData.length);
            }
          }
        }

        if (!contenusData || contenusData.length === 0) {
          throw new Error('Aucun contenu trouvé pour ce cours');
        }

        // Normalisation des données de contenu
        const validContenus = contenusData.map((c, i) => ({
          ...c,
          _id: c._id || c.id || `content-${i}`,
          ordre: c.ordre || i + 1,
          titre: c.titre || `Contenu ${i + 1}`,
          isCompleted: c.isCompleted || false,
          type: c.type || 'document',
          url: c.url || c.contenuUrl || c.fileUrl,
          description: c.description || '',
          duration: c.duree || c.duration,
        }));

        setContents(validContenus);
        console.log('✅ Contenus normalisés:', validContenus.length);

        // Trouver le contenu actuel
        const current = contentId 
          ? validContenus.find((c) => c._id === contentId)
          : validContenus[0];

        if (current) {
          setContent(current);
          setIsCompleted(current.isCompleted || false);
          console.log('🎯 Contenu actuel:', current.titre);
        } else if (validContenus.length > 0) {
          // Redirection vers le premier contenu si le contenu actuel n'est pas trouvé
          navigate(`/student/learn/${courseId}/contenu/${validContenus[0]._id}`, {
            replace: true,
          });
        }

        // Chargement de la progression
        try {
          const progressResponse = await axios.get(`${API_BASE_URL}/learning/progress/${courseId}`, { 
            headers,
            timeout: 5000 
          });
          const progressData = progressResponse.data?.data || progressResponse.data;
          setProgress(progressData?.pourcentage || progressData?.progress || 0);
          console.log('📊 Progression chargée:', progressData?.pourcentage || 0);
        } catch (progressError) {
          console.warn('⚠️ Erreur chargement progression:', progressError.message);
          setProgress(0);
        }

      } catch (err) {
        console.error('❌ Erreur de chargement:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors du chargement';
        setError(errorMessage);
        
        // Notification d'erreur
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, contentId, navigate, headers]);

  // Réinitialiser l'état du PDF quand le contenu change
  useEffect(() => {
    setPageNumber(1);
    setScale(1.2);
    setRotation(0);
    setPdfLoading(true);
    setNumPages(null);
  }, [contentId]);

  // === GESTION DE LA COMPLÉTION CORRIGÉE ===
  const handleCompleteContent = async () => {
    if (isCompleted || !headers || !contentId) return;

    try {
      await axios.put(
        `${API_BASE_URL}/courses/contenu/${contentId}/complete`, 
        {}, 
        { 
          headers,
          timeout: 5000 
        }
      );

      setIsCompleted(true);
      setContents((prev) =>
        prev.map((c) => (c._id === contentId ? { ...c, isCompleted: true } : c))
      );

      // Mettre à jour la progression
      const completedCount = contents.filter((c) =>
        c._id === contentId ? true : c.isCompleted
      ).length;
      const newProgress = Math.round((completedCount / contents.length) * 100);
      setProgress(newProgress);

      setSnackbar({
        open: true,
        message: '🎉 Document terminé avec succès !',
        severity: 'success',
      });

      // Navigation automatique vers le contenu suivant
      const currentIndex = contents.findIndex((c) => c._id === contentId);
      if (currentIndex < contents.length - 1) {
        setTimeout(() => {
          navigate(`/student/learn/${courseId}/contenu/${contents[currentIndex + 1]._id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Erreur de complétion:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de la complétion du contenu',
        severity: 'error',
      });
    }
  };

  // === GESTION DU PDF ===
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    console.log(`✅ PDF chargé avec ${numPages} pages`);
  };

  const onDocumentLoadError = (error) => {
    console.error('❌ Erreur PDF:', error);
    setError('Erreur lors du chargement du document PDF');
    setPdfLoading(false);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, numPages || 1));
    setPageNumber(newPage);
  };

  // Téléchargement du PDF
  const handleDownload = () => {
    if (content?.url) {
      const link = document.createElement('a');
      link.href = content.url;
      link.download = `${content.titre || 'document'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // === NAVIGATION ===
  const handleNavigation = (direction) => {
    const currentIndex = contents.findIndex((c) => c._id === contentId);
    if (direction === 'prev' && currentIndex > 0) {
      navigate(`/student/learn/${courseId}/contenu/${contents[currentIndex - 1]._id}`);
    } else if (direction === 'next' && currentIndex < contents.length - 1) {
      navigate(`/student/learn/${courseId}/contenu/${contents[currentIndex + 1]._id}`);
    }
  };

  // Statistiques
  const stats = useMemo(() => {
    const completed = contents.filter((c) => c.isCompleted).length;
    const total = contents.length;
    const remaining = total - completed;
    const pdfProgress = numPages ? Math.round((pageNumber / numPages) * 100) : 0;
    return { completed, total, remaining, pdfProgress };
  }, [contents, numPages, pageNumber]);

  // === RENDU DU CHARGEMENT ===
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          color: colors.text.primary,
          gap: 3,
          p: 3,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CircularProgress
            size={isSmallMobile ? 60 : 100}
            thickness={3}
            sx={{
              color: colors.red,
              animation: `${pulseGlow} 2s infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <FileTextIcon sx={{ fontSize: isSmallMobile ? 24 : 40, color: colors.red }} />
          </Box>
        </Box>
        <Typography variant={isSmallMobile ? 'h6' : 'h5'} fontWeight={600} textAlign="center">
          Chargement du document...
        </Typography>
        <Typography color={colors.text.muted} textAlign="center">
          Préparation de votre contenu
        </Typography>
      </Box>
    );
  }

  // === RENDU DES ERREURS ===
  if (error || !content?.url) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          color: colors.text.primary,
          textAlign: 'center',
          p: 3,
        }}
      >
        <Box
          sx={{
            width: isSmallMobile ? 80 : 120,
            height: isSmallMobile ? 80 : 120,
            borderRadius: '50%',
            bgcolor: `${colors.red}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <FileTextIcon sx={{ fontSize: isSmallMobile ? 40 : 60, color: colors.red }} />
        </Box>
        <Typography variant={isSmallMobile ? 'h4' : 'h3'} sx={{ mb: 2, fontWeight: 700 }} textAlign="center">
          {error || 'Document non disponible'}
        </Typography>
        <Typography color={colors.text.secondary} sx={{ mb: 4, maxWidth: 500 }} textAlign="center">
          Nous n'avons pas pu charger ce document. Veuillez réessayer ou retourner au cours.
        </Typography>
        <Stack direction={isSmallMobile ? 'column' : 'row'} spacing={2} width={isSmallMobile ? '100%' : 'auto'}>
          <Button
            onClick={() => window.location.reload()}
            variant='contained'
            size='large'
            sx={{
              bgcolor: colors.red,
              px: 4,
              '&:hover': { bgcolor: colors.redLight },
              width: isSmallMobile ? '100%' : 'auto',
            }}
          >
            Réessayer
          </Button>
          <Button
            onClick={() => navigate(`/student/course/${courseId}`)}
            variant='outlined'
            size='large'
            sx={{
              borderColor: colors.border,
              color: colors.text.primary,
              px: 4,
              '&:hover': { borderColor: colors.red },
              width: isSmallMobile ? '100%' : 'auto',
            }}
          >
            Retour au cours
          </Button>
        </Stack>
      </Box>
    );
  }

  // === RENDU PRINCIPAL ===
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.darkNavy} 100%)`,
        overflow: 'hidden',
        pt: 4,
        pb: 8,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, ${colors.red}12, transparent 50%),
            radial-gradient(circle at 80% 70%, ${colors.purple}12, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Décorations de fond */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.red}08 1.5px, transparent 1.5px),
            linear-gradient(90deg, ${colors.red}08 1.5px, transparent 1.5px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.3,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 100,
          right: 60,
          width: 200,
          height: 200,
          background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
          borderRadius: '50%',
          opacity: 0.08,
          filter: 'blur(80px)',
          animation: `${floatingAnimation} 4s ease-in-out infinite`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 150,
          left: 80,
          width: 150,
          height: 150,
          background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
          borderRadius: '50%',
          opacity: 0.06,
          filter: 'blur(60px)',
          animation: `${floatingAnimation} 5s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        {/* En-tête avec navigation */}
        <Fade in timeout={600}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            justifyContent='space-between' 
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{ mb: 4 }}
          >
            <NavButton
              startIcon={<ArrowLeftIcon />}
              onClick={() => navigate(`/student/course/${courseId}`)}
              sx={{ minWidth: 'auto' }}
            >
              {isSmallMobile ? <ArrowLeftIcon /> : 'Retour au cours'}
            </NavButton>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={isSmallMobile ? '100%' : 'auto'}>
              <StatsCard elevation={0}>
                <BookIcon sx={{ fontSize: 22, color: colors.info }} />
                <Box>
                  <Typography variant='caption' color={colors.text.muted}>
                    Contenus
                  </Typography>
                  <Typography variant='h6' color={colors.text.primary} fontWeight={700}>
                    {stats.completed}/{stats.total}
                  </Typography>
                </Box>
              </StatsCard>

              <StatsCard elevation={0}>
                <TrendingUpIcon sx={{ fontSize: 22, color: colors.success }} />
                <Box>
                  <Typography variant='caption' color={colors.text.muted}>
                    Progression
                  </Typography>
                  <Typography variant='h6' color={colors.text.primary} fontWeight={700}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
              </StatsCard>

              <StatsCard elevation={0}>
                <EyeIcon sx={{ fontSize: 22, color: colors.warning }} />
                <Box>
                  <Typography variant='caption' color={colors.text.muted}>
                    PDF Lu
                  </Typography>
                  <Typography variant='h6' color={colors.text.primary} fontWeight={700}>
                    {stats.pdfProgress}%
                  </Typography>
                </Box>
              </StatsCard>
            </Stack>
          </Stack>
        </Fade>

        <Fade in timeout={1000}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            {/* SIDEBAR - Liste des contenus */}
            <Box sx={{ width: { xs: '100%', lg: 350 } }}>
              <SidebarCard>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                    sx={{ mb: 3 }}
                  >
                    <Typography
                      variant='h6'
                      color={colors.text.primary}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontWeight: 700,
                      }}
                    >
                      <ListIcon sx={{ color: colors.red }} />
                      Contenu du cours
                    </Typography>
                    <Chip
                      label={`${stats.completed}/${stats.total}`}
                      size='small'
                      sx={{
                        bgcolor: `${colors.success}20`,
                        color: colors.success,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Divider sx={{ mb: 2, borderColor: colors.borderLight }} />

                  <List sx={{ overflow: 'auto', maxHeight: { xs: '300px', lg: 'calc(100vh - 350px)' }, pr: 1 }}>
                    {contents.map((c, index) => (
                      <ContentListItem
                        key={c._id}
                        selected={c._id === contentId}
                        completed={c.isCompleted}
                        onClick={() => navigate(`/student/learn/${courseId}/contenu/${c._id}`)}
                      >
                        <ListItemText
                          primary={
                            <Stack direction='row' alignItems='center' spacing={1.5}>
                              {c.isCompleted ? (
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    bgcolor: `${colors.success}25`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <CheckCircleIcon sx={{ color: colors.success, fontSize: 16 }} />
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    bgcolor: c._id === contentId ? `${colors.red}25` : colors.glass,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: c._id === contentId ? colors.red : colors.text.muted,
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {index + 1}
                                </Box>
                              )}
                              <Typography
                                color={
                                  c._id === contentId ? colors.text.primary : colors.text.secondary
                                }
                                fontWeight={c._id === contentId ? 600 : 400}
                                sx={{ flex: 1 }}
                                noWrap
                              >
                                {c.titre}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Box sx={{ ml: 5, mt: 0.5 }}>
                              <Chip
                                label={c.type?.charAt(0).toUpperCase() + c.type?.slice(1) || 'Document'}
                                size='small'
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor:
                                    c.type === 'video'
                                      ? `${colors.purple}20`
                                      : c.type === 'document'
                                        ? `${colors.info}20`
                                        : `${colors.warning}20`,
                                  color:
                                    c.type === 'video'
                                      ? colors.purple
                                      : c.type === 'document'
                                        ? colors.info
                                        : colors.warning,
                                }}
                              />
                            </Box>
                          }
                        />
                      </ContentListItem>
                    ))}
                  </List>
                </CardContent>
              </SidebarCard>
            </Box>

            {/* VISIONNEUSE DE DOCUMENT PRINCIPAL */}
            <ViewerContainer>
              {/* Titre et informations */}
              <Box sx={{ mb: 4 }}>
                <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }} flexWrap="wrap">
                  <Chip
                    label='DOCUMENT PDF'
                    sx={{
                      bgcolor: colors.red,
                      color: colors.text.primary,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  />
                  {isCompleted && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                      label='TERMINÉ'
                      sx={{
                        bgcolor: `${colors.success}20`,
                        color: colors.success,
                        fontWeight: 700,
                        border: `1px solid ${colors.success}`,
                      }}
                    />
                  )}
                  {numPages && (
                    <Chip
                      icon={<FileTextIcon sx={{ fontSize: 16 }} />}
                      label={`${numPages} page${numPages > 1 ? 's' : ''}`}
                      sx={{
                        bgcolor: `${colors.info}20`,
                        color: colors.info,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>

                <Typography
                  variant='h3'
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    color: colors.text.primary,
                    mb: 1,
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {course?.titre}
                </Typography>

                <Typography
                  variant='h5'
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    fontWeight: 600,
                    color: colors.text.secondary,
                    mb: 3,
                    wordBreak: 'break-word',
                  }}
                >
                  {content?.titre}
                </Typography>

                {/* Barre de progression du cours */}
                <Box>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant='body2'
                      color={colors.text.secondary}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 16, color: colors.success }} />
                      Progression du cours
                    </Typography>
                    <Typography variant='h6' color={colors.text.primary} fontWeight={700}>
                      {Math.round(progress)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant='determinate'
                    value={progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: `${colors.red}15`,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${colors.red}, ${colors.purple})`,
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderColor: colors.borderLight }} />

              {/* Barre d'outils du PDF */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: colors.glass,
                  border: `1px solid ${colors.borderLight}`,
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent='space-between'
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  flexWrap='wrap'
                  gap={2}
                >
                  {/* Contrôles de navigation */}
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <ToolButton
                      onClick={() => goToPage(pageNumber - 1)}
                      disabled={pageNumber <= 1}
                      aria-label='Page précédente'
                    >
                      <ChevronLeftIcon />
                    </ToolButton>

                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: '8px',
                        bgcolor: colors.glassDark,
                        border: `1px solid ${colors.borderLight}`,
                        minWidth: 120,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant='body2' color={colors.text.primary} fontWeight={600}>
                        Page {pageNumber} / {numPages || '...'}
                      </Typography>
                    </Box>

                    <ToolButton
                      onClick={() => goToPage(pageNumber + 1)}
                      disabled={pageNumber >= numPages}
                      aria-label='Page suivante'
                    >
                      <ChevronRightIcon />
                    </ToolButton>
                  </Stack>

                  {/* Contrôles de zoom et rotation */}
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <ToolButton onClick={handleZoomOut} aria-label='Zoom arrière'>
                      <ZoomOutIcon />
                    </ToolButton>

                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: '8px',
                        bgcolor: colors.glassDark,
                        border: `1px solid ${colors.borderLight}`,
                        minWidth: 80,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant='body2' color={colors.text.primary} fontWeight={600}>
                        {Math.round(scale * 100)}%
                      </Typography>
                    </Box>

                    <ToolButton onClick={handleZoomIn} aria-label='Zoom avant'>
                      <ZoomInIcon />
                    </ToolButton>

                    <Divider
                      orientation='vertical'
                      flexItem
                      sx={{ mx: 1, borderColor: colors.borderLight, display: { xs: 'none', sm: 'block' } }}
                    />

                    <ToolButton onClick={handleRotate} aria-label='Rotation'>
                      <RotateCwIcon />
                    </ToolButton>

                    <Tooltip title='Télécharger le PDF' arrow>
                      <ToolButton
                        onClick={handleDownload}
                        aria-label='Télécharger'
                      >
                        <DownloadIcon />
                      </ToolButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>

              {/* Affichage du document PDF */}
              <DocumentWrapper>
                {pdfLoading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}
                  >
                    <CircularProgress size={isSmallMobile ? 40 : 60} sx={{ color: colors.red, mb: 2 }} />
                    <Typography color={colors.text.primary}>Chargement du PDF...</Typography>
                  </Box>
                )}

                <Document
                  file={content.url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={50} sx={{ color: colors.red }} />
                    </Box>
                  }
                  error={
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 4,
                        color: colors.red,
                      }}
                    >
                      <FileTextIcon sx={{ fontSize: 48 }} />
                      <Typography variant='h6' sx={{ mt: 2 }}>
                        Erreur de chargement du PDF
                      </Typography>
                    </Box>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    loading={
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={40} sx={{ color: colors.red }} />
                      </Box>
                    }
                  />
                </Document>
              </DocumentWrapper>

              {/* Slider de navigation rapide */}
              {numPages && numPages > 1 && (
                <Box sx={{ mt: 3, px: 2 }}>
                  <Typography variant='body2' color={colors.text.muted} sx={{ mb: 1 }}>
                    Navigation rapide
                  </Typography>
                  <Slider
                    value={pageNumber}
                    min={1}
                    max={numPages}
                    onChange={(_, value) => goToPage(value)}
                    valueLabelDisplay='auto'
                    valueLabelFormat={(value) => `Page ${value}`}
                    sx={{
                      color: colors.red,
                      '& .MuiSlider-thumb': {
                        bgcolor: colors.red,
                        '&:hover': {
                          boxShadow: `0 0 0 8px ${colors.red}30`,
                        },
                      },
                      '& .MuiSlider-track': {
                        bgcolor: colors.red,
                      },
                      '& .MuiSlider-rail': {
                        bgcolor: colors.borderLight,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Description du contenu */}
              {content.description && (
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: `${colors.glass}`,
                    border: `1px solid ${colors.borderLight}`,
                  }}
                >
                  <Typography
                    variant='body1'
                    color={colors.text.secondary}
                    sx={{ lineHeight: 1.8 }}
                  >
                    {content.description}
                  </Typography>
                </Box>
              )}

              {/* Boutons de navigation et complétion */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent='space-between'
                alignItems='center'
                spacing={2}
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: colors.glass,
                  border: `1px solid ${colors.borderLight}`,
                }}
              >
                <NavButton
                  startIcon={<ArrowLeftIcon />}
                  onClick={() => handleNavigation('prev')}
                  disabled={contents.findIndex((c) => c._id === contentId) === 0}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 130 },
                    order: { xs: 2, sm: 1 }
                  }}
                >
                  Précédent
                </NavButton>

                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  justifyContent: 'center',
                  order: { xs: 1, sm: 2 },
                  width: { xs: '100%', sm: 'auto' },
                  mb: { xs: 2, sm: 0 }
                }}>
                  {!isCompleted ? (
                    <CompleteButton
                      onClick={handleCompleteContent}
                      completed={false}
                      startIcon={<CheckCircleIcon />}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Marquer comme terminé
                    </CompleteButton>
                  ) : (
                    <CompleteButton 
                      completed={true} 
                      disabled 
                      startIcon={<AwardIcon />}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Document terminé
                    </CompleteButton>
                  )}
                </Box>

                <NavButton
                  endIcon={<ArrowRightIcon />}
                  onClick={() => handleNavigation('next')}
                  disabled={contents.findIndex((c) => c._id === contentId) === contents.length - 1}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 130 },
                    order: { xs: 3, sm: 3 }
                  }}
                >
                  Suivant
                </NavButton>
              </Stack>

              {/* Message de progression */}
              {stats.pdfProgress > 50 && stats.pdfProgress < 100 && !isCompleted && (
                <Alert
                  severity='info'
                  sx={{
                    mt: 3,
                    borderRadius: '12px',
                    bgcolor: `${colors.info}15`,
                    border: `1px solid ${colors.info}30`,
                    '& .MuiAlert-icon': {
                      color: colors.info,
                    },
                  }}
                >
                  <Typography variant='body2' color={colors.text.primary}>
                    <strong>Excellent travail !</strong> Vous avez lu {stats.pdfProgress}% du
                    document. Continuez jusqu'à la fin pour débloquer le contenu suivant ! 📖
                  </Typography>
                </Alert>
              )}

              {/* Encouragement à terminer */}
              {stats.pdfProgress === 100 && !isCompleted && (
                <Alert
                  severity='success'
                  sx={{
                    mt: 3,
                    borderRadius: '12px',
                    bgcolor: `${colors.success}15`,
                    border: `1px solid ${colors.success}30`,
                    '& .MuiAlert-icon': {
                      color: colors.success,
                    },
                  }}
                >
                  <Typography variant='body2' color={colors.text.primary}>
                    <strong>Bravo !</strong> Vous avez parcouru tout le document. N'oubliez pas de
                    le marquer comme terminé ! 🎉
                  </Typography>
                </Alert>
              )}
            </ViewerContainer>
          </Box>
        </Fade>
      </Container>

      {/* NOTIFICATION SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant='filled'
          sx={{
            borderRadius: '12px',
            boxShadow: `0 8px 32px ${colors.navy}60`,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(DocumentViewer);