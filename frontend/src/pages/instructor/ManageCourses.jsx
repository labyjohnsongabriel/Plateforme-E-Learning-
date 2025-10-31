// src/components/instructor/ManageCourses.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  CircularProgress,
  Alert,
  ThemeProvider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  createTheme,
  Tooltip,
  IconButton,
  Stack,
  Avatar,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import {
  School as SchoolIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

// Thème professionnel
const instructorTheme = createTheme({
  palette: {
    primary: {
      main: colors.fuschia || colors.fuchsia || '#f13544',
      light: colors.lightFuschia || colors.lightFuchsia || '#ff6b74',
    },
    secondary: {
      main: colors.navy || '#010b40',
      light: colors.lightNavy || '#1a237e',
    },
    background: {
      default: colors.navy || '#010b40',
      paper: colors.navy || '#010b40',
    },
    text: {
      primary: colors.white || '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
});

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Composants stylisés
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'} 0%, ${colors.lightNavy || '#1a237e'} 100%)`,
  position: 'relative',
  overflow: 'auto',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, ${colors.fuschia || '#f13544'}15 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${colors.lightFuschia || '#ff6b74'}10 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 3s ease infinite`,
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px ${colors.fuschia || '#f13544'}20`,
    border: `1px solid ${colors.fuschia || '#f13544'}40`,
  },
}));

const TableCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(30px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  animation: `${fadeInUp} 0.8s ease-out`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2), borderRadius: '20px' },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
  color: colors.white || '#ffffff',
  borderRadius: '16px',
  padding: '14px 32px',
  fontWeight: 600,
  fontSize: '0.95rem',
  textTransform: 'none',
  boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}40`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${colors.fuschia || '#f13544'}60`,
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  '&:hover': {
    backgroundColor: `${colors.fuschia || '#f13544'}10`,
    transform: 'scale(1.01)',
    boxShadow: `0 4px 12px ${colors.fuschia || '#f13544'}20`,
  },
  '& td, & th': {
    borderBottom: 'none',
    padding: theme.spacing(2.5),
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: `${colors.fuschia || '#f13544'}40`,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.fuschia || '#f13544',
      boxShadow: `0 0 20px ${colors.fuschia || '#f13544'}30`,
    },
  },
  '& .MuiInputBase-input': {
    color: colors.white || '#ffffff',
    padding: '14px 16px',
    fontSize: '0.95rem',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
}));

