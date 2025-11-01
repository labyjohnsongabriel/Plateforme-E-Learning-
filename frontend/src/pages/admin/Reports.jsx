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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Grid,
  Chip,
  Snackbar,
  Avatar,
  Fade,
} from '@mui/material';
import { Visibility, Download, School, People, CheckCircle } from '@mui/icons-material';
import { styled, keyframes, alpha, useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Validate colors
const validateColor = (color, fallback) => {
  if (typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return color;
  }
  return fallback;
};

// Styled Components
const ReportsContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${validateColor(colors.navy, '#010b40')} 0%, ${validateColor(colors.lightNavy, '#1a237e')} 100%)`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(validateColor(colors.navy, '#010b40'), 0.8)}, ${alpha(validateColor(colors.lightNavy, '#1a237e'), 0.8)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.2)}`,
  borderRadius: 16,
  padding: theme.spacing(2),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${alpha(validateColor(colors.fuschia, '#f13544'), 0.3)}`,
    borderColor: alpha(validateColor(colors.fuschia, '#f13544'), 0.5),
  },
}));

const ReportsCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(validateColor(colors.navy, '#010b40'), 0.95)}, ${alpha(validateColor(colors.lightNavy, '#1a237e'), 0.95)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.2)}`,
  borderRadius: 20,
  padding: theme.spacing(3),
  boxShadow: `0 20px 60px ${alpha('#000', 0.3)}`,
  animation: `${fadeInUp} 0.8s ease-out`,
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: validateColor(colors.white, '#ffffff'),
  fontWeight: 600,
  fontSize: '0.95rem',
  borderBottom: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.1)}`,
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: { fontSize: '0.85rem', padding: theme.spacing(1) },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(validateColor(colors.fuschia, '#f13544'), 0.08),
    transform: 'scale(1.01)',
  },
  '&:last-child td': { borderBottom: 0 },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: validateColor(colors.white, '#ffffff'),
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'scale(1.2) rotate(10deg)' },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${validateColor(colors.fuschia, '#f13544')}, ${validateColor(colors.lightFuschia, '#ff6b74')})`,
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: `0 8px 24px ${alpha(validateColor(colors.fuschia, '#f13544'), 0.4)}`,
  color: validateColor(colors.white, '#ffffff'),
  '&:hover': {
    background: `linear-gradient(135deg, ${alpha(validateColor(colors.fuschia, '#f13544'), 0.9)}, ${alpha(validateColor(colors.lightFuschia, '#ff6b74'), 0.9)})`,
    boxShadow: `0 12px 32px ${alpha(validateColor(colors.fuschia, '#f13544'), 0.6)}`,
    transform: 'translateY(-2px)',
  },
}));

