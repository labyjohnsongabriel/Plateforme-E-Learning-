import React, { useState, useEffect, useCallback, useContext } from 'react';
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
  Snackbar,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { alpha } from '@mui/material';
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
const UsersContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#0a0a2a'} 0%, ${colors.lightNavy || '#1a237e'} 100%)`,
  padding: theme.spacing(6),
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(3) },
}));

const UsersCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.navy || '#0a0a2a', 0.95)}, ${alpha(colors.lightNavy || '#1a237e', 0.95)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(colors.fuschia || '#f13544', 0.2)}`,
  borderRadius: 20,
  padding: theme.spacing(4),
  boxShadow: `0 20px 60px ${alpha('#000', 0.3)}`,
  animation: `${fadeInUp} 0.8s ease-out`,
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: colors.white || '#ffffff',
  fontWeight: 500,
  fontSize: '1rem',
  borderBottom: `1px solid ${alpha(colors.fuschia || '#f13544', 0.1)}`,
  padding: theme.spacing(2),
  '&:first-of-type': { paddingLeft: theme.spacing(4) },
  [theme.breakpoints.down('sm')]: { fontSize: '0.9rem', padding: theme.spacing(1.5) },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': { backgroundColor: alpha(colors.fuschia || '#f13544', 0.08), transform: 'scale(1.01)' },
  '&:last-child td': { borderBottom: 0 },
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
  '&:disabled': {
    background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}80, ${colors.lightFuschia || '#ff6b74'}80)`,
    color: alpha(colors.white || '#ffffff', 0.6),
  },
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(1, 2), fontSize: '0.9rem' },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: colors.white || '#ffffff',
  transition: 'all 0.3s ease',
  margin: theme.spacing(0, 0.5),
  '&:hover': { transform: 'scale(1.2)', backgroundColor: alpha(colors.fuschia || '#f13544', 0.2) },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: `linear-gradient(135deg, ${alpha(colors.navy || '#0a0a2a', 0.98)}, ${alpha(colors.lightNavy || '#1a237e', 0.98)})`,
    color: colors.white || '#ffffff',
    boxShadow: `0 20px 60px ${alpha('#000', 0.4)}`,
    padding: theme.spacing(2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: colors.white || '#ffffff',
    borderRadius: 8,
    '& fieldset': { borderColor: alpha(colors.fuschia || '#f13544', 0.3) },
    '&:hover fieldset': { borderColor: colors.fuschia || '#f13544' },
    '&.Mui-focused fieldset': { borderColor: colors.fuschia || '#f13544' },
  },
  '& .MuiInputLabel-root': {
    color: alpha(colors.white || '#ffffff', 0.7),
    '&.Mui-focused': { color: colors.fuschia || '#f13544' },
  },
}));

