// Frontend: src/pages/Profile.jsx (assuming the file path)
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
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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
  MenuBook,
  Shield,
  HowToReg,
  AdminPanelSettings,
  Groups,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

// Couleurs alignées avec About.jsx
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

// Styled Components
const ProfileContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(4),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 32px 80px ${colors.navy}4d`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const ActionCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(3),
  textAlign: 'center',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 25px 60px ${colors.navy}4d`,
  },
}));

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
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminPanelSettings sx={{ fontSize: 24, color: colors.red }} />;
      case 'ENSEIGNANT':
        return <Groups sx={{ fontSize: 24, color: colors.red }} />;
      default:
        return <HowToReg sx={{ fontSize: 24, color: colors.red }} />;
    }
  };

  return (
    <GlassCard elevation={0}>
      <Fade in={true} timeout={1000}>
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                fontSize: { xs: '1.5rem', md: '1.75rem' },
              }}
            >
              Informations personnelles
            </Typography>
            <IconButton onClick={handleEditToggle} aria-label={isEditing ? 'Annuler' : 'Modifier'}>
              {isEditing ? (
                <Cancel sx={{ color: colors.red }} />
              ) : (
                <Edit sx={{ color: colors.purple }} />
              )}
            </IconButton>
          </Box>
          {message && (
            <Alert
              severity='success'
              sx={{
                mb: 3,
                background: `${colors.purple}33`,
                color: '#ffffff',
                border: `1px solid ${colors.purple}4d`,
              }}
            >
              {message}
            </Alert>
          )}
          {error && (
            <Alert
              severity='error'
              sx={{
                mb: 3,
                background: `${colors.red}33`,
                color: '#ffffff',
                border: `1px solid ${colors.red}4d`,
              }}
            >
              {error}
            </Alert>
          )}
          {isEditing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  src={editForm.avatar ? URL.createObjectURL(editForm.avatar) : user.avatar}
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    border: `3px solid ${colors.red}`,
                    boxShadow: `0 8px 32px ${colors.navy}4d`,
                  }}
                  aria-label='Avatar utilisateur'
                >
                  {user.prenom?.[0] || ''}
                  {user.nom?.[0] || ''}
                </Avatar>
              </Box>
              <Button
                variant='contained'
                component='label'
                sx={{
                  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                  borderRadius: '16px',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 40px ${colors.red}66`,
                  },
                }}
              >
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
                          <Person sx={{ color: colors.red }} />
                        </InputAdornment>
                      ),
                      sx: {
                        background: `${colors.navy}33`,
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: `${colors.red}4d`,
                        },
                      },
                    }}
                    sx={{ '& .MuiInputBase-input': { color: '#ffffff' } }}
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
                          <Person sx={{ color: colors.red }} />
                        </InputAdornment>
                      ),
                      sx: {
                        background: `${colors.navy}33`,
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: `${colors.red}4d`,
                        },
                      },
                    }}
                    sx={{ '& .MuiInputBase-input': { color: '#ffffff' } }}
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
                          <Email sx={{ color: colors.red }} />
                        </InputAdornment>
                      ),
                      sx: {
                        background: `${colors.navy}33`,
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: `${colors.red}4d`,
                        },
                      },
                    }}
                    sx={{ '& .MuiInputBase-input': { color: '#ffffff' } }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='contained'
                  sx={{
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    borderRadius: '16px',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    flex: 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${colors.red}66`,
                    },
                  }}
                  onClick={handleSave}
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  variant='outlined'
                  sx={{
                    borderColor: colors.red,
                    color: colors.red,
                    borderRadius: '16px',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    flex: 1,
                    '&:hover': {
                      borderColor: colors.pink,
                      color: colors.pink,
                      background: `${colors.red}1a`,
                    },
                  }}
                  onClick={handleEditToggle}
                  startIcon={<Cancel />}
                >
                  Annuler
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                    border: `2px solid ${colors.red}`,
                  }}
                  aria-label='Avatar utilisateur'
                >
                  {user.prenom?.[0] || ''}
                  {user.nom?.[0] || ''}
                </Avatar>
                <Box>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Nom complet
                  </Typography>
                  <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                    {user.prenom} {user.nom}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email sx={{ fontSize: 24, color: colors.red }} />
                <Box>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Email
                  </Typography>
                  <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Event sx={{ fontSize: 24, color: colors.red }} />
                <Box>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Membre depuis
                  </Typography>
                  <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                    {user.dateInscription ? new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'Date non disponible'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getRoleIcon()}
                <Box>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Rôle
                  </Typography>
                  <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                    {user.role === 'ETUDIANT'
                      ? 'Étudiant'
                      : user.role === 'ENSEIGNANT'
                        ? 'Enseignant'
                        : 'Administrateur'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Fade>
    </GlassCard>
  );
};

