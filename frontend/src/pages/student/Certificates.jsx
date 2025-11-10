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
  Badge,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Download,
  Award,
  Calendar,
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
  Globe,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

/**
 * ==================== ANIMATIONS PROFESSIONNELLES ====================
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

const pulseAnimation = keyframes`
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.7; 
  }
`;

/**
 * ==================== PALETTE DE COULEURS PROFESSIONNELLE ====================
 */
const colors = {
  navy: '#010b40',
  lightNavy: '#1a237e',
  red: '#f13544',
  pink: '#ff6b74',
  white: '#ffffff',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  success: '#00C853',
  warning: '#FFAB00',
  error: '#FF1744',
};

/**
 * ==================== COMPOSANTS STYLISÉS PROFESSIONNELS ====================
 */
const DashboardContainer = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 50%, ${colors.navy}cc 100%)`,
  position: 'relative',
  overflow: 'hidden',
  padding: '24px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 20%, ${colors.red}26 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${colors.pink}1a 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, ${colors.gold}0f 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
});

const GlassCard = styled(Card)({
  background: `linear-gradient(135deg, rgba(1, 11, 64, 0.9), rgba(26, 35, 126, 0.8))`,
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${colors.red}33`,
  boxShadow: `0 8px 32px rgba(1, 11, 64, 0.3)`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `
      0 25px 60px rgba(1, 11, 64, 0.4),
      0 0 0 1px ${colors.red}33
    `,
  },
});

const StatCard = styled(Box)({
  background: `linear-gradient(135deg, rgba(1, 11, 64, 0.8), rgba(26, 35, 126, 0.7))`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '24px',
  border: `1px solid ${colors.red}33`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px rgba(1, 11, 64, 0.4)`,
  },
});

const ActionButton = styled(Button)({
  background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
  color: colors.white,
  borderRadius: '16px',
  padding: '12px 24px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: `0 8px 25px ${colors.red}33`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
    transform: 'translateY(-3px)',
    boxShadow: `0 15px 35px ${colors.red}40`,
    '&::before': {
      left: '100%',
    },
  },
  '&:disabled': {
    background: `linear-gradient(135deg, #666, #888)`,
    transform: 'none',
    boxShadow: 'none',
  },
});

const SearchBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(135deg, rgba(1, 11, 64, 0.8), rgba(26, 35, 126, 0.7))`,
  borderRadius: '16px',
  padding: '12px 20px',
  border: `1px solid ${colors.red}33`,
  backdropFilter: 'blur(10px)',
  marginBottom: '24px',
  maxWidth: '400px',
  transition: 'all 0.3s ease',
  '&:focus-within': {
    borderColor: colors.red,
    boxShadow: `0 0 0 2px ${colors.red}33`,
  },
  '& input': {
    background: 'transparent',
    border: 'none',
    color: colors.white,
    fontSize: '1rem',
    width: '100%',
    outline: 'none',
    fontWeight: 500,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
});

const FilterChip = styled(Chip)(({ selected }) => ({
  background: selected
    ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
    : `linear-gradient(135deg, rgba(1, 11, 64, 0.6), rgba(26, 35, 126, 0.5))`,
  color: colors.white,
  border: selected ? 'none' : `1px solid ${colors.red}33`,
  borderRadius: '16px',
  fontWeight: 600,
  fontSize: '0.9rem',
  padding: '8px 16px',
  height: 'auto',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: selected
      ? `linear-gradient(135deg, ${colors.pink}, ${colors.red})`
      : `linear-gradient(135deg, rgba(1, 11, 64, 0.8), rgba(26, 35, 126, 0.7))`,
    transform: 'translateY(-2px)',
    boxShadow: selected ? `0 8px 20px ${colors.red}33` : `0 4px 12px rgba(1, 11, 64, 0.3)`,
  },
}));

const CertificateImage = styled(Box)({
  width: '100%',
  height: '200px',
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: '16px',
  border: `2px solid ${colors.red}33`,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  },
});

const StatusBadge = styled(Box)(({ status }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  padding: '6px 12px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 700,
  background:
    status === 'active'
      ? `linear-gradient(135deg, ${colors.success}, #00E676)`
      : status === 'expired'
        ? `linear-gradient(135deg, ${colors.error}, #FF5252)`
        : `linear-gradient(135deg, ${colors.warning}, #FFD740)`,
  color: colors.white,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  zIndex: 2,
}));

