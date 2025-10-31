
// CoursePlayer.jsx - Version Corrigée Professionnelle
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  ListItemIcon,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ArrowBack as ArrowLeftIcon,
  ArrowForward as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Book as BookIcon,
  Schedule as ClockIcon,
  Analytics as BarChart3Icon,
  PlayArrow as PlayIcon,
  Description as FileTextIcon,
  Help as HelpCircleIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as MaximizeIcon,
  GetApp as DownloadIcon,
  WorkspacePremium as AwardIcon,
  TrackChanges as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';

// === CONFIGURATION ===
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// === ANIMATIONS ===
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

const slideInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-40px);
  }
  to { 
    opacity: 1; 
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(40px);
  }
  to { 
    opacity: 1; 
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 0 0 rgba(241, 53, 68, 0.7);
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 0 0 10px rgba(241, 53, 68, 0);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(241, 53, 68, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(241, 53, 68, 0.8);
  }
`;

// === SYSTÈME DE COULEURS ===
const colors = {
  navy: '#010b40',
  darkNavy: '#00072d',
  deepSpace: '#0a0f2d',
  red: '#f13544',
  redLight: '#ff6b74',
  redDark: '#c71f2e',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  info: '#3b82f6',
  infoLight: '#60a5fa',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  glassLight: 'rgba(255, 255, 255, 0.12)',
  border: 'rgba(241, 53, 68, 0.25)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderDark: 'rgba(1, 11, 64, 0.5)',
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.4)',
  },
};

// === STYLES RESPONSIVES ===
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '24px',
  padding: theme.spacing(4),
  animation: `${fadeInUp} 0.7s ease-out`,
  boxShadow: `
    0 20px 40px ${colors.navy}40,
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
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
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

const SidebarCard = styled(Card)(({ theme, mobileOpen }) => ({
  background: `linear-gradient(135deg, ${colors.glassLight}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '20px',
  animation: `${slideInLeft} 0.6s ease-out`,
  boxShadow: `
    0 10px 30px ${colors.navy}60,
    0 0 0 1px rgba(255, 255, 255, 0.05) inset
  `,
  maxHeight: mobileOpen ? '80vh' : 'calc(100vh - 200px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('lg')]: {
    position: mobileOpen ? 'fixed' : 'relative',
    top: mobileOpen ? 0 : 'auto',
    left: mobileOpen ? 0 : 'auto',
    width: mobileOpen ? '100vw' : '100%',
    height: mobileOpen ? '100vh' : 'auto',
    maxHeight: mobileOpen ? '100vh' : '500px',
    zIndex: mobileOpen ? 1300 : 1,
    borderRadius: mobileOpen ? 0 : '20px',
    animation: mobileOpen ? `${slideInRight} 0.3s ease-out` : `${slideInLeft} 0.6s ease-out`,
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
  animation: completed ? 'none' : `${pulse} 2s infinite`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: completed ? `0 8px 25px ${colors.success}40` : `0 8px 25px ${colors.red}40`,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: completed ? `0 12px 35px ${colors.success}50` : `0 12px 35px ${colors.red}50`,
  },
  '&:disabled': {
    opacity: 0.7,
  },

}));

const ContentListItem = styled(ListItem)(({ selected, completed }) => ({
  borderRadius: '12px',
  marginBottom: '8px',
  padding: '12px 16px',
  background: selected
    ? `linear-gradient(135deg, ${colors.red}20, ${colors.red}10)`
    : 'transparent',
  border: selected ? `1px solid ${colors.red}40` : '1px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    background: completed
      ? `linear-gradient(180deg, ${colors.success}, ${colors.successLight})`
      : selected
        ? `linear-gradient(180deg, ${colors.red}, ${colors.redLight})`
        : 'transparent',
  },
  '&:hover': {
    background: selected
      ? `linear-gradient(135deg, ${colors.red}30, ${colors.red}15)`
      : `${colors.glass}`,
    borderColor: selected ? colors.red : colors.borderLight,
    transform: 'translateX(4px)',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '16px',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${colors.navy}40`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
}));

// === LECTEUR VIDÉO AMÉLIORÉ ===
const VideoPlayer = ({ videoUrl, onEnded }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '300px' : '500px',
        bgcolor: '#000',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
      onClick={() => !isPlaying && togglePlay()}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          cursor: 'pointer'
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onClick={togglePlay}
      />

      {/* Overlay de lecture */}
      <Fade in={!isPlaying}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <IconButton
            onClick={togglePlay}
            sx={{
              bgcolor: `${colors.red}cc`,
              color: 'white',
              width: isMobile ? 60 : 80,
              height: isMobile ? 60 : 80,
              '&:hover': {
                bgcolor: colors.red,
                transform: 'scale(1.1)',
              },
            }}
          >
            <PlayIcon sx={{ fontSize: isMobile ? 30 : 40 }} />
          </IconButton>
        </Box>
      </Fade>

      {/* Contrôles vidéo */}
      <Fade in={showControls}>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            p: isMobile ? 1 : 2,
          }}
        >
          {/* Barre de progression */}
          <Box
            sx={{
              width: '100%',
              height: isMobile ? 4 : 6,
              bgcolor: 'rgba(255,255,255,0.3)',
              borderRadius: 3,
              cursor: 'pointer',
              mb: isMobile ? 1 : 2,
            }}
            onClick={handleSeek}
          >
            <Box
              sx={{
                width: `${(currentTime / duration) * 100}%`,
                height: '100%',
                bgcolor: colors.red,
                borderRadius: 3,
                transition: 'width 0.1s',
              }}
            />
          </Box>

          {/* Contrôles */}
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Stack direction='row' spacing={isMobile ? 1 : 2} alignItems='center'>
              <IconButton onClick={togglePlay} sx={{ color: 'white', p: isMobile ? 0.5 : 1 }}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton onClick={toggleMute} sx={{ color: 'white', p: isMobile ? 0.5 : 1 }}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Typography variant='body2' color='white' sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Stack>

            <IconButton
              onClick={() => videoRef.current?.requestFullscreen()}
              sx={{ color: 'white', p: isMobile ? 0.5 : 1 }}
            >
              <MaximizeIcon />
            </IconButton>
          </Stack>
        </Box>
      </Fade>
    </Box>
  );
};

