// src/components/instructor/CreateCourse.jsx
import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  ThemeProvider,
  createTheme,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import { School as SchoolIcon } from '@mui/icons-material';

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
  },
  components: {
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
          '& .MuiInputBase-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            color: colors.white || '#ffffff',
            borderRadius: '8px',
          },
          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
            '&:hover fieldset': { borderColor: colors.fuschia || '#f13544' },
            '&.Mui-focused fieldset': { borderColor: colors.fuschia || '#f13544' },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            color: colors.white || '#ffffff',
            borderRadius: '8px',
          },
          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
            '&:hover fieldset': { borderColor: colors.fuschia || '#f13544' },
            '&.Mui-focused fieldset': { borderColor: colors.fuschia || '#f13544' },
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

const FormCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}cc, ${colors.lightNavy || '#1a237e'}cc)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  padding: theme.spacing(4),
  animation: `${fadeInUp} 0.6s ease-out`,
  maxWidth: '600px',
  margin: '0 auto',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
    borderRadius: '16px 16px 0 0',
  },
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

const CreateCourse = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    domaineId: '',
    niveau: 'ALFA', // Utiliser les valeurs en majuscules comme dans le backend
  });

  const [domaines, setDomaines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDomaines, setIsLoadingDomaines] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // Charger les domaines disponibles
  useEffect(() => {
    const fetchDomaines = async () => {
      if (!user?.token) return;

      setIsLoadingDomaines(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/domaines`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        // Adapter selon la structure de votre réponse API
        const domainesData = response.data.data || response.data || [];
        setDomaines(domainesData);
      } catch (err) {
        console.error('Erreur lors du chargement des domaines:', err);
        setError('Erreur lors du chargement des domaines disponibles');
      } finally {
        setIsLoadingDomaines(false);
      }
    };

    if (user) {
      fetchDomaines();
    }
  }, [user, API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.titre.trim()) return 'Le titre est requis';
    if (!formData.description.trim()) return 'La description est requise';
    if (!formData.duree || parseFloat(formData.duree) <= 0)
      return 'La durée doit être un nombre positif';
    if (!formData.domaineId) return 'Le domaine est requis';
    if (!formData.niveau) return 'Le niveau est requis';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user || !user.token) {
        throw new Error('Utilisateur non authentifié');
      }

      // Préparer les données selon le format attendu par le backend
      const courseData = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        duree: parseFloat(formData.duree),
        domaineId: formData.domaineId,
        niveau: formData.niveau,
        // Les champs suivants seront gérés automatiquement par le backend
        estPublie: false,
        statutApprobation: 'PENDING',
      };

      console.log('📤 Données envoyées au backend:', courseData);

      // Utiliser l'endpoint standard de création de cours
      const response = await axios.post(`${API_BASE_URL}/courses`, courseData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Réponse du backend:', response.data);

      setSuccess('Cours créé avec succès ! Redirection...');

      // Rediriger vers la liste des cours après un délai
      setTimeout(() => navigate('/instructor/courses'), 2000);
    } catch (err) {
      console.error('❌ Erreur lors de la création du cours:', err);

      // Gestion détaillée des erreurs
      if (err.response?.data?.errors) {
        const errorDetails = err.response.data.errors
          .map((error) => `${error.path}: ${error.msg}`)
          .join(', ');
        setError(`Erreur de validation: ${errorDetails}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
        setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      } else {
        setError('Erreur lors de la création du cours. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={instructorTheme}>
      <FormContainer>
        {/* Background Decorations */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${colors.fuschia || '#f13544'}0a 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.05,
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
          }}
        />

        <Container maxWidth={false} disableGutters>
          {/* En-tête */}
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Typography
              variant='h3'
              sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}
            >
              Créer un Nouveau Cours
            </Typography>
          </Box>

          {/* Formulaire */}
          <FormCard>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity='success' sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Titre */}
              <TextField
                label='Titre du cours'
                name='titre'
                value={formData.titre}
                onChange={handleChange}
                fullWidth
                required
                margin='normal'
                placeholder='Ex: Introduction à la programmation Python'
              />

              {/* Description */}
              <TextField
                label='Description'
                name='description'
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                margin='normal'
                placeholder='Décrivez le contenu et les objectifs de votre cours...'
              />

              {/* Durée */}
              <TextField
                label='Durée (en heures)'
                name='duree'
                type='number'
                value={formData.duree}
                onChange={handleChange}
                fullWidth
                required
                margin='normal'
                inputProps={{ min: 1, step: 0.5 }}
                placeholder='Ex: 10.5'
              />

              {/* Domaine */}
              <FormControl fullWidth required margin='normal'>
                <InputLabel>Domaine</InputLabel>
                <Select
                  name='domaineId'
                  value={formData.domaineId}
                  onChange={handleChange}
                  label='Domaine'
                  disabled={isLoadingDomaines}
                >
                  <MenuItem value=''>
                    <em>Sélectionner un domaine</em>
                  </MenuItem>
                  {domaines.map((domaine) => (
                    <MenuItem key={domaine._id} value={domaine._id}>
                      {domaine.nom || `Domaine ${domaine._id}`}
                    </MenuItem>
                  ))}
                </Select>
                {isLoadingDomaines && (
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                    Chargement des domaines...
                  </Typography>
                )}
              </FormControl>

              {/* Niveau */}
              <FormControl fullWidth required margin='normal'>
                <InputLabel>Niveau</InputLabel>
                <Select
                  name='niveau'
                  value={formData.niveau}
                  onChange={handleChange}
                  label='Niveau'
                >
                  <MenuItem value='ALFA'>Alfa (Débutant)</MenuItem>
                  <MenuItem value='BETA'>Beta (Intermédiaire)</MenuItem>
                  <MenuItem value='GAMMA'>Gamma (Avancé)</MenuItem>
                  <MenuItem value='DELTA'>Delta (Expert)</MenuItem>
                </Select>
              </FormControl>

              {/* Bouton de soumission */}
              <StyledButton
                type='submit'
                disabled={isLoading || isLoadingDomaines}
                fullWidth
                sx={{ mt: 3, height: '48px' }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: colors.white || '#ffffff' }} />
                ) : (
                  'Créer le Cours'
                )}
              </StyledButton>

              {/* Bouton annuler */}
              <Button
                onClick={() => navigate('/instructor/courses')}
                fullWidth
                sx={{
                  mt: 2,
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Annuler
              </Button>
            </form>
          </FormCard>

          {/* Informations supplémentaires */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Le cours sera créé en statut "Brouillon". Vous pourrez le publier après avoir ajouté
              du contenu.
            </Typography>
          </Box>
        </Container>
      </FormContainer>
    </ThemeProvider>
  );
};

export default CreateCourse;
