import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  Chip,
  Avatar,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stack,
  Grid,
  Fade,
  alpha,
  useTheme,
  Snackbar,
  Switch,
} from '@mui/material';
import {
  Delete,
  Edit,
  Visibility,
  Add,
  Search,
  School,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const CoursesContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'} 0%, ${colors.lightNavy || '#1a237e'} 100%)`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.navy || '#010b40', 0.8)}, ${alpha(colors.lightNavy || '#1a237e', 0.8)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(colors.fuschia || '#f13544', 0.2)}`,
  borderRadius: 16,
  padding: theme.spacing(2),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${alpha(colors.fuschia || '#f13544', 0.3)}`,
    borderColor: alpha(colors.fuschia || '#f13544', 0.5),
  },
}));

const TableCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.navy || '#010b40', 0.95)}, ${alpha(colors.lightNavy || '#1a237e', 0.95)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(colors.fuschia || '#f13544', 0.2)}`,
  borderRadius: 20,
  padding: theme.spacing(3),
  boxShadow: `0 20px 60px ${alpha('#000', 0.3)}`,
  animation: `${fadeInUp} 0.8s ease-out`,
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: colors.white || '#ffffff',
  fontWeight: 600,
  fontSize: '0.95rem',
  borderBottom: `1px solid ${alpha(colors.fuschia || '#f13544', 0.1)}`,
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: { fontSize: '0.85rem', padding: theme.spacing(1) },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(colors.fuschia || '#f13544', 0.08),
    transform: 'scale(1.01)',
  },
  '&:last-child td': { borderBottom: 0 },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: colors.white || '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'scale(1.2) rotate(10deg)' },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: `0 8px 24px ${alpha(colors.fuschia || '#f13544', 0.4)}`,
  color: colors.white || '#ffffff',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}dd, ${colors.lightFuschia || '#ff6b74'}dd)`,
    boxShadow: `0 12px 32px ${alpha(colors.fuschia || '#f13544', 0.6)}`,
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(1, 2), fontSize: '0.9rem' },
}));

const Courses = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  // State management
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    domaineId: '',
    niveau: '',
    duree: '',
    estPublie: false,
    statutApprobation: 'PENDING',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [domaines, setDomaines] = useState([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);

  // Vérification admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      setError('Accès réservé aux administrateurs');
      setTimeout(() => navigate('/unauthorized'), 2000);
    }
  }, [user, authLoading, navigate]);

  // Récupération des domaines (clés étrangères pour domaineId)
  const fetchDomaines = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await axios.get('http://localhost:3001/api/courses/domaine', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Assurer que les domaines sont un tableau et mapper correctement les IDs
      const domainesData = Array.isArray(response.data) ? response.data : [];
      setDomaines(
        domainesData.map((domaine) => ({
          ...domaine,
          _id: domaine._id.toString(), // Normaliser l'ID en string pour éviter les problèmes de comparaison
        }))
      );
    } catch (err) {
      console.error('Erreur lors du chargement des domaines:', err);
      setError('Erreur lors du chargement des domaines');
    }
  }, [user]);

  // Récupération des cours
  const fetchCourses = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/courses', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const coursesData = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];
      // Normalisation des données pour cohérence avec le schéma backend
      const normalizedCourses = coursesData.map((course) => ({
        ...course,
        _id: course._id.toString(), // Normaliser l'ID
        titre: course.title || course.titre || 'Sans titre',
        niveau: course.level || course.niveau || 'N/A',
        createur: course.instructorId || course.createur || null,
        estPublie:
          course.isPublished !== undefined ? course.isPublished : course.estPublie || false,
        domaineId: course.domaineId?._id
          ? { _id: course.domaineId._id.toString(), nom: course.domaineId.nom }
          : { _id: course.domaineId?.toString() || null, nom: 'Domaine non défini' },
        duree: course.duree || course.price || 0,
        contenu: course.modules || course.contenu || [],
        statutApprobation: course.statutApprobation || 'PENDING',
      }));
      setCourses(normalizedCourses);
      setFilteredCourses(normalizedCourses);
      setStats({
        total: normalizedCourses.length,
        published: normalizedCourses.filter((c) => c.estPublie).length,
        draft: normalizedCourses.filter((c) => !c.estPublie).length,
        pending: normalizedCourses.filter((c) => c.statutApprobation === 'PENDING').length,
        approved: normalizedCourses.filter((c) => c.statutApprobation === 'APPROVED').length,
        rejected: normalizedCourses.filter((c) => c.statutApprobation === 'REJECTED').length,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDomaines();
      fetchCourses();
    }
  }, [user, fetchDomaines, fetchCourses]);

  // Filtrage des cours
  useEffect(() => {
    let filtered = [...courses];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.titre || '').toLowerCase().includes(searchLower) ||
          (c.description || '').toLowerCase().includes(searchLower) ||
          (c.domaineId?.nom || '').toLowerCase().includes(searchLower)
      );
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((c) =>
        statusFilter === 'PUBLISHED' ? c.estPublie : !c.estPublie
      );
    }
    if (approvalFilter !== 'ALL') {
      filtered = filtered.filter((c) => c.statutApprobation === approvalFilter);
    }
    setFilteredCourses(filtered);
    setPage(0);
  }, [search, statusFilter, approvalFilter, courses]);

  // Gestion de la modale (création/édition)
  const openModal = (mode, course = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && course?._id) {
      setEditingCourse(course);
      setFormData({
        titre: course.titre || '',
        description: course.description || '',
        domaineId: course.domaineId?._id || '',
        niveau: course.niveau || '',
        duree: course.duree?.toString() || '',
        estPublie: !!course.estPublie,
        statutApprobation: course.statutApprobation || 'PENDING',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        titre: '',
        description: '',
        domaineId: '',
        niveau: '',
        duree: '',
        estPublie: false,
        statutApprobation: 'PENDING',
      });
    }
    setModalOpen(true);
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.titre.trim()) return 'Le titre est requis';
    if (!formData.domaineId) return 'Le domaine est requis';
    if (!formData.niveau) return 'Le niveau est requis';
    const dureeNum = parseFloat(formData.duree);
    if (!formData.duree || isNaN(dureeNum) || dureeNum <= 0)
      return 'La durée doit être un nombre positif';
    return '';
  };

  // Soumission du formulaire (création/mise à jour)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      setFormLoading(false);
      return;
    }
    try {
      const data = {
        ...formData,
        duree: parseFloat(formData.duree),
      };
      let response;
      if (modalMode === 'create') {
        response = await axios.post('http://localhost:3001/api/courses', data, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccess('Cours créé avec succès');
      } else if (editingCourse?._id) {
        response = await axios.put(`http://localhost:3001/api/courses/${editingCourse._id}`, data, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccess('Cours mis à jour avec succès');
      } else {
        throw new Error('ID du cours manquant pour la mise à jour');
      }
      // Optionnel: Log la réponse pour débogage
      console.log('Réponse backend:', response.data);
      setSnackbarOpen(true);
      setModalOpen(false);
      fetchCourses(); // Recharger les cours après opération
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire:', err);
      setFormError(err.response?.data?.message || "Erreur lors de l'opération sur le cours");
    } finally {
      setFormLoading(false);
    }
  };

  // Gestion de la suppression
  const handleDeleteClick = (course) => {
    if (!course?._id) {
      setError('ID du cours invalide');
      setSnackbarOpen(true);
      return;
    }
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse?._id) {
      setError('ID du cours invalide');
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/api/courses/${selectedCourse._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('Cours supprimé avec succès');
      setSnackbarOpen(true);
      fetchCourses();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du cours');
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  // Affichage des détails du cours dans la modale
  const handleViewCourse = (course) => {
    if (!course?._id) {
      setError('ID du cours invalide');
      setSnackbarOpen(true);
      return;
    }
    setSelectedCourseDetails(course);
    setDetailsModalOpen(true);
  };

  // Composants utilitaires
  const getStatusChip = (course) => (
    <Chip
      label={course.estPublie ? 'Publié' : 'Brouillon'}
      size='small'
      color={course.estPublie ? 'success' : 'warning'}
      icon={course.estPublie ? <CheckCircle /> : <Schedule />}
    />
  );

  const getApprovalChip = (course) => {
    const colorMap = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error' };
    return (
      <Chip
        label={course.statutApprobation || 'N/A'}
        size='small'
        color={colorMap[course.statutApprobation] || 'default'}
      />
    );
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';

  const getModulesCount = (modules) => (Array.isArray(modules) ? modules.length : 0);

  // Écran de chargement
  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${colors.lightNavy || '#1a237e'})`,
        }}
      >
        <CircularProgress
          sx={{
            color: colors.fuschia || '#f13544',
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <CoursesContainer>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(
            colors.fuschia || '#f13544',
            0.1
          )} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${alpha(
            colors.lightFuschia || '#ff6b74',
            0.1
          )} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth={false} disableGutters>
        <Fade in timeout={800}>
          <Box>
            {/* En-tête */}
            <Box
              sx={{
                p: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant='h3'
                  sx={{
                    fontWeight: 800,
                    color: colors.white || '#ffffff',
                    mb: 1,
                    fontSize: { xs: '1.5rem', md: '2.5rem' },
                  }}
                >
                  Gestion des Cours
                </Typography>
                <Typography
                  variant='body1'
                  sx={{ color: alpha(colors.white || '#ffffff', 0.7), fontWeight: 500 }}
                >
                  Gérez tous les cours de la plateforme d'apprentissage
                </Typography>
              </Box>
              <PrimaryButton startIcon={<Add />} onClick={() => openModal('create')}>
                Ajouter un Cours
              </PrimaryButton>
            </Box>

            {/* Cartes de statistiques */}
            <Grid container spacing={3} sx={{ p: 4, pb: 0 }}>
              {[
                {
                  label: 'Total des Cours',
                  value: stats.total,
                  icon: <School />,
                  color: colors.fuschia || '#f13544',
                },
                {
                  label: 'Cours Publiés',
                  value: stats.published,
                  icon: <CheckCircle />,
                  color: '#10b981',
                },
                {
                  label: 'Cours en Brouillon',
                  value: stats.draft,
                  icon: <Schedule />,
                  color: '#f59e0b',
                },
                {
                  label: "En Attente d'Approbation",
                  value: stats.pending,
                  icon: <Schedule />,
                  color: '#f59e0b',
                },
                {
                  label: 'Cours Approuvés',
                  value: stats.approved,
                  icon: <CheckCircle />,
                  color: '#10b981',
                },
                {
                  label: 'Cours Rejetés',
                  value: stats.rejected,
                  icon: <Schedule />,
                  color: '#ef4444',
                },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={2} key={index}>
                  <StatsCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stat.color, 0.2),
                          width: 56,
                          height: 56,
                          border: `2px solid ${stat.color}`,
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { color: stat.color, fontSize: 28 },
                        })}
                      </Avatar>
                      <Box>
                        <Typography
                          variant='h4'
                          sx={{ color: colors.white || '#ffffff', fontWeight: 800 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </StatsCard>
                </Grid>
              ))}
            </Grid>

            {/* Alertes */}
            {error && (
              <Alert severity='error' sx={{ m: 4 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={4000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity={success ? 'success' : 'error'}
                sx={{ boxShadow: 3 }}
              >
                {success || error}
              </Alert>
            </Snackbar>

            {/* Carte du tableau */}
            <TableCard>
              <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder='Rechercher par titre, description ou domaine...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      color: colors.white || '#ffffff',
                      borderRadius: 3,
                      '& fieldset': { borderColor: alpha(colors.fuschia || '#f13544', 0.3) },
                      '&:hover fieldset': { borderColor: colors.fuschia || '#f13544' },
                      '&.Mui-focused fieldset': { borderColor: colors.fuschia || '#f13544' },
                    },
                    '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search sx={{ color: alpha(colors.white || '#ffffff', 0.5) }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
                    Statut
                  </InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      color: colors.white || '#ffffff',
                      borderRadius: 3,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuschia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuschia || '#f13544',
                      },
                    }}
                  >
                    <MenuItem value='ALL'>Tous les Statuts</MenuItem>
                    <MenuItem value='PUBLISHED'>Publiés</MenuItem>
                    <MenuItem value='DRAFT'>Brouillons</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
                    Approbation
                  </InputLabel>
                  <Select
                    value={approvalFilter}
                    onChange={(e) => setApprovalFilter(e.target.value)}
                    sx={{
                      color: colors.white || '#ffffff',
                      borderRadius: 3,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuschia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuschia || '#f13544',
                      },
                    }}
                  >
                    <MenuItem value='ALL'>Toutes les Approbations</MenuItem>
                    <MenuItem value='PENDING'>En attente</MenuItem>
                    <MenuItem value='APPROVED'>Approuvé</MenuItem>
                    <MenuItem value='REJECTED'>Rejeté</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TableContainer sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(colors.fuschia || '#f13544', 0.1) }}>
                      <StyledTableCell>Titre</StyledTableCell>
                      <StyledTableCell>Domaine</StyledTableCell>
                      <StyledTableCell>Niveau</StyledTableCell>
                      <StyledTableCell>Modules</StyledTableCell>
                      <StyledTableCell>Statut</StyledTableCell>
                      <StyledTableCell>Approbation</StyledTableCell>
                      <StyledTableCell>Durée</StyledTableCell>
                      <StyledTableCell>Créé le</StyledTableCell>
                      <StyledTableCell align='center'>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.length > 0 ? (
                      filteredCourses
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((course) => (
                          <StyledTableRow key={course._id}>
                            <StyledTableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: alpha(colors.fuschia || '#f13544', 0.2),
                                    border: `2px solid ${colors.fuschia || '#f13544'}`,
                                  }}
                                >
                                  <School sx={{ color: colors.fuschia || '#f13544' }} />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}
                                  >
                                    {course.titre}
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    sx={{ color: alpha(colors.white || '#ffffff', 0.6) }}
                                  >
                                    {course.description
                                      ? `${course.description.substring(0, 50)}...`
                                      : 'Pas de description'}
                                  </Typography>
                                </Box>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={course.domaineId?.nom || 'Domaine non défini'}
                                size='small'
                                sx={{
                                  bgcolor: alpha('#3b82f6', 0.2),
                                  color: '#3b82f6',
                                  fontWeight: 600,
                                }}
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={course.niveau || 'N/A'}
                                size='small'
                                sx={{
                                  bgcolor: alpha('#8b5cf6', 0.2),
                                  color: '#8b5cf6',
                                  fontWeight: 600,
                                }}
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={`${getModulesCount(course.contenu)} module(s)`}
                                size='small'
                                sx={{
                                  bgcolor: alpha('#10b981', 0.2),
                                  color: '#10b981',
                                  fontWeight: 600,
                                }}
                              />
                            </StyledTableCell>
                            <StyledTableCell>{getStatusChip(course)}</StyledTableCell>
                            <StyledTableCell>{getApprovalChip(course)}</StyledTableCell>
                            <StyledTableCell sx={{ color: alpha(colors.white || '#ffffff', 0.9) }}>
                              {course.duree ? `${course.duree} h` : 'N/A'}
                            </StyledTableCell>
                            <StyledTableCell sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
                              {formatDate(course.createdAt)}
                            </StyledTableCell>
                            <StyledTableCell align='center'>
                              <Stack direction='row' spacing={1} justifyContent='center'>
                                <Tooltip title='Voir le cours' arrow>
                                  <ActionButton
                                    size='small'
                                    onClick={() => handleViewCourse(course)}
                                    sx={{
                                      bgcolor: alpha('#3b82f6', 0.2),
                                      '&:hover': { bgcolor: alpha('#3b82f6', 0.3) },
                                    }}
                                  >
                                    <Visibility fontSize='small' />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title='Modifier le cours' arrow>
                                  <ActionButton
                                    size='small'
                                    onClick={() => openModal('edit', course)}
                                    sx={{
                                      bgcolor: alpha('#f59e0b', 0.2),
                                      '&:hover': { bgcolor: alpha('#f59e0b', 0.3) },
                                    }}
                                  >
                                    <Edit fontSize='small' />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title='Supprimer le cours' arrow>
                                  <ActionButton
                                    size='small'
                                    onClick={() => handleDeleteClick(course)}
                                    sx={{
                                      bgcolor: alpha('#ef4444', 0.2),
                                      '&:hover': { bgcolor: alpha('#ef4444', 0.3) },
                                    }}
                                  >
                                    <Delete fontSize='small' />
                                  </ActionButton>
                                </Tooltip>
                              </Stack>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={9} align='center'>
                          <Box sx={{ py: 8 }}>
                            <School
                              sx={{
                                fontSize: 64,
                                color: alpha(colors.white || '#ffffff', 0.2),
                                mb: 2,
                              }}
                            />
                            <Typography
                              variant='h6'
                              sx={{ color: alpha(colors.white || '#ffffff', 0.5) }}
                            >
                              Aucun cours trouvé
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component='div'
                count={filteredCourses.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage='Lignes par page'
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                sx={{
                  color: colors.white || '#ffffff',
                  '& .MuiTablePagination-select': { color: colors.white || '#ffffff' },
                  '& .MuiTablePagination-selectIcon': { color: colors.white || '#ffffff' },
                  '& .MuiTablePagination-actions button': { color: colors.white || '#ffffff' },
                }}
              />
            </TableCard>
          </Box>
        </Fade>
      </Container>

      {/* Modale de création/édition */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(
              colors.navy || '#010b40',
              0.98
            )}, ${alpha(colors.lightNavy || '#1a237e', 0.98)})`,
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(colors.fuschia || '#f13544', 0.3)}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
          {modalMode === 'create' ? 'Ajouter un Cours' : 'Modifier le Cours'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity='error' sx={{ mb: 2 }} onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}
          <form onSubmit={handleFormSubmit}>
            <TextField
              label='Titre du Cours'
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              fullWidth
              required
              margin='normal'
              sx={{
                '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) },
                '& .MuiOutlinedInput-root': { color: colors.white || '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.fuschia || '#f13544',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.fuschia || '#f13544',
                },
              }}
            />
            <TextField
              label='Description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
              margin='normal'
              sx={{
                '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) },
                '& .MuiOutlinedInput-root': { color: colors.white || '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.fuschia || '#f13544',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.fuschia || '#f13544',
                },
              }}
            />
            <FormControl fullWidth margin='normal'>
              <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>Domaine</InputLabel>
              <Select
                value={formData.domaineId}
                onChange={(e) => setFormData({ ...formData, domaineId: e.target.value })}
                required
                sx={{
                  color: colors.white || '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.fuschia || '#f13544',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.fuschia || '#f13544',
                  },
                }}
              >
                <MenuItem value=''>
                  <em>Sélectionner un domaine</em>
                </MenuItem>
                {domaines.map((domaine) => (
                  <MenuItem key={domaine._id} value={domaine._id}>
                    {domaine.nom || 'Domaine sans nom'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin='normal'>
              <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>Niveau</InputLabel>
              <Select
                value={formData.niveau}
                onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                required
                sx={{
                  color: colors.white || '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.fuschia || '#f13544',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.fuschia || '#f13544',
                  },
                }}
              >
                <MenuItem value=''>
                  <em>Sélectionner un niveau</em>
                </MenuItem>
                <MenuItem value='Débutant'>Débutant</MenuItem>
                <MenuItem value='Intermédiaire'>Intermédiaire</MenuItem>
                <MenuItem value='Avancé'>Avancé</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label='Durée (heures)'
              value={formData.duree}
              onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
              fullWidth
              type='number'
              inputProps={{ min: 0, step: 0.5 }}
              required
              margin='normal'
              sx={{
                '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) },
                '& .MuiOutlinedInput-root': { color: colors.white || '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.fuschia || '#f13544',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.fuschia || '#f13544',
                },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Switch
                checked={formData.estPublie}
                onChange={(e) => setFormData({ ...formData, estPublie: e.target.checked })}
                color='primary'
              />
              <Typography sx={{ color: colors.white || '#ffffff', ml: 1 }}>Publié</Typography>
            </Box>
            <FormControl fullWidth margin='normal'>
              <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
                Statut d'approbation
              </InputLabel>
              <Select
                value={formData.statutApprobation}
                onChange={(e) => setFormData({ ...formData, statutApprobation: e.target.value })}
                required
                sx={{
                  color: colors.white || '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(colors.fuschia || '#f13544', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.fuschia || '#f13544',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.fuschia || '#f13544',
                  },
                }}
              >
                <MenuItem value='PENDING'>En attente</MenuItem>
                <MenuItem value='APPROVED'>Approuvé</MenuItem>
                <MenuItem value='REJECTED'>Rejeté</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={() => setModalOpen(false)}
            sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant='contained'
            disabled={formLoading}
            sx={{
              background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
              color: colors.white || '#ffffff',
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}dd, ${colors.lightFuschia || '#ff6b74'}dd)`,
              },
            }}
          >
            {formLoading ? (
              <CircularProgress size={24} color='inherit' />
            ) : modalMode === 'create' ? (
              'Créer le Cours'
            ) : (
              'Mettre à jour le Cours'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(
              colors.navy || '#010b40',
              0.98
            )}, ${alpha(colors.lightNavy || '#1a237e', 0.98)})`,
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(colors.fuschia || '#f13544', 0.3)}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
          Confirmer la Suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: alpha(colors.white || '#ffffff', 0.8) }}>
            Êtes-vous sûr de vouloir supprimer le cours "{selectedCourse?.titre || 'N/A'}" ? Cette
            action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{
              background: `linear-gradient(135deg, #ef4444, #dc2626)`,
              color: colors.white || '#ffffff',
              fontWeight: 600,
              '&:hover': { background: `linear-gradient(135deg, #dc2626, #b91c1c)` },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale des détails du cours */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(
              colors.navy || '#010b40',
              0.98
            )}, ${alpha(colors.lightNavy || '#1a237e', 0.98)})`,
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(colors.fuschia || '#f13544', 0.3)}`,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
          Détails du Cours
        </DialogTitle>
        <DialogContent>
          {selectedCourseDetails ? (
            <Box sx={{ color: colors.white || '#ffffff' }}>
              <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
                {selectedCourseDetails.titre || 'Sans titre'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Description :
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: alpha(colors.white || '#ffffff', 0.7), mt: 1 }}
                  >
                    {selectedCourseDetails.description || 'Aucune description disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Domaine :
                  </Typography>
                  <Chip
                    label={selectedCourseDetails.domaineId?.nom || 'Domaine non défini'}
                    size='small'
                    sx={{
                      bgcolor: alpha('#3b82f6', 0.2),
                      color: '#3b82f6',
                      fontWeight: 600,
                      mt: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Niveau :
                  </Typography>
                  <Chip
                    label={selectedCourseDetails.niveau || 'N/A'}
                    size='small'
                    sx={{
                      bgcolor: alpha('#8b5cf6', 0.2),
                      color: '#8b5cf6',
                      fontWeight: 600,
                      mt: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Durée :
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: alpha(colors.white || '#ffffff', 0.7), mt: 1 }}
                  >
                    {selectedCourseDetails.duree ? `${selectedCourseDetails.duree} heures` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Statut :
                  </Typography>
                  {getStatusChip(selectedCourseDetails)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Approbation :
                  </Typography>
                  {getApprovalChip(selectedCourseDetails)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Nombre de modules :
                  </Typography>
                  <Chip
                    label={`${getModulesCount(selectedCourseDetails.contenu)} module(s)`}
                    size='small'
                    sx={{
                      bgcolor: alpha('#10b981', 0.2),
                      color: '#10b981',
                      fontWeight: 600,
                      mt: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9) }}
                  >
                    Date de création :
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: alpha(colors.white || '#ffffff', 0.7), mt: 1 }}
                  >
                    {formatDate(selectedCourseDetails.createdAt)}
                  </Typography>
                </Grid>
                {selectedCourseDetails.contenu?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle1'
                      sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9), mt: 2 }}
                    >
                      Modules :
                    </Typography>
                    <Box sx={{ mt: 1, pl: 2 }}>
                      {selectedCourseDetails.contenu.map((module, index) => (
                        <Typography
                          key={index}
                          variant='body2'
                          sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}
                        >
                          - {module.title || `Module ${index + 1}`}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Typography sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
              Aucun cours sélectionné
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDetailsModalOpen(false)}
            sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}
          >
            Fermer
          </Button>
          <Button
            onClick={() => {
              setDetailsModalOpen(false);
              navigate(`/course/${selectedCourseDetails?._id}`);
            }}
            sx={{
              background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
              color: colors.white || '#ffffff',
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}dd, ${colors.lightFuschia || '#ff6b74'}dd)`,
              },
            }}
          >
            Voir la page complète
          </Button>
        </DialogActions>
      </Dialog>
    </CoursesContainer>
  );
};

export default Courses;
