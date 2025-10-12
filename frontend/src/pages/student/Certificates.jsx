import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Card, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { CloudDownload as DownloadIcon } from '@mui/icons-material';

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Couleurs principales
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  purple: '#8b5cf6',
};

// Styled Components
const CertificateCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${colors.red}33`,
  padding: '16px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${colors.navy}4d`,
  },
});

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3001/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/certificates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertificates(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des certificats');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [token]);

  const handleDownload = async (certId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificate/${certId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur lors du téléchargement du certificat:', err);
      alert('Erreur lors du téléchargement du certificat.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography sx={{ color: '#ffffff', fontSize: '1.2rem' }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography sx={{ color: colors.red, fontSize: '1.2rem' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh' }}>
      <Fade in timeout={800}>
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            mb: 4,
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          Mes Certificats
        </Typography>
      </Fade>
      <Stack spacing={3}>
        {certificates.length === 0 ? (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>
            Aucun certificat obtenu pour le moment.
          </Typography>
        ) : (
          certificates.map((cert) => (
            <CertificateCard key={cert.id} elevation={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '1.2rem',
                    }}
                  >
                    Certificat - {cert.title || `Niveau ${cert.level}`}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Obtenu le {new Date(cert.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(cert.id)}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${colors.red}4d`,
                    },
                  }}
                >
                  Télécharger
                </Button>
              </Box>
            </CertificateCard>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default Certificates;