const NotificationsPanel = ({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  clearNotifications,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <GlassCard sx={{ mt: 3 }} elevation={0}>
      <Fade in={true} timeout={1200}>
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                fontSize: { xs: '1.5rem', md: '1.75rem' },
              }}
            >
              Notifications
              <Badge
                badgeContent={unreadCount}
                sx={{ ml: 2, '& .MuiBadge-badge': { backgroundColor: colors.red } }}
              />
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                sx={{
                  borderColor: colors.red,
                  color: colors.red,
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  '&:hover': {
                    borderColor: colors.pink,
                    color: colors.pink,
                    background: `${colors.red}1a`,
                  },
                }}
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Tout marquer comme lu
              </Button>
              <Button
                variant='outlined'
                sx={{
                  borderColor: colors.red,
                  color: colors.red,
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  '&:hover': {
                    borderColor: colors.pink,
                    color: colors.pink,
                    background: `${colors.red}1a`,
                  },
                }}
                onClick={clearNotifications}
                disabled={notifications.length === 0}
              >
                Supprimer tout
              </Button>
            </Box>
          </Box>
          {notifications.length === 0 ? (
            <Typography
              sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.9rem', md: '1rem' } }}
            >
              Aucune notification
            </Typography>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification._id || notification.id}
                  sx={{
                    bgcolor: notification.lu ? 'transparent' : `${colors.purple}1a`,
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: `${colors.purple}33`,
                    },
                  }}
                  button
                  onClick={() => markAsRead(notification._id || notification.id)}
                >
                  <ListItemIcon>
                    <NotificationsIcon
                      sx={{ color: notification.lu ? 'rgba(255, 255, 255, 0.7)' : colors.red }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{ color: '#ffffff', fontWeight: notification.lu ? 500 : 700 }}
                      >
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                        {new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Fade>
    </GlassCard>
  );
};

const StudentStats = ({ user }) => (
  <GlassCard elevation={0}>
    <Fade in={true} timeout={1000}>
      <Box>
        <Typography
          variant='h5'
          sx={{
            fontWeight: 700,
            color: '#ffffff',
            mb: 3,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
          }}
        >
          Statistiques d'apprentissage
        </Typography>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CircularProgress
            variant='determinate'
            value={user.progression || 0}
            size={100}
            thickness={5}
            sx={{ color: colors.red }}
          />
          <Typography
            variant='h6'
            sx={{
              mt: 1,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
            }}
          >
            {user.progression || 0}%
          </Typography>
          <Typography
            sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            Progression
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <ActionCard>
              <Typography
                variant='h6'
                sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '1.2rem', md: '1.4rem' } }}
              >
                {user.coursTermines || 0}
              </Typography>
              <Typography
                sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.9rem', md: '1rem' } }}
              >
                Cours terminés
              </Typography>
            </ActionCard>
          </Grid>
          <Grid item xs={6}>
            <ActionCard>
              <Typography
                variant='h6'
                sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '1.2rem', md: '1.4rem' } }}
              >
                {user.certificats || 0}
              </Typography>
              <Typography
                sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.9rem', md: '1rem' } }}
              >
                Certificats
              </Typography>
            </ActionCard>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3, borderColor: `${colors.red}4d` }} />
        <Typography
          variant='h6'
          sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '1.2rem', md: '1.4rem' } }}
        >
          Réalisations récentes
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: `${colors.purple}1a`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Verified sx={{ fontSize: 20, color: colors.red }} />
          <Typography
            sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            Python Basics terminé - Il y a 2 jours
          </Typography>
        </Box>
      </Box>
    </Fade>
  </GlassCard>
);

