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
  InputAdornment,
  Fade,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Badge,
} from '@mui/material';
import {
  Delete,
  Edit,
  Add,
  Search,
  Visibility,
  Email,
  CalendarToday,
  Person,
  Security,
  CheckCircle,
  Cancel,
  MoreVert,
  Lock,
  LockOpen,
  Refresh,
  FilterList,
  Download,
  Upload,
  CloudDownload,
  SaveAlt,
  PictureAsPdf,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { alpha } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

// ✅ Configuration API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// ✅ Configuration Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Styled Components
const UsersContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors?.navy || '#010b40'} 0%, ${colors?.lightNavy || '#1a237e'} 100%)`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const UsersCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors?.navy || '#010b40', 0.95)}, ${alpha(colors?.lightNavy || '#1a237e', 0.95)})`,
  backdropFilter: 'blur(20px) saturate(180%)',
  border: `1px solid ${alpha(colors?.red || '#f13544', 0.2)}`,
  borderRadius: 24,
  padding: theme.spacing(4),
  boxShadow: `0 25px 60px ${alpha('#000', 0.4)}`,
  animation: `${fadeInUp} 0.8s ease-out`,
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const StatsCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${alpha(color || colors?.red || '#f13544', 0.9)}, ${alpha(color || colors?.pink || '#ff6b74', 0.9)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(color || colors?.red || '#f13544', 0.3)}`,
  borderRadius: 20,
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 50px ${alpha(color || colors?.red || '#f13544', 0.4)}`,
    borderColor: alpha(color || colors?.red || '#f13544', 0.6),
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: colors?.white || '#ffffff',
  fontWeight: 600,
  fontSize: '0.95rem',
  borderBottom: `1px solid ${alpha(colors?.red || '#f13544', 0.1)}`,
  padding: theme.spacing(2.5),
  '&:first-of-type': { paddingLeft: theme.spacing(4) },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
    padding: theme.spacing(1.5),
    '&:first-of-type': { paddingLeft: theme.spacing(2) },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  transition: 'all 0.3s ease',
  background:
    status === 'active'
      ? `linear-gradient(90deg, ${alpha('#10b981', 0.05)}, transparent)`
      : status === 'inactive'
        ? `linear-gradient(90deg, ${alpha('#6b7280', 0.05)}, transparent)`
        : 'transparent',
  '&:hover': {
    backgroundColor:
      status === 'active'
        ? alpha('#10b981', 0.08)
        : status === 'inactive'
          ? alpha('#6b7280', 0.08)
          : alpha(colors?.red || '#f13544', 0.08),
    transform: 'scale(1.01)',
    boxShadow: `0 4px 20px ${alpha(colors?.red || '#f13544', 0.1)}`,
  },
  '&:last-child td': { borderBottom: 0 },
}));

const PrimaryButton = styled(Button)(({ theme, customcolor }) => {
  const btnColor = customcolor || colors?.red || '#f13544';
  return {
    background: `linear-gradient(135deg, ${btnColor}, ${alpha(btnColor, 0.8)})`,
    borderRadius: 14,
    padding: theme.spacing(1.5, 4),
    fontWeight: 700,
    fontSize: '1rem',
    textTransform: 'none',
    boxShadow: `0 8px 32px ${alpha(btnColor, 0.4)}`,
    color: colors?.white || '#ffffff',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(btnColor, 0.9)}, ${alpha(btnColor, 0.7)})`,
      boxShadow: `0 16px 48px ${alpha(btnColor, 0.6)}`,
      transform: 'translateY(-3px)',
    },
    '&:disabled': {
      background: alpha(btnColor, 0.4),
      color: alpha(colors?.white || '#ffffff', 0.6),
      transform: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 3),
      fontSize: '0.9rem',
    },
  };
});

const ActionButton = styled(IconButton)(({ theme, color }) => ({
  color: color || colors?.white || '#ffffff',
  transition: 'all 0.3s ease',
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1),
  '&:hover': {
    transform: 'scale(1.15) rotate(5deg)',
    backgroundColor: alpha(color || colors?.red || '#f13544', 0.15),
    boxShadow: `0 4px 16px ${alpha(color || colors?.red || '#f13544', 0.3)}`,
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    background: `linear-gradient(135deg, ${alpha(colors?.navy || '#010b40', 0.98)}, ${alpha(colors?.lightNavy || '#1a237e', 0.98)})`,
    backdropFilter: 'blur(30px) saturate(180%)',
    color: colors?.white || '#ffffff',
    boxShadow: `0 32px 80px ${alpha('#000', 0.5)}`,
    border: `1px solid ${alpha(colors?.red || '#f13544', 0.2)}`,
    padding: theme.spacing(1),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: colors?.white || '#ffffff',
    borderRadius: 12,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha(colors?.red || '#f13544', 0.3),
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: colors?.red || '#f13544',
      boxShadow: `0 0 0 3px ${alpha(colors?.red || '#f13544', 0.1)}`,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors?.red || '#f13544',
      boxShadow: `0 0 0 3px ${alpha(colors?.red || '#f13544', 0.2)}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: alpha(colors?.white || '#ffffff', 0.7),
    fontSize: '1rem',
    fontWeight: 500,
    '&.Mui-focused': {
      color: colors?.red || '#f13544',
      fontWeight: 600,
    },
  },
  '& .MuiFormHelperText-root': {
    color: alpha(colors?.white || '#ffffff', 0.6),
    fontSize: '0.85rem',
  },
}));

