import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Card,
  Fade,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Palette de couleurs
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
};

// Styled Components
const SettingsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${colors.navy}4d`,
    borderColor: `${colors.red}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledCheckbox = styled(Checkbox)({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-checked': {
    color: colors.red,
  },
});

const StyledButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 24px',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${colors.red}4d`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

const Settings = () => {
  const { user, logout, refreshToken, isAuthenticated } = useAuth() || {
    user: null,
    logout: () => {},
    refreshToken: async () => false,
    isAuthenticated: false,
  };
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  /**
   * Charge les paramètres actuels de l'utilisateur
   */
  const loadSettings = useCallback(async () => {
    if (!isAuthenticated || !user?.token || !user?.id) {
      setError('Authentification requise');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 Fetching settings for user:', user.id);
      const response = await axios.get(`${API_BASE_URL}/api/users/settings`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        params: { userId: user.id }, // Add userId parameter
        timeout: 10000,
      });

      console.log('📊 Settings response:', response.data);
      const settings = response.data;
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setSuccess(null);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des paramètres:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = 'Erreur lors du chargement des paramètres';
      if (err.response?.status === 401) {
        console.log('🔄 Attempting token refresh');
        const refreshed = await refreshToken();
        if (refreshed) {
          console.log('✅ Token refreshed, retrying settings load');
          return loadSettings(); // Retry after refresh
        }
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        logout();
        navigate('/login');
      } else if (err.response?.status === 400) {
        errorMessage =
          err.response.data.message || 'Requête invalide, veuillez vérifier vos données';
      } else if (err.response?.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (err.response?.status === 404) {
        errorMessage = 'Paramètres non trouvés';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur réseau - vérifiez votre connexion Internet';
      } else {
        errorMessage = err.response?.data?.message || 'Erreur inattendue';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, logout, refreshToken, navigate, API_BASE_URL]);

  /**
   * Sauvegarde les paramètres
   */
  const handleSave = useCallback(async () => {
    if (!isAuthenticated || !user?.token || !user?.id) {
      setError('Authentification requise');
      navigate('/login');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📤 Saving settings for user:', user.id, { notificationsEnabled });
      const response = await axios.post(
        `${API_BASE_URL}/api/users/settings`,
        { userId: user.id, notificationsEnabled },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Settings saved:', response.data);
      setSuccess(response.data.message || 'Paramètres sauvegardés avec succès');
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde des paramètres:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = 'Erreur lors de la sauvegarde des paramètres';
      if (err.response?.status === 401) {
        console.log('🔄 Attempting token refresh');
        const refreshed = await refreshToken();
        if (refreshed) {
          console.log('✅ Token refreshed, retrying settings save');
          return handleSave(); // Retry after refresh
        }
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        logout();
        navigate('/login');
      } else if (err.response?.status === 400) {
        errorMessage =
          err.response.data.message || 'Requête invalide, veuillez vérifier vos données';
      } else if (err.response?.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (err.response?.status === 404) {
        errorMessage = 'Service indisponible';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur réseau - vérifiez votre connexion Internet';
      } else {
        errorMessage = err.response?.data?.message || 'Erreur inattendue';
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [notificationsEnabled, user, isAuthenticated, logout, refreshToken, navigate, API_BASE_URL]);

  useEffect(() => {
    if (!user || !isAuthenticated) {
      console.log('🚫 No user or not authenticated, redirecting to login');
      navigate('/login');
    } else {
      loadSettings();
    }
  }, [user, isAuthenticated, loadSettings, navigate]);

  if (!user || !isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: colors.navy,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      <Fade in timeout={800}>
        <Typography
          variant='h4'
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            mb: { xs: 3, sm: 4 },
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          Paramètres
        </Typography>
      </Fade>

      <SettingsCard elevation={0}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <CircularProgress sx={{ color: colors.red }} size={40} />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2, fontSize: '1rem' }}>
              Chargement des paramètres...
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert
                severity='error'
                sx={{
                  mb: 2,
                  bgcolor: `${colors.red}1a`,
                  color: '#ffffff',
                  borderRadius: '12px',
                  '& .MuiAlert-icon': { color: colors.red },
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity='success'
                sx={{
                  mb: 2,
                  bgcolor: `${colors.success}1a`,
                  color: '#ffffff',
                  borderRadius: '12px',
                  '& .MuiAlert-icon': { color: colors.success },
                }}
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    aria-label='Activer les notifications'
                  />
                }
                label={
                  <Typography sx={{ color: '#ffffff', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    Activer les notifications
                  </Typography>
                }
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              />
              <StyledButton
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                fullWidth
                aria-label='Sauvegarder les paramètres'
              >
                {saving ? (
                  <>
                    <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} />
                    Sauvegarde en cours...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </StyledButton>
            </Box>
          </>
        )}
      </SettingsCard>
    </Box>
  );
};

export default Settings;
