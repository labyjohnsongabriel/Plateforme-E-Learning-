// src/components/admin/Reports.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

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
const ReportsContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}, ${
    colors.lightNavy || '#1a237e'
  })`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ReportsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy || '#010b40'}cc, ${
    colors.lightNavy || '#1a237e'
  }cc)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${colors.fuschia || '#f13544'}33`,
  borderRadius: '16px',
  padding: theme.spacing(4),
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${colors.fuschia || '#f13544'}4d`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.success || '#4CAF50'}, ${
    colors.successLight || '#81C784'
  })`,
  borderRadius: '12px',
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  color: colors.white || '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.success || '#4CAF50'}CC, ${
      colors.successLight || '#81C784'
    }CC)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${colors.success || '#4CAF50'}4D`,
  },
  '&:disabled': {
    background: `linear-gradient(135deg, ${colors.success || '#4CAF50'}80, ${
      colors.successLight || '#81C784'
    }80)`,
    cursor: 'not-allowed',
  },
}));

const Reports = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vérification des droits admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role?.toLowerCase() !== 'admin') {
      setError('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.');
      setTimeout(() => navigate('/unauthorized'), 2000);
    }
  }, [user, authLoading, navigate]);

  // Chargement des rapports
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Validation de la réponse API
        const reportsData = Array.isArray(response.data?.data) ? response.data.data : [];
        setReports(
          reportsData.map((report) => ({
            id: report.id || Math.random().toString(36).slice(2), // Fallback ID
            title: report.title || 'Rapport Sans Titre',
            type: report.type || 'Inconnu',
            date: report.date || new Date().toISOString(),
            data: report.data || {},
            totalUsers: report.totalUsers || 0,
            usersByRole: report.usersByRole || {},
            totalCourses: report.totalCourses || 0,
            completionRate: report.completionRate || 0,
          }))
        );
      } catch (err) {
        console.error('Erreur lors du chargement des rapports:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des rapports');
        // Minimal demo data as fallback
        setReports([
          {
            id: 'fallback-1',
            title: 'Rapport Indisponible',
            type: 'Inconnu',
            date: new Date().toISOString(),
            data: { note: 'Données indisponibles en raison d’une erreur serveur' },
            totalUsers: 0,
            usersByRole: { admin: 0, instructor: 0, student: 0 },
            totalCourses: 0,
            completionRate: 0,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role?.toLowerCase() === 'admin') {
      fetchReports();
    }
  }, [user]);

  // Téléchargement d'un rapport
  const handleDownload = async (reportId) => {
    try {
      setError('');
      setSuccess('');

      const report = reports.find((r) => r.id === reportId);
      if (!report) {
        setError('Rapport non trouvé');
        return;
      }

      // Création d'un PDF simulé
      const pdfContent = `
        RAPPORT: ${report.title}
        Type: ${report.type}
        Date: ${new Date(report.date).toLocaleDateString('fr-FR')}
        Généré le: ${new Date().toLocaleDateString('fr-FR')}
        
        ${report.data ? `Statistiques: ${JSON.stringify(report.data, null, 2)}` : ''}
        ${report.totalUsers ? `Nombre total d'utilisateurs: ${report.totalUsers}` : ''}
        ${report.usersByRole ? `Utilisateurs par rôle: ${JSON.stringify(report.usersByRole, null, 2)}` : ''}
        ${report.totalCourses ? `Nombre total de cours: ${report.totalCourses}` : ''}
        ${report.completionRate ? `Taux de complétion: ${report.completionRate}%` : ''}
      `;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `rapport-${report.title.toLowerCase().replace(/\s+/g, '-')}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Rapport téléchargé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Erreur lors du téléchargement du rapport');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filtrage des rapports
  const filteredReports = Array.isArray(reports)
    ? reports.filter((r) => (r.title || '').toLowerCase().includes(search.toLowerCase()))
    : [];

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: colors.navy || '#010b40',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            color: colors.white || '#ffffff',
          }}
        >
          <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} size={48} />
          <Typography variant='h5'>Chargement des rapports...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ReportsContainer>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.fuschia || '#f13544'}1a 1px, transparent 1px),
            linear-gradient(90deg, ${colors.fuschia || '#f13544'}1a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 60,
          right: 30,
          width: 100,
          height: 100,
          background: `linear-gradient(135deg, ${
            colors.fuschia || '#f13544'
          }, ${colors.lightFuschia || '#ff6b74'})`,
          borderRadius: '50%',
          opacity: 0.15,
          animation: `${floatingAnimation} 4s ease-in-out infinite`,
        }}
      />

      <Container maxWidth='xl'>
        <ReportsCard elevation={4}>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 700,
              color: colors.white || '#ffffff',
              textAlign: 'center',
              mb: 1,
            }}
          >
            Rapports Administrateur
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              mb: 4,
            }}
          >
            Consultez et téléchargez les rapports du système
          </Typography>

          {error && (
            <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            label='Rechercher un rapport'
            variant='outlined'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: `${colors.fuschia || '#f13544'}4d`,
                },
                '&:hover fieldset': {
                  borderColor: colors.fuschia || '#f13544',
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.fuschia || '#f13544',
                },
                borderRadius: '12px',
                color: colors.white || '#ffffff',
              },
              '& .MuiInputLabel-root': {
                color: `${colors.white || '#ffffff'}b3`,
                '&.Mui-focused': { color: colors.fuschia || '#f13544' },
              },
              '& .MuiInputBase-input': {
                color: colors.white || '#ffffff',
                fontSize: '1rem',
              },
            }}
          />

          <TableContainer
            component={Paper}
            sx={{
              background: 'transparent',
              borderRadius: '12px',
              border: `1px solid ${colors.fuschia || '#f13544'}33`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label='Tableau des rapports'>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: colors.white || '#ffffff',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderBottom: `2px solid ${colors.fuschia || '#f13544'}`,
                    }}
                  >
                    Titre
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.white || '#ffffff',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderBottom: `2px solid ${colors.fuschia || '#f13544'}`,
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.white || '#ffffff',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderBottom: `2px solid ${colors.fuschia || '#f13544'}`,
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.white || '#ffffff',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderBottom: `2px solid ${colors.fuschia || '#f13544'}`,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <TableRow
                      key={report.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(241, 53, 68, 0.05)',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: colors.white || '#ffffff',
                          fontSize: '1rem',
                        }}
                      >
                        {report.title || 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: colors.white || '#ffffff',
                          fontSize: '1rem',
                        }}
                      >
                        {report.type || 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: colors.white || '#ffffff',
                          fontSize: '1rem',
                        }}
                      >
                        {report.date ? new Date(report.date).toLocaleDateString('fr-FR') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <StyledButton
                          onClick={() => handleDownload(report.id)}
                          aria-label={`Télécharger le rapport ${report.title || 'N/A'}`}
                        >
                          Télécharger
                        </StyledButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        color: colors.white || '#ffffff',
                        textAlign: 'center',
                        py: 4,
                        fontSize: '1.1rem',
                      }}
                    >
                      Aucun rapport trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </ReportsCard>
      </Container>
    </ReportsContainer>
  );
};

export default Reports;
