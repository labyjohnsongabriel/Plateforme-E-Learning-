import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const CoursesContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${
    colors.lightNavy || '#1a237e'
  })`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
}));

const CoursesCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}cc, ${
    colors.lightNavy || '#1a237e'
  }cc)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  padding: theme.spacing(4),
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${colors.navy || '#010b40'}33`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${
    colors.lightFuschia || '#ff6b74'
  })`,
  borderRadius: '12px',
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: '1.1rem',
  textTransform: 'none',
  boxShadow: `0 4px 16px ${colors.fuschia || '#f13544'}4d`,
  color: colors.white || '#ffffff',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}cc, ${
      colors.lightFuschia || '#ff6b74'
    }cc)`,
    boxShadow: `0 6px 20px ${colors.fuschia || '#f13544'}66`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}80, ${
      colors.lightFuschia || '#ff6b74'
    }80)`,
    cursor: 'not-allowed',
  },
}));

const Courses = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vérification des droits admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      setError('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.');
      setTimeout(() => navigate('/unauthorized'), 1000);
    }
  }, [user, authLoading, navigate]);

  // Chargement des cours
  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (mounted && Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          setCourses([]);
          setError('Les données des cours ne sont pas au format attendu.');
        }
      } catch (err) {
        if (mounted)
          setError(err.response?.data?.message || 'Erreur lors de la récupération des cours');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') {
      fetchCourses();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  // Suppression d'un cours
  const handleDelete = async (courseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCourses(courses.filter((c) => c.id !== courseId));
      setSuccess('Cours supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du cours');
    }
  };

  // Filtrage des cours avec sécurité
  const filteredCourses = Array.isArray(courses)
    ? courses.filter((c) => (c.title || '').toLowerCase().includes(search.toLowerCase()))
    : [];

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: colors.white || '#ffffff',
          }}
        >
          <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} size={32} />
          <Typography variant='h5'>Chargement des cours...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <CoursesContainer>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.fuschia || '#f13544'}1a 1px, transparent 1px),
            linear-gradient(90deg, ${colors.fuschia || '#f13544'}1a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 60,
          right: 30,
          width: 100,
          height: 100,
          background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
          borderRadius: '50%',
          opacity: 0.15,
          animation: `${floatingAnimation} 4s ease-in-out infinite`,
        }}
      />
      <Container maxWidth='xl'>
        <CoursesCard elevation={4}>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 600,
              color: colors.white || '#ffffff',
              textAlign: 'center',
              mb: 4,
            }}
          >
            Gestion des Cours
          </Typography>
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          <TextField
            label='Rechercher un cours'
            variant='outlined'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: `${colors.fuschia || '#f13544'}4d`,
                },
                '&:hover fieldset': {
                  borderColor: colors.fuschia || '#f13544',
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.fuschia || '#f13544',
                },
                borderRadius: '8px',
                color: colors.white || '#ffffff',
              },
              '& .MuiInputLabel-root': {
                color: `${colors.white || '#ffffff'}b3`,
                '&.Mui-focused': { color: colors.fuschia || '#f13544' },
              },
              '& .MuiInputBase-input': { color: colors.white || '#ffffff' },
            }}
          />
          <TableContainer component={Paper} sx={{ background: 'transparent' }}>
            <Table sx={{ minWidth: 650 }} aria-label='Tableau des cours'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 600 }}>
                    Titre
                  </TableCell>
                  <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 600 }}>
                    Créateur
                  </TableCell>
                  <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 600 }}>
                    Date de création
                  </TableCell>
                  <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell sx={{ color: colors.white || '#ffffff' }}>
                        {course.title || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: colors.white || '#ffffff' }}>
                        {course.creator?.name || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: colors.white || '#ffffff' }}>
                        {course.createdAt
                          ? new Date(course.createdAt).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                          sx={{ color: colors.lightFuschia || '#ff6b74' }}
                          aria-label={`Modifier le cours ${course.title || 'N/A'}`}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(course.id)}
                          sx={{ color: colors.fuschia || '#f13544' }}
                          aria-label={`Supprimer le cours ${course.title || 'N/A'}`}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ color: colors.white || '#ffffff', textAlign: 'center' }}
                    >
                      Aucun cours trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <StyledButton
            variant='contained'
            onClick={() => navigate('/admin/courses/add')}
            sx={{ mt: 4 }}
            aria-label='Ajouter un nouveau cours'
          >
            Ajouter un cours
          </StyledButton>
        </CoursesCard>
      </Container>
    </CoursesContainer>
  );
};

export default Courses;