// === VISIONNEUSE DE DOCUMENTS RESPONSIVE ===
const DocumentViewer = ({ pdfUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      setLoading(false);
      if (!pdfUrl) {
        setError('Document non disponible');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pdfUrl]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? '300px' : '500px',
          bgcolor: colors.glassDark,
          borderRadius: '16px',
          border: `1px solid ${colors.borderLight}`,
        }}
      >
        <CircularProgress
          size={isMobile ? 40 : 60}
          thickness={4}
          sx={{
            color: colors.red,
            mb: 3,
          }}
        />
        <Typography color={colors.text.primary} variant={isMobile ? 'body1' : 'h6'} sx={{ mb: 1 }}>
          Chargement du document...
        </Typography>
        <Typography color={colors.text.muted} variant={isMobile ? 'caption' : 'body2'}>
          Veuillez patienter
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? '300px' : '500px',
          bgcolor: colors.glassDark,
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          color: 'white',
          textAlign: 'center',
          p: isMobile ? 2 : 4,
        }}
      >
        <Box
          sx={{
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: '50%',
            bgcolor: `${colors.red}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <FileTextIcon sx={{ fontSize: isMobile ? 30 : 40, color: colors.red }} />
        </Box>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mb: 1, fontWeight: 600 }}>
          Document non disponible
        </Typography>
        <Typography color={colors.text.muted} sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant='outlined'
          startIcon={<DownloadIcon />}
          sx={{
            color: 'white',
            borderColor: colors.border,
            '&:hover': {
              borderColor: colors.red,
              bgcolor: `${colors.red}20`,
            },
          }}
          onClick={() => window.open(pdfUrl, '_blank')}
        >
          Ouvrir dans un nouvel onglet
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: isMobile ? '300px' : '500px',
        bgcolor: colors.glassDark,
        borderRadius: '16px',
        border: `1px solid ${colors.borderLight}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        p: isMobile ? 2 : 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Effet de fond */}
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.red}20, transparent)`,
          filter: 'blur(60px)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
            borderRadius: '20px',
            bgcolor: `${colors.red}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            mx: 'auto',
            animation: `${glow} 2s infinite`,
          }}
        >
          <FileTextIcon sx={{ fontSize: isMobile ? 40 : 50, color: colors.red }} />
        </Box>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ mb: 1, fontWeight: 700 }}>
          Document PDF
        </Typography>
        <Typography color={colors.text.secondary} sx={{ mb: 4, maxWidth: 400 }}>
          Cliquez sur le bouton ci-dessous pour ouvrir et consulter le document dans votre
          navigateur
        </Typography>
        <Button
          variant='contained'
          size='large'
          startIcon={<DownloadIcon />}
          sx={{
            bgcolor: colors.red,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: colors.redLight,
              transform: 'translateY(-2px)',
            },
          }}
          onClick={() => window.open(pdfUrl, '_blank')}
        >
          Ouvrir le document
        </Button>
      </Box>
    </Box>
  );
};

