
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
  levelALFA: {
    gradient: `linear-gradient(135deg, ${colors.red} 0%, ${colors.pink} 100%)`,
  },
  levelBETA: {
    gradient: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purple}cc 100%)`,
  },
};

const StyledCard = styled(Card)(({ level }) => ({
  background:
    colors[`level${level}`]?.gradient ||
    `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${colors.red}33`,
  borderRadius: '20px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
  maxWidth: '400px', // Increased for larger interface
  margin: '24px', // Increased margin
  overflow: 'hidden',
  position: 'relative',
}));

const CourseCard = ({ course }) => {
  const [domainName, setDomainName] = useState(course.domain || 'Chargement...');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDomain = async () => {
      if (course.domaineId && !course.domain) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/domaine/${course.domaineId}`);
          setDomainName(response.data.nom || 'Domaine inconnu');
        } catch (err) {
          setError('Erreur lors du chargement du domaine');
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
        if (token) {
          const response = await axios.get(`${API_BASE_URL}/learning/progress/${course._id || course.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProgress(response.data.pourcentage || 0);
        }
      } catch (err) {
        console.error('Erreur progression:', err);
        setError('Erreur lors du chargement de la progression');
      }
    };
    fetchProgress();
  }, [course._id, course.id]);

  if (loading) {
    return <CircularProgress sx={{ color: colors.red }} />;
  }

  return (
    <Fade in timeout={1000}>
      <StyledCard level={course.niveau || course.level}>
        <CardContent sx={{ p: 4 }}> {/* Increased padding */}
          {course.isCertifying && (
            <Tooltip title='Cours certifiant'>
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: colors.red,
                  borderRadius: '50%',
                  p: 1,
                }}
              >
                <Award size={20} color='#ffffff' />
              </Box>
            </Tooltip>
          )}
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#ffffff', mb: 2, fontSize: '1.6rem', lineHeight: 1.3 }} {/* Larger font */}
          >
            {course.titre || course.title}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<BookOpen size={16} color={colors.red} />}
              label={`Niveau: ${course.niveau || course.level}`}
              size='small'
              sx={{
                backgroundColor: `${colors.navy}33`,
                color: '#ffffff',
                fontWeight: 500,
                mr: 1,
                fontSize: '1rem', // Larger font
              }}
            />
            <Chip
              label={`Domaine: ${domainName}`}
              size='small'
              sx={{
                backgroundColor: `${colors.navy}33`,
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '1rem', // Larger font
              }}
            />
          </Box>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem', // Larger font
              lineHeight: 1.5,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description || 'Description du cours à venir...'}
          </Typography>
          {progress !== null && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#ffffff', fontSize: '1rem', mb: 1 }}> {/* Larger */}
                Progression: {progress}%
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
              fontSize: '1.2rem', // Larger font
              textTransform: 'none',
              boxShadow: `0 8px 32px ${colors.red}4d`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 40px ${colors.red}66`,
              },
            }}
            endIcon={<ArrowRight size={20} />}
            aria-label={`Commencer le cours ${course.titre || course.title}`}
          >
            {progress > 0 ? 'Continuer' : 'Commencer'}
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </StyledCard>
    </Fade>
  );
};

export default React.memo(CourseCard);