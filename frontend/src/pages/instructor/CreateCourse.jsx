// src/components/instructor/CreateCourse.jsx
import React, { useState, useContext } from 'react';
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
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
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
    niveau: 'Alfa',
    contenu: '',
    quizzes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user) throw new Error('Utilisateur non authentifié');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/instructor/${user.id}/courses`,
        formData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccess('Cours créé avec succès !');
      setTimeout(() => navigate('/instructor/courses'), 2000);
    } catch (err) {
      console.error('Erreur lors de la création du cours:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création du cours. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: colors.navy || '#010b40', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} />
        <Typography sx={{ ml: 2, color: colors.white || '#ffffff' }}>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={instructorTheme}>
      <FormContainer>
        {/* Background Decorations */}
        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(${colors.fuschia || '#f13544'}0a 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.05 }} />
        <Box sx={{ position: 'absolute', bottom: 60, right: 30, width: 120, height: 120, background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`, borderRadius: '50%', opacity: 0.15, animation: `${floatingAnimation} 4s ease-in-out infinite` }} />
        <Container maxWidth={false} disableGutters>
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon sx={{ fontSize: 40, color: colors.fuschia || '#f13544' }} />
            <Typography variant="h3" sx={{ color: colors.white || '#ffffff', fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
              Créer un Cours
            </Typography>
          </Box>
          <FormCard>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <form onSubmit={handleSubmit}>
              <TextField
                label="Titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
              <TextField
                label="Durée (en heures)"
                name="duree"
                type="number"
                value={formData.duree}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Domaine ID"
                name="domaineId"
                value={formData.domaineId}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                select
                label="Niveau"
                name="niveau"
                value={formData.niveau}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                <MenuItem value="Alfa">Alfa</MenuItem>
                <MenuItem value="Bêta">Bêta</MenuItem>
                <MenuItem value="Gamma">Gamma</MenuItem>
                <MenuItem value="Delta">Delta</MenuItem>
              </TextField>
              <TextField
                label="Contenu (JSON)"
                name="contenu"
                value={formData.contenu}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
              <StyledButton type="submit" disabled={isLoading} fullWidth sx={{ mt: 2 }}>
                {isLoading ? <CircularProgress size={24} sx={{ color: colors.white || '#ffffff' }} /> : 'Créer le Cours'}
              </StyledButton>
            </form>
          </FormCard>
        </Container>
      </FormContainer>
    </ThemeProvider>
  );
};

export default CreateCourse;