const Users = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', password: '', role: 'ETUDIANT' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      setError('Accès réservé aux administrateurs');
      setTimeout(() => navigate('/unauthorized'), 2000);
    }
  }, [user, authLoading, navigate]);

  const fetchUsers = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3001/api/admin/users', { headers: { Authorization: `Bearer ${user.token}` } });
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Erreur fetchUsers:', err);
      const errorMessage = err.response?.status === 401 ? 'Session expirée. Veuillez vous reconnecter.' : err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
      if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const filtered = users.filter(u => `${u.nom || ''} ${u.prenom || ''}`.toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()));
    setFilteredUsers(filtered);
    setPage(0);
  }, [search, users]);

  const openAddModal = () => {
    setFormData({ nom: '', prenom: '', email: '', password: '', role: 'ETUDIANT' });
    setFormError('');
    setAddModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ nom: user.nom || '', prenom: user.prenom || '', email: user.email || '', password: '', role: user.role || 'ETUDIANT' });
    setFormError('');
    setEditModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const validateForm = (isEdit = false) => {
    if (!formData.nom) return 'Le nom est requis';
    if (!formData.prenom) return 'Le prénom est requis';
    if (!formData.email) return "L'email est requis";
    if (!isEdit && !formData.password) return 'Le mot de passe est requis pour la création';
    if (!formData.role) return 'Le rôle est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "L'email est invalide";
    if (!isEdit && formData.password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    return '';
  };

  const handleFormSubmit = async (isEdit) => {
    setFormError('');
    setFormLoading(true);
    const validationError = validateForm(isEdit);
    if (validationError) {
      setFormError(validationError);
      setFormLoading(false);
      return;
    }
    try {
      const data = { nom: formData.nom, prenom: formData.prenom, email: formData.email, role: formData.role };
      if (!isEdit || formData.password) data.password = formData.password;
      if (isEdit) {
        await axios.put(`http://localhost:3001/api/admin/users/${selectedUser._id}`, data, { headers: { Authorization: `Bearer ${user.token}` } });
        setSuccess('Utilisateur mis à jour avec succès');
      } else {
        await axios.post('http://localhost:3001/api/admin/users', data, { headers: { Authorization: `Bearer ${user.token}` } });
        setSuccess('Utilisateur créé avec succès');
      }
      setSnackbarOpen(true);
      setAddModalOpen(false);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Erreur handleFormSubmit:', err);
      const errorMessage = err.response?.status === 409 ? 'Cet email est déjà utilisé' : err.response?.data?.message || "Erreur lors de l'opération";
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/users/${selectedUser._id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setSuccess('Utilisateur supprimé avec succès');
      setSnackbarOpen(true);
      fetchUsers();
    } catch (err) {
      console.error('Erreur handleDeleteConfirm:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: `linear-gradient(135deg, ${colors.navy || '#0a0a2a'}, ${colors.lightNavy || '#1a237e'})` }}>
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>Chargement des utilisateurs...</Typography>
      </Box>
    );
  }

  return (
    <UsersContainer>
      <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${alpha(colors.fuschia || '#f13544', 0.1)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(colors.fuschia || '#f13544', 0.1)} 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.05 }} />
      <Box sx={{ position: 'absolute', bottom: 60, right: 30, width: 120, height: 120, background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`, borderRadius: '50%', opacity: 0.15, animation: `${floatingAnimation} 4s ease-in-out infinite` }} />

      <Container maxWidth={false} disableGutters>
        <UsersCard>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: colors.white || '#ffffff', mb: 1, fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
              Gestion des Utilisateurs
            </Typography>
     {  /*     <PrimaryButton startIcon={<Add />} onClick={openAddModal}>
              Ajouter un Utilisateur
            </PrimaryButton>*/}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

          <TextField
            placeholder="Rechercher par nom, prénom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 300, mb: 4, '& .MuiOutlinedInput-root': { color: colors.white || '#ffffff', borderRadius: 8, '& fieldset': { borderColor: alpha(colors.fuschia || '#f13544', 0.3) }, '&:hover fieldset': { borderColor: colors.fuschia || '#f13544' }, '&.Mui-focused fieldset': { borderColor: colors.fuschia || '#f13544' } }, '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) } }}
            fullWidth
          />

          <TableContainer sx={{ borderRadius: 2, mb: 2, mt: 4, background: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(colors.fuschia || '#f13544', 0.1) }}>
                  <StyledTableCell>Nom</StyledTableCell>
                  <StyledTableCell>Prénom</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Rôle</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <StyledTableRow key={user._id}>
                    <StyledTableCell>{user.nom || 'N/A'}</StyledTableCell>
                    <StyledTableCell>{user.prenom || 'N/A'}</StyledTableCell>
                    <StyledTableCell>{user.email || 'N/A'}</StyledTableCell>
                    <StyledTableCell>
                      {user.role === 'ETUDIANT' ? 'Étudiant' : user.role === 'ENSEIGNANT' ? 'Enseignant' : user.role === 'ADMIN' ? 'Administrateur' : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Tooltip title="Modifier" arrow>
                        <ActionButton onClick={() => openEditModal(user)} sx={{ bgcolor: alpha('#f59e0b', 0.2), '&:hover': { bgcolor: alpha('#f59e0b', 0.3) } }}>
                          <Edit />
                        </ActionButton>
                      </Tooltip>
                      <Tooltip title="Supprimer" arrow>
                        <ActionButton onClick={() => handleDeleteClick(user)} sx={{ bgcolor: alpha('#ef4444', 0.2), '&:hover': { bgcolor: alpha('#ef4444', 0.3) } }}>
                          <Delete />
                        </ActionButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <StyledTableCell colSpan={5} align="center">
                      Aucun utilisateur trouvé
                    </StyledTableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Lignes par page"
            sx={{ color: colors.white || '#ffffff', '& .MuiTablePagination-select': { color: colors.white || '#ffffff' }, '& .MuiTablePagination-selectIcon': { color: colors.white || '#ffffff' }, '& .MuiTablePagination-actions button': { color: colors.white || '#ffffff' } }}
          />
        </UsersCard>
      </Container>

      {/* Modal Ajout */}
      <StyledDialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colors.white || '#ffffff' }}>Ajouter un Utilisateur</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <StyledTextField label="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} fullWidth required sx={{ mb: 2, mt: 2 }} />
          <StyledTextField label="Prénom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} fullWidth required sx={{ mb: 2 }} />
          <StyledTextField label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth required type="email" sx={{ mb: 2 }} />
          <StyledTextField label="Mot de passe" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} fullWidth required type="password" sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>Rôle</InputLabel>
            <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} sx={{ color: colors.white || '#ffffff', '& .MuiSvgIcon-root': { color: colors.white || '#ffffff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.fuschia || '#f13544', 0.3) }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuschia || '#f13544' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuschia || '#f13544' } }}>
              <MenuItem value="ETUDIANT">Étudiant</MenuItem>
              <MenuItem value="ENSEIGNANT">Enseignant</MenuItem>
              <MenuItem value="ADMIN">Administrateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)} sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>Annuler</Button>
          <PrimaryButton onClick={() => handleFormSubmit(false)} disabled={formLoading}>{formLoading ? <CircularProgress size={24} /> : 'Créer'}</PrimaryButton>
        </DialogActions>
      </StyledDialog>

      {/* Modal Édition */}
      <StyledDialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colors.white || '#ffffff' }}>Modifier l'Utilisateur</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <StyledTextField label="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} fullWidth required sx={{ mb: 2, mt: 2 }} />
          <StyledTextField label="Prénom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} fullWidth required sx={{ mb: 2 }} />
          <StyledTextField label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth required type="email" sx={{ mb: 2 }} />
          <StyledTextField label="Mot de passe (optionnel)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} fullWidth type="password" sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>Rôle</InputLabel>
            <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} sx={{ color: colors.white || '#ffffff', '& .MuiSvgIcon-root': { color: colors.white || '#ffffff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.fuschia || '#f13544', 0.3) }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuschia || '#f13544' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuschia || '#f13544' } }}>
              <MenuItem value="ETUDIANT">Étudiant</MenuItem>
              <MenuItem value="ENSEIGNANT">Enseignant</MenuItem>
              <MenuItem value="ADMIN">Administrateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>Annuler</Button>
          <PrimaryButton onClick={() => handleFormSubmit(true)} disabled={formLoading}>{formLoading ? <CircularProgress size={24} /> : 'Mettre à jour'}</PrimaryButton>
        </DialogActions>
      </StyledDialog>

      {/* Dialog Suppression */}
      <StyledDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colors.white || '#ffffff' }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.white || '#ffffff' }}>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.nom} {selectedUser?.prenom}</strong> ? Cette action est irréversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>Annuler</Button>
          <PrimaryButton onClick={handleDeleteConfirm} sx={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>Supprimer</PrimaryButton>
        </DialogActions>
      </StyledDialog>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={error ? 'error' : 'success'} sx={{ boxShadow: 3, background: error ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #10b981, #34d399)', color: colors.white || '#ffffff' }}>{error || success}</Alert>
      </Snackbar>
    </UsersContainer>
  );
};

export default Users;