// === COMPOSANT QUIZ RESPONSIVE ===
const QuizComponent = ({ questions, onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onSubmit) {
      setTimeout(onSubmit, 1000);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <Box
        sx={{
          height: isMobile ? '300px' : '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.glassDark,
          borderRadius: '16px',
          border: `1px solid ${colors.borderLight}`,
          color: 'white',
          textAlign: 'center',
          p: isMobile ? 2 : 4,
        }}
      >
        <Box
          sx={{
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: '50%',
            bgcolor: `${colors.warning}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <HelpCircleIcon sx={{ fontSize: isMobile ? 30 : 40, color: colors.warning }} />
        </Box>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mb: 1, fontWeight: 600 }}>
          Quiz non disponible
        </Typography>
        <Typography color={colors.text.muted} sx={{ mb: 3 }}>
          Aucune question n'a été trouvée pour ce quiz
        </Typography>
        <Button
          variant='contained'
          sx={{ bgcolor: colors.red, '&:hover': { bgcolor: colors.redLight } }}
          onClick={onSubmit}
        >
          Marquer comme terminé
        </Button>
      </Box>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 4,
        bgcolor: colors.glassDark,
        borderRadius: '16px',
        border: `1px solid ${colors.borderLight}`,
        color: 'white',
        minHeight: isMobile ? '300px' : '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* En-tête du quiz */}
      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 3 }}>
        <Box>
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>
            Question {currentQuestion + 1}
          </Typography>
          <Typography color={colors.text.muted} variant='body2'>
            sur {questions.length}
          </Typography>
        </Box>
        <Chip
          label={`${Math.round(progress)}%`}
          sx={{
            bgcolor: `${colors.red}20`,
            color: colors.red,
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        />
      </Stack>

      {/* Barre de progression */}
      <LinearProgress
        variant='determinate'
        value={progress}
        sx={{
          mb: 4,
          height: 8,
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${colors.red}, ${colors.purple})`,
            borderRadius: 4,
          },
        }}
      />

      {/* Question */}
      <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ mb: 4, flex: 1, lineHeight: 1.6 }}>
        {question?.question || 'Question non disponible'}
      </Typography>

      {/* Options */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        {question?.options?.map((option, index) => {
          const isSelected = answers[question.id] === option;
          return (
            <Button
              key={index}
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => handleAnswer(question.id, option)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                p: isMobile ? 1.5 : 2,
                color: isSelected ? 'white' : colors.text.secondary,
                bgcolor: isSelected ? colors.red : 'transparent',
                borderColor: isSelected ? colors.red : colors.borderLight,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: isSelected ? 600 : 400,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isSelected ? colors.redLight : `${colors.red}15`,
                  borderColor: colors.red,
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: isSelected ? 'white' : colors.glass,
                  color: isSelected ? colors.red : colors.text.muted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  mr: 2,
                  flexShrink: 0,
                }}
              >
                {String.fromCharCode(65 + index)}
              </Box>
              {option}
            </Button>
          );
        })}
      </Stack>

      {/* Navigation */}
      <Stack direction='row' spacing={2} justifyContent='space-between'>
        <Button
          variant='outlined'
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          sx={{
            color: 'white',
            borderColor: colors.borderLight,
            '&:hover': { borderColor: colors.red },
          }}
        >
          Précédent
        </Button>

        {currentQuestion < questions.length - 1 ? (
          <Button
            variant='contained'
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            sx={{
              bgcolor: colors.red,
              '&:hover': { bgcolor: colors.redLight },
            }}
          >
            Suivant
          </Button>
        ) : (
          <Button
            variant='contained'
            disabled={submitted}
            onClick={handleSubmit}
            startIcon={submitted ? <CheckCircleIcon /> : <AwardIcon />}
            sx={{
              bgcolor: submitted ? colors.success : colors.red,
              '&:hover': { bgcolor: submitted ? colors.successLight : colors.redLight },
            }}
          >
            {submitted ? 'Soumis !' : 'Soumettre le quiz'}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

// === COMPOSANT PRINCIPAL ===
const CoursePlayer = () => {
  const { courseId, contenuId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [course, setCourse] = useState(null);
  const [contenu, setContenu] = useState(null);
  const [contenus, setContenus] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : null;
  }, []);

  // === CHARGEMENT DES DONNÉES OPTIMISÉ ===
  useEffect(() => {
    const fetchData = async () => {
      if (!headers) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Chargement du cours...', courseId);

        // Chargement du cours avec gestion d'erreur améliorée
        const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, { 
          headers,
          timeout: 10000 
        });
        
        const courseData = courseResponse.data?.data || courseResponse.data;
        
        if (!courseData || !courseData._id) {
          throw new Error('Données du cours invalides');
        }
        
        setCourse(courseData);
        console.log('✅ Cours chargé:', courseData.titre);

        // === EXTRACTION DES CONTENUS - STRATÉGIE MULTIPLE ===
        let contenusData = [];
        
        // Stratégie 1 : Extraire depuis la structure du cours (le plus fiable)
        if (courseData.contenu) {
          console.log('📦 Structure contenu disponible:', Object.keys(courseData.contenu));
          
          // Cas 1: sections avec modules
          if (courseData.contenu.sections && Array.isArray(courseData.contenu.sections)) {
            contenusData = courseData.contenu.sections.flatMap((section, sectionIndex) => {
              const modules = section.modules || section.contenus || [];
              return modules.map((module, moduleIndex) => ({
                ...module,
                _id: module._id || module.id || `${section._id}-${moduleIndex}`,
                sectionTitre: section.titre,
                sectionOrdre: sectionIndex + 1,
                ordre: moduleIndex + 1,
              }));
            });
            console.log('📚 Contenus extraits des sections:', contenusData.length);
          }
          
          // Cas 2: contenus directs (tableau plat)
          if (contenusData.length === 0 && courseData.contenu.contenus && Array.isArray(courseData.contenu.contenus)) {
            contenusData = courseData.contenu.contenus;
            console.log('📚 Contenus extraits du tableau direct:', contenusData.length);
          }
          
          // Cas 3: modules directs
          if (contenusData.length === 0 && courseData.contenu.modules && Array.isArray(courseData.contenu.modules)) {
            contenusData = courseData.contenu.modules;
            console.log('📚 Contenus extraits des modules:', contenusData.length);
          }
        }
        
        // Stratégie 2 : Tableau de contenus à la racine
        if (contenusData.length === 0 && courseData.contenus && Array.isArray(courseData.contenus)) {
          contenusData = courseData.contenus;
          console.log('📚 Contenus extraits du tableau racine:', contenusData.length);
        }

        // Stratégie 3 : Essayer les endpoints API (fallback)
        if (contenusData.length === 0) {
          console.log('🔍 Tentative de chargement via API...');
          
          const endpoints = [
            `${API_BASE_URL}/courses/${courseId}/contenus`,
            `${API_BASE_URL}/courses/contenu?courseId=${courseId}`,
            `${API_BASE_URL}/contenus?courseId=${courseId}`,
          ];

          for (const endpoint of endpoints) {
            try {
              const response = await axios.get(endpoint, { headers, timeout: 5000 });
              const data = response.data?.data || response.data;
              
              if (Array.isArray(data) && data.length > 0) {
                contenusData = data;
                console.log(`✅ Contenus chargés depuis ${endpoint}:`, contenusData.length);
                break;
              }
            } catch (apiError) {
              console.warn(`⚠️ Échec ${endpoint}:`, apiError.response?.status || apiError.message);
              continue;
            }
          }
        }

        // Vérification finale
        if (!contenusData || contenusData.length === 0) {
          console.error('❌ Aucun contenu trouvé. Structure du cours:', 
            JSON.stringify(courseData, null, 2).substring(0, 500)
          );
          throw new Error(
            'Ce cours ne contient pas encore de contenu. Veuillez contacter l\'administrateur.'
          );
        }

        // === NORMALISATION DES CONTENUS ===
        const validContenus = contenusData.map((c, index) => {
          // Détermination de l'ID
          const id = c._id || c.id || c.contenuId || `content-${courseId}-${index}`;
          
          // Détermination du type
          let type = c.type || 'document';
          if (!type && c.url) {
            if (c.url.includes('.mp4') || c.url.includes('.webm') || c.url.includes('video')) {
              type = 'video';
            } else if (c.url.includes('.pdf') || c.url.includes('document')) {
              type = 'document';
            }
          }
          if (c.questions && Array.isArray(c.questions) && c.questions.length > 0) {
            type = 'quiz';
          }

          return {
            ...c,
            _id: id,
            ordre: c.ordre || c.order || index + 1,
            titre: c.titre || c.title || c.nom || `Contenu ${index + 1}`,
            isCompleted: Boolean(c.isCompleted || c.completed || c.estTermine),
            type,
            url: c.url || c.contenuUrl || c.fileUrl || c.videoUrl || c.documentUrl,
            description: c.description || c.desc || '',
            duration: c.duree || c.duration || c.temps,
            questions: c.questions || [],
            sectionTitre: c.sectionTitre || c.section,
          };
        }).sort((a, b) => a.ordre - b.ordre); // Tri par ordre

        setContenus(validContenus);
        console.log('✅ Contenus normalisés et triés:', validContenus.length);
        console.log('📋 Premier contenu:', validContenus[0]);

        // === SÉLECTION DU CONTENU ACTUEL ===
        let currentContent = null;
        
        if (contenuId) {
          currentContent = validContenus.find(c => c._id === contenuId);
          if (!currentContent) {
            console.warn(`⚠️ Contenu ${contenuId} introuvable, redirection vers le premier`);
          }
        }
        
        if (!currentContent) {
          currentContent = validContenus[0];
          navigate(`/student/learn/${courseId}/contenu/${currentContent._id}`, {
            replace: true,
          });
        }

        setContenu(currentContent);
        setIsCompleted(currentContent.isCompleted);
        console.log('🎯 Contenu actuel:', currentContent.titre);

        // === CHARGEMENT DE LA PROGRESSION ===
        try {
          const progressEndpoints = [
            `${API_BASE_URL}/learning/progress/${courseId}`,
            `${API_BASE_URL}/progress/${courseId}`,
            `${API_BASE_URL}/courses/${courseId}/progress`,
          ];

          let progressLoaded = false;
          for (const endpoint of progressEndpoints) {
            try {
              const progressResponse = await axios.get(endpoint, { headers, timeout: 5000 });
              const progressData = progressResponse.data?.data || progressResponse.data;
              const progressValue = progressData?.pourcentage || progressData?.progress || 0;
              
              setProgress(progressValue);
              console.log('📊 Progression chargée:', progressValue);
              progressLoaded = true;
              break;
            } catch (progressError) {
              continue;
            }
          }

          if (!progressLoaded) {
            // Calculer la progression localement
            const completedCount = validContenus.filter(c => c.isCompleted).length;
            const calculatedProgress = Math.round((completedCount / validContenus.length) * 100);
            setProgress(calculatedProgress);
            console.log('📊 Progression calculée localement:', calculatedProgress);
          }
        } catch (progressError) {
          console.warn('⚠️ Erreur chargement progression:', progressError.message);
          const completedCount = validContenus.filter(c => c.isCompleted).length;
          setProgress(Math.round((completedCount / validContenus.length) * 100));
        }

      } catch (err) {
        console.error('❌ Erreur de chargement:', err);
        console.error('Stack trace:', err.stack);
        
        const errorMessage = 
          err.response?.data?.message || 
          err.message || 
          'Une erreur est survenue lors du chargement';
        
        setError(errorMessage);
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
  }, [courseId, contenuId, navigate, headers, location.pathname]);

  // === MARQUER COMME TERMINÉ - VERSION ROBUSTE ===
  const handleComplete = useCallback(async () => {
    if (completing || isCompleted || !headers || !contenuId) return;

    setCompleting(true);

    try {
      console.log('🎯 Marquage du contenu comme terminé:', contenuId);

      // Essayer plusieurs endpoints possibles
      const endpoints = [
        { 
          url: `${API_BASE_URL}/courses/contenu/${contenuId}/complete`, 
          method: 'put',
          data: {} 
        },
        { 
          url: `${API_BASE_URL}/contenus/${contenuId}/complete`, 
          method: 'put',
          data: {} 
        },
        { 
          url: `${API_BASE_URL}/learning/complete`, 
          method: 'post',
          data: { contenuId, courseId } 
        },
        { 
          url: `${API_BASE_URL}/progress/complete`, 
          method: 'post',
          data: { contenuId, courseId } 
        },
      ];

      let completionSuccess = false;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const response = await axios({
            method: endpoint.method,
            url: endpoint.url,
            data: endpoint.data,
            headers,
            timeout: 5000
          });

          if (response.status === 200 || response.status === 201) {
            console.log(`✅ Complétion réussie via ${endpoint.url}`);
            completionSuccess = true;
            break;
          }
        } catch (endpointError) {
          lastError = endpointError;
          console.warn(`⚠️ Échec ${endpoint.url}:`, endpointError.response?.status);
          continue;
        }
      }

      if (!completionSuccess) {
        console.warn('⚠️ Tous les endpoints ont échoué, mise à jour locale uniquement');
      }

      // Mise à jour locale (toujours effectuée)
      setIsCompleted(true);
      setContenus((prev) =>
        prev.map((c) => (c._id === contenuId ? { ...c, isCompleted: true } : c))
      );

      // Recalcul de la progression
      const completedCount = contenus.filter((c) =>
        c._id === contenuId ? true : c.isCompleted
      ).length;
      const newProgress = Math.round((completedCount / contenus.length) * 100);
      setProgress(newProgress);
      console.log('📊 Nouvelle progression:', newProgress);

      setSnackbar({
        open: true,
        message: '🎉 Contenu terminé avec succès !',
        severity: 'success',
      });

      // Navigation automatique vers le contenu suivant
      const currentIndex = contenus.findIndex((c) => c._id === contenuId);
      if (currentIndex >= 0 && currentIndex < contenus.length - 1) {
        setTimeout(() => {
          navigate(`/student/learn/${courseId}/contenu/${contenus[currentIndex + 1]._id}`);
        }, 1500);
      } else if (currentIndex === contenus.length - 1) {
        // Dernier contenu terminé
        setSnackbar({
          open: true,
          message: '🎊 Félicitations ! Vous avez terminé tous les contenus de ce cours !',
          severity: 'success',
        });
      }
    } catch (err) {
      console.error('❌ Erreur critique de complétion:', err);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la complétion. Vos progrès ont été sauvegardés localement.',
        severity: 'warning',
      });
    } finally {
      setCompleting(false);
    }
  }, [contenuId, contenus, courseId, navigate, headers, completing, isCompleted]);

  const currentIndex = useMemo(
    () => contenus.findIndex((c) => c._id === contenuId),
    [contenus, contenuId]
  );

  const navigateToContent = useCallback(
    (direction) => {
      const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < contenus.length) {
        navigate(`/student/learn/${courseId}/contenu/${contenus[newIndex]._id}`);
      }
    },
    [currentIndex, contenus, courseId, navigate]
  );

  const handleVideoEnd = useCallback(() => {
    if (!isCompleted && contenu?.type === 'video') {
      handleComplete();
    }
  }, [isCompleted, contenu?.type, handleComplete]);

  // Statistiques calculées
  const stats = useMemo(() => {
    const completed = contenus.filter((c) => c.isCompleted).length;
    const total = contenus.length;
    const remaining = total - completed;
    const avgTimePerContent = 10; // minutes estimées
    const estimatedTime = remaining * avgTimePerContent;

    return { completed, total, remaining, estimatedTime };
  }, [contenus]);

  // Gestion du menu mobile
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);


  
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
          color: '#fff',
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
              animation: `${glow} 2s infinite`,
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
            <BookIcon sx={{ fontSize: isSmallMobile ? 24 : 40, color: colors.red }} />
          </Box>
        </Box>
        <Typography variant={isSmallMobile ? 'h6' : 'h5'} fontWeight={600} textAlign="center">
          Chargement du cours...
        </Typography>
        <Typography color={colors.text.muted} textAlign="center">
          Préparation de votre contenu
        </Typography>
      </Box>
    );
  }


  if (error || !course || contenus.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
          color: '#fff',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
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
          <WarningIcon sx={{ fontSize: isSmallMobile ? 40 : 60, color: colors.red }} />
        </Box>
        <Typography variant={isSmallMobile ? 'h4' : 'h3'} sx={{ mb: 2, fontWeight: 700 }} textAlign="center">
          {error || 'Cours introuvable'}
        </Typography>
        <Typography color={colors.text.secondary} sx={{ mb: 4, maxWidth: 500 }} textAlign="center">
          Nous n'avons pas pu charger ce cours. Veuillez réessayer ou retourner au tableau de bord.
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
            onClick={() => navigate('/student/dashboard')}
            variant='outlined'
            size='large'
            sx={{
              borderColor: colors.border,
              color: '#fff',
              px: 4,
              '&:hover': { borderColor: colors.red },
              width: isSmallMobile ? '100%' : 'auto',
            }}
          >
            Tableau de bord
          </Button>
        </Stack>
      </Box>
    );
  }


  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
        position: 'relative',
        overflow: 'auto',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, ${colors.red}10, transparent 50%),
            radial-gradient(circle at 80% 70%, ${colors.purple}10, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 1, sm: 2, md: 3 },
          py: 0,
          maxWidth: '100% !important',
        }}
      >
        <Fade in timeout={800}>
          <Box>
            {/* HEADER AMÉLIORÉ */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                background: `linear-gradient(135deg, ${colors.glassDark}, ${colors.navy}cc)`,
                backdropFilter: 'blur(20px)',
                p: { xs: 2, sm: 3 },
                zIndex: 1000,
                borderBottom: `1px solid ${colors.border}`,
                boxShadow: `0 8px 32px ${colors.navy}60`,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent='space-between'
                alignItems='center'
                spacing={2}
              >
                {/* Bouton retour et menu mobile */}
                <Stack direction="row" spacing={2} alignItems="center" width={isMobile ? '100%' : 'auto'} justifyContent="space-between">
                  <NavButton
                    startIcon={<ArrowLeftIcon />}
                    onClick={() => navigate(`/student/course/${courseId}`)}
                    sx={{ minWidth: 'auto' }}
                  >
                    {isSmallMobile ? <ArrowLeftIcon /> : 'Retour'}
                  </NavButton>

                  {isMobile && (
                    <IconButton
                      onClick={toggleSidebar}
                      sx={{
                        color: colors.text.primary,
                        bgcolor: colors.glass,
                        border: `1px solid ${colors.border}`,
                        '&:hover': {
                          bgcolor: `${colors.red}20`,
                          borderColor: colors.red,
                        },
                      }}
                    >
                      {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                  )}
                </Stack>

                {/* Titre et progression */}
                <Box sx={{ 
                  textAlign: 'center', 
                  flex: 1, 
                  minWidth: isMobile ? '100%' : 300,
                  order: { xs: 3, md: 2 },
                  mt: { xs: 2, md: 0 }
                }}>
                  <Typography
                    variant={isSmallMobile ? 'h6' : 'h5'}
                    color={colors.text.primary}
                    fontWeight={700}
                    sx={{ mb: 2 }}
                    noWrap
                  >
                    {course.titre}
                  </Typography>

                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant='determinate'
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.red}, ${colors.purple})`,
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      sx={{ mt: 1 }}
                    >
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <TrendingUpIcon sx={{ fontSize: 14, color: colors.success }} />
                        <Typography variant='caption' color={colors.text.secondary}>
                          Progression
                        </Typography>
                      </Stack>
                      <Typography variant='body2' color={colors.text.primary} fontWeight={700}>
                        {Math.round(progress)}%
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                {/* Statistiques rapides - cachées sur mobile */}
                {!isMobile && (
                  <Stack direction='row' spacing={2} order={3}>
                    <Tooltip title='Contenus complétés' arrow>
                      <StatsCard elevation={0}>
                        <BarChart3Icon sx={{ fontSize: 20, color: colors.success }} />
                        <Box>
                          <Typography variant='caption' color={colors.text.muted}>
                            Complétés
                          </Typography>
                          <Typography variant='body2' color={colors.text.primary} fontWeight={700}>
                            {stats.completed}/{stats.total}
                          </Typography>
                        </Box>
                      </StatsCard>
                    </Tooltip>

                    <Tooltip title='Temps restant estimé' arrow>
                      <StatsCard elevation={0}>
                        <ClockIcon sx={{ fontSize: 20, color: colors.info }} />
                        <Box>
                          <Typography variant='caption' color={colors.text.muted}>
                            Restant
                          </Typography>
                          <Typography variant='body2' color={colors.text.primary} fontWeight={700}>
                            {stats.estimatedTime} min
                          </Typography>
                        </Box>
                      </StatsCard>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* CONTENU PRINCIPAL */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 3,
                p: { xs: 2, sm: 3 },
                minHeight: 'calc(100vh - 140px)',
                width: '100%',
              }}
            >
              {/* SIDEBAR - Liste des contenus */}
              {(!isMobile || sidebarOpen) && (
                <Box sx={{ 
                  width: { xs: '100%', lg: 380 }, 
                  flexShrink: 0,
                  position: isMobile && sidebarOpen ? 'fixed' : 'relative',
                  top: isMobile && sidebarOpen ? 0 : 'auto',
                  left: isMobile && sidebarOpen ? 0 : 'auto',
                  zIndex: isMobile && sidebarOpen ? 1200 : 1,
                }}>
                  <SidebarCard mobileOpen={sidebarOpen}>
                    <CardContent
                      sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%' 
                      }}
                    >
                      {isMobile && sidebarOpen && (
                        <>
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
                              <BookIcon sx={{ color: colors.red }} />
                              Contenus du cours
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
                        </>
                      )}

                    <List sx={{ overflow: 'auto', flex: 1, pr: 1 }}>
                      {contenus.map((c, i) => (
                        <ContentListItem
                          key={c._id}
                          selected={c._id === contenuId}
                          completed={c.isCompleted}
                          onClick={() => {
                            navigate(`/student/learn/${courseId}/contenu/${c._id}`);
                            if (isMobile) setSidebarOpen(false);
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 44 }}>
                            {c.isCompleted ? (
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: `${colors.success}20`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <CheckCircleIcon sx={{ color: colors.success, fontSize: 18 }} />
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: c._id === contenuId ? `${colors.red}20` : colors.glass,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: c._id === contenuId ? colors.red : colors.text.muted,
                                  fontWeight: 700,
                                }}
                              >
                                {i + 1}
                              </Box>
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                color={
                                  c._id === contenuId ? colors.text.primary : colors.text.secondary
                                }
                                fontWeight={c._id === contenuId ? 600 : 400}
                                sx={{ mb: 0.5 }}
                                noWrap
                              >
                                {c.titre}
                              </Typography>
                            }
                            secondary={
                              <Stack direction='row' spacing={1} alignItems='center'>
                                <Chip
                                  label={
                                    c.type === 'video'
                                      ? 'Vidéo'
                                      : c.type === 'quiz'
                                        ? 'Quiz'
                                        : 'Document'
                                  }
                                  size='small'
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor:
                                      c.type === 'video'
                                        ? `${colors.purple}20`
                                        : c.type === 'quiz'
                                          ? `${colors.warning}20`
                                          : `${colors.info}20`,
                                    color:
                                      c.type === 'video'
                                        ? colors.purple
                                        : c.type === 'quiz'
                                          ? colors.warning
                                          : colors.info,
                                  }}
                                />
                                {c.duration && (
                                  <Typography variant='caption' color={colors.text.muted}>
                                    {c.duration}
                                  </Typography>
                                )}
                              </Stack>
                            }
                          />
                        </ContentListItem>
                      ))}
                    </List>

                    {/* Résumé de progression */}
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: `${colors.success}10`,
                        border: `1px solid ${colors.success}30`,
                      }}
                    >
                      <Stack direction='row' alignItems='center' spacing={2}>
                        <TargetIcon sx={{ color: colors.success }} />
                        <Box flex={1}>
                          <Typography variant='body2' color={colors.text.primary} fontWeight={600}>
                            Objectif: {stats.remaining} restant{stats.remaining > 1 ? 's' : ''}
                          </Typography>
                          <Typography variant='caption' color={colors.text.muted}>
                            Continuez comme ça ! 💪
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    </CardContent>
                  </SidebarCard>
                </Box>
              )}

              {/* ZONE DE CONTENU PRINCIPAL */}
              <GlassCard sx={{ 
                flex: 1, 
                minHeight: '100%',
                width: isMobile && sidebarOpen ? '100%' : 'auto'
              }}>
                <Stack spacing={4} sx={{ height: '100%' }}>
                  {/* En-tête du contenu actuel */}
                  <Box>
                    <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
                      <Chip
                        label={contenu.type?.toUpperCase()}
                        sx={{
                          bgcolor: colors.red,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          px: 1,
                        }}
                      />
                      {isCompleted && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label='TERMINÉ'
                          sx={{
                            bgcolor: `${colors.success}20`,
                            color: colors.success,
                            fontWeight: 700,
                            border: `1px solid ${colors.success}`,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant={isSmallMobile ? 'h4' : 'h3'}
                      color={colors.text.primary}
                      fontWeight={800}
                      sx={{ 
                        mb: 2, 
                        fontSize: { 
                          xs: '1.5rem', 
                          sm: '2rem', 
                          md: '2.5rem' 
                        },
                        wordBreak: 'break-word'
                      }}
                    >
                      {contenu.titre}
                    </Typography>

                    {contenu.description && (
                      <Typography
                        variant='body1'
                        color={colors.text.secondary}
                        sx={{ lineHeight: 1.8 }}
                      >
                        {contenu.description}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ borderColor: colors.borderLight }} />

                  {/* Conteneur du média */}
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      bgcolor: colors.deepSpace,
                      boxShadow: `0 20px 60px ${colors.navy}80`,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {contenu.type === 'video' && (
                      <VideoPlayer videoUrl={contenu.url} onEnded={handleVideoEnd} />
                    )}
                    {contenu.type === 'document' && <DocumentViewer pdfUrl={contenu.url} />}
                    {contenu.type === 'quiz' && (
                      <QuizComponent
                        questions={contenu.questions || []}
                        onSubmit={handleComplete}
                      />
                    )}
                  </Box>

                  {/* Barre de navigation */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent='space-between'
                    alignItems='center'
                    spacing={2}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: '16px',
                      bgcolor: colors.glass,
                      border: `1px solid ${colors.borderLight}`,
                    }}
                  >
                    <NavButton
                      startIcon={<ArrowLeftIcon />}
                      onClick={() => navigateToContent('prev')}
                      disabled={currentIndex === 0}
                      sx={{ 
                        minWidth: { xs: '100%', sm: 140 },
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
                      {!isCompleted && contenu.type !== 'quiz' && (
                        <CompleteButton
                          onClick={handleComplete}
                          disabled={completing}
                          completed={false}
                          startIcon={
                            completing ? (
                              <CircularProgress size={20} sx={{ color: 'white' }} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          {completing ? 'En cours...' : 'Marquer comme terminé'}
                        </CompleteButton>
                      )}

                      {isCompleted && (
                        <CompleteButton 
                          completed={true} 
                          disabled 
                          startIcon={<AwardIcon />}
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          Contenu terminé
                        </CompleteButton>
                      )}
                    </Box>

                    <NavButton
                      endIcon={<ArrowRightIcon />}
                      onClick={() => navigateToContent('next')}
                      disabled={currentIndex === contenus.length - 1}
                      sx={{ 
                        minWidth: { xs: '100%', sm: 140 },
                        order: { xs: 3, sm: 3 }
                      }}
                    >
                      Suivant
                    </NavButton>
                  </Stack>
                </Stack>
              </GlassCard>
            </Box>
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
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(CoursePlayer);