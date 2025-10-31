import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  ThemeProvider,
  createTheme,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import {
  School as SchoolIcon,
  Timer as TimerIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  TrendingUp as LevelIcon,
  SaveAlt as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

const instructorTheme = createTheme({
  palette: {
    primary: { main: colors.fuchsia || '#f13544', light: colors.lightFuchsia || '#ff6b74' },
    secondary: { main: colors.navy || '#010b40', light: colors.lightNavy || '#1a237e' },
    background: {
      default: colors.navy || '#010b40',
      paper: `linear-gradient(135deg, ${colors.navy || '#010b40'}dd, ${colors.lightNavy || '#1a237e'}dd)`,
    },
    text: { primary: colors.white || '#ffffff', secondary: colors.lightNavy || '#1a237e' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: '16px', backgroundColor: `${colors.navy || '#010b40'}cc` },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: `${colors.navy || '#010b40'}dd` },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: `${colors.navy || '#010b40'}cc`,
            color: colors.white || '#ffffff',
          },
          '& .MuiInputLabel-root': { color: colors.lightFuchsia || '#ff6b74' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.lightNavy || '#1a237e' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuchsia || '#f13544' },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.fuchsia || '#f13544',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: `${colors.navy || '#010b40'}cc`,
          color: colors.white || '#ffffff',
        },
        icon: { color: colors.lightFuchsia || '#ff6b74' },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: colors.navy || '#010b40',
          color: colors.white || '#ffffff',
          '&:hover': {
            backgroundColor: `${colors.lightNavy || '#1a237e'}cc`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}, ${colors.lightFuchsia || '#ff6b74'})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}cc, ${colors.lightFuchsia || '#ff6b74'}cc)`,
          },
        },
        outlinedSecondary: {
          color: colors.white || '#ffffff',
          borderColor: colors.lightNavy || '#1a237e',
          '&:hover': {
            borderColor: colors.fuchsia || '#f13544',
            backgroundColor: `${colors.lightNavy || '#1a237e'}33`,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          color: colors.white || '#ffffff',
          backgroundColor: `${colors.navy || '#010b40'}cc`,
          border: `1px solid ${colors.fuchsia || '#f13544'}33`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          color: colors.white || '#ffffff',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.lightNavy || '#1a237e',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepLabel-label': {
            color: colors.white || '#ffffff',
          },
          '& .MuiStepLabel-iconContainer': {
            color: colors.fuchsia || '#f13544',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.navy || '#010b40',
          color: colors.white || '#ffffff',
        },
      },
    },
  },
});

const CreateCourse = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // États principaux
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    domaineId: '',
    niveau: 'ALFA',
  });

  // Gestion du contenu du cours
  const [contenu, setContenu] = useState({
    sections: [],
  });

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
  });

  // États d'édition
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingModuleIndex, setEditingModuleIndex] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPreviewSection, setSelectedPreviewSection] = useState(null);

  // États de chargement et erreurs
  const [domaines, setDomaines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDomaines, setIsLoadingDomaines] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [domaineError, setDomaineError] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const steps = ['Informations générales', 'Détails du cours', 'Contenu du cours', 'Révision'];

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

  const typesModule = [
    {
      value: 'VIDEO',
      label: 'Vidéo',
      icon: <VideoIcon />,
      description: 'Contenu vidéo (URL YouTube, Vimeo, etc.)',
    },
    {
      value: 'TEXTE',
      label: 'Article/Texte',
      icon: <ArticleIcon />,
      description: 'Contenu textuel ou document',
    },
    { value: 'QUIZ', label: 'Quiz', icon: <QuizIcon />, description: 'Évaluation interactive' },
  ];

  // Chargement des domaines
  useEffect(() => {
    const fetchDomaines = async () => {
      if (!user?.token) return;

      setIsLoadingDomaines(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/instructeurs/domaines`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const domainesData = response.data.data || response.data || [];
        setDomaines(domainesData);

        if (domainesData.length === 0) {
          setError(
            "Aucun domaine disponible. Veuillez contacter l'administrateur pour ajouter des domaines."
          );
        }
      } catch (err) {
        console.error('Erreur lors du chargement des domaines:', err);
        let errMsg = 'Erreur lors du chargement des domaines disponibles.';

        if (err.response?.status === 404) {
          errMsg =
            "La route pour récupérer les domaines n'existe pas encore. Contactez l'administrateur.";
        } else if (err.response?.status === 401) {
          errMsg = 'Session expirée. Veuillez vous reconnecter.';
          navigate('/login');
        } else if (err.code === 'ERR_NETWORK') {
          errMsg = 'Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.';
        }

        setError(errMsg);
      } finally {
        setIsLoadingDomaines(false);
      }
    };

    if (user) {
      fetchDomaines();
    }
  }, [user, API_BASE_URL, navigate]);

  // Handlers de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'domaineId') setDomaineError(false);
  };

  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setCurrentSection((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setCurrentModule((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion des modules
  const addModule = () => {
    if (!currentModule.titre.trim()) {
      setError('Le titre du module est requis');
      return;
    }
    if (!currentModule.contenu.trim()) {
      setError('Le contenu du module est requis');
      return;
    }

    const newModule = {
      ...currentModule,
      ordre: currentSection.modules.length + 1,
    };

    if (editingModuleIndex !== null) {
      // Mode édition
      const updatedModules = [...currentSection.modules];
      updatedModules[editingModuleIndex] = newModule;
      setCurrentSection((prev) => ({
        ...prev,
        modules: updatedModules,
      }));
      setEditingModuleIndex(null);
    } else {
      // Mode ajout
      setCurrentSection((prev) => ({
        ...prev,
        modules: [...prev.modules, newModule],
      }));
    }

    // Réinitialiser le formulaire
    setCurrentModule({
      titre: '',
      type: 'VIDEO',
      contenu: '',
      duree: '',
      ordre: currentSection.modules.length + 2,
    });
    setError('');
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
    });
  };

  // Gestion des sections
  const addSection = () => {
    if (!currentSection.titre.trim()) {
      setError('Le titre de la section est requis');
      return;
    }

    if (currentSection.modules.length === 0) {
      setError('Ajoutez au moins un module à la section');
      return;
    }

    const newSection = {
      ...currentSection,
      ordre: contenu.sections.length + 1,
    };

    if (editingSectionIndex !== null) {
      // Mode édition
      const updatedSections = [...contenu.sections];
      updatedSections[editingSectionIndex] = newSection;
      setContenu({ sections: updatedSections });
      setEditingSectionIndex(null);
    } else {
      // Mode ajout
      setContenu((prev) => ({
        sections: [...prev.sections, newSection],
      }));
    }

    // Réinitialiser le formulaire
    setCurrentSection({
      titre: '',
      description: '',
      ordre: contenu.sections.length + 2,
      modules: [],
    });
    setError('');
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

  // Validation des étapes
  const validateStep = (step) => {
    switch (step) {
      case 0:
        const titre = formData.titre.trim();
        if (!titre) return 'Le titre est requis';
        if (titre.length < 10) return 'Le titre doit contenir au moins 10 caractères';
        if (titre.length > 100) return 'Le titre ne doit pas dépasser 100 caractères';
        return '';
      case 1:
        const description = formData.description.trim();
        if (!description) return 'La description est requise';
        if (description.length < 50) return 'La description doit contenir au moins 50 caractères';
        if (description.length > 1000) return 'La description ne doit pas dépasser 1000 caractères';
        const duree = parseFloat(formData.duree);
        if (isNaN(duree) || duree <= 0) return 'La durée doit être un nombre positif supérieur à 0';
        if (duree > 1000) return 'La durée maximale autorisée est de 1000 heures';
        return '';
      case 2:
        // Le contenu est optionnel lors de la création initiale
        return '';
      case 3:
        if (!formData.domaineId) {
          setDomaineError(true);
          return 'Sélectionnez un domaine';
        }
        setDomaineError(false);
        if (!formData.niveau) return 'Sélectionnez un niveau';
        return '';
      default:
        return '';
    }
  };

  const handleNext = () => {
    const validationError = validateStep(activeStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (activeStep === 3 && domaines.length === 0) {
      setError('Aucun domaine disponible. Impossible de continuer.');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
    setDomaineError(false);
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    const validationError = validateStep(activeStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user || !user.token) {
        throw new Error('Utilisateur non authentifié. Veuillez vous reconnecter.');
      }

      const courseData = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        duree: parseFloat(formData.duree),
        domaineId: formData.domaineId,
        niveau: formData.niveau,
        contenu: contenu.sections.length > 0 ? contenu : null,
        estPublie: false,
        statutApprobation: 'PENDING',
      };

      const response = await axios.post(
        `${API_BASE_URL}/instructeurs/${user.id}/courses`,
        courseData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('Cours créé avec succès ! Vous allez être redirigé...');
      setTimeout(() => navigate('/instructor/manageCourses'), 2000);
    } catch (err) {
      let errorMessage =
        'Erreur inattendue lors de la création du cours. Veuillez réessayer plus tard.';
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Route non trouvée. Vérifiez la configuration du backend.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.errors) {
          errorMessage = err.response.data.errors.map((e) => e.msg).join(', ');
        } else if (err.response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          navigate('/login');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu conditionnel - Chargement
  if (authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
        }}
      >
        <CircularProgress size={60} sx={{ color: colors.fuchsia || '#f13544' }} />
      </Box>
    );
  }

  // Rendu conditionnel - Autorisation
  if (!user || user.role !== 'ENSEIGNANT') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
        }}
      >
        <Alert
          severity='error'
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: `${colors.navy || '#010b40'}cc`,
            color: colors.white || '#ffffff',
            border: `1px solid ${colors.fuchsia || '#f13544'}33`,
          }}
        >
          Accès interdit : Réservé aux enseignants uniquement.
        </Alert>
      </Box>
    );
  }

  // Rendu du contenu de chaque étape
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
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
              <SchoolIcon fontSize='large' />
              Informations de Base du Cours
            </Typography>
            <Typography variant='body2' sx={{ mb: 4, color: colors.white, opacity: 0.8 }}>
              Commencez par définir le titre de votre cours. Choisissez un titre clair et descriptif
              qui permettra aux étudiants de comprendre immédiatement le sujet du cours.
            </Typography>
            <TextField
              label='Titre du Cours'
              name='titre'
              value={formData.titre}
              onChange={handleChange}
              fullWidth
              required
              variant='outlined'
              placeholder='Exemple : Maîtriser React.js - De Zéro à Expert'
              helperText={`${formData.titre.length}/100 caractères (minimum 10 requis)`}
              inputProps={{ maxLength: 100 }}
              error={
                formData.titre.length > 0 &&
                (formData.titre.length < 10 || formData.titre.length > 100)
              }
              sx={{ mb: 4 }}
            />
          </Box>
        );

      case 1:
        return (
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
              <DescriptionIcon fontSize='large' />
              Détails et Description
            </Typography>
            <Typography variant='body2' sx={{ mb: 4, color: colors.white, opacity: 0.8 }}>
              Fournissez une description complète de votre cours incluant les objectifs
              pédagogiques, les compétences acquises, le public cible et les prérequis éventuels.
            </Typography>
            <TextField
              label='Description Détaillée du Cours'
              name='description'
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={8}
              variant='outlined'
              placeholder='Décrivez votre cours en détail : objectifs, contenu, prérequis, compétences acquises...'
              helperText={`${formData.description.length}/1000 caractères (minimum 50 requis)`}
              inputProps={{ maxLength: 1000 }}
              error={
                formData.description.length > 0 &&
                (formData.description.length < 50 || formData.description.length > 1000)
              }
              sx={{ mb: 4 }}
            />
            <TextField
              label='Durée Totale Estimée (heures)'
              name='duree'
              type='number'
              value={formData.duree}
              onChange={handleChange}
              fullWidth
              required
              variant='outlined'
              placeholder='Ex: 24.5'
              inputProps={{ min: 0.5, step: 0.5, max: 1000 }}
              InputProps={{
                startAdornment: (
                  <TimerIcon sx={{ mr: 1.5, color: colors.lightFuchsia || '#ff6b74' }} />
                ),
              }}
              helperText='Durée totale approximative pour compléter le cours (0.5 à 1000 heures)'
              error={
                formData.duree &&
                (parseFloat(formData.duree) <= 0 || parseFloat(formData.duree) > 1000)
              }
            />
          </Box>
        );

      case 2:
        return (
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
              Structuration du Contenu (Optionnel)
            </Typography>

            <Alert severity='info' sx={{ mb: 4, borderRadius: 2 }}>
              <Typography variant='body2'>
                <strong>Cette étape est optionnelle.</strong> Vous pouvez créer la structure de
                votre cours maintenant ou l'ajouter plus tard depuis votre tableau de bord. Le
                contenu inclut les sections, modules, vidéos et quiz.
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
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
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
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                          }}
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
                {editingSectionIndex !== null
                  ? 'Modifier la Section'
                  : 'Créer une Nouvelle Section'}
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
                        <Box sx={{ mr: 2 }}>
                          {typesModule.find((t) => t.value === module.type)?.icon}
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant='body1' sx={{ color: colors.white }}>
                              {module.titre}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant='caption'
                              sx={{ color: colors.white, opacity: 0.7 }}
                            >
                              Type: {module.type} | Durée: {module.duree || 'N/A'} min | Contenu:{' '}
                              {module.contenu.substring(0, 50)}...
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
                          <IconButton
                            onClick={() => removeModule(index)}
                            sx={{ color: colors.fuchsia }}
                          >
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
                <Typography
                  variant='subtitle1'
                  gutterBottom
                  sx={{ color: colors.lightFuchsia, mb: 2 }}
                >
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
                  <Grid item xs={12}>
                    <TextField
                      label='Contenu/URL du Module *'
                      name='contenu'
                      value={currentModule.contenu}
                      onChange={handleModuleChange}
                      fullWidth
                      required
                      multiline
                      rows={3}
                      placeholder='URL vidéo YouTube/Vimeo, texte du cours, ou identifiant du quiz'
                      helperText={
                        currentModule.type === 'VIDEO'
                          ? 'Exemple: https://www.youtube.com/watch?v=...'
                          : currentModule.type === 'TEXTE'
                            ? "Saisissez le contenu textuel ou l'URL d'un document"
                            : 'Identifiant du quiz associé'
                      }
                    />
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
                        disabled={!currentModule.titre || !currentModule.contenu}
                      >
                        {editingModuleIndex !== null
                          ? 'Mettre à jour le Module'
                          : 'Ajouter le Module'}
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
                  startIcon={<SaveIcon />}
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

      case 3:
        return (
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
              <CategoryIcon fontSize='large' />
              Catégorisation et Révision Finale
            </Typography>

            {isLoadingDomaines ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: colors.fuchsia || '#f13544' }} />
              </Box>
            ) : (
              <FormControl fullWidth required sx={{ mb: 4 }} error={domaineError}>
                <InputLabel id='domaine-label'>Domaine d'Étude *</InputLabel>
                <Select
                  labelId='domaine-label'
                  name='domaineId'
                  value={formData.domaineId}
                  onChange={handleChange}
                  label="Domaine d'Étude *"
                  variant='outlined'
                  disabled={domaines.length === 0}
                >
                  <MenuItem value=''>
                    <em>Sélectionnez un domaine</em>
                  </MenuItem>
                  {domaines.map((domaine) => (
                    <MenuItem key={domaine._id} value={domaine._id}>
                      {domaine.nom}
                    </MenuItem>
                  ))}
                </Select>
                {domaineError && (
                  <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                    Veuillez sélectionner un domaine
                  </Typography>
                )}
              </FormControl>
            )}

            <Typography
              variant='h6'
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: colors.lightFuchsia || '#ff6b74',
                mt: 4,
                mb: 3,
              }}
            >
              <LevelIcon fontSize='medium' />
              Niveau de Difficulté
            </Typography>
            <Grid container spacing={3}>
              {niveaux.map((niveau) => (
                <Grid item xs={12} md={6} key={niveau.value}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border:
                        formData.niveau === niveau.value
                          ? `3px solid ${niveau.color}`
                          : `2px solid ${colors.lightNavy || '#1a237e'}`,
                      borderRadius: 2,
                      backgroundColor: `${colors.navy || '#010b40'}cc`,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: `0 8px 16px ${colors.fuchsia || '#f13544'}33`,
                      },
                    }}
                    onClick={() => setFormData((prev) => ({ ...prev, niveau: niveau.value }))}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant='h6' sx={{ color: niveau.color, fontWeight: 'bold' }}>
                          {niveau.label}
                        </Typography>
                        <Chip
                          label={niveau.value}
                          sx={{
                            bgcolor: niveau.color,
                            color: colors.white || '#ffffff',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Typography variant='body2' sx={{ color: colors.white || '#ffffff' }}>
                        {niveau.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 5, borderColor: colors.lightNavy || '#1a237e' }} />

            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                backgroundColor: `${colors.navy || '#010b40'}cc`,
                border: `2px solid ${colors.fuchsia}`,
              }}
            >
              <Typography
                variant='h5'
                gutterBottom
                sx={{
                  color: colors.fuchsia || '#f13544',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PreviewIcon /> Récapitulatif Complet du Cours
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Titre du Cours :
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 600, color: colors.white || '#ffffff' }}
                  >
                    {formData.titre || 'Non défini'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Durée Totale :
                  </Typography>
                  <Chip
                    icon={<TimerIcon />}
                    label={formData.duree ? `${formData.duree} heures` : 'Non définie'}
                    sx={{ bgcolor: colors.lightNavy, fontWeight: 'bold' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Niveau :
                  </Typography>
                  <Chip
                    icon={<LevelIcon />}
                    label={
                      niveaux.find((n) => n.value === formData.niveau)?.label || 'Non sélectionné'
                    }
                    sx={{
                      bgcolor:
                        niveaux.find((n) => n.value === formData.niveau)?.color || colors.lightNavy,
                      fontWeight: 'bold',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Domaine :
                  </Typography>
                  <Chip
                    icon={<CategoryIcon />}
                    label={
                      domaines.find((d) => d._id === formData.domaineId)?.nom || 'Non sélectionné'
                    }
                    sx={{ bgcolor: colors.lightNavy, fontWeight: 'bold' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Description :
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: `${colors.navy}aa`,
                      border: `1px solid ${colors.lightNavy}`,
                    }}
                  >
                    <Typography
                      variant='body1'
                      sx={{
                        color: colors.white || '#ffffff',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {formData.description || 'Non définie'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Structure du Contenu :
                  </Typography>
                  {contenu.sections.length > 0 ? (
                    <Box>
                      <Chip
                        label={`${contenu.sections.length} section(s)`}
                        sx={{ bgcolor: colors.fuchsia, fontWeight: 'bold', mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`${contenu.sections.reduce((acc, s) => acc + s.modules.length, 0)} module(s) au total`}
                        sx={{ bgcolor: colors.lightNavy, fontWeight: 'bold', mb: 1 }}
                      />
                      <List sx={{ mt: 2 }}>
                        {contenu.sections.map((section, idx) => (
                          <ListItem
                            key={idx}
                            sx={{
                              border: `1px solid ${colors.lightNavy}`,
                              borderRadius: 1,
                              mb: 1,
                              backgroundColor: `${colors.navy}cc`,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant='body1'
                                  sx={{ color: colors.white, fontWeight: 'bold' }}
                                >
                                  Section {idx + 1}: {section.titre}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant='caption'
                                  sx={{ color: colors.white, opacity: 0.7 }}
                                >
                                  {section.modules.length} module(s) -{' '}
                                  {section.description || 'Pas de description'}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ) : (
                    <Alert severity='info' sx={{ borderRadius: 2 }}>
                      Aucun contenu ajouté. Vous pourrez structurer votre cours après sa création.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={instructorTheme}>
      <Box
        sx={{
          bgcolor: colors.navy || '#010b40',
          minHeight: '100vh',
          width: '100vw',
          py: 6,
          overflowX: 'hidden',
        }}
      >
        <Container maxWidth='lg' sx={{ px: { xs: 2, md: 4 } }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/instructor/manageCourses')}
            variant='outlined'
            color='secondary'
            sx={{
              mb: 4,
              borderRadius: 2,
            }}
          >
            Retour aux Cours
          </Button>

          <Paper elevation={6} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 80, color: colors.fuchsia || '#f13544', mb: 2 }} />
              <Typography
                variant='h3'
                gutterBottom
                fontWeight={800}
                color={colors.fuchsia || '#f13544'}
              >
                Création d'un Nouveau Cours
              </Typography>
              <Typography
                variant='subtitle1'
                sx={{ maxWidth: 700, mx: 'auto', color: colors.white || '#ffffff', opacity: 0.9 }}
              >
                Suivez cet assistant étape par étape pour créer un cours professionnel et structuré.
                Tous les champs marqués d'un astérisque (*) sont obligatoires.
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: activeStep === index ? 700 : 400,
                        color: colors.white || '#ffffff',
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity='error' sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError('')}>
                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                  {error}
                </Typography>
              </Alert>
            )}

            {success && (
              <Alert
                severity='success'
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  backgroundColor: `${colors.navy || '#010b40'}cc`,
                  color: colors.white || '#ffffff',
                  border: `1px solid ${colors.fuchsia || '#f13544'}33`,
                }}
                onClose={() => setSuccess('')}
              >
                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                  {success}
                </Typography>
              </Alert>
            )}

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, gap: 2 }}>
              <Button
                disabled={activeStep === 0 || isLoading}
                onClick={handleBack}
                variant='outlined'
                color='secondary'
                size='large'
                sx={{
                  borderRadius: 2,
                  px: 4,
                }}
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSubmit}
                  disabled={isLoading || isLoadingDomaines}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={24} sx={{ color: colors.white || '#ffffff' }} />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  size='large'
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  {isLoading ? 'Création en cours...' : 'Créer le Cours'}
                </Button>
              ) : (
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleNext}
                  disabled={isLoading || isLoadingDomaines}
                  size='large'
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Paper>

          <Box sx={{ mt: 5, textAlign: 'center', color: colors.white || '#ffffff' }}>
            <Paper sx={{ p: 3, backgroundColor: `${colors.navy}aa`, borderRadius: 2 }}>
              <Typography variant='body1' sx={{ mb: 1, fontWeight: 'bold' }}>
                📝 Note Importante
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.9 }}>
                Votre cours sera créé en mode brouillon et soumis pour approbation.
                {contenu.sections.length === 0 &&
                  ' Vous pourrez ajouter ou modifier le contenu depuis votre tableau de bord.'}{' '}
                Un administrateur devra approuver votre cours avant qu'il ne soit visible par les
                étudiants.
              </Typography>
            </Paper>
          </Box>
        </Container>

        {/* Dialog de prévisualisation */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: colors.navy, color: colors.fuchsia }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PreviewIcon />
              Prévisualisation de la Section
            </Box>
          </DialogTitle>
          <DialogContent sx={{ bgcolor: colors.navy, pt: 3 }}>
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
                <Divider sx={{ my: 2 }} />
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
                            <Typography
                              variant='body2'
                              sx={{ color: colors.white, opacity: 0.7, mb: 1 }}
                            >
                              {module.contenu}
                            </Typography>
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
          <DialogActions sx={{ bgcolor: colors.navy, p: 2 }}>
            <Button onClick={() => setPreviewDialogOpen(false)} sx={{ color: colors.white }}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default CreateCourse;