// src/components/instructor/ManageCourses.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  CircularProgress,
  Alert,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  IconButton,
  Stack,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  BookOpen,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Search,
  Plus,
  Filter,
  Eye,
  AlertCircle,
} from 'lucide-react';

// === ANIMATIONS ===
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(241, 53, 68, 0.3); }
  50% { box-shadow: 0 0 30px rgba(241, 53, 68, 0.6); }
`;

// === COULEURS ===
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  darkNavy: '#00072d',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(1, 11, 64, 0.6)',
  border: 'rgba(241, 53, 68, 0.2)',
};

const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  padding: theme.spacing(3.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 50px ${colors.navy}80`,
    borderColor: `${colors.red}66`,
  },
}));

const StatCard = styled(Box)(({ theme, color = colors.red }) => ({
  background: `linear-gradient(135deg, ${color}15, ${color}08)`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: `1px solid ${color}33`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: `${color}66`,
    boxShadow: `0 12px 30px ${color}33`,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 10px 25px ${colors.red}4d`,
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.9rem',
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `${colors.red}1a`,
    borderColor: colors.red,
    transform: 'translateY(-2px)',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: `${colors.glass}`,
    borderRadius: '16px',
    color: '#ffffff',
    '& fieldset': {
      borderColor: colors.border,
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: `${colors.red}40`,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.red,
      boxShadow: `0 0 20px ${colors.red}30`,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.red,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: `${colors.red}10`,
    transform: 'scale(1.01)',
  },
  '& td, & th': {
    border: 'none',
    padding: theme.spacing(2),
    color: '#ffffff',
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

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchCourses(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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
      APPROVED: { color: colors.success, label: 'Approuvé' },
      PENDING: { color: colors.warning, label: 'En attente' },
      REJECTED: { color: colors.red, label: 'Rejeté' },
      DRAFT: { color: colors.info, label: 'Brouillon' },
    };
    const config = configs[status] || configs.DRAFT;
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: `${config.color}33`,
          color: config.color,
          fontWeight: 600,
          fontSize: '0.8rem',
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
        }}
      >
        <CircularProgress
          size={70}
          thickness={4}
          sx={{ color: colors.red, animation: `${pulseGlow} 2s infinite` }}
        />
        <Typography sx={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 600, mt: 3 }}>
          Chargement des cours...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.darkNavy})`,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      {/* En-tête */}
      <Fade in timeout={800}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: { xs: 4, sm: 6 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(135deg, #ffffff, #ff6b74)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gestion des Cours
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 500,
              }}
            >
              Gérez vos cours et suivez leur performance
            </Typography>
          </Box>
          <ActionButton onClick={() => navigate('/instructor/courses/create')} startIcon={<Plus size={18} />}>
            Créer un Cours
          </ActionButton>
        </Box>
      </Fade>

      {/* Alertes */}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            bgcolor: `${colors.success}15`,
            color: colors.success,
            borderRadius: '12px',
            border: `1px solid ${colors.success}33`,
          }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            bgcolor: `${colors.red}15`,
            color: colors.red,
            borderRadius: '12px',
            border: `1px solid ${colors.red}33`,
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        <Grid item xs={12} sm={4}>
          <StatCard color={colors.red}>
            <BookOpen size={36} color={colors.red} style={{ marginBottom: '16px' }} />
            <Typography sx={{ color: colors.red, fontWeight: 800, fontSize: '2.2rem', mb: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
              Total Cours
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard color={colors.purple}>
            <Users size={36} color={colors.purple} style={{ marginBottom: '16px' }} />
            <Typography sx={{ color: colors.purple, fontWeight: 800, fontSize: '2.2rem', mb: 0.5 }}>
              {stats.students}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
              Étudiants
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard color={colors.success}>
            <TrendingUp size={36} color={colors.success} style={{ marginBottom: '16px' }} />
            <Typography sx={{ color: colors.success, fontWeight: 800, fontSize: '2.2rem', mb: 0.5 }}>
              {stats.approved}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
              Approuvés
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* Recherche et Filtres */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <SearchField
          placeholder="Rechercher un cours..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="rgba(255, 255, 255, 0.5)" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Filtrer par statut</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Filtrer par statut"
            sx={{
              backgroundColor: colors.glass,
              color: '#ffffff',
              borderRadius: '16px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border,
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: `${colors.red}40`,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.red,
              },
            }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="APPROVED">Approuvé</MenuItem>
            <MenuItem value="PENDING">En attente</MenuItem>
            <MenuItem value="REJECTED">Rejeté</MenuItem>
            <MenuItem value="DRAFT">Brouillon</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Tableau */}
      <DashboardCard elevation={0}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            mb: 3,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Filter size={28} color={colors.red} />
          Liste des Cours ({filteredCourses.length})
        </Typography>
        {filteredCourses.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>Titre</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>Niveau</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>Étudiants</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <StyledTableRow key={course._id}>
                      <TableCell>
                        <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>{course.titre}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.niveau}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(course.statutApprobation)}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {course.etudiantsInscrits?.length || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Modifier">
                            <IconButton
                              component={Link}
                              to={`/instructor/courses/edit/${course._id}`}
                              size="small"
                              sx={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                '&:hover': { background: `${colors.red}30` },
                              }}
                            >
                              <Edit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(course)}
                              sx={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                '&:hover': { background: 'rgba(239, 68, 68, 0.3)' },
                              }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#ffffff',
                      '&.Mui-selected': {
                        background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                        color: '#ffffff',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5, color: 'rgba(255, 255, 255, 0.5)' }}>
            <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
              Aucun cours trouvé
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', mb: 3 }}>
              Créez un nouveau cours pour commencer
            </Typography>
            <ActionButton onClick={() => navigate('/instructor/courses/create')} startIcon={<Plus size={18} />}>
              Créer mon premier cours
            </ActionButton>
          </Box>
        )}
      </DashboardCard>

      {/* Dialog de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${colors.glass}, ${colors.glassDark})`,
            backdropFilter: 'blur(30px)',
            color: '#ffffff',
            borderRadius: '24px',
            border: `1px solid ${colors.border}`,
            minWidth: '400px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AlertCircle size={28} color={colors.red} />
          Confirmer la Suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
            Êtes-vous sûr de vouloir supprimer le cours{' '}
            <Box component="span" sx={{ color: colors.red, fontWeight: 700 }}>
              "{courseToDelete?.titre}"
            </Box>{' '}
            ?<br /><br />
            ⚠️ Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <SecondaryButton onClick={handleDeleteCancel}>Annuler</SecondaryButton>
          <Button
            onClick={handleDeleteConfirm}
            sx={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              '&:hover': { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCourses;