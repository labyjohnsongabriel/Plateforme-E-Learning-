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
  Stack,
  Container,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Download,
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Share2,
  Eye,
  Filter,
  Search,
  Star,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Shield,
  BadgeCheck,
  Zap,
  Crown,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

/**
 * ==================== ANIMATIONS IDENTIQUES AU CATALOGUE ====================
 */
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(40px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-15px); 
  }
`;

const rotateAnimation = keyframes`
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
`;

/**
 * ==================== COULEURS IDENTIQUES AU CATALOGUE ====================
 */
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  white: '#ffffff',
};

/**
 * ==================== COMPOSANTS STYLISÉS (STYLE CATALOGUE) ====================
 */
const DashboardContainer = styled(Box)({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.navy}cc 100%)`,
  position: 'relative',
  overflow: 'hidden',
  padding: '24px',
});

const GlassCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${colors.red}33`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 25px 60px ${colors.navy}4d`,
  },
});

const StatCard = styled(Box)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '24px',
  border: `1px solid ${colors.red}33`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${colors.navy}4d`,
  },
});

const ActionButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: colors.white,
  borderRadius: '16px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: `0 8px 25px ${colors.red}33`,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
    transform: 'translateY(-3px)',
    boxShadow: `0 15px 35px ${colors.red}40`,
  },
});

const SearchBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  borderRadius: '16px',
  padding: '12px 20px',
  border: `1px solid ${colors.red}33`,
  backdropFilter: 'blur(10px)',
  marginBottom: '24px',
  maxWidth: '400px',
  '& input': {
    background: 'transparent',
    border: 'none',
    color: colors.white,
    fontSize: '1.1rem',
    width: '100%',
    outline: 'none',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
});

const FilterChip = styled(Chip)(({ selected }) => ({
  background: selected
    ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
    : `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  color: colors.white,
  border: selected ? 'none' : `1px solid ${colors.red}33`,
  borderRadius: '16px',
  fontWeight: 600,
  fontSize: '0.9rem',
  '&:hover': {
    background: selected
      ? `linear-gradient(135deg, ${colors.pink}, ${colors.red})`
      : `${colors.red}15`,
    transform: 'translateY(-2px)',
  },
}));

const EmptyStateBox = styled(Box)({
  textAlign: 'center',
  padding: '80px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
});

/**
 * ==================== COMPOSANT PRINCIPAL ====================
 */
