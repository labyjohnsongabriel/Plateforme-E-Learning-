import React, { useState } from 'react';
import { Box, Typography, Card, Switch, Button, Fade, CircularProgress, Grid } from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as BellIcon,
  Security as ShieldIcon,
  Storage as StorageIcon,
  Email as MailIcon,
  CheckCircle as CheckCircleIcon,
  Error as AlertCircleIcon,
  Settings as SettingsIcon,
  Dns as ServerIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

// Fonction utilitaire pour valider les couleurs
const validateColor = (color, fallback) => {
  if (typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return color;
  }
  return fallback;
};

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const ConfigCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${validateColor(colors.navy, '#010b40')}b3, ${validateColor(colors.lightNavy, '#1a237e')}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${validateColor(colors.red, '#ef4444')}33`,
  padding: theme.spacing(2),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${validateColor(colors.navy, '#010b40')}4d`,
  },
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StatusAlert = styled(Box)(({ theme, status }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  border: `1px solid ${status === 'success' ? validateColor(colors.purple, '#8b5cf6') : validateColor(colors.red, '#ef4444')}33`,
  background:
    status === 'success'
      ? `${validateColor(colors.purple, '#8b5cf6')}1a`
      : `${validateColor(colors.red, '#ef4444')}1a`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  color:
    status === 'success'
      ? validateColor(colors.purple, '#8b5cf6')
      : validateColor(colors.red, '#ef4444'),
  width: '100%',
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-checked': {
      color: validateColor(colors.red, '#ef4444'),
    },
    '&.Mui-checked + .MuiSwitch-track': {
      backgroundColor: validateColor(colors.red, '#ef4444'),
    },
  },
  '& .MuiSwitch-track': {
    backgroundColor: validateColor(colors.navy, '#010b40'),
  },
}));

const SystemConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    notifications: true,
    emailAlerts: true,
    securityLogs: true,
    autoBackup: false,
    maintenanceMode: false,
    apiRateLimit: true,
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const API_BASE_URL = 'http://localhost:3001/api';
  const token = localStorage.getItem('token');

  const configSections = [
    {
      title: 'Notifications',
      icon: BellIcon,
      settings: [
        {
          key: 'notifications',
          label: 'Notifications Push',
          description: 'Recevoir des notifications en temps réel',
        },
        {
          key: 'emailAlerts',
          label: 'Alertes Email',
          description: 'Notifications par email pour événements critiques',
        },
      ],
    },
    {
      title: 'Sécurité',
      icon: ShieldIcon,
      settings: [
        {
          key: 'securityLogs',
          label: 'Journaux de Sécurité',
          description: 'Enregistrer tous les événements de sécurité',
        },
        {
          key: 'apiRateLimit',
          label: 'Limitation API',
          description: 'Activer la limitation du taux de requêtes API',
        },
      ],
    },
    {
      title: 'Système',
      icon: StorageIcon,
      settings: [
        {
          key: 'autoBackup',
          label: 'Sauvegarde Automatique',
          description: 'Sauvegardes quotidiennes automatiques',
        },
        {
          key: 'maintenanceMode',
          label: 'Mode Maintenance',
          description: 'Activer le mode maintenance du système',
        },
      ],
    },
  ];

  const handleToggle = (key) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveStatus(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus(null);
    try {
      await axios.put(`${API_BASE_URL}/users/settings`, config, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        p: { xs: 1, sm: 2 },
        bgcolor: validateColor(colors.navy, '#010b40'),
        color: '#ffffff',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <Fade in timeout={800}>
        <Box sx={{ width: '100%', maxWidth: '100%', mx: 0, height: '100%' }}>
          {/* Header */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <SettingsIcon
              sx={{ color: validateColor(colors.red, '#ef4444'), fontSize: { xs: 24, sm: 32 } }}
            />
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              Configuration Système
            </Typography>
          </Box>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 2,
              textAlign: { xs: 'center', sm: 'left' },
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            }}
          >
            Gérez les paramètres et préférences du système
          </Typography>

          {/* Status Alert */}
          {saveStatus && (
            <StatusAlert status={saveStatus}>
              {saveStatus === 'success' ? (
                <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
              ) : (
                <AlertCircleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
              )}
              <Typography sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                {saveStatus === 'success'
                  ? 'Configuration sauvegardée avec succès'
                  : 'Erreur lors de la sauvegarde'}
              </Typography>
            </StatusAlert>
          )}

          {/* Configuration Sections */}
          <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
            {configSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Grid item xs={12} md={4} key={idx}>
                  <ConfigCard elevation={0}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 1,
                        borderBottom: `1px solid ${validateColor(colors.red, '#ef4444')}33`,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: `${validateColor(colors.red, '#ef4444')}1a`,
                          borderRadius: '8px',
                        }}
                      >
                        <Icon
                          sx={{
                            color: validateColor(colors.red, '#ef4444'),
                            fontSize: { xs: 16, sm: 20 },
                          }}
                        />
                      </Box>
                      <Typography
                        variant='h6'
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                      >
                        {section.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {section.settings.map((setting) => (
                        <Box
                          key={setting.key}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                color: '#ffffff',
                                fontWeight: 500,
                                mb: 0.5,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                              }}
                            >
                              {setting.label}
                            </Typography>
                            <Typography
                              sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              }}
                            >
                              {setting.description}
                            </Typography>
                          </Box>
                          <StyledSwitch
                            checked={config[setting.key]}
                            onChange={() => handleToggle(setting.key)}
                            aria-label={`Activer ou désactiver ${setting.label}`}
                          />
                        </Box>
                      ))}
                    </Box>
                  </ConfigCard>
                </Grid>
              );
            })}
          </Grid>

          {/* Actions */}
          <ConfigCard elevation={0}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  sx={{ color: '#ffffff', fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Modifications en attente
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  Cliquez sur Sauvegarder pour appliquer les changements
                </Typography>
              </Box>
              <Button
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  bgcolor: `linear-gradient(135deg, ${validateColor(colors.red, '#ef4444')}, ${validateColor(colors.pink, '#f472b6')})`,
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${validateColor(colors.red, '#ef4444')}4d`,
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  'Sauvegarder les Modifications'
                )}
              </Button>
            </Box>
          </ConfigCard>

          {/* System Info */}
          <Grid container spacing={2} sx={{ mt: 2, width: '100%' }}>
            {[
              { icon: StorageIcon, title: 'Base de données', status: 'Connectée' },
              { icon: ServerIcon, title: 'Serveur', status: 'En ligne' },
              { icon: MailIcon, title: 'Service Mail', status: 'Actif' },
            ].map((item, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <ConfigCard elevation={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <item.icon
                      sx={{
                        color: validateColor(colors.purple, '#8b5cf6'),
                        fontSize: { xs: 24, sm: 32 },
                        mb: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                      }}
                    >
                      {item.status}
                    </Typography>
                  </Box>
                </ConfigCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default SystemConfig;