const Reports = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    completionRate: 0,
    usersByRole: { admin: 0, instructor: 0, student: 0 },
  });

  // Admin check
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role?.toLowerCase() !== 'admin') {
      setError('Accès réservé aux administrateurs');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/unauthorized'), 2000);
    }
  }, [user, authLoading, navigate]);

  // Fetch reports and stats
  const fetchReportsAndStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = user?.token || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      console.log('Début de la récupération des statistiques...');
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stats`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 secondes timeout
      });

      console.log('Réponse reçue:', response.data);
      
      const globalData = response.data;

      // Normalize data to match expected structure
      const normalizedStats = {
        totalUsers: globalData.totalUsers || 0,
        totalCourses: globalData.totalCourses || 0,
        completionRate: globalData.completionRate || 0,
        usersByRole: globalData.usersByRole || { 
          admin: globalData.usersByRole?.admin || 0, 
          instructor: globalData.usersByRole?.instructor || 0, 
          student: globalData.usersByRole?.student || 0 
        },
      };
      
      setStats(normalizedStats);

      // Create a comprehensive report from stats
      const report = {
        id: 'global-1',
        title: 'Rapport Global des Statistiques',
        type: 'Global',
        date: new Date().toISOString(),
        data: {
          categories: globalData.categories || [],
          totalEnrollments: globalData.totalEnrollments || 0,
          recentActivities: globalData.recentActivities || [],
          coursesData: globalData.coursesData || [],
        },
        totalUsers: normalizedStats.totalUsers,
        usersByRole: normalizedStats.usersByRole,
        totalCourses: normalizedStats.totalCourses,
        completionRate: normalizedStats.completionRate,
      };
      
      setReports([report]);
      setFilteredReports([report]);
      console.log('Rapport créé avec succès:', report);

    } catch (err) {
      console.error('Erreur détaillée lors de la récupération:', err);
      
      let errorMessage = 'Erreur lors de la récupération des statistiques';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Erreur avec réponse du serveur
          errorMessage = err.response.data?.message || `Erreur serveur: ${err.response.status}`;
        } else if (err.request) {
          // Pas de réponse du serveur
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else {
          // Erreur de configuration
          errorMessage = `Erreur de configuration: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSnackbarOpen(true);
      
      // Create fallback data
      const fallbackStats = {
        totalUsers: 0,
        totalCourses: 0,
        completionRate: 0,
        usersByRole: { admin: 0, instructor: 0, student: 0 },
      };
      
      setStats(fallbackStats);
      
      const fallbackReport = {
        id: 'fallback-1',
        title: 'Rapport Indisponible',
        type: 'Erreur',
        date: new Date().toISOString(),
        data: { 
          note: 'Données indisponibles - Veuillez réessayer plus tard',
          categories: [],
          totalEnrollments: 0
        },
        totalUsers: 0,
        usersByRole: { admin: 0, instructor: 0, student: 0 },
        totalCourses: 0,
        completionRate: 0,
      };
      
      setReports([fallbackReport]);
      setFilteredReports([fallbackReport]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role?.toLowerCase() === 'admin') {
      fetchReportsAndStats();
    }
  }, [user]);

  // Filter reports
  useEffect(() => {
    const filtered = reports.filter(
      (r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.type && r.type.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredReports(filtered);
    setPage(0);
  }, [search, reports]);

  // View report details
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setDetailsModalOpen(true);
  };

  // Download report as PDF
  const handleDownload = async (reportId) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) {
        throw new Error('Rapport non trouvé');
      }

      console.log('Début de la génération du PDF pour le rapport:', report.title);
      
      const doc = new jsPDF();
      
      // Configuration du document
      doc.setProperties({
        title: `Rapport - ${report.title}`,
        subject: 'Rapport Administratif Plateforme',
        author: 'Système Administratif',
        keywords: 'rapport, statistiques, administration',
        creator: 'Plateforme Éducative'
      });

      // En-tête
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(validateColor(colors.navy, '#010b40'));
      doc.text('Rapport Administratif - Plateforme Éducative', 14, 15);
      
      doc.setDrawColor(validateColor(colors.fuschia, '#f13544'));
      doc.setLineWidth(0.5);
      doc.line(14, 20, 196, 20);

      // Informations du rapport
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(90);
      
      let yPosition = 30;
      doc.text(`Rapport: ${report.title}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Type: ${report.type}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Date du rapport: ${formatDate(report.date)}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, 14, yPosition);
      yPosition += 15;

      // Tableau des statistiques principales
      const tableData = [
        ['Statistique', 'Valeur'],
        ['Total Utilisateurs', report.totalUsers?.toString() || '0'],
        ['Total Cours', report.totalCourses?.toString() || '0'],
        ['Taux de Complétion', `${report.completionRate || 0}%`],
        ['Inscriptions Totales', report.data?.totalEnrollments?.toString() || '0'],
      ];

      // Ajouter les utilisateurs par rôle
      if (report.usersByRole) {
        Object.entries(report.usersByRole).forEach(([role, count]) => {
          const roleName = getRoleDisplayName(role);
          tableData.push([`Utilisateurs ${roleName}`, count.toString()]);
        });
      }

      doc.autoTable({
        startY: yPosition,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: validateColor(colors.navy, '#010b40'),
          textColor: validateColor(colors.white, '#ffffff'),
          fontSize: 11,
          fontStyle: 'bold',
        },
        bodyStyles: { 
          textColor: validateColor(colors.navy, '#010b40'), 
          fontSize: 10 
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] 
        },
        margin: { top: 10 },
        styles: {
          cellPadding: 3,
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
      });

      let finalY = doc.autoTable.previous.finalY + 10;

      // Ajouter les catégories si disponibles
      if (report.data?.categories?.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(validateColor(colors.navy, '#010b40'));
        doc.text('Catégories de Cours:', 14, finalY);
        finalY += 8;

        doc.autoTable({
          startY: finalY,
          head: [['Catégorie']],
          body: report.data.categories.map((cat) => [cat]),
          theme: 'striped',
          headStyles: {
            fillColor: validateColor(colors.fuschia, '#f13544'),
            textColor: validateColor(colors.white, '#ffffff'),
            fontSize: 11,
          },
          bodyStyles: { 
            textColor: validateColor(colors.navy, '#010b40'), 
            fontSize: 10 
          },
          styles: {
            cellPadding: 3,
          },
        });
        finalY = doc.autoTable.previous.finalY + 10;
      }

      // Ajouter les activités récentes si disponibles
      if (report.data?.recentActivities?.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(validateColor(colors.navy, '#010b40'));
        doc.text('Activités Récentes:', 14, finalY);
        finalY += 8;

        const activitiesData = report.data.recentActivities.slice(0, 5).map(activity => [
          activity.description.length > 80 
            ? activity.description.substring(0, 80) + '...' 
            : activity.description,
          formatDate(activity.date)
        ]);

        doc.autoTable({
          startY: finalY,
          head: [['Activité', 'Date']],
          body: activitiesData,
          theme: 'striped',
          headStyles: {
            fillColor: validateColor(colors.lightNavy, '#1a237e'),
            textColor: validateColor(colors.white, '#ffffff'),
            fontSize: 11,
          },
          bodyStyles: { 
            textColor: validateColor(colors.navy, '#010b40'), 
            fontSize: 9 
          },
          columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 40 }
          },
          styles: {
            cellPadding: 2,
            overflow: 'linebreak',
          },
        });
      }

      // Pied de page sur toutes les pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${i} de ${pageCount}`, 
          doc.internal.pageSize.width - 20, 
          doc.internal.pageSize.height - 10
        );
        doc.text(
          '© 2025 Plateforme Éducative - Document confidentiel', 
          14, 
          doc.internal.pageSize.height - 10
        );
      }

      // Téléchargement
      const fileName = `rapport-${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      setSuccess('Rapport téléchargé avec succès');
      setSnackbarOpen(true);
      console.log('PDF généré et téléchargé avec succès');

    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError(err.message || 'Erreur lors de la génération du rapport PDF');
      setSnackbarOpen(true);
    }
  };

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrateurs',
      'instructor': 'Instructeurs',
      'student': 'Étudiants',
      'etudiant': 'Étudiants',
      'enseignant': 'Enseignants'
    };
    return roleMap[role.toLowerCase()] || role;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Date invalide';
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setError('');
    setSuccess('');
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${validateColor(colors.navy, '#010b40')}, ${validateColor(colors.lightNavy, '#1a237e')})`,
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: validateColor(colors.fuschia, '#f13544'),
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 2, 
            color: validateColor(colors.white, '#ffffff'),
            fontWeight: 600 
          }}
        >
          Chargement des rapports...
        </Typography>
      </Box>
    );
  }

  return (
    <ReportsContainer>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(validateColor(colors.fuschia, '#f13544'), 0.1)} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${alpha(validateColor(colors.lightFuschia, '#ff6b74'), 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth={false} disableGutters>
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <Box
              sx={{
                p: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: validateColor(colors.white, '#ffffff'),
                    mb: 1,
                    fontSize: { xs: '1.5rem', md: '2.5rem' },
                    background: `linear-gradient(135deg, ${validateColor(colors.white, '#ffffff')}, ${alpha(validateColor(colors.white, '#ffffff'), 0.8)})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Rapports Administrateur
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha(validateColor(colors.white, '#ffffff'), 0.7),
                    fontWeight: 500,
                  }}
                >
                  Analysez les statistiques globales de la plateforme
                </Typography>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ p: 4, pb: 0 }}>
              {[
                {
                  label: 'Total Utilisateurs',
                  value: stats.totalUsers,
                  icon: <People />,
                  color: validateColor(colors.fuschia, '#f13544'),
                },
                {
                  label: 'Total Cours',
                  value: stats.totalCourses,
                  icon: <School />,
                  color: '#10b981',
                },
                {
                  label: 'Taux Complétion',
                  value: `${stats.completionRate.toFixed(1)}%`,
                  icon: <CheckCircle />,
                  color: '#f59e0b',
                },
                {
                  label: 'Administrateurs',
                  value: stats.usersByRole.admin || 0,
                  icon: <People />,
                  color: '#3b82f6',
                },
                {
                  label: 'Instructeurs',
                  value: stats.usersByRole.instructor || 0,
                  icon: <People />,
                  color: '#8b5cf6',
                },
                {
                  label: 'Étudiants',
                  value: stats.usersByRole.student || 0,
                  icon: <People />,
                  color: '#ef4444',
                },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={2} key={index}>
                  <StatsCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stat.color, 0.2),
                          width: 56,
                          height: 56,
                          border: `2px solid ${stat.color}`,
                          animation: `${floatingAnimation} 3s ease-in-out infinite`,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { color: stat.color, fontSize: 28 },
                        })}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            color: validateColor(colors.white, '#ffffff'), 
                            fontWeight: 800,
                            fontSize: { xs: '1.5rem', md: '1.75rem' }
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ 
                            color: alpha(validateColor(colors.white, '#ffffff'), 0.7),
                            fontWeight: 500 
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </StatsCard>
                </Grid>
              ))}
            </Grid>

            {/* Alerts */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={success ? 'success' : 'error'}
                sx={{ 
                  boxShadow: 3,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                {success || error}
              </Alert>
            </Snackbar>

            {/* Search */}
            <Box sx={{ p: 4, pt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Rechercher par titre ou type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  flex: 1,
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    color: validateColor(colors.white, '#ffffff'),
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: alpha(validateColor(colors.fuschia, '#f13544'), 0.3),
                    },
                    '&:hover fieldset': { 
                      borderColor: validateColor(colors.fuschia, '#f13544') 
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: validateColor(colors.fuschia, '#f13544'),
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: alpha(validateColor(colors.white, '#ffffff'), 0.7),
                  },
                }}
              />
            </Box>

            {/* Reports Table */}
            <ReportsCard>
              <TableContainer sx={{ borderRadius: 2, maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: alpha(validateColor(colors.fuschia, '#f13544'), 0.1),
                      '& th': {
                        borderBottom: `2px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.3)}`,
                      }
                    }}>
                      <StyledTableCell>Titre</StyledTableCell>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Total Utilisateurs</StyledTableCell>
                      <StyledTableCell>Total Cours</StyledTableCell>
                      <StyledTableCell>Taux Complétion</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                      filteredReports
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((report, index) => (
                          <StyledTableRow 
                            key={report.id}
                            sx={{
                              animation: `${fadeInUp} 0.5s ease-out`,
                              animationDelay: `${index * 0.1}s`,
                              animationFillMode: 'both'
                            }}
                          >
                            <StyledTableCell>
                              <Typography sx={{ fontWeight: 600 }}>
                                {report.title || 'N/A'}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip 
                                label={report.type || 'N/A'} 
                                size="small"
                                sx={{
                                  bgcolor: alpha(validateColor(colors.fuschia, '#f13544'), 0.2),
                                  color: validateColor(colors.fuschia, '#f13544'),
                                  fontWeight: 600,
                                }}
                              />
                            </StyledTableCell>
                            <StyledTableCell>{formatDate(report.date)}</StyledTableCell>
                            <StyledTableCell>{report.totalUsers || 0}</StyledTableCell>
                            <StyledTableCell>{report.totalCourses || 0}</StyledTableCell>
                            <StyledTableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle sx={{ 
                                  color: report.completionRate >= 50 ? '#10b981' : '#f59e0b', 
                                  fontSize: 18 
                                }} />
                                {report.completionRate || 0}%
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Voir détails" arrow>
                                  <ActionButton
                                    onClick={() => handleViewReport(report)}
                                    sx={{
                                      bgcolor: alpha('#3b82f6', 0.2),
                                      '&:hover': { bgcolor: alpha('#3b82f6', 0.3) },
                                    }}
                                  >
                                    <Visibility fontSize="small" />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title="Télécharger PDF" arrow>
                                  <ActionButton
                                    onClick={() => handleDownload(report.id)}
                                    sx={{
                                      bgcolor: alpha('#10b981', 0.2),
                                      '&:hover': { bgcolor: alpha('#10b981', 0.3) },
                                    }}
                                  >
                                    <Download fontSize="small" />
                                  </ActionButton>
                                </Tooltip>
                              </Box>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={7} align="center">
                          <Box sx={{ py: 8 }}>
                            <Typography
                              variant="h6"
                              sx={{ 
                                color: alpha(validateColor(colors.white, '#ffffff'), 0.5),
                                mb: 1
                              }}
                            >
                              Aucun rapport trouvé
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ 
                                color: alpha(validateColor(colors.white, '#ffffff'), 0.3),
                              }}
                            >
                              Essayez de modifier vos termes de recherche
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              {filteredReports.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredReports.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                  }
                  sx={{
                    color: validateColor(colors.white, '#ffffff'),
                    '& .MuiTablePagination-select': { 
                      color: validateColor(colors.white, '#ffffff') 
                    },
                    '& .MuiTablePagination-selectIcon': {
                      color: validateColor(colors.white, '#ffffff'),
                    },
                    '& .MuiTablePagination-actions button': {
                      color: validateColor(colors.white, '#ffffff'),
                    },
                    '& .MuiTablePagination-selectLabel': {
                      color: alpha(validateColor(colors.white, '#ffffff'), 0.7),
                    },
                    '& .MuiTablePagination-displayedRows': {
                      color: alpha(validateColor(colors.white, '#ffffff'), 0.7),
                    },
                  }}
                />
              )}
            </ReportsCard>
          </Box>
        </Fade>
      </Container>

      {/* Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(validateColor(colors.navy, '#010b40'), 0.98)}, ${alpha(validateColor(colors.lightNavy, '#1a237e'), 0.98)})`,
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.3)}`,
            boxShadow: `0 25px 50px ${alpha('#000', 0.5)}`,
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            color: validateColor(colors.white, '#ffffff'), 
            fontWeight: 700,
            fontSize: '1.5rem',
            borderBottom: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.2)}`,
            pb: 2
          }}
        >
          📊 Détails du Rapport
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {selectedReport && (
            <Box sx={{ color: validateColor(colors.white, '#ffffff') }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {selectedReport.title}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: validateColor(colors.fuschia, '#f13544') }}>
                    Informations Générales
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={500}>Type:</Typography>
                      <Chip
                        label={selectedReport.type}
                        size="small"
                        sx={{
                          bgcolor: alpha(validateColor(colors.fuschia, '#f13544'), 0.2),
                          color: validateColor(colors.fuschia, '#f13544'),
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={500}>Date:</Typography>
                      <Typography>{formatDate(selectedReport.date)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={500}>Total Utilisateurs:</Typography>
                      <Typography fontWeight={600}>{selectedReport.totalUsers}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={500}>Total Cours:</Typography>
                      <Typography fontWeight={600}>{selectedReport.totalCourses}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={500}>Taux Complétion:</Typography>
                      <Typography 
                        fontWeight={600}
                        sx={{ 
                          color: selectedReport.completionRate >= 50 ? '#10b981' : '#f59e0b' 
                        }}
                      >
                        {selectedReport.completionRate}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: validateColor(colors.fuschia, '#f13544') }}>
                    Détails Supplémentaires
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={500}>Inscriptions Totales:</Typography>
                      <Typography fontWeight={600}>
                        {selectedReport.data?.totalEnrollments || 0}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography fontWeight={500} sx={{ mb: 1 }}>Utilisateurs par rôle:</Typography>
                      {selectedReport.usersByRole && Object.entries(selectedReport.usersByRole).map(([role, count]) => (
                        <Box key={role} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            • {getRoleDisplayName(role)}:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Catégories */}
                {selectedReport.data?.categories?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: validateColor(colors.fuschia, '#f13544') }}>
                      Catégories de Cours ({selectedReport.data.categories.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedReport.data.categories.map((cat, index) => (
                        <Chip
                          key={index}
                          label={cat}
                          size="small"
                          sx={{
                            bgcolor: alpha(validateColor(colors.lightNavy, '#1a237e'), 0.5),
                            color: validateColor(colors.white, '#ffffff'),
                            border: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.3)}`,
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Activités récentes */}
                {selectedReport.data?.recentActivities?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: validateColor(colors.fuschia, '#f13544') }}>
                      Activités Récentes
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {selectedReport.data.recentActivities.slice(0, 5).map((activity, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 1.5, 
                            mb: 1, 
                            borderRadius: 2,
                            bgcolor: alpha(validateColor(colors.navy, '#010b40'), 0.5),
                            border: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.1)}`,
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(validateColor(colors.white, '#ffffff'), 0.5) }}>
                            {formatDate(activity.date)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => selectedReport && handleDownload(selectedReport.id)}
            variant="contained"
            startIcon={<Download />}
            sx={{
              background: `linear-gradient(135deg, ${validateColor(colors.fuschia, '#f13544')}, ${validateColor(colors.lightFuschia, '#ff6b74')})`,
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(validateColor(colors.fuschia, '#f13544'), 0.4)}`,
              },
            }}
          >
            Télécharger PDF
          </Button>
          <Button
            onClick={() => setDetailsModalOpen(false)}
            sx={{ 
              color: alpha(validateColor(colors.white, '#ffffff'), 0.7),
              fontWeight: 500,
              '&:hover': {
                color: validateColor(colors.white, '#ffffff'),
                bgcolor: alpha(validateColor(colors.fuschia, '#f13544'), 0.1),
              }
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </ReportsContainer>
  );
};

export default Reports;