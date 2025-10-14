import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Fade,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Download, Award, Calendar, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

/**
 * ==================== ANIMATIONS ====================
 */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

/**
 * ==================== PALETTE DE COULEURS ====================
 */
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
  darkBg: '#0a0e27',
  success: '#10b981',
  warning: '#f59e0b',
};

/**
 * ==================== STYLED COMPONENTS ====================
 */
const CertificateCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: `1px solid ${colors.red}33`,
  padding: theme.spacing(2.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 30px ${colors.navy}4d`,
    borderColor: `${colors.red}66`,
    background: `linear-gradient(135deg, ${colors.lightNavy}cc, ${colors.purple}99)`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '10px',
  padding: '8px 16px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${colors.red}4d`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

const StatCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.success}1a, ${colors.purple}1a)`,
  borderRadius: '12px',
  padding: theme.spacing(2.5),
  border: `1px solid ${colors.success}33`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: `${colors.success}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const EmptyStateBox = styled(Box)({
  textAlign: 'center',
  py: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
});

/**
 * ==================== COMPOSANT PRINCIPAL ====================
 */
const Certificates = () => {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };

  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  /**
   * Récupère les certificats de l'utilisateur
   */
  const fetchCertificates = useCallback(async () => {
    try {
      if (!user?.token) {
        setError('Authentification requise. Veuillez vous reconnecter.');
        logout();
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/learning/certificates`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const certificatesList = response.data?.data || response.data;

      if (!Array.isArray(certificatesList)) {
        throw new Error('Format de données invalide');
      }

      setCertificates(certificatesList);

      const thisMonth = certificatesList.filter((cert) => {
        const certDate = new Date(cert.dateEmission);
        const now = new Date();
        return (
          certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear()
        );
      }).length;

      setStats({
        total: certificatesList.length,
        thisMonth,
      });
    } catch (err) {
      let errorMessage = 'Erreur lors du chargement des certificats';

      if (err.response?.status === 401) {
        errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
        logout();
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas accès à vos certificats.";
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de se connecter au serveur.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Erreur réseau - vérifiez votre connexion.';
      }

      setError(errorMessage);
      setCertificates([]);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [user, logout, API_BASE_URL]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  /**
   * Télécharge un certificat
   */
  const handleDownloadCertificate = useCallback(
    async (certId, coursTitle) => {
      setDownloadingId(certId);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/learning/certificate/${certId}/download`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            responseType: 'blob',
            timeout: 30000,
          }
        );

        if (response.data.size === 0) {
          throw new Error('Le fichier PDF est vide');
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `Certificat_${coursTitle}_${new Date().toISOString().split('T')[0]}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || 'Erreur lors du téléchargement du certificat';
        alert(errorMsg);
      } finally {
        setDownloadingId(null);
      }
    },
    [API_BASE_URL, user?.token]
  );

  /**
   * Réessaie de récupérer les certificats
   */
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await fetchCertificates();
  }, [fetchCertificates]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: colors.navy,
          animation: `${fadeInUp} 0.5s ease-out`,
        }}
      >
        <CircularProgress sx={{ color: colors.pink }} size={60} thickness={4} />
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1rem', sm: '1.2rem' },
            fontWeight: 500,
            mt: 2,
          }}
        >
          Chargement de vos certificats...
        </Typography>
      </Box>
    );
  }

  if (error && certificates.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: colors.navy,
          p: { xs: 2, sm: 4 },
        }}
      >
        <Alert
          severity='error'
          sx={{
            width: { xs: '100%', sm: '80%', md: '50%' },
            bgcolor: `${colors.red}1a`,
            color: '#ffffff',
            borderRadius: '12px',
            p: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            '& .MuiAlert-icon': {
              color: colors.red,
              mt: 0.5,
            },
          }}
          icon={<AlertCircle size={24} />}
          action={
            <StyledButton
              size='small'
              onClick={handleRetry}
              disabled={retrying}
              endIcon={<RotateCcw size={16} />}
            >
              {retrying ? 'Réessai...' : 'Réessayer'}
            </StyledButton>
          }
        >
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Erreur</Typography>
            <Typography sx={{ fontSize: '0.95rem' }}>{error}</Typography>
          </Box>
        </Alert>
      </Box>
    );
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
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant='h3'
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Award size={32} color={colors.red} />
            Mes Certificats
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Certificats d'accomplissement obtenus
          </Typography>
        </Box>
      </Fade>

      {certificates.length > 0 && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard>
              <Award size={32} color={colors.success} style={{ marginBottom: '12px' }} />
              <Typography
                sx={{
                  color: colors.success,
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.8rem' },
                }}
              >
                {stats.total}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  mt: 1,
                }}
              >
                Total
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <StatCard>
              <Calendar size={32} color={colors.purple} style={{ marginBottom: '12px' }} />
              <Typography
                sx={{
                  color: colors.purple,
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.8rem' },
                }}
              >
                {stats.thisMonth}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  mt: 1,
                }}
              >
                Ce mois
              </Typography>
            </StatCard>
          </Grid>
        </Grid>
      )}

      {error && certificates.length > 0 && (
        <Alert
          severity='warning'
          sx={{
            bgcolor: `${colors.warning}1a`,
            color: '#ffffff',
            borderRadius: '12px',
            mb: 4,
            '& .MuiAlert-icon': {
              color: colors.warning,
            },
            width: { xs: '100%', sm: '80%', md: '50%' },
            mx: 'auto',
          }}
        >
          {error}
        </Alert>
      )}

      {certificates.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {certificates.map((cert, index) => (
            <Grid item xs={12} sm={6} md={4} key={cert._id}>
              <CertificateCard
                elevation={0}
                sx={{
                  animation: `${slideIn} 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${colors.success}33, ${colors.purple}33)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle size={28} color={colors.success} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        color: colors.success,
                        fontWeight: 700,
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      }}
                    >
                      Certificat obtenu
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {cert.cours?.titre || cert.title || 'Certificat'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Calendar size={16} color={colors.pink} />
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    }}
                  >
                    {new Date(cert.dateEmission).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>

                {cert.valide && (
                  <Chip
                    icon={<CheckCircle size={16} />}
                    label='Valide'
                    sx={{
                      backgroundColor: `${colors.success}33`,
                      color: colors.success,
                      fontWeight: 600,
                      mb: 3,
                    }}
                  />
                )}

                {cert.numero && (
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      mb: 2,
                      fontFamily: 'monospace',
                    }}
                  >
                    N° {cert.numero}
                  </Typography>
                )}

                <StyledButton
                  fullWidth
                  disabled={downloadingId === cert._id || !user?.token}
                  onClick={() =>
                    handleDownloadCertificate(cert._id, cert.cours?.titre || cert.title)
                  }
                  endIcon={
                    downloadingId === cert._id ? (
                      <CircularProgress size={16} sx={{ color: '#ffffff' }} />
                    ) : (
                      <Download size={18} />
                    )
                  }
                >
                  {downloadingId === cert._id ? 'Téléchargement...' : 'Télécharger'}
                </StyledButton>
              </CertificateCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyStateBox>
          <Award size={80} color={colors.red} style={{ opacity: 0.2 }} />
          <Box>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '1.2rem', sm: '1.3rem' },
                fontWeight: 600,
                mb: 1,
              }}
            >
              Aucun certificat obtenu
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Complétez vos cours pour obtenir vos certificats
            </Typography>
          </Box>
        </EmptyStateBox>
      )}
    </Box>
  );
};

export default Certificates;