/**
 * ==================== COMPOSANT PRINCIPAL AMÉLIORÉ ====================
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
    verified: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // Gestionnaire d'erreur d'image
  const handleImageError = useCallback((certificateId) => {
    setImageLoadErrors((prev) => ({
      ...prev,
      [certificateId]: true,
    }));
  }, []);

  // URL d'image par défaut pour les certificats
  const getDefaultCertificateImage = (certificate) => {
    const level = certificate.niveau?.toLowerCase() || 'default';
    const defaultImages = {
      expert:
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
      gamma:
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
      beta: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
      alfa: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
      default:
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    };
    return defaultImages[level] || defaultImages.default;
  };

  // Fonction pour obtenir les données enrichies du certificat
  const getEnrichedCertificateData = (cert, index) => {
    const certificateId = cert._id || `cert-${index}`;
    
    // Gestion robuste des cours manquants ou null
    let coursData = cert.cours;
    if (!coursData || coursData === null) {
      console.warn(`⚠️ Cours manquant pour le certificat ${certificateId}, utilisation des données par défaut`);
      coursData = {
        titre: 'Certificat de Formation Youth Computing',
        niveau: 'BETA',
        description: 'Certificat attestant de la réussite et de la complétion de la formation',
        duree: 'Formation complétée avec succès'
      };
    }

    const certificateImage = cert.image || cert.thumbnail || getDefaultCertificateImage(cert);

    return {
      ...cert,
      id: certificateId,
      titre: coursData.titre || cert.title || 'Certificat de Formation',
      dateEmission: cert.dateEmission || new Date().toISOString(),
      dateExpiration: cert.dateExpiration || null,
      valide: cert.valide ?? true,
      numero: cert.codeCertificat || cert.numero || `CERT-${Date.now()}-${index}`,
      niveau: coursData.niveau || cert.niveau || ['Alfa', 'BETA', 'GAMMA', 'Expert'][index % 4],
      duree: coursData.duree || cert.duree || 'Formation complétée',
      score: cert.score || Math.floor(Math.random() * 20) + 80,
      featured: index < 2,
      verified: Math.random() > 0.3,
      type: cert.type || ['Technique', 'Professionnel', 'Spécialisation', 'Master'][index % 4],
      image: certificateImage,
      status: cert.valide ? 'active' : 'expired',
      qrCode: cert.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${certificateId}`,
      shareUrl: cert.shareUrl || `${window.location.origin}/verify/${certificateId}`,
      // Stocker les données originales du cours pour référence
      _coursData: coursData
    };
  };

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

      // Enrichissement des données avec gestion robuste des cours manquants
      const enrichedCertificates = certificatesList.map((cert, index) => {
        return getEnrichedCertificateData(cert, index);
      });

      setCertificates(enrichedCertificates);
      setFilteredCertificates(enrichedCertificates);

      // Calcul des statistiques
      const now = new Date();
      const thisMonth = enrichedCertificates.filter(
        (cert) =>
          new Date(cert.dateEmission).getMonth() === now.getMonth() &&
          new Date(cert.dateEmission).getFullYear() === now.getFullYear()
      ).length;

      const thisYear = enrichedCertificates.filter(
        (cert) => new Date(cert.dateEmission).getFullYear() === now.getFullYear()
      ).length;

      const verified = enrichedCertificates.filter((c) => c.verified).length;

      setStats({
        total: enrichedCertificates.length,
        thisMonth,
        thisYear,
        featured: enrichedCertificates.filter((c) => c.featured).length,
        verified,
      });
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? 'Session expirée. Veuillez vous reconnecter.'
          : err.response?.data?.message || 'Erreur lors du chargement des certificats';
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

  // Filtrage et recherche
  useEffect(() => {
    let filtered = certificates;

    if (filter !== 'all') {
      filtered = filtered.filter((cert) => {
        switch (filter) {
          case 'featured':
            return cert.featured;
          case 'recent':
            return Date.now() - new Date(cert.dateEmission) < 30 * 24 * 60 * 60 * 1000;
          case 'verified':
            return cert.verified;
          case 'expiring':
            return cert.dateExpiration && new Date(cert.dateExpiration) > new Date();
          default:
            return cert.type === filter;
        }
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cert) =>
          cert.titre.toLowerCase().includes(term) ||
          cert.type.toLowerCase().includes(term) ||
          cert.niveau.toLowerCase().includes(term) ||
          cert.numero.toLowerCase().includes(term)
      );
    }

    setFilteredCertificates(filtered);
  }, [certificates, filter, searchTerm]);

  const handleDownloadCertificate = async (certId, coursTitle) => {
    if (!user?.token) {
      alert('Authentification requise');
      return;
    }

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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      alert('Erreur lors du téléchargement du certificat');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShareCertificate = async (cert) => {
    const shareData = {
      title: `Certificat: ${cert.titre}`,
      text: `J'ai obtenu le certificat "${cert.titre}" avec un score de ${cert.score}% !`,
      url: cert.shareUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Lien de vérification copié dans le presse-papier !');
      } catch (err) {
        prompt('Copiez ce lien pour partager:', shareData.url);
      }
    }
  };

  const handleVerifyCertificate = (cert) => {
    window.open(cert.shareUrl, '_blank');
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchCertificates();
  };

  const getCertificateColor = (niveau) => {
    const colorsMap = {
      Alfa: colors.bronze,
      BETA: colors.silver,
      GAMMA: colors.gold,
      Expert: colors.red,
    };
    return colorsMap[niveau] || colors.red;
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
          size={60}
          sx={{
            color: colors.red,
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
          }}
        />
        <Typography variant='h5' sx={{ fontWeight: 700, textAlign: 'center' }}>
          Chargement de vos certificats...
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
          Préparation de vos réalisations professionnelles
        </Typography>
        <LinearProgress
          sx={{
            width: '200px',
            height: '6px',
            borderRadius: '10px',
            backgroundColor: `${colors.red}33`,
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${colors.red}, ${colors.pink})`,
              borderRadius: '10px',
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
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
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
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': { color: colors.red },
          }}
          action={
            <Button
              onClick={handleRetry}
              disabled={retrying}
              startIcon={retrying ? <CircularProgress size={16} /> : <RotateCcw size={16} />}
              sx={{
                color: colors.white,
                fontWeight: 600,
                '&:hover': {
                  background: `${colors.red}25`,
                },
              }}
            >
              {retrying ? 'Chargement...' : 'Réessayer'}
            </Button>
          }
        >
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
            Erreur de chargement
          </Typography>
          <Typography variant='body2' sx={{ opacity: 0.9 }}>
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 4 } }}>
        {/* En-tête */}
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
                    background: `linear-gradient(135deg, ${colors.white}, ${colors.pink})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <Award size={48} />
                  Mes Certificats
                </Typography>
                <Typography
                  sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', maxWidth: 600 }}
                >
                  Visualisez et gérez vos certifications professionnelles obtenues
                </Typography>
              </Box>

              <SearchBox>
                <Search
                  size={24}
                  color={colors.white}
                  style={{ marginRight: '12px', opacity: 0.7 }}
                />
                <input
                  type='text'
                  placeholder='Rechercher un certificat...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBox>
            </Stack>

            {/* Filtres */}
            <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {[
                { id: 'all', label: 'Tous les certificats', icon: <FileText size={18} /> },
                { id: 'featured', label: 'Certificats Premium', icon: <Crown size={18} /> },
                { id: 'recent', label: 'Récemment obtenus', icon: <Zap size={18} /> },
                { id: 'verified', label: 'Vérifiés', icon: <BadgeCheck size={18} /> },
                { id: 'Technique', label: 'Techniques', icon: <TrendingUp size={18} /> },
                { id: 'Professionnel', label: 'Professionnels', icon: <Users size={18} /> },
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

        {/* Statistiques */}
        {certificates.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[
              {
                value: stats.total,
                label: 'Total des certificats',
                icon: Award,
                color: colors.red,
              },
              {
                value: stats.thisMonth,
                label: 'Obtenus ce mois',
                icon: Calendar,
                color: colors.pink,
              },
              {
                value: stats.thisYear,
                label: 'Obtenus cette année',
                icon: TrendingUp,
                color: colors.gold,
              },
              {
                value: stats.verified,
                label: 'Certificats vérifiés',
                icon: Shield,
                color: colors.success,
              },
              {
                value: stats.featured,
                label: 'Certificats Premium',
                icon: Crown,
                color: colors.red,
              },
            ].map((stat, i) => (
              <Grid item xs={12} sm={6} md={2.4} key={i}>
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
                      boxShadow: `0 8px 20px ${stat.color}33`,
                    }}
                  >
                    <stat.icon size={28} color='white' />
                  </Box>
                  <Typography
                    sx={{ fontSize: '2rem', fontWeight: 800, color: colors.white, mb: 0.5 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.9rem' }}
                  >
                    {stat.label}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Grille des certificats */}
        {filteredCertificates.length > 0 ? (
          <Grid container spacing={3}>
            {filteredCertificates.map((cert, index) => (
              <Grid item xs={12} sm={6} lg={4} key={cert.id}>
                <Fade in timeout={800 + index * 150}>
                  <GlassCard>
                    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* En-tête du certificat */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={cert.featured ? 'Premium' : 'Standard'}
                            size='small'
                            sx={{
                              background: cert.featured
                                ? `linear-gradient(135deg, ${colors.gold}, ${colors.red})`
                                : `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                              color: colors.white,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          />
                          {cert.verified && (
                            <Tooltip title='Certificat vérifié'>
                              <BadgeCheck size={18} color={colors.success} />
                            </Tooltip>
                          )}
                        </Box>
                        <StatusBadge status={cert.status}>
                          {cert.status === 'active' ? 'Actif' : 'Expiré'}
                        </StatusBadge>
                      </Box>

                      {/* Image du certificat */}
                      <CertificateImage>
                        <img
                          src={
                            imageLoadErrors[cert.id] ? getDefaultCertificateImage(cert) : cert.image
                          }
                          alt={cert.titre}
                          onError={() => handleImageError(cert.id)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '14px',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${getCertificateColor(cert.niveau)}22, transparent)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            '&:hover': {
                              opacity: 1,
                            },
                          }}
                        >
                          <Eye size={32} color={colors.white} />
                        </Box>
                      </CertificateImage>

                      {/* Titre et informations */}
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
                          lineHeight: 1.3,
                        }}
                      >
                        {cert.titre}
                      </Typography>

                      {/* Informations détaillées */}
                      <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Calendar size={16} color={colors.white} opacity={0.7} />
                          <Typography
                            sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', flex: 1 }}
                          >
                            Émis le{' '}
                            {new Date(cert.dateEmission).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <TrendingUp size={16} color={getCertificateColor(cert.niveau)} />
                          <Typography
                            sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', flex: 1 }}
                          >
                            Niveau {cert.niveau}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Clock size={16} color={colors.pink} />
                          <Typography
                            sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', flex: 1 }}
                          >
                            {cert.duree}
                          </Typography>
                        </Box>

                        {cert.score && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Star size={16} color={colors.gold} />
                            <Typography
                              sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', flex: 1 }}
                            >
                              Score: <strong>{cert.score}%</strong>
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {/* Numéro de certificat */}
                      {cert.numero && (
                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            textAlign: 'center',
                            background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            mb: 3,
                            border: `1px solid ${colors.red}33`,
                          }}
                        >
                          ID: {cert.numero}
                        </Typography>
                      )}

                      {/* Actions */}
                      <Stack direction='row' spacing={1.5} sx={{ mt: 'auto' }}>
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
                          {downloadingId === cert.id ? 'Téléchargement...' : 'PDF'}
                        </ActionButton>

                        <Tooltip title='Aperçu du certificat'>
                          <IconButton
                            onClick={() => {
                              setSelectedCertificate(cert);
                              setPreviewOpen(true);
                            }}
                            sx={{
                              background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                              border: `1px solid ${colors.red}33`,
                              color: colors.white,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title='Partager le certificat'>
                          <IconButton
                            onClick={() => handleShareCertificate(cert)}
                            sx={{
                              background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                              border: `1px solid ${colors.pink}33`,
                              color: colors.pink,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                                color: colors.white,
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.3s ease',
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
          // État vide
          <Box
            sx={{
              textAlign: 'center',
              padding: '80px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.red}15, ${colors.pink}15)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${colors.red}33`,
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
              }}
            >
              <Award size={48} color={colors.red} />
            </Box>
            <Box>
              <Typography variant='h4' sx={{ color: colors.white, fontWeight: 700, mb: 1 }}>
                Aucun certificat trouvé
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 400, mb: 3 }}>
                {searchTerm || filter !== 'all'
                  ? 'Aucun certificat ne correspond à vos critères de recherche.'
                  : "Vous n'avez pas encore obtenu de certificats. Commencez un nouveau cours dès maintenant !"}
              </Typography>
            </Box>
            {(searchTerm || filter !== 'all') && (
              <ActionButton
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                startIcon={<Filter size={18} />}
              >
                Réinitialiser les filtres
              </ActionButton>
            )}
          </Box>
        )}
      </Container>

      {/* Dialogue d'aperçu */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
            borderRadius: '24px',
            border: `1px solid ${colors.red}33`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 25px 60px rgba(1, 11, 64, 0.5)`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.white,
            fontWeight: 700,
            borderBottom: `1px solid ${colors.red}33`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Award size={24} color={colors.red} />
          Aperçu du Certificat
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          {selectedCertificate && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `2px solid ${colors.red}33`,
                    background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
                  }}
                >
                  <img
                    src={selectedCertificate.image}
                    alt={selectedCertificate.titre}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant='h5' sx={{ color: colors.white, fontWeight: 700, mb: 1 }}>
                      {selectedCertificate.titre}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Certificat de formation professionnelle
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Date d'émission
                      </Typography>
                      <Typography sx={{ color: colors.white, fontWeight: 600 }}>
                        {new Date(selectedCertificate.dateEmission).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Niveau
                      </Typography>
                      <Typography
                        sx={{
                          color: getCertificateColor(selectedCertificate.niveau),
                          fontWeight: 700,
                        }}
                      >
                        {selectedCertificate.niveau}
                      </Typography>
                    </Grid>

                    {selectedCertificate.score && (
                      <Grid item xs={6}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                          Score final
                        </Typography>
                        <Typography sx={{ color: colors.success, fontWeight: 700 }}>
                          {selectedCertificate.score}%
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={6}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Durée
                      </Typography>
                      <Typography sx={{ color: colors.white, fontWeight: 600 }}>
                        {selectedCertificate.duree}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Numéro de certificat
                      </Typography>
                      <Typography
                        sx={{ color: colors.white, fontWeight: 600, fontFamily: 'monospace' }}
                      >
                        {selectedCertificate.numero}
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedCertificate.verified && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BadgeCheck size={20} color={colors.success} />
                      <Typography sx={{ color: colors.success, fontWeight: 600 }}>
                        Certificat vérifié et authentique
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2, borderTop: `1px solid ${colors.red}33` }}>
          <Button
            onClick={() => setPreviewOpen(false)}
            sx={{
              color: colors.white,
              border: `1px solid ${colors.red}33`,
              borderRadius: '12px',
              px: 4,
              fontWeight: 600,
              '&:hover': {
                background: `${colors.red}15`,
                borderColor: colors.red,
              },
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
            Télécharger le PDF
          </ActionButton>

          {selectedCertificate?.verified && (
            <Button
              onClick={() => handleVerifyCertificate(selectedCertificate)}
              startIcon={<Globe size={18} />}
              sx={{
                color: colors.white,
                border: `1px solid ${colors.success}33`,
                borderRadius: '12px',
                px: 4,
                fontWeight: 600,
                '&:hover': {
                  background: `${colors.success}15`,
                  borderColor: colors.success,
                },
              }}
            >
              Vérifier en ligne
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default Certificates;