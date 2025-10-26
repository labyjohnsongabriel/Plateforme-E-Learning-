import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Fade,
  Chip,
  Box,
  LinearProgress,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Award } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

const StyledCard = styled(Card)(({ level }) => ({
  background: level
    ? `linear-gradient(135deg, ${colors[level]?.start || colors.red} 0%, ${colors[level]?.end || colors.pink} 100%)`
    : `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '20px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
  maxWidth: '400px',
  margin: '24px',
  overflow: 'hidden',
  position: 'relative',
}));

const CourseCard = ({ course }) => {
  const [domainName, setDomainName] = useState(course.domain || 'Chargement...');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Niveau colors mapping
  const levelColors = {
    ALFA: { start: colors.red, end: colors.pink },
    BETA: { start: colors.purple, end: '#a855f7' },
    GAMMA: { start: '#3b82f6', end: '#06b6d4' },
    DELTA: { start: '#10b981', end: '#84cc16' },
  };

  useEffect(() => {
    const fetchDomain = async () => {
      if (course.domaineId && !course.domain) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/domaines/${course.domaineId}`);
          setDomainName(response.data.nom || 'Domaine inconnu');
        } catch (err) {
          console.error('Erreur chargement domaine:', err);
          setDomainName('Domaine inconnu');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDomain();
  }, [course.domaineId, course.domain]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && (course._id || course.id)) {
          const response = await axios.get(
            `${API_BASE_URL}/learning/progress/${course._id || course.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setProgress(response.data?.pourcentage || response.data?.progress || 0);
        }
      } catch (err) {
        console.error('Erreur progression:', err);
        // Ne pas afficher d'erreur pour la progression
      }
    };
    fetchProgress();
  }, [course._id, course.id]);

  const courseLevel = course.niveau || course.level;
  const levelColor = levelColors[courseLevel] || levelColors.ALFA;

  return (
    <Fade in timeout={1000}>
      <StyledCard level={levelColor}>
        <CardContent sx={{ p: 4 }}>
          {course.isCertifying && (
            <Tooltip title='Cours certifiant'>
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: colors.red,
                  borderRadius: '50%',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={20} color='#ffffff' />
              </Box>
            </Tooltip>
          )}

          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              color: '#ffffff',
              mb: 2,
              fontSize: '1.6rem',
              lineHeight: 1.3,
              minHeight: '64px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.titre || course.title || 'Titre non disponible'}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<BookOpen size={16} color={colors.red} />}
              label={`Niveau: ${courseLevel}`}
              size='small'
              sx={{
                backgroundColor: `${colors.navy}33`,
                color: '#ffffff',
                fontWeight: 500,
                mr: 1,
                mb: 1,
                fontSize: '1rem',
              }}
            />
            <Chip
              label={`Domaine: ${domainName}`}
              size='small'
              sx={{
                backgroundColor: `${colors.navy}33`,
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '1rem',
              }}
            />
          </Box>

          <Typography
            variant='body2'
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: 1.5,
              mb: 2,
              minHeight: '80px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description || 'Description du cours à venir...'}
          </Typography>

          {progress > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#ffffff', fontSize: '1rem', mb: 1 }}>
                Progression: {progress}%
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
          )}

          <Button
            component={Link}
            to={`/course/${course._id || course.id}`}
            variant='contained'
            sx={{
              mt: 2,
              background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '1.2rem',
              textTransform: 'none',
              boxShadow: `0 8px 32px ${colors.red}4d`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 40px ${colors.red}66`,
              },
            }}
            endIcon={<ArrowRight size={20} />}
            aria-label={`Voir le cours ${course.titre || course.title}`}
          >
            {progress > 0 ? 'Continuer' : 'Découvrir'}
          </Button>

          {error && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </StyledCard>
    </Fade>
  );
};

export default React.memo(CourseCard);