const AdminActions = () => (
  <GlassCard elevation={0}>
    <Fade in={true} timeout={1000}>
      <Box>
        <Typography
          variant='h5'
          sx={{
            fontWeight: 700,
            color: '#ffffff',
            mb: 3,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
          }}
        >
          Gestion des utilisateurs
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              variant='contained'
              sx={{
                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                borderRadius: '16px',
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${colors.red}66`,
                },
              }}
              startIcon={<Person sx={{ color: '#ffffff' }} />}
              fullWidth
              href='/admin/users'
            >
              Liste des utilisateurs
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              sx={{
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                borderRadius: '16px',
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${colors.navy}66`,
                },
              }}
              startIcon={<Settings sx={{ color: '#ffffff' }} />}
              fullWidth
              href='/admin/settings'
            >
              Paramètres de la plateforme
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  </GlassCard>
);

const InstructorActions = () => (
  <GlassCard elevation={0}>
    <Fade in={true} timeout={1000}>
      <Box>
        <Typography
          variant='h5'
          sx={{
            fontWeight: 700,
            color: '#ffffff',
            mb: 3,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
          }}
        >
          Gestion des cours
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              variant='contained'
              sx={{
                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                borderRadius: '16px',
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${colors.red}66`,
                },
              }}
              startIcon={<MenuBook sx={{ color: '#ffffff' }} />}
              fullWidth
              href='/instructor/courses'
            >
              Mes cours
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              sx={{
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                borderRadius: '16px',
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${colors.navy}66`,
                },
              }}
              startIcon={<Person sx={{ color: '#ffffff' }} />}
              fullWidth
              href='/instructor/students'
            >
              Suivi des apprenants
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  </GlassCard>
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        if (!userData) {
          throw new Error('Données utilisateur non trouvées dans la réponse');
        }
        setUser({
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          avatar: userData.avatar || '',
          dateInscription: userData.dateInscription || userData.createdAt || '',
          coursTermines: userData.coursTermines || 0,
          progression: userData.progression || 0,
          role: userData.role || 'ETUDIANT',
          certificats: userData.certificats || 0,
        });
        setEditForm({
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          avatar: null,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération du profil');
        console.error('Erreur chargement profil:', err);
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

      const updatedUserData = response.data.data;
      if (!updatedUserData) {
        throw new Error('Données utilisateur non trouvées après mise à jour');
      }

      setUser((prev) => ({
        ...prev,
        ...updatedUserData,
        avatar: updatedUserData.avatar || prev.avatar,
      }));
      setMessage('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      console.error('Erreur mise à jour profil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <ProfileContainer>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress sx={{ color: colors.red }} />
          <Typography
            sx={{
              ml: 2,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
            }}
          >
            Chargement...
          </Typography>
        </Box>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      {/* Arrière-plan décoratif */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${colors.red}26 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${colors.red}1a 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      />
      <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 10, py: { xs: 4, md: 6 } }}>
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Mon Profil
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Gérer vos informations personnelles et vos activités
            </Typography>
          </Box>
        </Fade>
        {notificationError && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              background: `${colors.red}33`,
              color: '#ffffff',
              border: `1px solid ${colors.red}4d`,
            }}
          >
            {notificationError}
          </Alert>
        )}
        <Grid container spacing={{ xs: 3, md: 4 }}>
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
            <Slide direction='up' in={true} timeout={1200}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: { xs: 2, md: 3 },
                  mt: { xs: 3, md: 4 },
                }}
              >
                <Button
                  variant='contained'
                  sx={{
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    borderRadius: '16px',
                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                    fontWeight: 600,
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 2 },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${colors.red}66`,
                    },
                  }}
                  startIcon={<MenuBook sx={{ color: '#ffffff' }} />}
                  href='/courses'
                >
                  Mes cours
                </Button>
                <Button
                  variant='contained'
                  sx={{
                    background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                    borderRadius: '16px',
                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                    fontWeight: 600,
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 2 },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${colors.navy}66`,
                    },
                  }}
                  startIcon={<Verified sx={{ color: '#ffffff' }} />}
                  href='/certificates'
                >
                  Certificats
                </Button>
                <Button
                  variant='contained'
                  sx={{
                    background: `linear-gradient(135deg, ${colors.purple}, ${colors.purple}cc)`,
                    borderRadius: '16px',
                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                    fontWeight: 600,
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 2 },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${colors.purple}66`,
                    },
                  }}
                  startIcon={<Settings sx={{ color: '#ffffff' }} />}
                  href='/settings'
                >
                  Paramètres
                </Button>
              </Box>
            </Slide>
          </Grid>
        </Grid>
      </Container>
    </ProfileContainer>
  );
};

export default Profile;