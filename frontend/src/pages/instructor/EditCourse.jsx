import React, { useState, useEffect, useContext } from 'react';
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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';

// Custom theme - CORRECTION: Utilisation des mêmes valeurs que dans CreateCourse
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
        root: { 
          borderRadius: '16px', 
          backgroundColor: `${colors.navy || '#010b40'}cc`,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { 
          backgroundColor: `${colors.navy || '#010b40'}dd`,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: `${colors.navy || '#010b40'}cc`,
            color: colors.white || '#ffffff',
            borderRadius: '12px',
          },
          '& .MuiInputLabel-root': { 
            color: colors.lightFuchsia || '#ff6b74',
            fontSize: '0.95rem',
          },
          '& .MuiOutlinedInput-notchedOutline': { 
            borderColor: colors.lightNavy || '#1a237e',
            borderRadius: '12px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': { 
            borderColor: colors.fuchsia || '#f13544',
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.fuchsia || '#f13544',
            borderWidth: '2px',
          },
          '& .MuiFormHelperText-root': {
            color: colors.lightFuchsia || '#ff6b74',
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: `${colors.navy || '#010b40'}cc`,
          color: colors.white || '#ffffff',
          borderRadius: '12px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.lightNavy || '#1a237e',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.fuchsia || '#f13544',
          },
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
          '&.Mui-selected': {
            backgroundColor: `${colors.fuchsia || '#f13544'}33`,
            '&:hover': {
              backgroundColor: `${colors.fuchsia || '#f13544'}44`,
            },
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
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}, ${colors.lightFuchsia || '#ff6b74'})`,
          boxShadow: '0 4px 15px rgba(241, 53, 68, 0.3)',
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}cc, ${colors.lightFuchsia || '#ff6b74'}cc)`,
            boxShadow: '0 6px 20px rgba(241, 53, 68, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlinedSecondary: {
          color: colors.white || '#ffffff',
          borderColor: colors.lightNavy || '#1a237e',
          borderWidth: '2px',
          '&:hover': {
            borderColor: colors.fuchsia || '#f13544',
            backgroundColor: `${colors.lightNavy || '#1a237e'}33`,
            transform: 'translateY(-2px)',
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
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          '& .MuiAlert-icon': {
            color: colors.fuchsia || '#f13544',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          color: colors.white || '#ffffff',
          fontWeight: 500,
          borderRadius: '8px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.lightNavy || '#1a237e',
          margin: '20px 0',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepLabel-label': {
            color: colors.white || '#ffffff',
            fontWeight: 500,
            fontSize: '0.9rem',
          },
          '& .MuiStepLabel-iconContainer': {
            color: colors.fuchsia || '#f13544',
          },
          '& .MuiStepConnector-line': {
            borderColor: colors.lightNavy || '#1a237e',
          },
        },
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
const FormContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${colors.lightNavy || '#1a237e'})`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const EditCourse = () => {
  const { id: courseId } = useParams();
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    domaineId: '',
    niveau: 'ALFA',
    contenu: '',
    quizzes: [],
    statutApprobation: 'PENDING',
    estPublie: false,
  });
  const [domaines, setDomaines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDomaines, setIsLoadingDomaines] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const steps = ['Informations générales', 'Détails du cours', 'Révision'];

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

  useEffect(() => {
    const fetchCourseAndDomaines = async () => {
      setIsLoading(true);
      setIsLoadingDomaines(true);
      setError('');
      try {
        if (!user || !user.token) throw new Error('Utilisateur non authentifié');

        // Fetch course data
        const courseResponse = await axios.get(
          `${API_BASE_URL}/instructeurs/${user.id}/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setFormData({
          titre: courseResponse.data.data.titre || '',
          description: courseResponse.data.data.description || '',
          duree: courseResponse.data.data.duree || '',
          domaineId: courseResponse.data.data.domaineId || '',
          niveau: courseResponse.data.data.niveau || 'ALFA',
          contenu: courseResponse.data.data.contenu || '',
          quizzes: courseResponse.data.data.quizzes || [],
          statutApprobation: courseResponse.data.data.statutApprobation || 'PENDING',
          estPublie: courseResponse.data.data.estPublie || false,
        });

        // CORRECTION: Utilisation de la même route que dans CreateCourse
        const domainesResponse = await axios.get(`${API_BASE_URL}/instructeurs/domaines`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const domainesData = domainesResponse.data.data || domainesResponse.data || [];
        setDomaines(domainesData);
        if (domainesData.length === 0) {
          setError(
            "Aucun domaine disponible. Veuillez contacter l'administrateur pour ajouter des domaines."
          );
        }
      } catch (err) {
        console.error('Erreur lors de la récupération:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données.');
      } finally {
        setIsLoading(false);
        setIsLoadingDomaines(false);
      }
    };

    if (user && courseId) fetchCourseAndDomaines();
  }, [user, courseId, API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

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
        if (!formData.domaineId) return 'Sélectionnez un domaine';
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
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

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
        contenu: formData.contenu,
        quizzes: formData.quizzes,
        estPublie: formData.estPublie,
        statutApprobation: formData.statutApprobation,
      };

      await axios.put(`${API_BASE_URL}/instructeurs/${user.id}/courses/${courseId}`, courseData, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      });

      setSuccess('Cours mis à jour avec succès ! Vous allez être redirigé...');
      setTimeout(() => navigate('/instructor/manageCourses'), 2000);
    } catch (err) {
      let errorMessage =
        'Erreur inattendue lors de la mise à jour du cours. Veuillez réessayer plus tard.';
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Route non trouvée. Vérifiez la configuration du backend.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.errors) {
          errorMessage = err.response.data.errors.map((e) => e.msg).join(', ');
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
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
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>
          Chargement du cours...
        </Typography>
      </Box>
    );
  }

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

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 2, animation: `${fadeInUp} 0.6s ease-out` }}>
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
              Modifiez le titre de votre cours. Choisissez un titre clair et descriptif qui permettra aux étudiants de comprendre immédiatement le sujet du cours.
            </Typography>
            <TextField
              label='Titre du Cours'
              name='titre'
              value={formData.titre}
              onChange={handleChange}
              fullWidth
              required
              variant='outlined'
              placeholder='Exemple : Apprendre le Développement Web avec React'
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
          <Box sx={{ p: 2, animation: `${fadeInUp} 0.6s ease-out` }}>
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
              Détails et Contenu
            </Typography>
            <Typography variant='body2' sx={{ mb: 4, color: colors.white, opacity: 0.8 }}>
              Mettez à jour la description détaillée, la durée et le contenu de votre cours.
            </Typography>
            <TextField
              label='Description Détaillée'
              name='description'
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={8}
              variant='outlined'
              placeholder='Décrivez les objectifs, le programme, les prérequis et les compétences acquises...'
              helperText={`${formData.description.length}/1000 caractères (minimum 50 requis)`}
              inputProps={{ maxLength: 1000 }}
              error={
                formData.description.length > 0 &&
                (formData.description.length < 50 || formData.description.length > 1000)
              }
              sx={{ mb: 4 }}
            />
            <TextField
              label='Durée Estimée (heures)'
              name='duree'
              type='number'
              value={formData.duree}
              onChange={handleChange}
              fullWidth
              required
              variant='outlined'
              placeholder='Exemple : 15.5'
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
              sx={{ mb: 4 }}
            />
            <TextField
              label='Contenu (JSON)'
              name='contenu'
              value={formData.contenu}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              variant='outlined'
              placeholder='Entrez le contenu du cours au format JSON'
              helperText='Structure JSON optionnelle pour le contenu avancé du cours'
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 2, animation: `${fadeInUp} 0.6s ease-out` }}>
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
              Catégorisation et Récapitulatif
            </Typography>
            {isLoadingDomaines ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: colors.fuchsia || '#f13544' }} />
              </Box>
            ) : (
              <FormControl fullWidth required sx={{ mb: 4 }}>
                <InputLabel id='domaine-label'>Domaine d'Étude</InputLabel>
                <Select
                  labelId='domaine-label'
                  name='domaineId'
                  value={formData.domaineId}
                  onChange={handleChange}
                  label="Domaine d'Étude"
                  variant='outlined'
                  disabled={domaines.length === 0}
                >
                  <MenuItem value=''>
                    <em>Choisissez un domaine</em>
                  </MenuItem>
                  {domaines.map((domaine) => (
                    <MenuItem key={domaine._id} value={domaine._id}>
                      {domaine.nom}
                    </MenuItem>
                  ))}
                </Select>
                {domaines.length === 0 && (
                  <Typography variant='caption' sx={{ color: colors.lightFuchsia, mt: 1 }}>
                    Aucun domaine disponible. Contactez l'administrateur.
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
              Sélection du Niveau
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
                Récapitulatif Final du Cours
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Titre :
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 600, color: colors.white || '#ffffff' }}
                  >
                    {formData.titre || 'Non défini'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                  >
                    Durée :
                  </Typography>
                  <Chip
                    icon={<TimerIcon />}
                    label={formData.duree ? `${formData.duree} heures` : 'Non définie'}
                    sx={{ bgcolor: colors.lightNavy, fontWeight: 'bold' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12}>
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
                      borderRadius: 1,
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
                {formData.contenu && (
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle2'
                      sx={{ color: colors.lightFuchsia || '#ff6b74', mb: 1 }}
                    >
                      Contenu (JSON) :
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: `${colors.navy}aa`,
                        border: `1px solid ${colors.lightNavy}`,
                        borderRadius: 1,
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{
                          color: colors.white || '#ffffff',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                        }}
                      >
                        {formData.contenu}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
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
      <FormContainer>
        {/* Background Decorations */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${colors.fuchsia || '#f13544'}0a 1px, transparent 1px)`,
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
            background: `linear-gradient(135deg, ${colors.fuchsia || '#f13544'}, ${colors.lightFuchsia || '#ff6b74'})`,
            borderRadius: '50%',
            opacity: 0.15,
            animation: `${floatingAnimation} 4s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/instructor/manageCourses')}
            variant='outlined'
            color='secondary'
            sx={{ mb: 4, borderRadius: 2 }}
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
                Modification du Cours
              </Typography>
              <Typography
                variant='subtitle1'
                sx={{ maxWidth: 600, mx: 'auto', color: colors.white || '#ffffff', opacity: 0.9 }}
              >
                Modifiez les détails de votre cours à l'aide de cet assistant pas à pas.
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
                sx={{ borderRadius: 2, px: 4 }}
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
                  {isLoading ? 'Mise à jour en cours...' : 'Sauvegarder le Cours'}
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
                Les modifications seront enregistrées en mode brouillon jusqu'à ce que vous
                décidiez de publier le cours. Un administrateur devra approuver les modifications
                importantes.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </FormContainer>
    </ThemeProvider>
  );
};

export default EditCourse;