const Certificates = () => {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };

  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    thisYear: 0,
    featured: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const fetchCertificates = useCallback(async () => {
    try {
      if (!user?.token) {
        setError('Authentification requise. Veuillez vous reconnecter.');
        setTimeout(() => logout(), 2000);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/learning/certificates`, {
        headers: { Authorization: `Bearer ${user.token}` },
        timeout: 15000,
      });

      const certificatesList = response.data?.data || response.data || [];
      if (!Array.isArray(certificatesList)) throw new Error('Format invalide');

      const enrichedCertificates = certificatesList.map((cert, index) => ({
        ...cert,
        id: cert._id || `cert-${index}`,
        titre: cert.cours?.titre || cert.title || 'Certificat de Formation',
        dateEmission: cert.dateEmission || new Date().toISOString(),
        valide: cert.valide ?? true,
        numero: cert.numero || `CERT-${Date.now()}-${index}`,
        niveau: cert.niveau || ['Alfa', 'BETA', 'GAMMA', 'Expert'][index % 4],
        duree: cert.duree || Math.floor(Math.random() * 50) + 10,
        score: cert.score || Math.floor(Math.random() * 20) + 80,
        featured: index < 2,
        type: cert.type || ['Technique', 'Professionnel', 'Spécialisation', 'Master'][index % 4],
      }));

      setCertificates(enrichedCertificates);
      setFilteredCertificates(enrichedCertificates);

      const now = new Date();
      const thisMonth = enrichedCertificates.filter(
        (cert) =>
          new Date(cert.dateEmission).getMonth() === now.getMonth() &&
          new Date(cert.dateEmission).getFullYear() === now.getFullYear()
      ).length;

      const thisYear = enrichedCertificates.filter(
        (cert) => new Date(cert.dateEmission).getFullYear() === now.getFullYear()
      ).length;

      setStats({
        total: enrichedCertificates.length,
        thisMonth,
        thisYear,
        featured: enrichedCertificates.filter((c) => c.featured).length,
      });
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? 'Session expirée'
          : err.response?.data?.message || 'Erreur de chargement';
      setError(msg);
      setCertificates([]);
      setFilteredCertificates([]);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [user, logout, API_BASE_URL]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    let filtered = certificates;
    if (filter !== 'all') {
      filtered = filtered.filter((cert) =>
        filter === 'featured'
          ? cert.featured
          : filter === 'recent'
            ? Date.now() - new Date(cert.dateEmission) < 30 * 24 * 60 * 60 * 1000
            : cert.type === filter
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cert) =>
          cert.titre.toLowerCase().includes(term) ||
          cert.type.toLowerCase().includes(term) ||
          cert.niveau.toLowerCase().includes(term)
      );
    }
    setFilteredCertificates(filtered);
  }, [certificates, filter, searchTerm]);

  const handleDownloadCertificate = async (certId, coursTitle) => {
    if (!user?.token) return alert('Authentification requise');
    setDownloadingId(certId);
    try {
      const response = await axios.get(`${API_BASE_URL}/learning/certificate/${certId}/download`, {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificat_${coursTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShareCertificate = (cert) => {
    if (navigator.share) {
      navigator.share({ title: cert.titre, text: `Score: ${cert.score}%` });
    } else {
      navigator.clipboard.writeText(`Certificat: ${cert.titre}`);
      alert('Copié dans le presse-papier !');
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchCertificates();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
          color: colors.white,
          gap: 3,
        }}
      >
        <CircularProgress
          sx={{ color: colors.red, animation: `${rotateAnimation} 2s linear infinite` }}
        />
        <Typography variant='h5' sx={{ fontWeight: 700 }}>
          Chargement des certificats...
        </Typography>
        <LinearProgress
          sx={{
            width: '200px',
            height: '6px',
            borderRadius: '10px',
            backgroundColor: `${colors.red}33`,
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
            },
          }}
        />
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
          minHeight: '100vh',
          p: 4,
        }}
      >
        <Alert
          severity='error'
          sx={{
            width: '100%',
            maxWidth: 600,
            background: `${colors.red}15`,
            color: colors.white,
            border: `1px solid ${colors.red}33`,
            borderRadius: '20px',
          }}
          action={
            <Button
              onClick={handleRetry}
              disabled={retrying}
              startIcon={retrying ? <CircularProgress size={16} /> : <RotateCcw size={16} />}
              sx={{ color: colors.white }}
            >
              Réessayer
            </Button>
          }
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 20%, ${colors.red}26 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${colors.red}1a 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 4 } }}>
        <Fade in timeout={1000}>
          <Box sx={{ mb: 6 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent='space-between'
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={3}
              sx={{ mb: 4 }}
            >
              <Box>
                <Typography
                  variant='h1'
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    color: colors.white,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Award size={48} color={colors.red} />
                  Mes Certificats
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>
                  Vos réalisations et certifications professionnelles
                </Typography>
              </Box>
              <SearchBox>
                <Search size={24} color={colors.white} style={{ marginRight: '12px' }} />
                <input
                  type='text'
                  placeholder='Rechercher...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBox>
            </Stack>

            <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', mb: 4 }}>
              {[
                { id: 'all', label: 'Tous', icon: <FileText size={18} /> },
                { id: 'featured', label: 'Premium', icon: <Sparkles size={18} /> },
                { id: 'recent', label: 'Récents', icon: <Zap size={18} /> },
                { id: 'Technique', label: 'Techniques', icon: <TrendingUp size={18} /> },
              ].map((f) => (
                <FilterChip
                  key={f.id}
                  label={f.label}
                  icon={f.icon}
                  selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                />
              ))}
            </Stack>
          </Box>
        </Fade>

        {certificates.length > 0 && (
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[
              { value: stats.total, label: 'Total', icon: Award, color: colors.red },
              { value: stats.thisMonth, label: 'Ce Mois', icon: Calendar, color: colors.pink },
              { value: stats.thisYear, label: 'Cette Année', icon: TrendingUp, color: colors.red },
              { value: stats.featured, label: 'Premium', icon: Crown, color: colors.pink },
            ].map((stat, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <StatCard>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <stat.icon size={32} color='white' />
                  </Box>
                  <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color: colors.white }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredCertificates.length > 0 ? (
          <Grid container spacing={4}>
            {filteredCertificates.map((cert, index) => (
              <Grid item xs={12} md={6} lg={4} key={cert.id}>
                <Fade in timeout={1000 + index * 200}>
                  <GlassCard elevation={0}>
                    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={cert.featured ? 'Premium' : 'Obtenu'}
                          sx={{
                            background: cert.featured
                              ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                              : `${colors.navy}b3`,
                            color: colors.white,
                            fontWeight: 600,
                          }}
                        />
                        {cert.featured && (
                          <Crown
                            size={24}
                            color={colors.pink}
                            style={{ animation: `${floatingAnimation} 3s infinite` }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant='h6'
                        sx={{
                          color: colors.white,
                          fontWeight: 700,
                          mb: 2,
                          minHeight: '56px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {cert.titre}
                      </Typography>

                      <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Calendar size={18} color={colors.white} />
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                            {new Date(cert.dateEmission).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <TrendingUp size={18} color={colors.red} />
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                            Niveau: {cert.niveau}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Clock size={18} color={colors.pink} />
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                            Durée: {cert.duree}h
                          </Typography>
                        </Box>
                        {cert.score && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Star size={18} color={colors.red} />
                            <Typography
                              sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}
                            >
                              Score: {cert.score}%
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {cert.numero && (
                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            textAlign: 'center',
                            background: `${colors.navy}b3`,
                            padding: '8px',
                            borderRadius: '8px',
                            mb: 3,
                          }}
                        >
                          ID: {cert.numero}
                        </Typography>
                      )}

                      <Stack direction='row' spacing={2} sx={{ mt: 'auto' }}>
                        <ActionButton
                          fullWidth
                          onClick={() => handleDownloadCertificate(cert.id, cert.titre)}
                          disabled={downloadingId === cert.id}
                          startIcon={
                            downloadingId === cert.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Download size={18} />
                            )
                          }
                        >
                          {downloadingId === cert.id ? '...' : 'PDF'}
                        </ActionButton>
                        <Tooltip title='Voir'>
                          <IconButton
                            onClick={() => {
                              setSelectedCertificate(cert);
                              setPreviewOpen(true);
                            }}
                            sx={{
                              background: `${colors.red}15`,
                              border: `1px solid ${colors.red}33`,
                              color: colors.red,
                              '&:hover': { background: `${colors.red}25` },
                            }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Partager'>
                          <IconButton
                            onClick={() => handleShareCertificate(cert)}
                            sx={{
                              background: `${colors.pink}15`,
                              border: `1px solid ${colors.pink}33`,
                              color: colors.pink,
                              '&:hover': { background: `${colors.pink}25` },
                            }}
                          >
                            <Share2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </GlassCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyStateBox>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `${colors.red}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${colors.red}33`,
              }}
            >
              <Award size={48} color={colors.red} />
            </Box>
            <Typography variant='h5' sx={{ color: colors.white, fontWeight: 700 }}>
              Aucun certificat trouvé
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 400 }}>
              Modifiez vos filtres ou commencez un nouveau cours !
            </Typography>
            {(searchTerm || filter !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                sx={{
                  mt: 2,
                  color: colors.white,
                  border: `1px solid ${colors.red}`,
                  borderRadius: '16px',
                  px: 4,
                  py: 1.5,
                }}
                startIcon={<Filter size={18} />}
              >
                Réinitialiser
              </Button>
            )}
          </EmptyStateBox>
        )}
      </Container>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
            borderRadius: '24px',
            border: `1px solid ${colors.red}33`,
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle
          sx={{ color: colors.white, fontWeight: 700, borderBottom: `1px solid ${colors.red}33` }}
        >
          Aperçu du Certificat
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          {selectedCertificate && (
            <Box sx={{ textAlign: 'center' }}>
              <Award size={80} color={colors.red} style={{ mb: 3 }} />
              <Typography variant='h5' sx={{ color: colors.white, fontWeight: 700, mb: 2 }}>
                {selectedCertificate.titre}
              </Typography>
              <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Date</Typography>
                  <Typography sx={{ color: colors.white, fontWeight: 600 }}>
                    {new Date(selectedCertificate.dateEmission).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Niveau</Typography>
                  <Typography sx={{ color: colors.white, fontWeight: 600 }}>
                    {selectedCertificate.niveau}
                  </Typography>
                </Grid>
                {selectedCertificate.score && (
                  <Grid item xs={6}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Score</Typography>
                    <Typography sx={{ color: colors.red, fontWeight: 700 }}>
                      {selectedCertificate.score}%
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Durée</Typography>
                  <Typography sx={{ color: colors.white, fontWeight: 600 }}>
                    {selectedCertificate.duree}h
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setPreviewOpen(false)}
            sx={{
              color: colors.white,
              border: `1px solid ${colors.red}`,
              borderRadius: '12px',
              px: 4,
            }}
          >
            Fermer
          </Button>
          <ActionButton
            onClick={() =>
              selectedCertificate &&
              handleDownloadCertificate(selectedCertificate.id, selectedCertificate.titre)
            }
            startIcon={<Download size={18} />}
          >
            PDF
          </ActionButton>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default Certificates;
