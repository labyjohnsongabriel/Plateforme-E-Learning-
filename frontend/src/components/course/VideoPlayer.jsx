import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  CircularProgress,
  Button,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  Replay as ReplayIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Couleurs
const colors = {
  primary: '#f13544',
  primaryLight: '#ff6b74',
  background: 'rgba(0, 0, 0, 0.8)',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
};

// Styled Components
const VideoContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  backgroundColor: '#000',
  borderRadius: '12px',
  overflow: 'hidden',
  '&:hover .video-controls': {
    opacity: 1,
  },
});

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  display: 'block',
});

const ControlsOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  padding: '20px',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  animation: `${fadeIn} 0.3s ease`,
});

const ProgressBar = styled(Box)({
  width: '100%',
  height: '6px',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '3px',
  cursor: 'pointer',
  marginBottom: '15px',
  position: 'relative',
  '&:hover': {
    height: '8px',
  },
});

const Progress = styled(Box)({
  height: '100%',
  backgroundColor: colors.primary,
  borderRadius: '3px',
  transition: 'width 0.1s ease',
});

const ControlButton = styled(IconButton)({
  color: colors.text,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const TimeDisplay = styled(Typography)({
  color: colors.textSecondary,
  fontSize: '0.9rem',
  minWidth: '100px',
});

const VideoPlayer = ({ 
  videoUrl, 
  onEnded, 
  onProgress, 
  autoComplete = true,
  title = "Video"
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isFullscreen: false,
    isLoading: true,
    hasError: false,
    showControls: true,
  });

  const controlsTimeoutRef = useRef();

  // Format time helper
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          setPlayerState(prev => ({ ...prev, hasError: true }));
        });
      }
      setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  }, [playerState.isPlaying]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setPlayerState(prev => ({ ...prev, currentTime, duration }));

      // Report progress
      if (onProgress && duration > 0) {
        const progress = (currentTime / duration) * 100;
        onProgress(progress);
      }

      // Auto-complete at 95%
      if (autoComplete && currentTime > 0 && duration > 0 && currentTime / duration > 0.95) {
        onEnded?.();
      }
    }
  }, [onProgress, onEnded, autoComplete]);

  // Handle video end
  const handleEnded = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    onEnded?.();
  }, [onEnded]);

  // Handle seek
  const handleSeek = useCallback((event) => {
    if (videoRef.current && playerState.duration > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * playerState.duration;
    }
  }, [playerState.duration]);

  // Handle volume change
  const handleVolumeChange = useCallback((event) => {
    const volume = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setPlayerState(prev => ({ 
        ...prev, 
        volume, 
        isMuted: volume === 0 
      }));
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const isMuted = !playerState.isMuted;
      videoRef.current.muted = isMuted;
      setPlayerState(prev => ({ ...prev, isMuted }));
    }
  }, [playerState.isMuted]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Skip forward/backward
  const skip = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  // Handle loaded data
  const handleLoadedData = useCallback(() => {
    setPlayerState(prev => ({ 
      ...prev, 
      isLoading: false,
      duration: videoRef.current?.duration || 0 
    }));
  }, []);

  // Handle error
  const handleError = useCallback(() => {
    setPlayerState(prev => ({ ...prev, hasError: true, isLoading: false }));
  }, []);

  // Show controls
  const showControls = useCallback(() => {
    setPlayerState(prev => ({ ...prev, showControls: true }));
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState.isPlaying) {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
  }, [playerState.isPlaying]);

  // Event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleFullscreenChange = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  if (playerState.hasError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Erreur de chargement de la vidéo
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: colors.textSecondary }}>
          Impossible de charger la vidéo. Vérifiez votre connexion internet.
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.open(videoUrl, '_blank')}
          sx={{
            backgroundColor: colors.primary,
            '&:hover': {
              backgroundColor: colors.primaryLight,
            },
          }}
        >
          Ouvrir dans un nouvel onglet
        </Button>
      </Box>
    );
  }

  return (
    <VideoContainer 
      ref={containerRef}
      onMouseMove={showControls}
      onMouseEnter={showControls}
    >
      {/* Video Element */}
      <VideoElement
        ref={videoRef}
        src={videoUrl}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Loading Overlay */}
      {playerState.isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      )}

      {/* Play/Pause Overlay */}
      {!playerState.isPlaying && !playerState.isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}
        >
          <ControlButton
            onClick={togglePlay}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: 'rgba(241, 53, 68, 0.9)',
              animation: `${pulse} 2s infinite`,
              '&:hover': {
                backgroundColor: colors.primary,
              },
            }}
          >
            <PlayIcon sx={{ fontSize: 40 }} />
          </ControlButton>
        </Box>
      )}

      {/* Controls Overlay */}
      {(playerState.showControls || !playerState.isPlaying) && (
        <ControlsOverlay className="video-controls">
          {/* Progress Bar */}
          <ProgressBar onClick={handleSeek}>
            <Progress
              sx={{
                width: `${(playerState.currentTime / playerState.duration) * 100}%`,
              }}
            />
          </ProgressBar>

          {/* Control Buttons */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Play/Pause */}
              <Tooltip title={playerState.isPlaying ? 'Pause' : 'Play'}>
                <ControlButton onClick={togglePlay}>
                  {playerState.isPlaying ? <PauseIcon /> : <PlayIcon />}
                </ControlButton>
              </Tooltip>

              {/* Skip Backward */}
              <Tooltip title="Reculer 10s">
                <ControlButton onClick={() => skip(-10)}>
                  <ReplayIcon />
                </ControlButton>
              </Tooltip>

              {/* Volume Control */}
              <Tooltip title={playerState.isMuted ? 'Activer le son' : 'Désactiver le son'}>
                <ControlButton onClick={toggleMute}>
                  {playerState.isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </ControlButton>
              </Tooltip>

              <Box sx={{ width: 80, display: { xs: 'none', sm: 'block' } }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={playerState.volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: '100%',
                    accentColor: colors.primary,
                  }}
                />
              </Box>

              {/* Time Display */}
              <TimeDisplay>
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </TimeDisplay>
            </Stack>

            <Stack direction="row" spacing={1}>
              {/* Download */}
              <Tooltip title="Télécharger">
                <ControlButton onClick={() => window.open(videoUrl, '_blank')}>
                  <DownloadIcon />
                </ControlButton>
              </Tooltip>

              {/* Fullscreen */}
              <Tooltip title="Plein écran">
                <ControlButton onClick={toggleFullscreen}>
                  <FullscreenIcon />
                </ControlButton>
              </Tooltip>
            </Stack>
          </Stack>
        </ControlsOverlay>
      )}
    </VideoContainer>
  );
};

export default React.memo(VideoPlayer);