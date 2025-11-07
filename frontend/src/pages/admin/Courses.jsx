// src/pages/admin/Courses.jsx - CORRIGÉ AVEC UPLOAD PROFESSIONNEL
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
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
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Delete,
  Edit,
  Visibility,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search,
  School,
  CheckCircle,
  Schedule,
  Publish as PublishIcon,
  Timer as TimerIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  TrendingUp as LevelIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  Preview as PreviewIcon,
  CloudUpload as UploadIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  VideoFile as VideoFileIcon,
  Description as TextIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const COURSES_BASE_URL = `${API_BASE_URL}/courses`;
const USERS_BASE_URL = `${API_BASE_URL}/users`;
const UPLOAD_BASE_URL = `${API_BASE_URL}/upload`;

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
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

// Composant d'upload de fichiers professionnel
const FileUploadZone = styled(Box)(({ theme, isDragActive, isUploading, hasError }) => ({
  border: `2px dashed ${
    hasError
      ? theme.palette.error.main
      : isDragActive
        ? colors.fuchsia
        : alpha(colors.fuchsia || '#f13544', 0.4)
  }`,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive
    ? alpha(colors.fuchsia || '#f13544', 0.1)
    : alpha(colors.navy || '#010b40', 0.3),
  position: 'relative',
  overflow: 'hidden',
  animation: hasError ? `${shake} 0.5s ease` : 'none',
  '&:hover': {
    borderColor: colors.fuchsia || '#f13544',
    backgroundColor: alpha(colors.fuchsia || '#f13544', 0.05),
  },
}));

const UploadProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(colors.white || '#ffffff', 0.1),
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${colors.fuchsia || '#f13544'}, ${colors.lightFuchsia || '#ff6b74'})`,
    borderRadius: 4,
  },
}));

const FilePreview = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  backgroundColor: alpha(colors.navy || '#010b40', 0.6),
  border: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.2)}`,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(colors.navy || '#010b40', 0.8),
    borderColor: colors.fuchsia || '#f13544',
  },
}));

const FileIconWrapper = styled(Box)(({ theme, fileType }) => ({
  width: 48,
  height: 48,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: getFileTypeColor(fileType),
  color: colors.white || '#ffffff',
  fontSize: 24,
}));

function getFileTypeColor(fileType) {
  const type = fileType?.toLowerCase() || '';
  if (type.includes('pdf')) return '#f44336';
  if (type.includes('video')) return '#ff4081';
  if (type.includes('image')) return '#4caf50';
  if (type.includes('text') || type.includes('doc')) return '#2196f3';
  return '#9c27b0';
}

function getFileIcon(fileType) {
  const type = fileType?.toLowerCase() || '';
  if (type.includes('pdf')) return <PdfIcon />;
  if (type.includes('video')) return <VideoFileIcon />;
  if (type.includes('image')) return <TextIcon />;
  if (type.includes('text') || type.includes('doc')) return <TextIcon />;
  return <FileIcon />;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Composant d'upload réutilisable
const ProfessionalFileUpload = ({
  onFileUpload,
  acceptedTypes = '*',
  maxSize = 100 * 1024 * 1024, // 100MB par défaut
  multiple = false,
  label = 'Déposez vos fichiers ici ou cliquez pour parcourir',
  uploadUrl = UPLOAD_BASE_URL,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // Reset input
  }, []);

  const validateFile = (file) => {
    // Validation de la taille
    if (file.size > maxSize) {
      throw new Error(
        `Le fichier ${file.name} dépasse la taille maximale de ${formatFileSize(maxSize)}`
      );
    }

    // Validation du type (simplifiée)
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions =
      acceptedTypes === '*'
        ? ['*']
        : acceptedTypes.split(',').map((ext) => ext.trim().replace('.', ''));

    if (acceptedTypes !== '*' && !allowedExtensions.includes('*')) {
      const isValid = allowedExtensions.some((ext) => {
        if (ext === fileExtension) return true;
        if (ext.includes('/')) {
          // Validation MIME type
          return file.type.includes(ext.split('/')[0]);
        }
        return false;
      });

      if (!isValid) {
        throw new Error(
          `Type de fichier non supporté: ${file.name}. Types autorisés: ${allowedExtensions.join(', ')}`
        );
      }
    }

    return true;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', 'course_content');

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
        timeout: 300000, // 5 minutes timeout pour les gros fichiers
      });

      if (response.data && response.data.url) {
        return {
          url: response.data.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        };
      } else {
        throw new Error('Aucune URL retournée par le serveur');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: Le téléchargement a pris trop de temps');
      }
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement');
    }
  };

  const handleFiles = async (files) => {
    if (!files.length) return;

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validation des fichiers
      for (const file of files) {
        validateFile(file);
      }

      const uploadPromises = files.map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);

      // Mettre à jour la liste des fichiers uploadés
      setUploadedFiles((prev) => [...prev, ...results]);

      // Notifier le parent
      if (onFileUpload) {
        onFileUpload(results);
      }
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du traitement des fichiers:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    document.getElementById('file-input').click();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Zone de dépôt */}
      <FileUploadZone
        isDragActive={isDragActive}
        isUploading={isUploading}
        hasError={!!error}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id='file-input'
          type='file'
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <UploadIcon
          sx={{ fontSize: 48, color: colors.fuchsia, mb: 2, opacity: isUploading ? 0.5 : 1 }}
        />

        <Typography variant='h6' sx={{ color: colors.white, mb: 1 }}>
          {isUploading ? 'Téléchargement en cours...' : label}
        </Typography>

        <Typography variant='body2' sx={{ color: alpha(colors.white, 0.7), mb: 2 }}>
          Formats supportés: PDF, MP4, MP3, DOC, DOCX, PPT, PPTX, IMAGES
          <br />
          Taille max: {formatFileSize(maxSize)}
        </Typography>

        {isUploading && (
          <Box sx={{ width: '100%', maxWidth: 300, mx: 'auto' }}>
            <UploadProgress variant='determinate' value={uploadProgress} />
            <Typography variant='caption' sx={{ color: colors.white, mt: 1 }}>
              {uploadProgress}% complété
            </Typography>
          </Box>
        )}
      </FileUploadZone>

      {/* Message d'erreur */}
      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Prévisualisation des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant='h6' sx={{ color: colors.white, mb: 2 }}>
            Fichiers téléchargés ({uploadedFiles.length})
          </Typography>
          {uploadedFiles.map((file, index) => (
            <FilePreview key={index}>
              <FileIconWrapper fileType={file.mimeType}>
                {getFileIcon(file.mimeType)}
              </FileIconWrapper>
              <Box sx={{ flex: 1 }}>
                <Typography variant='body1' sx={{ color: colors.white, fontWeight: 600 }}>
                  {file.fileName}
                </Typography>
                <Typography variant='caption' sx={{ color: alpha(colors.white, 0.7) }}>
                  {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                </Typography>
              </Box>
              <IconButton
                size='small'
                onClick={() => removeFile(index)}
                sx={{ color: colors.fuchsia }}
              >
                <CloseIcon />
              </IconButton>
            </FilePreview>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Styles restants...
const StatsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.navy || '#010b40', 0.8)}, ${alpha(colors.lightNavy || '#1a237e', 0.8)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.2)}`,
  borderRadius: 16,
  padding: theme.spacing(2),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${alpha(colors.fuchsia || '#f13544', 0.3)}`,
    borderColor: alpha(colors.fuchsia || '#f13544', 0.5),
  },
}));

const TableCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.navy || '#010b40', 0.95)}, ${alpha(colors.lightNavy || '#1a237e', 0.95)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.2)}`,
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
  borderBottom: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.1)}`,
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: { fontSize: '0.85rem', padding: theme.spacing(1) },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(colors.fuchsia || '#f13544', 0.08),
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
  background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}, ${colors.lightFuchsia || '#ff6b74'})`,
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: `0 8px 24px ${alpha(colors.fuchsia || '#f13544', 0.4)}`,
  color: colors.white || '#ffffff',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}dd, ${colors.lightFuchsia || '#ff6b74'}dd)`,
    boxShadow: `0 12px 32px ${alpha(colors.fuchsia || '#f13544', 0.6)}`,
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(1, 2), fontSize: '0.9rem' },
}));

const Courses = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  // State management principal
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
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
    instructeurId: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [domaines, setDomaines] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // États pour la gestion des sections et contenus
  const [contenu, setContenu] = useState({ sections: [] });
  const [currentSection, setCurrentSection] = useState({
    titre: '',
    description: '',
    ordre: 1,
    modules: [],
  });
  const [currentModule, setCurrentModule] = useState({
    titre: '',
    type: 'VIDEO',
    contenu: '',
    duree: '',
    ordre: 1,
    metadata: null,
  });
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingModuleIndex, setEditingModuleIndex] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPreviewSection, setSelectedPreviewSection] = useState(null);

  // CORRECTION: Types de modules mis à jour pour correspondre au backend
  const typesModule = [
    {
      value: 'VIDEO',
      label: 'Vidéo',
      icon: <VideoIcon />,
      description: 'Contenu vidéo (URL YouTube, Vimeo, etc.)',
      acceptedFiles: 'video/*',
    },
    {
      value: 'DOCUMENT',
      label: 'Document',
      icon: <ArticleIcon />,
      description: 'Document PDF, Word, PowerPoint, etc.',
      acceptedFiles: '.pdf,.doc,.docx,.ppt,.pptx,.txt',
    },
    {
      value: 'QUIZ',
      label: 'Quiz',
      icon: <QuizIcon />,
      description: 'Évaluation interactive',
      acceptedFiles: null, // Pas de fichier pour les quiz
    },
    {
      value: 'EXERCICE',
      label: 'Exercice',
      icon: <DescriptionIcon />,
      description: 'Exercice pratique ou devoir',
      acceptedFiles: '.pdf,.doc,.docx,.zip,.rar',
    },
  ];

  const niveaux = [
    {
      value: 'ALFA',
      label: 'Alfa (Débutant)',
      color: '#4CAF50',
      description: 'Pour les débutants absolus, aucune connaissance préalable requise.',
    },
    {
      value: 'BETA',
      label: 'Beta (Intermédiaire)',
      color: '#2196F3',
      description: 'Pour ceux avec des bases solides, prêt à approfondir.',
    },
    {
      value: 'GAMMA',
      label: 'Gamma (Avancé)',
      color: '#FF9800',
      description: 'Pour les apprenants expérimentés, concepts complexes.',
    },
    {
      value: 'DELTA',
      label: 'Delta (Expert)',
      color: '#F44336',
      description: 'Pour les professionnels, maîtrise avancée et applications réelles.',
    },
  ];

  // Vérification admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      setError('Accès réservé aux administrateurs');
      setTimeout(() => navigate('/unauthorized'), 2000);
    }
  }, [user, authLoading, navigate]);

  // CORRECTION AMÉLIORÉE : Récupération des domaines
  const fetchDomaines = useCallback(async () => {
    if (!user?.token) return;
    try {
      const endpoints = [
        `${API_BASE_URL}/domaines`,
        `${API_BASE_URL}/instructeurs/domaines`,
        `${API_BASE_URL}/categories`,
      ];

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Tentative de récupération des domaines depuis: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          if (
            response.data &&
            (response.data.data || response.data.length > 0 || response.data.domaines)
          ) {
            console.log(`✅ Endpoint ${endpoint} réussi`);
            break;
          }
        } catch (err) {
          lastError = err;
          console.log(`❌ Endpoint ${endpoint} non disponible:`, err.message);
        }
      }

      if (!response) {
        console.error('❌ Tous les endpoints de domaines ont échoué');
        throw lastError || new Error('Aucun endpoint pour les domaines disponible');
      }

      let domainesData = [];
      if (Array.isArray(response.data.data)) {
        domainesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        domainesData = response.data;
      } else if (Array.isArray(response.data.domaines)) {
        domainesData = response.data.domaines;
      }

      console.log(`📚 ${domainesData.length} domaines trouvés`);

      const formattedDomaines = domainesData.map((domaine) => ({
        _id: domaine._id?.toString() || domaine.id?.toString(),
        nom: domaine.nom || domaine.name || 'Domaine sans nom',
      }));

      setDomaines(formattedDomaines);

      if (formattedDomaines.length === 0) {
        console.warn('⚠️ Aucun domaine trouvé');
        setError("Aucun domaine disponible. Contactez l'administrateur pour en ajouter.");
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des domaines:', err);
      const errorMsg =
        err.response?.status === 404
          ? "Les domaines ne sont pas encore configurés. Contactez l'administrateur backend."
          : 'Erreur lors du chargement des domaines disponibles';
      setError(errorMsg);

      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
    }
  }, [user, navigate]);

  // CORRECTION AMÉLIORÉE : Récupération des instructeurs
  const fetchInstructors = useCallback(async () => {
    if (!user?.token) {
      console.warn('Aucun token utilisateur disponible');
      return;
    }
    try {
      console.log('🔍 Tentative de récupération des instructeurs...');

      const endpoints = [
        `${API_BASE_URL}/instructeurs`,
        `${API_BASE_URL}/users/instructeurs`,
        `${API_BASE_URL}/users?role=ENSEIGNANT`,
        `${API_BASE_URL}/users?role=TEACHER`,
        `${USERS_BASE_URL}?role=ENSEIGNANT`,
      ];

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Essai de l'endpoint: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          const hasData =
            response.data &&
            (Array.isArray(response.data.data) ||
              Array.isArray(response.data) ||
              Array.isArray(response.data.instructeurs) ||
              Array.isArray(response.data.users));

          if (hasData) {
            console.log(`✅ Endpoint ${endpoint} réussi`);
            break;
          }
        } catch (err) {
          lastError = err;
          console.log(`❌ Endpoint ${endpoint} non disponible:`, err.message);
        }
      }

      if (!response) {
        console.error('❌ Tous les endpoints ont échoué');
        throw lastError || new Error('Aucun endpoint pour les instructeurs disponible');
      }

      console.log('📦 Données reçues:', response.data);

      let instructorsData = [];
      if (Array.isArray(response.data.data)) {
        instructorsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        instructorsData = response.data;
      } else if (Array.isArray(response.data.instructeurs)) {
        instructorsData = response.data.instructeurs;
      } else if (Array.isArray(response.data.users)) {
        instructorsData = response.data.users;
      }

      console.log(`👨‍🏫 ${instructorsData.length} instructeurs trouvés avant filtrage`);

      const filteredInstructors = instructorsData.filter(
        (instructor) =>
          instructor.role === 'ENSEIGNANT' ||
          instructor.role === 'TEACHER' ||
          instructor.role === 'ADMIN' ||
          instructor.role === 'INSTRUCTOR'
      );

      console.log(`👨‍🏫 ${filteredInstructors.length} instructeurs après filtrage`);

      const formattedInstructors = filteredInstructors.map((instructor) => {
        const id =
          instructor._id?.toString() || instructor.id?.toString() || Math.random().toString();

        let nomComplet = instructor.username || instructor.displayName || '';

        if (!nomComplet) {
          const prenom = instructor.prenom || instructor.firstName || '';
          const nom = instructor.nom || instructor.lastName || '';
          nomComplet = `${prenom} ${nom}`.trim();
        }

        if (!nomComplet) {
          nomComplet = instructor.email || 'Instructeur sans nom';
        }

        return {
          ...instructor,
          _id: id,
          nom: nomComplet,
          email: instructor.email || 'Email non disponible',
        };
      });

      setInstructors(formattedInstructors);

      if (formattedInstructors.length === 0) {
        console.warn('⚠️ Aucun instructeur trouvé');
        setError("Aucun instructeur disponible. Veuillez créer des comptes enseignants d'abord.");
      } else {
        console.log(`✅ ${formattedInstructors.length} instructeurs chargés avec succès`);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des instructeurs:', err);

      let errorMessage = 'Erreur lors du chargement des instructeurs disponibles';

      if (err.response?.status === 404) {
        errorMessage =
          "Endpoint des instructeurs non disponible. Contactez l'administrateur backend.";
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        navigate('/login');
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  }, [user, navigate]);

  // Récupération des stats
  const fetchStats = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await axios.get(`${COURSES_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
    }
  }, [user, navigate]);

  // CORRECTION AMÉLIORÉE : Récupération des cours
  const fetchCourses = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
      const apiPage = page + 1;
      const response = await axios.get(`${COURSES_BASE_URL}`, {
        params: {
          page: apiPage,
          limit: rowsPerPage,
          search,
          statusFilter,
          approvalFilter,
        },
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const coursesData = response.data.data || response.data || [];
      console.log('📚 Cours reçus:', coursesData);

      const normalizedCourses = coursesData.map((course) => {
        let instructeurInfo = null;

        if (course.instructeurId) {
          if (typeof course.instructeurId === 'object' && course.instructeurId !== null) {
            instructeurInfo = {
              _id: course.instructeurId._id?.toString() || course.instructeurId.toString(),
              nom:
                course.instructeurId.username ||
                course.instructeurId.nom ||
                course.instructeurId.displayName ||
                `${course.instructeurId.prenom || ''} ${course.instructeurId.nom || ''}`.trim() ||
                'Instructeur inconnu',
              email: course.instructeurId.email || 'Email non disponible',
            };
          } else {
            const foundInstructor = instructors.find(
              (instr) => instr._id === course.instructeurId.toString()
            );
            instructeurInfo = foundInstructor
              ? {
                  _id: foundInstructor._id,
                  nom: foundInstructor.nom,
                  email: foundInstructor.email,
                }
              : {
                  _id: course.instructeurId.toString(),
                  nom: 'Instructeur non chargé',
                  email: 'Email non disponible',
                };
          }
        }

        let domaineInfo = null;
        if (course.domaineId) {
          if (typeof course.domaineId === 'object' && course.domaineId !== null) {
            domaineInfo = {
              _id: course.domaineId._id?.toString() || course.domaineId.toString(),
              nom: course.domaineId.nom || course.domaineId.name || 'Domaine non défini',
            };
          } else {
            const foundDomaine = domaines.find((dom) => dom._id === course.domaineId.toString());
            domaineInfo = foundDomaine
              ? {
                  _id: foundDomaine._id,
                  nom: foundDomaine.nom,
                }
              : {
                  _id: course.domaineId.toString(),
                  nom: 'Domaine non chargé',
                };
          }
        }

        return {
          ...course,
          _id: course._id?.toString() || course.id?.toString(),
          titre: course.titre || 'Sans titre',
          niveau: course.niveau || 'N/A',
          createur: course.createur || null,
          estPublie: course.estPublie || false,
          domaineId: domaineInfo || { _id: null, nom: 'Domaine non défini' },
          instructeurId: instructeurInfo,
          duree: course.duree || 0,
          contenu: course.contenu || { sections: [] },
          statutApprobation: course.statutApprobation || 'PENDING',
          createdAt: course.createdAt,
        };
      });

      setCourses(normalizedCourses);
      setTotal(response.data.total || normalizedCourses.length);

      console.log(`✅ ${normalizedCourses.length} cours normalisés avec succès`);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des cours:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    page,
    rowsPerPage,
    search,
    statusFilter,
    approvalFilter,
    navigate,
    instructors,
    domaines,
  ]);

  // Chargement initial
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      console.log('👑 Utilisateur admin détecté, récupération des données...');
      fetchDomaines();
      fetchInstructors();
      fetchStats();
    } else {
      console.warn('Accès non autorisé ou utilisateur non chargé:', user);
    }
  }, [user, fetchDomaines, fetchInstructors, fetchStats]);

  // Recharger les cours quand les dépendances changent
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchCourses();
    }
  }, [user, page, rowsPerPage, search, statusFilter, approvalFilter, fetchCourses]);

  // Gestion des contenus lors de l'ouverture de la modale
  useEffect(() => {
    if (modalOpen && editingCourse?._id) {
      setTabValue(0);
      setFormError('');
      if (modalMode === 'create') {
        setContenu({ sections: [] });
        setCurrentSection({
          titre: '',
          description: '',
          ordre: 1,
          modules: [],
        });
        setCurrentModule({
          titre: '',
          type: 'VIDEO',
          contenu: '',
          duree: '',
          ordre: 1,
          metadata: null,
        });
      } else if (editingCourse?._id && editingCourse.contenu) {
        setContenu(editingCourse.contenu);
      }
    }
  }, [modalOpen, modalMode, editingCourse?._id]);

  // NOUVELLE FONCTION : Gestion de l'upload de fichiers pour les modules
  const handleModuleFileUpload = (uploadedFiles) => {
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0]; // Prendre le premier fichier
      setCurrentModule((prev) => ({
        ...prev,
        contenu: file.url,
        metadata: {
          fileName: file.fileName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          uploadedAt: file.uploadedAt,
        },
      }));
      setSuccess(`Fichier "${file.fileName}" uploadé avec succès`);
      setSnackbarOpen(true);
    }
  };

  // Handlers pour les sections et modules
  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setCurrentSection((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setCurrentModule((prev) => ({ ...prev, [name]: value }));
  };

  const addModule = () => {
    if (!currentModule.titre.trim()) {
      setFormError('Le titre du module est requis');
      return;
    }

    // CORRECTION: Validation spécifique selon le type
    if (currentModule.type === 'DOCUMENT' && !currentModule.contenu) {
      setFormError('Veuillez uploader un fichier pour le module document');
      return;
    }

    if (
      (currentModule.type === 'VIDEO' || currentModule.type === 'EXERCICE') &&
      !currentModule.contenu.trim()
    ) {
      setFormError('Le contenu du module est requis');
      return;
    }

    // CORRECTION: S'assurer que la durée est valide
    const duree = currentModule.duree ? parseInt(currentModule.duree) : 0;
    if (duree < 0) {
      setFormError('La durée doit être un nombre positif');
      return;
    }

    const newModule = {
      ...currentModule,
      duree: duree || 1, // Durée par défaut de 1 minute
      ordre: currentSection.modules.length + 1,
    };

    if (editingModuleIndex !== null) {
      const updatedModules = [...currentSection.modules];
      updatedModules[editingModuleIndex] = newModule;
      setCurrentSection((prev) => ({
        ...prev,
        modules: updatedModules,
      }));
      setEditingModuleIndex(null);
    } else {
      setCurrentSection((prev) => ({
        ...prev,
        modules: [...prev.modules, newModule],
      }));
    }

    setCurrentModule({
      titre: '',
      type: 'VIDEO',
      contenu: '',
      duree: '',
      ordre: currentSection.modules.length + 2,
      metadata: null,
    });
    setFormError('');
  };

  const editModule = (index) => {
    const module = currentSection.modules[index];
    setCurrentModule(module);
    setEditingModuleIndex(index);
  };

  const removeModule = (index) => {
    setCurrentSection((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
    if (editingModuleIndex === index) {
      setEditingModuleIndex(null);
      setCurrentModule({
        titre: '',
        type: 'VIDEO',
        contenu: '',
        duree: '',
        ordre: 1,
        metadata: null,
      });
    }
  };

  const cancelEditModule = () => {
    setEditingModuleIndex(null);
    setCurrentModule({
      titre: '',
      type: 'VIDEO',
      contenu: '',
      duree: '',
      ordre: currentSection.modules.length + 1,
      metadata: null,
    });
  };

  const addSection = () => {
    if (!currentSection.titre.trim()) {
      setFormError('Le titre de la section est requis');
      return;
    }

    if (currentSection.modules.length === 0) {
      setFormError('Ajoutez au moins un module à la section');
      return;
    }

    const newSection = {
      ...currentSection,
      ordre: contenu.sections.length + 1,
    };

    if (editingSectionIndex !== null) {
      const updatedSections = [...contenu.sections];
      updatedSections[editingSectionIndex] = newSection;
      setContenu({ sections: updatedSections });
      setEditingSectionIndex(null);
    } else {
      setContenu((prev) => ({
        sections: [...prev.sections, newSection],
      }));
    }

    setCurrentSection({
      titre: '',
      description: '',
      ordre: contenu.sections.length + 2,
      modules: [],
    });
    setFormError('');
  };

  const editSection = (index) => {
    const section = contenu.sections[index];
    setCurrentSection(section);
    setEditingSectionIndex(index);
  };

  const removeSection = (index) => {
    setContenu((prev) => ({
      sections: prev.sections.filter((_, i) => i !== index),
    }));
    if (editingSectionIndex === index) {
      setEditingSectionIndex(null);
      setCurrentSection({
        titre: '',
        description: '',
        ordre: 1,
        modules: [],
      });
    }
  };

  const cancelEditSection = () => {
    setEditingSectionIndex(null);
    setCurrentSection({
      titre: '',
      description: '',
      ordre: contenu.sections.length + 1,
      modules: [],
    });
  };

  const previewSection = (section) => {
    setSelectedPreviewSection(section);
    setPreviewDialogOpen(true);
  };

  // Ouvrir la modale pour création/édition
  const openModal = (mode, course = null) => {
    setModalMode(mode);
    if (mode === 'edit' && course?._id) {
      setEditingCourse(course);
      setFormData({
        titre: course.titre || '',
        description: course.description || '',
        domaineId: course.domaineId?._id || '',
        niveau: course.niveau || '',
        duree: course.duree ? String(course.duree) : '',
        estPublie: !!course.estPublie,
        statutApprobation: course.statutApprobation || 'PENDING',
        instructeurId: course.instructeurId?._id || '',
      });
      setContenu(course.contenu || { sections: [] });
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
        instructeurId: '',
      });
      setContenu({ sections: [] });
    }
    setModalOpen(true);
  };

  // CORRECTION AMÉLIORÉE : Validation du formulaire
  const validateForm = () => {
    if (!formData.titre?.trim()) return 'Le titre est requis';
    if (formData.titre.trim().length < 5) return 'Le titre doit contenir au moins 5 caractères';
    if (!formData.description?.trim()) return 'La description est requise';
    if (formData.description.trim().length < 20)
      return 'La description doit contenir au moins 20 caractères';
    if (!formData.domaineId) return 'Le domaine est requis';
    if (!formData.niveau) return 'Le niveau est requis';

    const dureeNum = parseFloat(formData.duree);
    if (!formData.duree || isNaN(dureeNum) || dureeNum <= 0) {
      return 'La durée doit être un nombre positif';
    }

    if (!['ALFA', 'BETA', 'GAMMA', 'DELTA'].includes(formData.niveau)) {
      return 'Le niveau doit être ALFA, BETA, GAMMA ou DELTA';
    }

    return '';
  };

  // CORRECTION AMÉLIORÉE : Soumission du formulaire cours
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
        contenu: contenu.sections.length > 0 ? contenu : null,
      };

      console.log('📤 Données envoyées:', data);

      let response;
      if (modalMode === 'create') {
        response = await axios.post(COURSES_BASE_URL, data, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccess('Cours créé avec succès');
      } else if (editingCourse?._id) {
        response = await axios.put(`${COURSES_BASE_URL}/${editingCourse._id}`, data, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccess('Cours mis à jour avec succès');
      } else {
        throw new Error('ID du cours manquant pour la mise à jour');
      }

      setSnackbarOpen(true);
      setModalOpen(false);
      fetchCourses();
      fetchStats();
    } catch (err) {
      console.error('❌ Erreur lors de la soumission du formulaire:', err);

      let errorMessage = "Erreur lors de l'opération sur le cours";

      if (err.response?.status === 400) {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        navigate('/login');
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas la permission d'effectuer cette action.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errorDetails = err.response.data.errors || [];
        errorMessage = `${errorMessage} - Détails: ${errorDetails.map((e) => e.msg || e.message).join(', ')}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Publication du cours
  const handlePublish = async (course) => {
    if (!course?._id) {
      setError('ID du cours invalide');
      setSnackbarOpen(true);
      return;
    }
    try {
      await axios.put(
        `${COURSES_BASE_URL}/${course._id}`,
        {
          estPublie: true,
          statutApprobation: 'APPROVED',
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setSuccess('Cours publié avec succès');
      setSnackbarOpen(true);
      fetchCourses();
      fetchStats();
    } catch (err) {
      console.error('Erreur lors de la publication:', err);
      setError(err.response?.data?.message || 'Erreur lors de la publication du cours');
      setSnackbarOpen(true);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
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
      await axios.delete(`${COURSES_BASE_URL}/${selectedCourse._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('Cours supprimé avec succès');
      setSnackbarOpen(true);
      fetchCourses();
      fetchStats();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du cours');
      setSnackbarOpen(true);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  // Affichage des détails du cours
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

  const getContenusCount = (contenu) => {
    if (!contenu || !contenu.sections) return 0;
    return contenu.sections.reduce((acc, section) => acc + (section.modules?.length || 0), 0);
  };

  // NOUVEAU: Rendu du champ de contenu selon le type de module
  const renderModuleContentField = () => {
    const currentType = typesModule.find((t) => t.value === currentModule.type);

    switch (currentModule.type) {
      case 'DOCUMENT':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' sx={{ color: colors.white, mb: 1 }}>
              Télécharger un document
            </Typography>
            <ProfessionalFileUpload
              onFileUpload={handleModuleFileUpload}
              acceptedTypes={currentType?.acceptedFiles}
              maxSize={50 * 1024 * 1024} // 50MB
              multiple={false}
              label='Déposez votre document ici ou cliquez pour parcourir'
            />
            {currentModule.contenu && (
              <Alert severity='success' sx={{ mt: 2 }}>
                Fichier uploadé: {currentModule.metadata?.fileName}
              </Alert>
            )}
          </Box>
        );

      case 'VIDEO':
        return (
          <TextField
            label='URL de la vidéo *'
            name='contenu'
            value={currentModule.contenu}
            onChange={handleModuleChange}
            fullWidth
            required
            placeholder='https://www.youtube.com/watch?v=... ou https://vimeo.com/...'
            helperText='URL YouTube, Vimeo, ou autre service de streaming vidéo'
            sx={{ mt: 2 }}
          />
        );

      case 'EXERCICE':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' sx={{ color: colors.white, mb: 1 }}>
              Instructions de l'exercice ou fichier
            </Typography>
            <ProfessionalFileUpload
              onFileUpload={handleModuleFileUpload}
              acceptedTypes={currentType?.acceptedFiles}
              maxSize={20 * 1024 * 1024} // 20MB
              multiple={false}
              label="Déposez les instructions ou le fichier d'exercice"
            />
            <TextField
              label='Instructions (optionnel si fichier uploadé)'
              name='contenu'
              value={currentModule.contenu}
              onChange={handleModuleChange}
              fullWidth
              multiline
              rows={3}
              placeholder='Décrivez les consignes de l exercice...'
              sx={{ mt: 2 }}
            />
          </Box>
        );

      case 'QUIZ':
        return (
          <TextField
            label='Identifiant du Quiz *'
            name='contenu'
            value={currentModule.contenu}
            onChange={handleModuleChange}
            fullWidth
            required
            placeholder='ID du quiz créé dans la section évaluations'
            helperText='Référencez un quiz existant par son identifiant'
            sx={{ mt: 2 }}
          />
        );

      default:
        return null;
    }
  };

  // Rendu du contenu des sections pour la modale
  const renderStructureContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography
        variant='h5'
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: colors.fuchsia || '#f13544',
          mb: 3,
        }}
      >
        <ArticleIcon fontSize='large' />
        Structure du Contenu du Cours
      </Typography>

      <Alert severity='info' sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant='body2'>
          Structurez votre cours en sections et modules. Chaque section peut contenir plusieurs
          modules de différents types (vidéos, documents, quiz, exercices).
        </Typography>
      </Alert>

      {/* Sections existantes */}
      {contenu.sections.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: `${colors.navy || '#010b40'}aa`,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant='h6' sx={{ color: colors.lightFuchsia }}>
              Sections du Cours ({contenu.sections.length})
            </Typography>
            <Chip
              label={`${contenu.sections.reduce((acc, s) => acc + s.modules.length, 0)} modules au total`}
              sx={{ bgcolor: colors.fuchsia, fontWeight: 'bold' }}
            />
          </Box>
          <List>
            {contenu.sections.map((section, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  backgroundColor: `${colors.navy}dd`,
                  border: `1px solid ${colors.lightNavy}`,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='h6' sx={{ color: colors.white, mb: 1 }}>
                        Section {section.ordre}: {section.titre}
                      </Typography>
                      {section.description && (
                        <Typography
                          variant='body2'
                          sx={{ color: colors.white, opacity: 0.8, mb: 2 }}
                        >
                          {section.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size='small'
                          label={`${section.modules.length} module(s)`}
                          sx={{ bgcolor: colors.lightNavy }}
                        />
                        {section.modules.map((mod, idx) => (
                          <Chip
                            key={idx}
                            size='small'
                            icon={typesModule.find((t) => t.value === mod.type)?.icon}
                            label={mod.type}
                            sx={{ bgcolor: colors.lightNavy }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title='Prévisualiser'>
                        <IconButton
                          onClick={() => previewSection(section)}
                          sx={{ color: colors.lightFuchsia }}
                        >
                          <PreviewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Modifier'>
                        <IconButton
                          onClick={() => editSection(index)}
                          sx={{ color: colors.fuchsia }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Supprimer'>
                        <IconButton
                          onClick={() => removeSection(index)}
                          sx={{ color: colors.fuchsia }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        </Paper>
      )}

      {/* Formulaire de création/édition de section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: `${colors.navy || '#010b40'}aa`,
          borderRadius: 2,
        }}
      >
        <Typography variant='h6' gutterBottom sx={{ color: colors.lightFuchsia, mb: 3 }}>
          {editingSectionIndex !== null ? 'Modifier la Section' : 'Créer une Nouvelle Section'}
        </Typography>

        <TextField
          label='Titre de la Section *'
          name='titre'
          value={currentSection.titre}
          onChange={handleSectionChange}
          fullWidth
          required
          placeholder='Ex: Introduction aux Concepts de Base'
          sx={{ mb: 3 }}
        />

        <TextField
          label='Description de la Section'
          name='description'
          value={currentSection.description}
          onChange={handleSectionChange}
          fullWidth
          multiline
          rows={3}
          placeholder='Décrivez brièvement ce qui sera couvert dans cette section'
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 3 }} />

        {/* Modules de la section courante */}
        {currentSection.modules.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle1' gutterBottom sx={{ color: colors.white, mb: 2 }}>
              Modules de cette section ({currentSection.modules.length})
            </Typography>
            <List>
              {currentSection.modules.map((module, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: `1px solid ${colors.lightNavy}`,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: `${colors.navy}cc`,
                  }}
                >
                  <Box sx={{ mr: 2 }}>{typesModule.find((t) => t.value === module.type)?.icon}</Box>
                  <ListItemText
                    primary={
                      <Typography variant='body1' sx={{ color: colors.white }}>
                        {module.titre}
                      </Typography>
                    }
                    secondary={
                      <Typography variant='caption' sx={{ color: colors.white, opacity: 0.7 }}>
                        Type: {module.type} | Durée: {module.duree || 'N/A'} min
                        {module.metadata && ` | Fichier: ${module.metadata.fileName}`}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => editModule(index)}
                      sx={{ color: colors.fuchsia, mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => removeModule(index)} sx={{ color: colors.fuchsia }}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Formulaire d'ajout/édition de module */}
        <Paper
          sx={{
            p: 2,
            backgroundColor: `${colors.navy}cc`,
            border: `1px solid ${colors.lightNavy}`,
            borderRadius: 2,
          }}
        >
          <Typography variant='subtitle1' gutterBottom sx={{ color: colors.lightFuchsia, mb: 2 }}>
            {editingModuleIndex !== null ? 'Modifier le Module' : 'Ajouter un Module'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label='Titre du Module *'
                name='titre'
                value={currentModule.titre}
                onChange={handleModuleChange}
                fullWidth
                required
                placeholder='Ex: Introduction aux Composants React'
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type de Module *</InputLabel>
                <Select
                  name='type'
                  value={currentModule.type}
                  onChange={handleModuleChange}
                  label='Type de Module *'
                >
                  {typesModule.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Champ de contenu dynamique selon le type */}
            <Grid item xs={12}>
              {renderModuleContentField()}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label='Durée (minutes)'
                name='duree'
                type='number'
                value={currentModule.duree}
                onChange={handleModuleChange}
                fullWidth
                placeholder='Ex: 15'
                inputProps={{ min: 1, step: 1 }}
                helperText='Durée estimée en minutes'
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='contained'
                  startIcon={editingModuleIndex !== null ? <EditIcon /> : <AddIcon />}
                  onClick={addModule}
                  disabled={
                    !currentModule.titre ||
                    (currentModule.type !== 'DOCUMENT' && !currentModule.contenu?.trim()) ||
                    (currentModule.type === 'DOCUMENT' && !currentModule.contenu)
                  }
                >
                  {editingModuleIndex !== null ? 'Mettre à jour le Module' : 'Ajouter le Module'}
                </Button>
                {editingModuleIndex !== null && (
                  <Button
                    variant='outlined'
                    onClick={cancelEditModule}
                    sx={{ borderColor: colors.lightNavy, color: colors.white }}
                  >
                    Annuler
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={addSection}
            disabled={!currentSection.titre || currentSection.modules.length === 0}
            fullWidth
          >
            {editingSectionIndex !== null
              ? 'Mettre à jour la Section'
              : 'Enregistrer cette Section'}
          </Button>
          {editingSectionIndex !== null && (
            <Button
              variant='outlined'
              onClick={cancelEditSection}
              sx={{ borderColor: colors.lightNavy, color: colors.white }}
            >
              Annuler
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );

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
            color: colors.fuchsia || '#f13544',
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
            colors.fuchsia || '#f13544',
            0.1
          )} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${alpha(
            colors.lightFuchsia || '#ff6b74',
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
              <PrimaryButton startIcon={<AddIcon />} onClick={() => openModal('create')}>
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
                  color: colors.fuchsia || '#f13544',
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
                      '& fieldset': { borderColor: alpha(colors.fuchsia || '#f13544', 0.3) },
                      '&:hover fieldset': { borderColor: colors.fuchsia || '#f13544' },
                      '&.Mui-focused fieldset': { borderColor: colors.fuchsia || '#f13544' },
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
                        borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
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
                        borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
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
                    <TableRow sx={{ bgcolor: alpha(colors.fuchsia || '#f13544', 0.1) }}>
                      <StyledTableCell>Titre</StyledTableCell>
                      <StyledTableCell>Domaine</StyledTableCell>
                      <StyledTableCell>Niveau</StyledTableCell>
                      <StyledTableCell>Contenus</StyledTableCell>
                      <StyledTableCell>Statut</StyledTableCell>
                      <StyledTableCell>Approbation</StyledTableCell>
                      <StyledTableCell>Instructeur</StyledTableCell>
                      <StyledTableCell>Durée</StyledTableCell>
                      <StyledTableCell>Créé le</StyledTableCell>
                      <StyledTableCell align='center'>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <StyledTableRow key={course._id}>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: alpha(colors.fuchsia || '#f13544', 0.2),
                                  border: `2px solid ${colors.fuchsia || '#f13544'}`,
                                }}
                              >
                                <School sx={{ color: colors.fuchsia || '#f13544' }} />
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
                              label={`${getContenusCount(course.contenu)} contenu(s)`}
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
                          <StyledTableCell>
                            {course.instructeurId ? (
                              <Tooltip
                                title={course.instructeurId.email || 'Email non disponible'}
                                arrow
                              >
                                <Chip
                                  label={course.instructeurId.nom}
                                  size='small'
                                  sx={{
                                    bgcolor: alpha('#8b5cf6', 0.2),
                                    color: '#8b5cf6',
                                    fontWeight: 600,
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Chip
                                label='Non assigné'
                                size='small'
                                sx={{
                                  bgcolor: alpha('#6b7280', 0.2),
                                  color: '#6b7280',
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </StyledTableCell>
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
                              {!course.estPublie && (
                                <Tooltip title='Publier le cours' arrow>
                                  <ActionButton
                                    size='small'
                                    onClick={() => handlePublish(course)}
                                    sx={{
                                      bgcolor: alpha('#10b981', 0.2),
                                      '&:hover': { bgcolor: alpha('#10b981', 0.3) },
                                    }}
                                  >
                                    <PublishIcon fontSize='small' />
                                  </ActionButton>
                                </Tooltip>
                              )}
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
                        <StyledTableCell colSpan={10} align='center'>
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
                count={total}
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
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(
              colors.navy || '#010b40',
              0.98
            )}, ${alpha(colors.lightNavy || '#1a237e', 0.98)})`,
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.3)}`,
            maxHeight: '90vh',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ color: colors.white || '#ffffff', fontWeight: 700 }}>
          {modalMode === 'create' ? 'Ajouter un Cours' : 'Modifier le Cours'}
        </DialogTitle>
        <DialogContent sx={{ overflow: 'hidden' }}>
          <Box sx={{ width: '100%', mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
              <Tab label='Informations Générales' />
              <Tab label='Structure du Contenu' />
            </Tabs>
          </Box>
          {formError && (
            <Alert severity='error' sx={{ mb: 2 }} onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}
          <Box sx={{ height: '60vh', overflow: 'auto', pr: 1 }}>
            {tabValue === 0 ? (
              <form onSubmit={handleFormSubmit}>
                <TextField
                  label='Titre du Cours *'
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  fullWidth
                  required
                  margin='normal'
                  placeholder='Ex: Maîtriser React.js - De Zéro à Expert'
                  helperText={`${formData.titre.length}/100 caractères (minimum 5 requis)`}
                  inputProps={{ maxLength: 100 }}
                  error={
                    formData.titre.length > 0 &&
                    (formData.titre.length < 5 || formData.titre.length > 100)
                  }
                  sx={{
                    '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': { color: colors.white || '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.fuchsia || '#f13544',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.fuchsia || '#f13544',
                    },
                  }}
                />
                <TextField
                  label='Description *'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  margin='normal'
                  placeholder='Décrivez votre cours en détail : objectifs, contenu, prérequis, compétences acquises...'
                  helperText={`${formData.description.length}/1000 caractères (minimum 20 requis)`}
                  inputProps={{ maxLength: 1000 }}
                  error={
                    formData.description.length > 0 &&
                    (formData.description.length < 20 || formData.description.length > 1000)
                  }
                  sx={{
                    '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': { color: colors.white || '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.fuchsia || '#f13544',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.fuchsia || '#f13544',
                    },
                  }}
                />
                <FormControl fullWidth margin='normal' required>
                  <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
                    Domaine *
                  </InputLabel>
                  <Select
                    value={formData.domaineId}
                    onChange={(e) => setFormData({ ...formData, domaineId: e.target.value })}
                    sx={{
                      color: colors.white || '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
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
                <FormControl fullWidth margin='normal' required>
                  <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
                    Niveau *
                  </InputLabel>
                  <Select
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    sx={{
                      color: colors.white || '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                    }}
                  >
                    <MenuItem value=''>
                      <em>Sélectionner un niveau</em>
                    </MenuItem>
                    <MenuItem value='ALFA'>Alfa (Débutant)</MenuItem>
                    <MenuItem value='BETA'>Beta (Intermédiaire)</MenuItem>
                    <MenuItem value='GAMMA'>Gamma (Avancé)</MenuItem>
                    <MenuItem value='DELTA'>Delta (Expert)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <InputLabel sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}>
                    Instructeur (Optionnel)
                  </InputLabel>
                  <Select
                    value={formData.instructeurId}
                    onChange={(e) => setFormData({ ...formData, instructeurId: e.target.value })}
                    sx={{
                      color: colors.white || '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                    }}
                  >
                    <MenuItem value=''>
                      <em>Aucun instructeur assigné</em>
                    </MenuItem>
                    {instructors.length > 0 ? (
                      instructors.map((instructor) => (
                        <MenuItem key={instructor._id} value={instructor._id}>
                          <Box>
                            <Typography>{instructor.nom}</Typography>
                            <Typography variant='caption' sx={{ opacity: 0.7 }}>
                              {instructor.email}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        <em>Aucun instructeur disponible - Contactez l'administrateur</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
                <TextField
                  label='Durée (heures) *'
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                  fullWidth
                  type='number'
                  inputProps={{ min: 0.5, step: 0.5, max: 1000 }}
                  required
                  margin='normal'
                  placeholder='Ex: 24.5'
                  helperText='Durée totale approximative pour compléter le cours (0.5 à 1000 heures)'
                  error={
                    formData.duree &&
                    (parseFloat(formData.duree) <= 0 || parseFloat(formData.duree) > 1000)
                  }
                  sx={{
                    '& .MuiInputLabel-root': { color: alpha(colors.white || '#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': { color: colors.white || '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.fuchsia || '#f13544',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.fuchsia || '#f13544',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
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
                    onChange={(e) =>
                      setFormData({ ...formData, statutApprobation: e.target.value })
                    }
                    sx={{
                      color: colors.white || '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(colors.fuchsia || '#f13544', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.fuchsia || '#f13544',
                      },
                    }}
                  >
                    <MenuItem value='PENDING'>En attente</MenuItem>
                    <MenuItem value='APPROVED'>Approuvé</MenuItem>
                    <MenuItem value='REJECTED'>Rejeté</MenuItem>
                  </Select>
                </FormControl>
              </form>
            ) : (
              renderStructureContent()
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={() => setModalOpen(false)}
            sx={{ color: alpha(colors.white || '#ffffff', 0.7) }}
          >
            Fermer
          </Button>
          <Button
            type='submit'
            onClick={handleFormSubmit}
            variant='contained'
            disabled={formLoading}
            sx={{
              background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}, ${colors.lightFuchsia || '#ff6b74'})`,
              color: colors.white || '#ffffff',
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}dd, ${colors.lightFuchsia || '#ff6b74'}dd)`,
              },
            }}
          >
            {formLoading ? <CircularProgress size={24} color='inherit' /> : 'Sauvegarder le Cours'}
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
            border: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.3)}`,
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
            border: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.3)}`,
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
                    Instructeur :
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: alpha(colors.white || '#ffffff', 0.7), mt: 1 }}
                  >
                    {selectedCourseDetails.instructeurId ? (
                      <Box>
                        <Typography>{selectedCourseDetails.instructeurId.nom}</Typography>
                        {selectedCourseDetails.instructeurId.email && (
                          <Typography variant='caption' sx={{ opacity: 0.7 }}>
                            {selectedCourseDetails.instructeurId.email}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      'Non assigné'
                    )}
                  </Typography>
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
                    Nombre de contenus :
                  </Typography>
                  <Chip
                    label={`${getContenusCount(selectedCourseDetails.contenu)} contenu(s)`}
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
                {selectedCourseDetails.contenu?.sections?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle1'
                      sx={{ fontWeight: 500, color: alpha(colors.white || '#ffffff', 0.9), mt: 2 }}
                    >
                      Structure du Contenu :
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedCourseDetails.contenu.sections.map((section, sectionIndex) => (
                        <Card
                          key={sectionIndex}
                          sx={{ mb: 2, backgroundColor: `${colors.navy}cc` }}
                        >
                          <CardContent>
                            <Typography variant='h6' sx={{ color: colors.white, mb: 1 }}>
                              Section {section.ordre}: {section.titre}
                            </Typography>
                            {section.description && (
                              <Typography
                                variant='body2'
                                sx={{ color: colors.white, opacity: 0.8, mb: 2 }}
                              >
                                {section.description}
                              </Typography>
                            )}
                            <Box sx={{ pl: 2 }}>
                              {section.modules.map((module, moduleIndex) => (
                                <Box
                                  key={moduleIndex}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 1,
                                    p: 1,
                                    backgroundColor: `${colors.navy}aa`,
                                    borderRadius: 1,
                                  }}
                                >
                                  <Box sx={{ color: colors.fuchsia }}>
                                    {typesModule.find((t) => t.value === module.type)?.icon}
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant='body2' sx={{ color: colors.white }}>
                                      {module.titre}
                                    </Typography>
                                    <Typography
                                      variant='caption'
                                      sx={{ color: colors.white, opacity: 0.7 }}
                                    >
                                      Type: {module.type} | Durée: {module.duree || 'N/A'} min
                                      {module.metadata && ` | Fichier: ${module.metadata.fileName}`}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
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
              background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}, ${colors.lightFuchsia || '#ff6b74'})`,
              color: colors.white || '#ffffff',
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}dd, ${colors.lightFuchsia || '#ff6b74'}dd)`,
              },
            }}
          >
            Voir la page complète
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de prévisualisation des sections */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
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
            border: `1px solid ${alpha(colors.fuchsia || '#f13544', 0.3)}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.fuchsia || '#f13544', fontWeight: 700 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PreviewIcon />
            Prévisualisation de la Section
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPreviewSection && (
            <Box>
              <Typography variant='h5' sx={{ color: colors.white, mb: 2 }}>
                {selectedPreviewSection.titre}
              </Typography>
              {selectedPreviewSection.description && (
                <Typography variant='body1' sx={{ color: colors.white, opacity: 0.8, mb: 3 }}>
                  {selectedPreviewSection.description}
                </Typography>
              )}
              <Divider sx={{ my: 2, borderColor: colors.lightNavy }} />
              <Typography variant='h6' sx={{ color: colors.lightFuchsia, mb: 2 }}>
                Modules ({selectedPreviewSection.modules.length})
              </Typography>
              <List>
                {selectedPreviewSection.modules.map((module, idx) => (
                  <Card key={idx} sx={{ mb: 2, backgroundColor: `${colors.navy}cc` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <Box sx={{ color: colors.fuchsia, mt: 0.5 }}>
                          {typesModule.find((t) => t.value === module.type)?.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='h6' sx={{ color: colors.white, mb: 1 }}>
                            {module.titre}
                          </Typography>
                          {module.metadata ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <FileIconWrapper fileType={module.metadata.mimeType}>
                                {getFileIcon(module.metadata.mimeType)}
                              </FileIconWrapper>
                              <Box>
                                <Typography variant='body2' sx={{ color: colors.white }}>
                                  Fichier: {module.metadata.fileName}
                                </Typography>
                                <Typography
                                  variant='caption'
                                  sx={{ color: colors.white, opacity: 0.7 }}
                                >
                                  Taille: {formatFileSize(module.metadata.fileSize)}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Typography
                              variant='body2'
                              sx={{ color: colors.white, opacity: 0.7, mb: 1 }}
                            >
                              {module.contenu}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              size='small'
                              label={module.type}
                              sx={{ bgcolor: colors.lightNavy }}
                            />
                            {module.duree && (
                              <Chip
                                size='small'
                                icon={<TimerIcon fontSize='small' />}
                                label={`${module.duree} min`}
                                sx={{ bgcolor: colors.lightNavy }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ color: colors.white || '#ffffff' }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </CoursesContainer>
  );
};

export default Courses;