const ManageCourses = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const itemsPerPage = 8;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const fetchCourses = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError('');
      try {
        if (!user || !user.token) throw new Error('Utilisateur non authentifié');
        const response = await axios.get(`${API_BASE_URL}/instructeurs/${user.id}/courses`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const coursesData = response.data.data || [];
        setCourses(coursesData);

        let filtered = coursesData;
        if (searchQuery) {
          filtered = filtered.filter((course) =>
            course.titre.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (statusFilter) {
          filtered = filtered.filter((course) => course.statutApprobation === statusFilter);
        }

        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setFilteredCourses(filtered.slice(startIndex, endIndex));
        setCurrentPage(page);
      } catch (err) {
        console.error('Erreur lors de la récupération des cours:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des cours.');
      } finally {
        setIsLoading(false);
      }
    },
    [user, searchQuery, statusFilter, API_BASE_URL]
  );

  useEffect(() => {
    if (user && user.role === 'ENSEIGNANT') {
      fetchCourses(1);
    }
  }, [user, fetchCourses]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchCourses(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, statusFilter]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchCourses(value);
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!user || !user.token) throw new Error('Utilisateur non authentifié');
      await axios.delete(`${API_BASE_URL}/instructeurs/${user.id}/courses/${courseToDelete._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('Cours supprimé avec succès !');
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      fetchCourses(currentPage);
    } catch (err) {
      console.error('Erreur lors de la suppression du cours:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du cours.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const getStatusChip = (status) => {
    const configs = {
      APPROVED: {
        icon: <ApprovedIcon sx={{ fontSize: 16 }} />,
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        label: 'Approuvé',
      },
      PENDING: {
        icon: <PendingIcon sx={{ fontSize: 16 }} />,
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        label: 'En attente',
      },
      REJECTED: {
        icon: <RejectedIcon sx={{ fontSize: 16 }} />,
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        label: 'Rejeté',
      },
      DRAFT: {
        icon: null,
        gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
        label: 'Brouillon',
      },
    };
    const config = configs[status] || configs.DRAFT;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        sx={{
          background: config.gradient,
          color: colors.white || '#ffffff',
          fontWeight: 600,
          fontSize: '0.85rem',
          padding: '4px 8px',
          height: 'auto',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      />
    );
  };

  const stats = {
    total: courses.length,
    students: courses.reduce((acc, c) => acc + (c.etudiantsInscrits?.length || 0), 0),
    approved: courses.filter((c) => c.statutApprobation === 'APPROVED').length,
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${colors.lightNavy || '#1a237e'})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ color: colors.white || '#ffffff', fontSize: '1.1rem', fontWeight: 500 }}>
          Chargement des cours...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={instructorTheme}>
      <DashboardContainer>
        {/* Éléments de fond décoratifs */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${colors.fuschia || '#f13544'}15, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: `${float} 10s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            background: `radial-gradient(circle, ${colors.lightFuschia || '#ff6b74'}10, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(100px)',
            animation: `${float} 12s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth='xl' sx={{ py: 5, position: 'relative', zIndex: 1 }}>
          {/* En-tête moderne */}
          <Box sx={{ mb: 6, animation: `${scaleIn} 0.5s ease-out` }}>
            <Stack direction='row' spacing={3} alignItems='center' flexWrap='wrap' mb={2}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
                  boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}40`,
                }}
              >
                <SchoolIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='h3'
                  sx={{
                    color: colors.white || '#ffffff',
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                    mb: 1,
                    fontWeight: 700,
                  }}
                >
                  Gestion des Cours
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.1rem',
                    fontWeight: 400,
                  }}
                >
                  Gérez vos cours et suivez leur performance
                </Typography>
              </Box>
              <ModernButton
                component={Link}
                to='/instructor/courses/create'
                startIcon={<AddIcon />}
                sx={{ height: 'fit-content' }}
              >
                Créer un Cours
              </ModernButton>
            </Stack>
          </Box>

          {/* Statistiques */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard sx={{ animationDelay: '0.1s' }}>
                <Stack spacing={2}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        background: `${colors.fuschia || '#f13544'}20`,
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 32, color: colors.fuschia || '#f13544' }} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 0.5 }}
                      >
                        Total Cours
                      </Typography>
                      <Typography variant='h4' sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
                        {stats.total}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard sx={{ animationDelay: '0.2s' }}>
                <Stack spacing={2}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        background: `${colors.fuschia || '#f13544'}20`,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 32, color: colors.fuschia || '#f13544' }} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 0.5 }}
                      >
                        Étudiants
                      </Typography>
                      <Typography variant='h4' sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
                        {stats.students}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard sx={{ animationDelay: '0.3s' }}>
                <Stack spacing={2}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        background: `${colors.fuschia || '#f13544'}20`,
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 32, color: colors.fuschia || '#f13544' }} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', mb: 0.5 }}
                      >
                        Approuvés
                      </Typography>
                      <Typography variant='h4' sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
                        {stats.approved}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Recherche et Filtres */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <SearchField
              placeholder='Rechercher un cours...'
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&.Mui-focused': { color: colors.fuschia || '#f13544' },
                }}
              >
                Filtrer par statut
              </InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label='Filtrer par statut'
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: colors.white || '#ffffff',
                  borderRadius: '16px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '2px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${colors.fuschia || '#f13544'}40`,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.fuschia || '#f13544',
                  },
                }}
              >
                <MenuItem value=''>Tous</MenuItem>
                <MenuItem value='APPROVED'>Approuvé</MenuItem>
                <MenuItem value='PENDING'>En attente</MenuItem>
                <MenuItem value='REJECTED'>Rejeté</MenuItem>
                <MenuItem value='DRAFT'>Brouillon</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Message de succès */}
          {success && (
            <Alert
              severity='success'
              sx={{
                mb: 4,
                background: 'rgba(16, 185, 129, 0.1)',
                backdropFilter: 'blur(10px)',
                color: colors.white || '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                '& .MuiAlert-icon': { color: '#10b981' },
              }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {/* Message d'erreur */}
          {error && (
            <Alert
              severity='error'
              sx={{
                mb: 4,
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(10px)',
                color: colors.white || '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '& .MuiAlert-icon': { color: '#ef4444' },
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Tableau des cours */}
          <TableCard elevation={0}>
            <Typography
              variant='h5'
              sx={{
                color: colors.white || '#ffffff',
                mb: 4,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <FilterIcon sx={{ color: colors.fuschia || '#f13544' }} />
              Liste des Cours ({filteredCourses.length})
            </Typography>
            {filteredCourses.length > 0 ? (
              <TableContainer sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <TableCell
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          py: 2.5,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Titre
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Niveau
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Statut
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Étudiants
                      </TableCell>
                      <TableCell
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.map((course, index) => (
                      <StyledTableRow
                        key={course._id}
                        sx={{
                          animation: `${fadeInUp} ${0.3 + index * 0.1}s ease-out`,
                        }}
                      >
                        <TableCell>
                          <Stack direction='row' spacing={1.5} alignItems='center'>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                background: `${colors.fuschia || '#f13544'}20`,
                                color: colors.fuschia || '#f13544',
                              }}
                            >
                              <SchoolIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography sx={{ color: colors.white || '#ffffff', fontWeight: 500 }}>
                              {course.titre}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={course.niveau}
                            size='small'
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: colors.white || '#ffffff',
                              fontWeight: 500,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                          />
                        </TableCell>
                        <TableCell>{getStatusChip(course.statutApprobation)}</TableCell>
                        <TableCell>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <PeopleIcon sx={{ fontSize: 18, color: colors.fuschia || '#f13544' }} />
                            <Typography sx={{ color: colors.white || '#ffffff', fontWeight: 500 }}>
                              {course.etudiantsInscrits?.length || 0}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction='row' spacing={1}>
                            <Tooltip title='Modifier' arrow>
                              <IconButton
                                component={Link}
                                to={`/instructor/courses/edit/${course._id}`}
                                size='small'
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: colors.white || '#ffffff',
                                  '&:hover': {
                                    background: `${colors.fuschia || '#f13544'}30`,
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Supprimer' arrow>
                              <IconButton
                                size='small'
                                onClick={() => handleDeleteClick(course)}
                                sx={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  '&:hover': {
                                    background: 'rgba(239, 68, 68, 0.3)',
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `2px dashed rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.3)' }} />
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant='h6'
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    Aucun cours trouvé
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.95rem',
                    }}
                  >
                    Créez un nouveau cours pour commencer
                  </Typography>
                </Box>
                <ModernButton
                  component={Link}
                  to='/instructor/courses/create'
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Créer mon premier cours
                </ModernButton>
              </Box>
            )}
          </TableCard>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                size='large'
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: colors.white || '#ffffff',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '1rem',
                    fontWeight: 500,
                    minWidth: '40px',
                    height: '40px',
                    '&:hover': {
                      background: `${colors.fuschia || '#f13544'}30`,
                      borderColor: `${colors.fuschia || '#f13544'}60`,
                      transform: 'scale(1.05)',
                    },
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
                    borderColor: colors.fuschia || '#f13544',
                    boxShadow: `0 4px 16px ${colors.fuschia || '#f13544'}60`,
                    fontWeight: 700,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}dd, ${colors.lightFuschia || '#ff6b74'}dd)`,
                    },
                  },
                }}
              />
            </Box>
          )}
        </Container>

        {/* Dialog de confirmation de suppression */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(30px) saturate(180%)',
              color: colors.white || '#ffffff',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5)`,
              minWidth: '400px',
            },
          }}
        >
          <DialogTitle
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
              }}
            >
              <DeleteIcon />
            </Avatar>
            Confirmer la Suppression
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: 1.6 }}>
              Êtes-vous sûr de vouloir supprimer le cours{' '}
              <Box
                component='span'
                sx={{
                  color: colors.fuschia || '#f13544',
                  fontWeight: 700,
                  display: 'inline',
                }}
              >
                "{courseToDelete?.titre}"
              </Box>{' '}
              ?
              <br />
              <br />
              <Box component='span' sx={{ color: '#ef4444', fontWeight: 500 }}>
                ⚠️ Cette action est irréversible
              </Box>{' '}
              et supprimera toutes les données associées (étudiants inscrits, progression, etc.).
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
            <Button
              onClick={handleDeleteCancel}
              sx={{
                color: colors.white || '#ffffff',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              sx={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: colors.white || '#ffffff',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Supprimer Définitivement
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default ManageCourses;