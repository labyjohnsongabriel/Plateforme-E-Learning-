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
  TablePagination,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, keyframes } from '@mui/material/styles';
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
  background: `linear-gradient(135deg, ${theme.palette.background.default}, ${colors.lightNavy})`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  fontFamily: theme.typography.fontFamily,
}));

const UsersCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.default}cc, ${colors.lightNavy}cc)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${theme.palette.secondary.main}33`,
  borderRadius: '16px',
  padding: theme.spacing(4),
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${theme.palette.background.default}33`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
  borderRadius: '12px',
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: '1.1rem',
  textTransform: 'none',
  boxShadow: `0 4px 16px ${theme.palette.secondary.main}4d`,
  color: theme.palette.text.primary,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main}cc, ${theme.palette.secondary.light}cc)`,
    boxShadow: `0 6px 20px ${theme.palette.secondary.main}66`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main}80, ${theme.palette.secondary.light}80)`,
    cursor: 'not-allowed',
  },
}));

// Theme Configuration
const theme = createTheme({
  palette: {
    primary: { main: colors.navy || '#010b40' },
    secondary: { main: colors.fuschia || '#f13544', light: colors.lightFuschia || '#ff6b74' },
    background: { default: colors.navy || '#010b40' },
    text: { primary: colors.white || '#ffffff' },
    error: { main: '#ff4444' }, // For alerts
  },
  typography: {
    h4: { fontSize: '2.5rem', fontWeight: 700 },
    h5: { fontSize: '2rem', fontWeight: 600 },
    body1: { fontSize: '1.2rem' },
    body2: { fontSize: '1rem' },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px',
          borderBottom: `1px solid ${colors.fuschia}33`,
        },
      },
    },
  },
});

const Users = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Vérification des droits admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      setError('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.');
      setTimeout(() => navigate('/unauthorized'), 1000); // Delay for error visibility
    }
  }, [user, authLoading, navigate]);

  // Chargement des utilisateurs
  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (mounted && Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          setUsers([]);
          setError('Les données des utilisateurs ne sont pas au format attendu.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') {
      fetchUsers();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  // Suppression d'un utilisateur
  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.'
      )
    )
      return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(users.filter((u) => u.id !== userId));
      setSuccess('Utilisateur supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de l’utilisateur');
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Pagination
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, color: theme.palette.text.primary }}
        >
          <CircularProgress sx={{ color: theme.palette.secondary.main }} size={32} />
          <Typography variant='h5'>Chargement des utilisateurs...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <UsersContainer>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${theme.palette.secondary.main}1a 1px, transparent 1px),
              linear-gradient(90deg, ${theme.palette.secondary.main}1a 1px, transparent 1px)
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
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
            borderRadius: '50%',
            opacity: 0.15,
            animation: `${floatingAnimation} 4s ease-in-out infinite`,
          }}
        />

        <Container maxWidth='xl'>
          <UsersCard elevation={4}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: theme.typography.h4.fontWeight,
                color: theme.palette.text.primary,
                textAlign: 'center',
                mb: 4,
              }}
            >
              Gestion des Utilisateurs
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
              label='Rechercher (Nom ou Email)'
              variant='outlined'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: `${theme.palette.secondary.main}4d` },
                  '&:hover fieldset': { borderColor: theme.palette.secondary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
                  borderRadius: '8px',
                  color: theme.palette.text.primary,
                },
                '& .MuiInputLabel-root': {
                  color: `${theme.palette.text.primary}b3`,
                  '&.Mui-focused': { color: theme.palette.secondary.main },
                },
                '& .MuiInputBase-input': { color: theme.palette.text.primary },
              }}
            />

            <TableContainer component={Paper} sx={{ background: 'transparent' }}>
              <Table sx={{ minWidth: 650 }} aria-label='Tableau des utilisateurs'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      Nom
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      Rôle
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell sx={{ color: theme.palette.text.primary }}>
                          {user.name || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>
                          {user.email || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>
                          {user.role || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                            sx={{ color: theme.palette.secondary.light }}
                            aria-label={`Modifier ${user.name || 'utilisateur'}`}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(user.id)}
                            sx={{ color: theme.palette.error.main }}
                            aria-label={`Supprimer ${user.name || 'utilisateur'}`}
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
                        sx={{ color: theme.palette.text.primary, textAlign: 'center' }}
                      >
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component='div'
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ color: theme.palette.text.primary, mt: 2 }}
            />

            <StyledButton
              variant='contained'
              onClick={() => navigate('/admin/users/add')}
              sx={{ mt: 4 }}
              aria-label='Ajouter un nouvel utilisateur'
            >
              Ajouter un utilisateur
            </StyledButton>
          </UsersCard>
        </Container>
      </UsersContainer>
    </ThemeProvider>
  );
};

export default Users;
