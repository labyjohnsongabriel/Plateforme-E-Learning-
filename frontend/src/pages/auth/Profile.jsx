// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  InputAdornment,
  Container,
  Avatar,
  Alert,
  Divider,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Person,
  Email,
  Event,
  Edit,
  Save,
  Cancel,
  School,
  Verified,
  Settings,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: { main: '#1E3A8A' },
    secondary: { main: '#F43F5E' },
    background: { default: '#F9FAFB' },
    success: { main: '#10B981', light: '#D1FAE5' },
    error: { main: '#EF4444', light: '#FEE2E2' },
  },
  typography: {
    h4: { fontSize: '2.25rem', fontWeight: 700 },
    h5: { fontSize: '1.75rem', fontWeight: 600 },
    body1: { fontSize: '1.1rem' },
    body2: { fontSize: '0.9rem' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 20px',
        },
      },
    },
  },
});

// Composant pour les informations personnelles
const ProfileInfo = ({
  user,
  isEditing,
  editForm,
  handleInputChange,
  handleAvatarChange,
  handleEditToggle,
  handleSave,
  isSaving,
  message,
  error,
}) => (
  <Paper sx={{ p: 4 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant='h5' fontWeight='bold'>
        Informations personnelles
      </Typography>
      <IconButton onClick={handleEditToggle} aria-label={isEditing ? 'Annuler' : 'Modifier'}>
        {isEditing ? <Cancel color='primary' /> : <Edit color='secondary' />}
      </IconButton>
    </Box>
    {message && (
      <Alert severity='success' sx={{ mb: 3 }}>
        {message}
      </Alert>
    )}
    {error && (
      <Alert severity='error' sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}
    {isEditing ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            src={editForm.avatar ? URL.createObjectURL(editForm.avatar) : user.avatar}
            sx={{ width: 100, height: 100, border: `3px solid ${theme.palette.secondary.main}` }}
            aria-label='Avatar utilisateur'
          >
            {user.prenom[0]}
            {user.nom[0]}
          </Avatar>
        </Box>
        <Button variant='contained' component='label' color='secondary'>
          Changer l'avatar
          <input
            type='file'
            hidden
            accept='image/jpeg,image/png'
            onChange={handleAvatarChange}
            aria-label='Télécharger un nouvel avatar'
          />
        </Button>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Nom'
              name='nom'
              value={editForm.nom}
              onChange={handleInputChange}
              required
              variant='outlined'
              inputProps={{ maxLength: 50 }}
              aria-required='true'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Prénom'
              name='prenom'
              value={editForm.prenom}
              onChange={handleInputChange}
              required
              variant='outlined'
              inputProps={{ maxLength: 50 }}
              aria-required='true'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Email'
              name='email'
              value={editForm.email}
              onChange={handleInputChange}
              required
              variant='outlined'
              inputProps={{ maxLength: 100 }}
              aria-required='true'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            color='secondary'
            onClick={handleSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            fullWidth
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            variant='outlined'
            color='primary'
            onClick={handleEditToggle}
            startIcon={<Cancel />}
            fullWidth
          >
            Annuler
          </Button>
        </Box>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={user.avatar} sx={{ width: 48, height: 48 }} aria-label='Avatar utilisateur'>
            {user.prenom[0]}
            {user.nom[0]}
          </Avatar>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Nom complet
            </Typography>
            <Typography variant='body1'>
              {user.prenom} {user.nom}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Email sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Email
            </Typography>
            <Typography variant='body1'>{user.email}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Event sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Membre depuis
            </Typography>
            <Typography variant='body1'>
              {new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        </Box>
      </Box>
    )}
  </Paper>
);

// Composant pour les notifications
const NotificationsPanel = ({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  clearNotifications,
}) => (
  <Paper sx={{ p: 4, mt: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant='h5' fontWeight='bold'>
        Notifications
        <Badge badgeContent={unreadCount} color='secondary' sx={{ ml: 2 }} />
      </Typography>
      <Box>
        <Button
          variant='outlined'
          color='primary'
          onClick={markAllAsRead}
          sx={{ mr: 1 }}
          disabled={unreadCount === 0}
        >
          Tout marquer comme lu
        </Button>
        <Button
          variant='outlined'
          color='error'
          onClick={clearNotifications}
          disabled={notifications.length === 0}
        >
          Supprimer tout
        </Button>
      </Box>
    </Box>
    {notifications.length === 0 ? (
      <Typography variant='body1' color='text.secondary'>
        Aucune notification
      </Typography>
    ) : (
      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification._id || notification.id}
            sx={{
              bgcolor: notification.lu ? 'transparent' : 'success.light',
              borderRadius: 2,
              mb: 1,
            }}
            button
            onClick={() => markAsRead(notification._id || notification.id)}
          >
            <ListItemIcon>
              <NotificationsIcon color={notification.lu ? 'disabled' : 'secondary'} />
            </ListItemIcon>
            <ListItemText
              primary={notification.message}
              secondary={new Date(notification.createdAt).toLocaleString('fr-FR')}
            />
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
);

// Composant pour les statistiques des étudiants
const StudentStats = ({ user }) => (
  <Paper sx={{ p: 4 }}>
    <Typography variant='h5' fontWeight='bold' sx={{ mb: 3 }}>
      Statistiques d'apprentissage
    </Typography>
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <CircularProgress
        variant='determinate'
        value={user.progression}
        size={100}
        thickness={5}
        sx={{ color: 'secondary.main' }}
      />
      <Typography variant='h6' sx={{ mt: 1 }}>
        {user.progression}%
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        Progression
      </Typography>
    </Box>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant='h6'>{user.coursTermines}</Typography>
          <Typography variant='body2' color='text.secondary'>
            Cours terminés
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant='h6'>{user.certificats || 0}</Typography>
          <Typography variant='body2' color='text.secondary'>
            Certificats
          </Typography>
        </Card>
      </Grid>
    </Grid>
    <Divider sx={{ my: 3 }} />
    <Typography variant='h6'>Réalisations récentes</Typography>
    <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
      <Verified sx={{ fontSize: 20, mr: 1 }} />
      <Typography variant='body2'>Python Basics terminé - Il y a 2 jours</Typography>
    </Box>
  </Paper>
);

// Composant pour les actions des administrateurs
const AdminActions = () => (
  <Paper sx={{ p: 4 }}>
    <Typography variant='h5' fontWeight='bold' sx={{ mb: 3 }}>
      Gestion des utilisateurs
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button
          variant='contained'
          color='secondary'
          startIcon={<Person />}
          fullWidth
          href='/admin/users'
        >
          Liste des utilisateurs
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant='contained'
          color='primary'
          startIcon={<Settings />}
          fullWidth
          href='/admin/settings'
        >
          Paramètres de la plateforme
        </Button>
      </Grid>
    </Grid>
  </Paper>
);

// Composant pour les actions des enseignants
const InstructorActions = () => (
  <Paper sx={{ p: 4 }}>
    <Typography variant='h5' fontWeight='bold' sx={{ mb: 3 }}>
      Gestion des cours
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button
          variant='contained'
          color='secondary'
          startIcon={<School />}
          fullWidth
          href='/instructor/courses'
        >
          Mes cours
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant='contained'
          color='primary'
          startIcon={<Person />}
          fullWidth
          href='/instructor/students'
        >
          Suivi des apprenants
        </Button>
      </Grid>
    </Grid>
  </Paper>
);

const Profile = ({ userId }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    error: notificationError,
  } = useNotifications();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    avatar: '',
    dateInscription: '',
    coursTermines: 0,
    progression: 0,
    role: 'ETUDIANT',
    certificats: 0,
  });
  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    avatar: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      navigate('/login');
      return;
    }

    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const userData = response.data.data;
        setUser({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          avatar: userData.avatar || '',
          dateInscription: userData.createdAt,
          coursTermines: userData.coursTermines || 0,
          progression: userData.progression || 0,
          role: userData.role || 'ETUDIANT',
          certificats: userData.certificats || 0,
        });
        setEditForm({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          avatar: null,
        });
      } catch (err) {
        setError('Erreur lors de la récupération du profil');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [authUser, authLoading, navigate, userId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage('');
    setError('');
    if (!isEditing) {
      setEditForm({ nom: user.nom, prenom: user.prenom, email: user.email, avatar: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Veuillez sélectionner une image JPEG ou PNG');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 2MB");
        return;
      }
      setEditForm((prev) => ({ ...prev, avatar: file }));
      setError('');
    }
  };

  const validateForm = () => {
    if (!editForm.nom.trim()) return 'Le nom est requis';
    if (!editForm.prenom.trim()) return 'Le prénom est requis';
    if (!editForm.email.trim()) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) return 'Email invalide';
    if (editForm.nom.length > 50 || editForm.prenom.length > 50) return 'Nom ou prénom trop long';
    if (editForm.email.length > 100) return 'Email trop long';
    return null;
  };

  const handleSave = async () => {
    setError('');
    setMessage('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('nom', editForm.nom);
      formData.append('prenom', editForm.prenom);
      formData.append('email', editForm.email);
      if (editForm.avatar) {
        formData.append('avatar', editForm.avatar);
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser((prev) => ({
        ...prev,
        ...response.data.data,
        avatar: response.data.data.avatar || prev.avatar,
      }));
      setMessage('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress color='secondary' />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant='h4' fontWeight='bold'>
              Mon Profil
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Gérer vos informations personnelles et vos activités
            </Typography>
          </Box>
          {notificationError && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {notificationError}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ProfileInfo
                user={user}
                isEditing={isEditing}
                editForm={editForm}
                handleInputChange={handleInputChange}
                handleAvatarChange={handleAvatarChange}
                handleEditToggle={handleEditToggle}
                handleSave={handleSave}
                isSaving={isSaving}
                message={message}
                error={error}
              />
              <NotificationsPanel
                notifications={notifications.filter(
                  (n) => n.role === user.role || user.role === 'ADMIN'
                )}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                clearNotifications={clearNotifications}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              {user.role === 'ETUDIANT' && <StudentStats user={user} />}
              {user.role === 'ADMIN' && <AdminActions />}
              {user.role === 'ENSEIGNANT' && <InstructorActions />}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button
                  variant='contained'
                  color='secondary'
                  startIcon={<School />}
                  href='/courses'
                >
                  Mes cours
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<Verified />}
                  href='/certificates'
                >
                  Certificats
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  startIcon={<Settings />}
                  href='/settings'
                >
                  Paramètres
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;
