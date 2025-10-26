import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
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
  IconButton,
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
} from '@mui/icons-material';

// Custom theme
const instructorTheme = createTheme({
  palette: {
    primary: { main: colors.fuschia || '#f13544', light: colors.lightFuschia || '#ff6b74' },
    secondary: { main: colors.navy || '#010b40', light: colors.lightNavy || '#1a237e' },
    background: {
      default: colors.navy || '#010b40',
      paper: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
    },
    text: { primary: colors.white || '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: '16px' } } },
    MuiPaper: { styleOverrides: { root: { backgroundColor: `${colors.navy || '#010b40'}dd` } } },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': { backgroundColor: colors.white || '#ffffff' },
          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuschia || '#f13544' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { backgroundColor: colors.white || '#ffffff' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { color: colors.white || '#ffffff' },
      },
    },
  },
});

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
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${colors.lightNavy || '#1a237e'})`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const TableCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  animation: `${fadeInUp} 0.6s ease-out`,
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
  color: colors.white || '#ffffff',
  boxShadow: `0 4px 16px ${colors.fuschia || '#f13544'}4d`,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}cc, ${colors.lightFuschia || '#ff6b74'}cc)`,
    boxShadow: `0 6px 20px ${colors.fuschia || '#f13544'}66`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}80, ${colors.lightFuschia || '#ff6b74'}80)`,
    cursor: 'not-allowed',
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
  const itemsPerPage = 5;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const fetchCourses = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      if (!user || !user.token) throw new Error('Utilisateur non authentifié');
      const response = await axios.get(
        `${API_BASE_URL}/instructeurs/${user.id}/courses`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const coursesData = response.data.data || [];
      setCourses(coursesData);

      // Apply filters and pagination
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
  }, [user, searchQuery, statusFilter]);

  useEffect(() => {
    if (user && user.role === 'ENSEIGNANT') {
      fetchCourses(1);
    }
  }, [user, fetchCourses]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    fetchCourses(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
    fetchCourses(1);
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
      await axios.delete(
        `${API_BASE_URL}/instructeurs/${user.id}/courses/${courseToDelete._id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
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
    let icon, color, label;
    switch (status) {
      case 'APPROVED':
        icon = <ApprovedIcon />;
        color = '#4CAF50';
        label = 'Approuvé';
        break;
      case 'PENDING':
        icon = <PendingIcon />;
        color = '#FF9800';
        label = 'En attente';
        break;
      case 'REJECTED':
        icon = <RejectedIcon />;
        color = '#F44336';
        label = 'Rejeté';
        break;
      case 'DRAFT':
        icon = null;
        color = '#9E9E9E';
        label = 'Brouillon';
        break;
      default:
        icon = null;
        color = '#9E9E9E';
        label = status;
    }
    return (
      <Chip
        icon={icon}
        label={label}
        sx={{ bgcolor: color, color: colors.white || '#ffffff', fontWeight: 'bold' }}
      />
    );
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>
          Chargement des cours...
        </Typography>
      </Box>
    );
  }

  if (error && !success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500, bgcolor: `${colors.fuschia || '#f13544'}20` }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={instructorTheme}>
      <DashboardContainer>
        {/* Background Decorations */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${colors.fuschia || '#f13544'}0a 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.05,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 60,
            right: 30,
            width: 120,
            height: 120,
            background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
            borderRadius: '50%',
            opacity: 0.15,
            animation: `${floatingAnimation} 4s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 100,
            left: 50,
            width: 80,
            height: 80,
            background: `linear-gradient(135deg, ${colors.lightFuschia || '#ff6b74'}, ${colors.fuschia || '#f13544'})`,
            borderRadius: '50%',
            opacity: 0.1,
            animation: `${floatingAnimation} 5s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="xl">
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <SchoolIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Box>
              <Typography
                variant="h3"
                sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}
              >
                Gestion des Cours
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Gérer vos cours créés et leur statut
              </Typography>
            </Box>
            <Chip
              label="Instructeur"
              sx={{
                bgcolor: `${colors.fuschia || '#f13544'}33`,
                color: colors.white || '#ffffff',
                border: `1px solid ${colors.fuschia || '#f13544'}`,
              }}
            />
          </Box>

          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Statut</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="APPROVED">Approuvé</MenuItem>
                <MenuItem value="PENDING">En attente</MenuItem>
                <MenuItem value="REJECTED">Rejeté</MenuItem>
                <MenuItem value="DRAFT">Brouillon</MenuItem>
              </Select>
            </FormControl>
            <StyledButton
              component={Link}
              to="/instructor/create-course"
              startIcon={<SchoolIcon />}
            >
              Créer un Cours
            </StyledButton>
          </Box>

          {/* Success Message */}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 4, bgcolor: `${colors.fuschia || '#f13544'}20` }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {/* Courses Table */}
          <TableCard>
            <Typography variant="h6" sx={{ color: colors.white || '#ffffff', mb: 2 }}>
              Liste des Cours
            </Typography>
            {filteredCourses.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}>
                        Titre
                      </TableCell>
                      <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}>
                        Niveau
                      </TableCell>
                      <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}>
                        Statut
                      </TableCell>
                      <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}>
                        Étudiants
                      </TableCell>
                      <TableCell sx={{ color: colors.white || '#ffffff', fontWeight: 'bold' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow
                        key={course._id}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(241, 53, 68, 0.1)',
                          },
                        }}
                      >
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {course.titre}
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {course.niveau}
                        </TableCell>
                        <TableCell>{getStatusChip(course.statutApprobation)}</TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {course.etudiantsInscrits?.length || 0}
                        </TableCell>
                        <TableCell>
                          <StyledButton
                            component={Link}
                            to={`/instructor/edit-course/${course._id}`}
                            startIcon={<EditIcon />}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            Modifier
                          </StyledButton>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            size="small"
                            onClick={() => handleDeleteClick(course)}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
                  Aucun cours trouvé. Créez un nouveau cours pour commencer.
                </Typography>
              </Box>
            )}
          </TableCard>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: colors.white || '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}33`,
                    '&:hover': {
                      bgcolor: `${colors.fuschia || '#f13544'}33`,
                    },
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: colors.fuschia || '#f13544',
                    '&:hover': {
                      backgroundColor: colors.lightFuschia || '#ff6b74',
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
            PaperProps={{
              sx: {
                backgroundColor: colors.navy || '#010b40',
                color: colors.white || '#ffffff',
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle>Confirmer la Suppression</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Êtes-vous sûr de vouloir supprimer le cours "{courseToDelete?.titre}" ? Cette action
                est irréversible.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} sx={{ color: colors.white || '#ffffff' }}>
                Annuler
              </Button>
              <StyledButton onClick={handleDeleteConfirm} color="error">
                Supprimer
              </StyledButton>
            </DialogActions>
          </Dialog>
        </Container>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default ManageCourses;