// Helper functions
const formatDate = (date) => {
  if (!date) return 'Jamais';
  try {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now - targetDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} j`;

    return targetDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    return 'Date invalide';
  }
};

// ✅ CORRECTION : Fonction formatRole sécurisée
const formatRole = (role) => {
  if (!role) {
    return { label: 'Non défini', color: '#6B7280', icon: '👤' };
  }

  const roleMap = {
    ETUDIANT: { label: 'Étudiant', color: '#3B82F6', icon: '🎓' },
    ENSEIGNANT: { label: 'Enseignant', color: '#F59E0B', icon: '👨‍🏫' },
    ADMIN: { label: 'Administrateur', color: '#EF4444', icon: '⚡' },
    STUDENT: { label: 'Étudiant', color: '#3B82F6', icon: '🎓' },
    INSTRUCTOR: { label: 'Instructeur', color: '#F59E0B', icon: '👨‍🏫' },
    ADMINISTRATOR: { label: 'Admin', color: '#EF4444', icon: '⚡' },
  };

  return roleMap[role] || { label: role, color: '#6B7280', icon: '👤' };
};

// ✅ CORRECTION : Fonction getInitials sécurisée
const getInitials = (nom, prenom) => {
  const first = prenom?.charAt(0) || '';
  const last = nom?.charAt(0) || '';
  return `${first}${last}`.toUpperCase() || '?';
};

// ✅ CORRECTION : Fonction getStatus sécurisée
const getStatus = (lastLogin, isActive = true) => {
  if (!isActive) return { status: 'inactive', label: 'Inactif', color: '#6B7280' };

  if (!lastLogin) return { status: 'never', label: 'Jamais connecté', color: '#9CA3AF' };

  try {
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffMs = now - lastLoginDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 5) return { status: 'online', label: 'En ligne', color: '#10B981' };
    if (diffMins < 60) return { status: 'recent', label: 'Récent', color: '#F59E0B' };

    return { status: 'offline', label: 'Hors ligne', color: '#6B7280' };
  } catch (err) {
    return { status: 'unknown', label: 'Statut inconnu', color: '#9CA3AF' };
  }
};

// ✅ CORRECTION : Fonction pour afficher l'avatar avec gestion d'erreur
const UserAvatar = ({ user, size = 48 }) => {
  const [imageError, setImageError] = useState(false);

  // ✅ CORRECTION : Vérification améliorée de l'avatar
  const hasValidAvatar =
    user.avatar &&
    !imageError &&
    (user.avatar.startsWith('http') ||
      user.avatar.startsWith('data:image') ||
      user.avatar.startsWith('/'));

  if (hasValidAvatar) {
    return (
      <Avatar
        src={user.avatar}
        onError={() => setImageError(true)}
        sx={{
          width: size,
          height: size,
          border: `2px solid ${alpha('#3B82F6', 0.3)}`,
          backgroundColor: alpha('#3B82F6', 0.1),
        }}
        alt={`${user.prenom} ${user.nom}`}
      />
    );
  }

  const roleInfo = formatRole(user.role);
  return (
    <Avatar
      sx={{
        bgcolor: alpha(roleInfo.color, 0.2),
        color: roleInfo.color,
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        border: `2px solid ${alpha(roleInfo.color, 0.3)}`,
      }}
    >
      {getInitials(user.nom, user.prenom)}
    </Avatar>
  );
};

// ✅ Fonction pour télécharger la liste des utilisateurs en CSV
const downloadUsersListCSV = (users) => {
  try {
    const headers = [
      'Nom',
      'Prénom',
      'Email',
      'Rôle',
      'Statut',
      'Dernière Connexion',
      'Date de Création',
      'Avatar',
    ];
    const csvContent = [
      headers.join(','),
      ...users.map((user) =>
        [
          `"${user.nom}"`,
          `"${user.prenom}"`,
          `"${user.email}"`,
          `"${formatRole(user.role).label}"`,
          `"${user.isActive ? 'Actif' : 'Inactif'}"`,
          `"${user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}"`,
          `"${new Date(user.createdAt).toLocaleDateString('fr-FR')}"`,
          `"${user.avatar || 'Non défini'}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Erreur lors du téléchargement CSV:', error);
    return false;
  }
};

// ✅ Fonction pour télécharger la liste des utilisateurs en JSON
const downloadUsersListJSON = (users) => {
  try {
    const usersData = users.map((user) => ({
      Nom: user.nom,
      Prénom: user.prenom,
      Email: user.email,
      Rôle: formatRole(user.role).label,
      Statut: user.isActive ? 'Actif' : 'Inactif',
      'Dernière Connexion': user.lastLogin ? formatDate(user.lastLogin) : 'Jamais',
      'Date de Création': new Date(user.createdAt).toLocaleDateString('fr-FR'),
      Avatar: user.avatar || 'Non défini',
    }));

    const content = JSON.stringify(usersData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Erreur lors du téléchargement JSON:', error);
    return false;
  }
};

// ✅ Fonction pour générer un PDF
const downloadUsersListPDF = (users) => {
  try {
    // Créer un contenu HTML pour le PDF
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liste des Utilisateurs</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f13544; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Liste des Utilisateurs</h1>
          <div class="info">
            Généré le: ${new Date().toLocaleDateString('fr-FR')}<br>
            Total: ${users.length} utilisateurs
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Dernière Connexion</th>
              <th>Date de Création</th>
            </tr>
          </thead>
          <tbody>
            ${users
              .map(
                (user) => `
              <tr>
                <td>${user.nom}</td>
                <td>${user.prenom}</td>
                <td>${user.email}</td>
                <td>${formatRole(user.role).label}</td>
                <td>${user.isActive ? 'Actif' : 'Inactif'}</td>
                <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          Plateforme E-Learning - Généré automatiquement
        </div>
      </body>
      </html>
    `;

    // Ouvrir une nouvelle fenêtre pour imprimer/convertir en PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();

    // Attendre que le contenu soit chargé avant d'imprimer
    setTimeout(() => {
      printWindow.print();
      // Fermer la fenêtre après impression
      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 500);

    return true;
  } catch (error) {
    console.error('Erreur lors de la génération PDF:', error);

    // Fallback: Télécharger comme HTML
    try {
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Liste des Utilisateurs</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f13544; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Liste des Utilisateurs</h1>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Dernière Connexion</th>
                <th>Date de Création</th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (user) => `
                <tr>
                  <td>${user.nom}</td>
                  <td>${user.prenom}</td>
                  <td>${user.email}</td>
                  <td>${formatRole(user.role).label}</td>
                  <td>${user.isActive ? 'Actif' : 'Inactif'}</td>
                  <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}</td>
                  <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([content], { type: 'text/html' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (fallbackError) {
      console.error('Erreur fallback PDF:', fallbackError);
      return false;
    }
  }
};

const Users = () => {
  const { user: currentUser, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'ETUDIANT',
    isActive: true,
    avatar: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    online: 0,
    byRole: {},
  });

  // ✅ Vérification admin
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'ADMIN') {
      setError('Accès réservé aux administrateurs');
      setTimeout(() => navigate('/unauthorized'), 2000);
    }
  }, [currentUser, authLoading, navigate]);

  // ✅ Récupération des utilisateurs
  const fetchUsers = useCallback(async () => {
    if (!currentUser?.token) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Chargement des utilisateurs...');

      const response = await apiClient.get('/admin/users', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });

      // ✅ CORRECTION : Structure de réponse sécurisée
      const responseData = response.data || {};
      const usersData = Array.isArray(responseData.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : [];

      console.log('✅ Utilisateurs chargés:', usersData.length);

      // ✅ CORRECTION : Normalisation sécurisée avec vérifications et gestion des avatars
      const normalizedUsers = usersData
        .filter((user) => user != null)
        .map((u) => {
          // ✅ CORRECTION : Construction correcte de l'URL de l'avatar
          let avatarUrl = null;
          if (u.avatar) {
            if (u.avatar.startsWith('http') || u.avatar.startsWith('data:image')) {
              avatarUrl = u.avatar;
            } else if (u.avatar.startsWith('/')) {
              avatarUrl = `${API_BASE_URL.replace('/api', '')}${u.avatar}`;
            } else {
              avatarUrl = `${API_BASE_URL.replace('/api', '')}/uploads/avatars/${u.avatar}`;
            }
          }

          return {
            _id: u._id?.toString() || Math.random().toString(),
            nom: u.nom || 'Non spécifié',
            prenom: u.prenom || 'Non spécifié',
            email: u.email || 'Non spécifié',
            role: u.role || 'ETUDIANT',
            isActive: u.isActive !== undefined ? u.isActive : true,
            lastLogin: u.lastLogin || u.lastConnection || null,
            createdAt: u.createdAt || u.creationDate || new Date().toISOString(),
            avatar: avatarUrl || u.profilePicture || null,
            coursesCount: u.coursesCount || 0,
            progress: u.progress || 0,
          };
        });

      setUsers(normalizedUsers);

      // ✅ Calcul des statistiques
      const statsData = {
        total: normalizedUsers.length,
        active: normalizedUsers.filter((u) => u.isActive).length,
        online: normalizedUsers.filter((u) => {
          if (!u.isActive) return false;
          if (!u.lastLogin) return false;
          try {
            const lastLogin = new Date(u.lastLogin);
            return new Date() - lastLogin < 5 * 60 * 1000; // 5 minutes
          } catch {
            return false;
          }
        }).length,
        byRole: normalizedUsers.reduce((acc, u) => {
          const role = u.role || 'ETUDIANT';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {}),
      };

      setStats(statsData);
      console.log('📊 Statistiques calculées:', statsData);
    } catch (err) {
      console.error('❌ Erreur fetchUsers:', err);
      const errorMessage =
        err.response?.status === 401
          ? 'Session expirée. Veuillez vous reconnecter.'
          : err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, navigate]);

  // ✅ Chargement initial
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // ✅ Filtrage des utilisateurs
  useEffect(() => {
    let filtered = users;

    // Filtre de recherche
    if (search) {
      filtered = filtered.filter(
        (u) =>
          `${u.nom || ''} ${u.prenom || ''}`.toLowerCase().includes(search.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => {
        const status = getStatus(u.lastLogin, u.isActive);
        return status.status === statusFilter;
      });
    }

    setFilteredUsers(filtered);
    setPage(0);
  }, [search, roleFilter, statusFilter, users]);

  // ✅ Gestion des modales
  const openAddModal = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'ETUDIANT',
      isActive: true,
      avatar: '',
    });
    setFormError('');
    setAddModalOpen(true);
  };

  const openEditModal = (user) => {
    if (!user) return;

    setSelectedUser(user);
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      password: '',
      role: user.role || 'ETUDIANT',
      isActive: user.isActive !== undefined ? user.isActive : true,
      avatar: user.avatar || '',
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const openViewModal = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    if (!user?._id) {
      setError("ID de l'utilisateur invalide");
      setSnackbarOpen(true);
      return;
    }
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // ✅ Validation du formulaire
  const validateForm = (isEdit = false) => {
    if (!formData.nom?.trim()) return 'Le nom est requis';
    if (!formData.prenom?.trim()) return 'Le prénom est requis';
    if (!formData.email?.trim()) return "L'email est requis";
    if (!isEdit && !formData.password?.trim()) return 'Le mot de passe est requis pour la création';
    if (!formData.role) return 'Le rôle est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "L'email est invalide";
    if (!isEdit && formData.password.length < 6)
      return 'Le mot de passe doit contenir au moins 6 caractères';
    return '';
  };

  // ✅ Soumission du formulaire
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
      const data = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
      };

      // Inclure l'avatar s'il est fourni
      if (formData.avatar?.trim()) {
        data.avatar = formData.avatar.trim();
      }

      if (!isEdit || formData.password.trim()) {
        data.password = formData.password.trim();
      }

      if (isEdit) {
        await apiClient.put(`/admin/users/${selectedUser._id}`, data);
        setSuccess('Utilisateur mis à jour avec succès');
      } else {
        await apiClient.post('/admin/users', data);
        setSuccess('Utilisateur créé avec succès');
      }

      setSnackbarOpen(true);
      setAddModalOpen(false);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('❌ Erreur handleFormSubmit:', err);
      const errorMessage =
        err.response?.status === 409
          ? 'Cet email est déjà utilisé'
          : err.response?.data?.message || "Erreur lors de l'opération";
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Suppression d'un utilisateur
  const handleDeleteConfirm = async () => {
    if (!selectedUser?._id) {
      setError("ID de l'utilisateur invalide");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await apiClient.delete(`/admin/users/${selectedUser._id}`);
      setSuccess('Utilisateur supprimé avec succès');
      setSnackbarOpen(true);
      fetchUsers();
    } catch (err) {
      console.error('❌ Erreur handleDeleteConfirm:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // ✅ Toggle statut actif/inactif
  const handleToggleStatus = async (user, newStatus) => {
    if (!user?._id) return;

    try {
      await apiClient.put(`/admin/users/${user._id}`, {
        isActive: newStatus,
      });

      setSuccess(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      setSnackbarOpen(true);
      fetchUsers();
    } catch (err) {
      console.error('❌ Erreur toggle status:', err);
      setError('Erreur lors de la modification du statut');
      setSnackbarOpen(true);
    }
  };

  // ✅ Téléchargement de la liste des utilisateurs
  const handleDownloadUsers = (format = 'csv') => {
    let success = false;

    switch (format) {
      case 'csv':
        success = downloadUsersListCSV(filteredUsers);
        break;
      case 'json':
        success = downloadUsersListJSON(filteredUsers);
        break;
      case 'pdf':
        success = downloadUsersListPDF(filteredUsers);
        break;
      default:
        success = false;
    }

    if (success) {
      setSuccess(`Liste des utilisateurs téléchargée en format ${format.toUpperCase()}`);
      setSnackbarOpen(true);
    } else {
      setError('Erreur lors du téléchargement');
      setSnackbarOpen(true);
    }
  };

  // ✅ Écran de chargement
  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${colors?.navy || '#010b40'}, ${colors?.lightNavy || '#1a237e'})`,
          gap: 3,
        }}
      >
        <CircularProgress
          size={80}
          sx={{
            color: colors?.red || '#f13544',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
        <Box textAlign='center'>
          <Typography
            variant='h5'
            sx={{
              color: colors?.white || '#ffffff',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Chargement des utilisateurs
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: alpha(colors?.white || '#ffffff', 0.7),
            }}
          >
            Préparation des données en cours...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <UsersContainer>
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(colors?.red || '#f13544', 0.1)} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${alpha(colors?.pink || '#ff6b74', 0.1)} 0%, transparent 50%)`,
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
          background: `linear-gradient(135deg, ${colors?.red || '#f13544'}, ${colors?.pink || '#ff6b74'})`,
          borderRadius: '50%',
          opacity: 0.15,
          animation: `${floatingAnimation} 6s ease-in-out infinite`,
        }}
      />

      <Container maxWidth={false} disableGutters>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ mb: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 3,
                  mb: 4,
                }}
              >
                <Box>
                  <Typography
                    variant='h2'
                    sx={{
                      fontWeight: 800,
                      color: colors?.white || '#ffffff',
                      mb: 1,
                      fontSize: { xs: '2rem', md: '3rem' },
                      background: `linear-gradient(135deg, ${colors?.white || '#ffffff'}, ${alpha(colors?.white || '#ffffff', 0.8)})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    👥 Gestion des Utilisateurs
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{
                      color: alpha(colors?.white || '#ffffff', 0.8),
                      fontWeight: 400,
                      fontSize: { xs: '1rem', md: '1.25rem' },
                    }}
                  >
                    Gérez les comptes utilisateurs et leurs permissions
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Tooltip title='Télécharger la liste (PDF)'>
                    <PrimaryButton
                      startIcon={<PictureAsPdf />}
                      onClick={() => handleDownloadUsers('pdf')}
                      customcolor='#EF4444'
                    >
                      PDF
                    </PrimaryButton>
                  </Tooltip>
                  <Tooltip title='Télécharger la liste (CSV)'>
                    <PrimaryButton
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownloadUsers('csv')}
                      customcolor='#10B981'
                    >
                      CSV
                    </PrimaryButton>
                  </Tooltip>
                  <Tooltip title='Télécharger la liste (JSON)'>
                    <PrimaryButton
                      startIcon={<SaveAlt />}
                      onClick={() => handleDownloadUsers('json')}
                      customcolor='#3B82F6'
                    >
                      JSON
                    </PrimaryButton>
                  </Tooltip>
                  <PrimaryButton startIcon={<Refresh />} onClick={fetchUsers} customcolor='#6B7280'>
                    Actualiser
                  </PrimaryButton>
                  <PrimaryButton startIcon={<Add />} onClick={openAddModal}>
                    Nouvel Utilisateur
                  </PrimaryButton>
                </Box>
              </Box>

              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard color='#3B82F6'>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>
                          {stats.total}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
                        >
                          Total Utilisateurs
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <Person sx={{ fontSize: 28, color: 'white' }} />
                      </Avatar>
                    </Box>
                  </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard color='#10B981'>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>
                          {stats.active}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
                        >
                          Utilisateurs Actifs
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <CheckCircle sx={{ fontSize: 28, color: 'white' }} />
                      </Avatar>
                    </Box>
                  </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard color='#F59E0B'>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>
                          {stats.online}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
                        >
                          En Ligne
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <Visibility sx={{ fontSize: 28, color: 'white' }} />
                      </Avatar>
                    </Box>
                  </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard color='#8B5CF6'>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>
                          {Object.keys(stats.byRole).length}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
                        >
                          Rôles Différents
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <Security sx={{ fontSize: 28, color: 'white' }} />
                      </Avatar>
                    </Box>
                  </StatsCard>
                </Grid>
              </Grid>
            </Box>

            {/* Main Content Card */}
            <UsersCard>
              {/* Search and Filters Section */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={3} alignItems='center'>
                  <Grid item xs={12} md={4}>
                    <TextField
                      placeholder='Rechercher un utilisateur...'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Search sx={{ color: alpha(colors?.white || '#ffffff', 0.7) }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: colors?.white || '#ffffff',
                          borderRadius: 12,
                          '& fieldset': { borderColor: alpha(colors?.red || '#f13544', 0.3) },
                          '&:hover fieldset': { borderColor: colors?.red || '#f13544' },
                          '&.Mui-focused fieldset': { borderColor: colors?.red || '#f13544' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: alpha(colors?.white || '#ffffff', 0.7) }}>
                        Filtre par rôle
                      </InputLabel>
                      <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        sx={{
                          color: colors?.white || '#ffffff',
                          borderRadius: 12,
                          '& .MuiSvgIcon-root': { color: colors?.white || '#ffffff' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(colors?.red || '#f13544', 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors?.red || '#f13544',
                          },
                        }}
                      >
                        <MenuItem value='all'>Tous les rôles</MenuItem>
                        <MenuItem value='ETUDIANT'>Étudiants</MenuItem>
                        <MenuItem value='ENSEIGNANT'>Enseignants</MenuItem>
                        <MenuItem value='ADMIN'>Administrateurs</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: alpha(colors?.white || '#ffffff', 0.7) }}>
                        Filtre par statut
                      </InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{
                          color: colors?.white || '#ffffff',
                          borderRadius: 12,
                          '& .MuiSvgIcon-root': { color: colors?.white || '#ffffff' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(colors?.red || '#f13544', 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors?.red || '#f13544',
                          },
                        }}
                      >
                        <MenuItem value='all'>Tous les statuts</MenuItem>
                        <MenuItem value='online'>En ligne</MenuItem>
                        <MenuItem value='recent'>Récent</MenuItem>
                        <MenuItem value='offline'>Hors ligne</MenuItem>
                        <MenuItem value='inactive'>Inactif</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title='Filtres avancés'>
                        <ActionButton color='#3B82F6'>
                          <FilterList />
                        </ActionButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {error && (
                <Alert
                  severity='error'
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha('#EF4444', 0.9)}, ${alpha('#DC2626', 0.9)})`,
                    color: 'white',
                    border: `1px solid ${alpha('#EF4444', 0.3)}`,
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              {/* Users Table */}
              <TableContainer sx={{ borderRadius: 3, background: 'transparent' }}>
                <Table aria-label='Tableau des utilisateurs'>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: alpha(colors?.red || '#f13544', 0.1),
                        '& th': {
                          borderBottom: `2px solid ${alpha(colors?.red || '#f13544', 0.3)}`,
                          py: 3,
                        },
                      }}
                    >
                      <StyledTableCell>Utilisateur</StyledTableCell>
                      <StyledTableCell>Rôle</StyledTableCell>
                      <StyledTableCell>Statut</StyledTableCell>
                      <StyledTableCell>Dernière Connexion</StyledTableCell>
                      <StyledTableCell>Date de Création</StyledTableCell>
                      <StyledTableCell align='center'>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((user, index) => {
                          // ✅ CORRECTION : Vérification sécurisée de l'utilisateur
                          if (!user) return null;

                          const roleInfo = formatRole(user.role);
                          const statusInfo = getStatus(user.lastLogin, user.isActive);

                          return (
                            <StyledTableRow
                              key={user._id}
                              status={statusInfo.status}
                              sx={{
                                animation: `${fadeInUp} 0.5s ease-out`,
                                animationDelay: `${index * 0.1}s`,
                                animationFillMode: 'both',
                              }}
                            >
                              <StyledTableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Badge
                                    overlap='circular'
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant='dot'
                                    sx={{
                                      '& .MuiBadge-dot': {
                                        backgroundColor: statusInfo.color,
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        border: `2px solid ${colors?.navy || '#010b40'}`,
                                      },
                                    }}
                                  >
                                    {/* ✅ CORRECTION : Utilisation du composant UserAvatar amélioré */}
                                    <UserAvatar user={user} size={48} />
                                  </Badge>
                                  <Box>
                                    <Typography
                                      sx={{
                                        color: colors?.white || '#ffffff',
                                        fontWeight: 700,
                                        fontSize: '1.05rem',
                                      }}
                                    >
                                      {user.prenom} {user.nom}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        color: alpha(colors?.white || '#ffffff', 0.7),
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                      }}
                                    >
                                      <Email sx={{ fontSize: 16 }} />
                                      {user.email}
                                    </Typography>
                                    {user.avatar && (
                                      <Typography
                                        sx={{
                                          color: alpha('#3B82F6', 0.8),
                                          fontSize: '0.75rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                          mt: 0.5,
                                        }}
                                      >
                                        <Visibility sx={{ fontSize: 14 }} />
                                        Avatar disponible
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </StyledTableCell>

                              <StyledTableCell>
                                <Chip
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <span>{roleInfo.icon}</span>
                                      {roleInfo.label}
                                    </Box>
                                  }
                                  sx={{
                                    bgcolor: alpha(roleInfo.color, 0.15),
                                    color: roleInfo.color,
                                    fontWeight: 700,
                                    border: `1px solid ${alpha(roleInfo.color, 0.3)}`,
                                    fontSize: '0.8rem',
                                    px: 1,
                                    py: 2,
                                  }}
                                />
                              </StyledTableCell>

                              <StyledTableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: statusInfo.color,
                                      animation:
                                        statusInfo.status === 'online'
                                          ? `${pulse} 2s infinite`
                                          : 'none',
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      color: statusInfo.color,
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                    }}
                                  >
                                    {statusInfo.label}
                                  </Typography>
                                </Box>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={user.isActive}
                                      onChange={(e) => handleToggleStatus(user, e.target.checked)}
                                      size='small'
                                      sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: '#10B981',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                          backgroundColor: '#10B981',
                                        },
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography
                                      sx={{
                                        color: alpha(colors?.white || '#ffffff', 0.7),
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      {user.isActive ? 'Actif' : 'Inactif'}
                                    </Typography>
                                  }
                                  sx={{ mt: 0.5, ml: 0 }}
                                />
                              </StyledTableCell>

                              <StyledTableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CalendarToday
                                    sx={{
                                      fontSize: 16,
                                      color: alpha(colors?.white || '#ffffff', 0.6),
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      color: alpha(colors?.white || '#ffffff', 0.9),
                                      fontWeight: 500,
                                    }}
                                  >
                                    {formatDate(user.lastLogin)}
                                  </Typography>
                                </Box>
                              </StyledTableCell>

                              <StyledTableCell>
                                <Typography
                                  sx={{
                                    color: alpha(colors?.white || '#ffffff', 0.8),
                                    fontSize: '0.9rem',
                                  }}
                                >
                                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                </Typography>
                              </StyledTableCell>

                              <StyledTableCell align='center'>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                  <Tooltip title='Voir le profil' arrow>
                                    <ActionButton
                                      onClick={() => openViewModal(user)}
                                      color='#3B82F6'
                                      sx={{
                                        bgcolor: alpha('#3B82F6', 0.15),
                                      }}
                                    >
                                      <Visibility fontSize='small' />
                                    </ActionButton>
                                  </Tooltip>

                                  <Tooltip title='Modifier' arrow>
                                    <ActionButton
                                      onClick={() => openEditModal(user)}
                                      color='#F59E0B'
                                      sx={{
                                        bgcolor: alpha('#F59E0B', 0.15),
                                      }}
                                    >
                                      <Edit fontSize='small' />
                                    </ActionButton>
                                  </Tooltip>

                                  <Tooltip title='Supprimer' arrow>
                                    <ActionButton
                                      onClick={() => handleDeleteClick(user)}
                                      color='#EF4444'
                                      sx={{
                                        bgcolor: alpha('#EF4444', 0.15),
                                      }}
                                    >
                                      <Delete fontSize='small' />
                                    </ActionButton>
                                  </Tooltip>
                                </Box>
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        })
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={6} align='center'>
                          <Box sx={{ py: 8, textAlign: 'center' }}>
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                background: `linear-gradient(135deg, ${alpha(colors?.red || '#f13544', 0.1)}, ${alpha(colors?.pink || '#ff6b74', 0.1)})`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                              }}
                            >
                              <Search sx={{ fontSize: 40, color: colors?.red || '#f13544' }} />
                            </Box>
                            <Typography
                              variant='h6'
                              sx={{
                                color: alpha(colors?.white || '#ffffff', 0.7),
                                mb: 1,
                                fontWeight: 600,
                              }}
                            >
                              Aucun utilisateur trouvé
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                color: alpha(colors?.white || '#ffffff', 0.5),
                              }}
                            >
                              Essayez de modifier vos critères de recherche
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <TablePagination
                  component='div'
                  count={filteredUsers.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage='Lignes par page:'
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                  }
                  sx={{
                    color: colors?.white || '#ffffff',
                    mt: 2,
                    '& .MuiTablePagination-select': {
                      color: colors?.white || '#ffffff',
                    },
                    '& .MuiTablePagination-selectIcon': {
                      color: colors?.white || '#ffffff',
                    },
                    '& .MuiTablePagination-actions button': {
                      color: colors?.white || '#ffffff',
                    },
                    '& .MuiTablePagination-selectLabel': {
                      color: alpha(colors?.white || '#ffffff', 0.7),
                    },
                    '& .MuiTablePagination-displayedRows': {
                      color: alpha(colors?.white || '#ffffff', 0.7),
                    },
                  }}
                />
              )}
            </UsersCard>
          </Box>
        </Fade>
      </Container>

      {/* Modal Ajout */}
      <StyledDialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: colors?.white || '#ffffff',
            fontSize: '1.5rem',
            textAlign: 'center',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(colors?.red || '#f13544', 0.2), width: 40, height: 40 }}>
              <Add sx={{ color: colors?.red || '#f13544' }} />
            </Avatar>
            Nouvel Utilisateur
          </Box>
        </DialogTitle>

        <DialogContent>
          {formError && (
            <Alert
              severity='error'
              sx={{
                mb: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha('#EF4444', 0.9)}, ${alpha('#DC2626', 0.9)})`,
                color: 'white',
              }}
              onClose={() => setFormError('')}
            >
              {formError}
            </Alert>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit(false);
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label='Nom'
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  fullWidth
                  required
                  aria-required='true'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label='Prénom'
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  fullWidth
                  required
                  aria-required='true'
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label='Email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  required
                  type='email'
                  aria-required='true'
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label='Mot de passe'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  required
                  type='password'
                  helperText='Minimum 6 caractères'
                  aria-required='true'
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label="URL de l'avatar (optionnel)"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  fullWidth
                  type='url'
                  helperText="Lien vers l'image de profil"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: alpha(colors?.white || '#ffffff', 0.7) }}>
                    Rôle
                  </InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    sx={{
                      color: colors?.white || '#ffffff',
                      borderRadius: 3,
                      '& .MuiSvgIcon-root': { color: colors?.white || '#ffffff' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors?.red || '#f13544', 0.3),
                        borderWidth: 2,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors?.red || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors?.red || '#f13544',
                      },
                    }}
                  >
                    <MenuItem value='ETUDIANT'>🎓 Étudiant</MenuItem>
                    <MenuItem value='ENSEIGNANT'>👨‍🏫 Enseignant</MenuItem>
                    <MenuItem value='ADMIN'>⚡ Administrateur</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            sx={{
              color: alpha(colors?.white || '#ffffff', 0.7),
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(colors?.white || '#ffffff', 0.1),
              },
            }}
          >
            Annuler
          </Button>
          <PrimaryButton
            onClick={() => handleFormSubmit(false)}
            disabled={formLoading}
            sx={{ px: 4 }}
          >
            {formLoading ? <CircularProgress size={24} /> : "Créer l'utilisateur"}
          </PrimaryButton>
        </DialogActions>
      </StyledDialog>

      {/* Modal Édition */}
      <StyledDialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: colors?.white || '#ffffff',
            fontSize: '1.5rem',
            textAlign: 'center',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha('#F59E0B', 0.2), width: 40, height: 40 }}>
              <Edit sx={{ color: '#F59E0B' }} />
            </Avatar>
            Modifier l'Utilisateur
          </Box>
        </DialogTitle>

        <DialogContent>
          {formError && (
            <Alert
              severity='error'
              sx={{
                mb: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha('#EF4444', 0.9)}, ${alpha('#DC2626', 0.9)})`,
                color: 'white',
              }}
              onClose={() => setFormError('')}
            >
              {formError}
            </Alert>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit(true);
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label='Nom'
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  fullWidth
                  required
                  aria-required='true'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label='Prénom'
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  fullWidth
                  required
                  aria-required='true'
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label='Email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  required
                  type='email'
                  aria-required='true'
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label='Mot de passe (optionnel)'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  type='password'
                  helperText='Laissez vide pour ne pas modifier'
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label="URL de l'avatar (optionnel)"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  fullWidth
                  type='url'
                  helperText="Lien vers l'image de profil"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: alpha(colors?.white || '#ffffff', 0.7) }}>
                    Rôle
                  </InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    sx={{
                      color: colors?.white || '#ffffff',
                      borderRadius: 3,
                      '& .MuiSvgIcon-root': { color: colors?.white || '#ffffff' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors?.red || '#f13544', 0.3),
                        borderWidth: 2,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors?.red || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors?.red || '#f13544',
                      },
                    }}
                  >
                    <MenuItem value='ETUDIANT'>🎓 Étudiant</MenuItem>
                    <MenuItem value='ENSEIGNANT'>👨‍🏫 Enseignant</MenuItem>
                    <MenuItem value='ADMIN'>⚡ Administrateur</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10B981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10B981',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: colors?.white || '#ffffff', fontWeight: 500 }}>
                      Compte actif
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            sx={{
              color: alpha(colors?.white || '#ffffff', 0.7),
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(colors?.white || '#ffffff', 0.1),
              },
            }}
          >
            Annuler
          </Button>
          <PrimaryButton
            onClick={() => handleFormSubmit(true)}
            disabled={formLoading}
            sx={{ px: 4 }}
          >
            {formLoading ? <CircularProgress size={24} /> : 'Mettre à jour'}
          </PrimaryButton>
        </DialogActions>
      </StyledDialog>

      {/* Modal Détails Utilisateur */}
      <StyledDialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: colors?.white || '#ffffff',
            fontSize: '1.5rem',
            textAlign: 'center',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha('#3B82F6', 0.2), width: 40, height: 40 }}>
              <Visibility sx={{ color: '#3B82F6' }} />
            </Avatar>
            Détails de l'Utilisateur
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <UserAvatar user={selectedUser} size={120} />
                  <Typography
                    variant='h6'
                    sx={{
                      color: colors?.white || '#ffffff',
                      mt: 2,
                      fontWeight: 700,
                    }}
                  >
                    {selectedUser.prenom} {selectedUser.nom}
                  </Typography>
                  <Chip
                    label={formatRole(selectedUser.role).label}
                    sx={{
                      bgcolor: alpha(formatRole(selectedUser.role).color, 0.2),
                      color: formatRole(selectedUser.role).color,
                      fontWeight: 600,
                      mt: 1,
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: alpha(colors?.red || '#f13544', 0.05),
                    border: `1px solid ${alpha(colors?.red || '#f13544', 0.1)}`,
                  }}
                >
                  <Typography variant='h6' sx={{ color: colors?.white || '#ffffff', mb: 2 }}>
                    Informations Personnelles
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        sx={{ color: alpha(colors?.white || '#ffffff', 0.7), fontSize: '0.9rem' }}
                      >
                        📧 Email:
                      </Typography>
                      <Typography sx={{ color: colors?.white || '#ffffff', fontWeight: 600 }}>
                        {selectedUser.email}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        sx={{ color: alpha(colors?.white || '#ffffff', 0.7), fontSize: '0.9rem' }}
                      >
                        🎯 Statut:
                      </Typography>
                      <Typography
                        sx={{
                          color: selectedUser.isActive ? '#10B981' : '#EF4444',
                          fontWeight: 600,
                        }}
                      >
                        {selectedUser.isActive ? 'Actif' : 'Inactif'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        sx={{ color: alpha(colors?.white || '#ffffff', 0.7), fontSize: '0.9rem' }}
                      >
                        📅 Créé le:
                      </Typography>
                      <Typography sx={{ color: colors?.white || '#ffffff', fontWeight: 600 }}>
                        {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        sx={{ color: alpha(colors?.white || '#ffffff', 0.7), fontSize: '0.9rem' }}
                      >
                        🔗 Dernière connexion:
                      </Typography>
                      <Typography sx={{ color: colors?.white || '#ffffff', fontWeight: 600 }}>
                        {formatDate(selectedUser.lastLogin)}
                      </Typography>
                    </Grid>

                    {selectedUser.avatar && (
                      <Grid item xs={12}>
                        <Typography
                          sx={{ color: alpha(colors?.white || '#ffffff', 0.7), fontSize: '0.9rem' }}
                        >
                          🖼️ Avatar:
                        </Typography>
                        <Typography
                          sx={{
                            color: '#3B82F6',
                            fontWeight: 600,
                            wordBreak: 'break-all',
                          }}
                        >
                          {selectedUser.avatar}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setViewModalOpen(false)}
            sx={{
              color: alpha(colors?.white || '#ffffff', 0.7),
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(colors?.white || '#ffffff', 0.1),
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Dialog Suppression */}
      <StyledDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: colors?.white || '#ffffff',
            fontSize: '1.5rem',
            textAlign: 'center',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha('#EF4444', 0.2), width: 40, height: 40 }}>
              <Delete sx={{ color: '#EF4444' }} />
            </Avatar>
            Confirmer la suppression
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: colors?.white || '#ffffff',
              textAlign: 'center',
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <Box component='span' sx={{ color: colors?.red || '#f13544', fontWeight: 700 }}>
              {selectedUser?.prenom} {selectedUser?.nom}
            </Box>
            ? Cette action est irréversible.
          </Typography>

          {selectedUser && (
            <Box
              sx={{
                mt: 3,
                p: 3,
                borderRadius: 3,
                background: alpha(colors?.red || '#f13544', 0.1),
                border: `1px solid ${alpha(colors?.red || '#f13544', 0.3)}`,
              }}
            >
              <Typography sx={{ color: colors?.white || '#ffffff', fontWeight: 600, mb: 1 }}>
                Informations de l'utilisateur:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ color: alpha(colors?.white || '#ffffff', 0.8) }}>
                  📧 Email: {selectedUser.email}
                </Typography>
                <Typography sx={{ color: alpha(colors?.white || '#ffffff', 0.8) }}>
                  🎯 Rôle: {formatRole(selectedUser.role).label}
                </Typography>
                <Typography sx={{ color: alpha(colors?.white || '#ffffff', 0.8) }}>
                  📅 Créé le: {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                </Typography>
                {selectedUser.avatar && (
                  <Typography sx={{ color: alpha(colors?.white || '#ffffff', 0.8) }}>
                    🖼️ Avatar: {selectedUser.avatar ? 'Défini' : 'Non défini'}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: alpha(colors?.white || '#ffffff', 0.7),
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(colors?.white || '#ffffff', 0.1),
              },
            }}
          >
            Annuler
          </Button>
          <PrimaryButton onClick={handleDeleteConfirm} customcolor='#EF4444' sx={{ px: 4 }}>
            Supprimer définitivement
          </PrimaryButton>
        </DialogActions>
      </StyledDialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? 'error' : 'success'}
          sx={{
            boxShadow: 4,
            borderRadius: 3,
            background: error
              ? `linear-gradient(135deg, ${alpha('#EF4444', 0.95)}, ${alpha('#DC2626', 0.95)})`
              : `linear-gradient(135deg, ${alpha('#10B981', 0.95)}, ${alpha('#059669', 0.95)})`,
            color: colors?.white || '#ffffff',
            fontWeight: 600,
            fontSize: '1rem',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              color: colors?.white || '#ffffff',
              fontSize: '1.5rem',
            },
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </UsersContainer>
  );
};

export default Users;
