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

// Animations (cohérentes avec Courses.jsx)
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

// Fonction utilitaire pour valider les couleurs
const validateColor = (color, fallback) => {
  if (typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return color;
  }
  return fallback;
};

// Styled Components (alignés sur Courses.jsx)
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
    usersByRole: {},
  });

  // Vérification admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role?.toLowerCase() !== 'admin') {
      setError('Accès réservé aux administrateurs');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/unauthorized'), 2000);
    }
  }, [user, authLoading, navigate]);

  // Chargement des rapports et stats globales
  useEffect(() => {
    const fetchReportsAndStats = async () => {
      setIsLoading(true);
      try {
        const globalResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/stats/global`,
          {
            headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` },
          }
        );
        const globalData = globalResponse.data || {};

        const reportsData = Array.isArray(globalData.reports) ? globalData.reports : [globalData];
        const normalizedReports = reportsData.map((report, index) => ({
          id: report.id || `report-${index}`,
          title: report.title || `Rapport ${index + 1}`,
          type: report.type || 'Global',
          date: report.date || new Date().toISOString(),
          data: report.data || {},
          totalUsers: report.totalUsers || 0,
          usersByRole: report.usersByRole || { admin: 0, instructor: 0, student: 0 },
          totalCourses: report.totalCourses || 0,
          completionRate: report.completionRate || 0,
        }));
        setReports(normalizedReports);
        setFilteredReports(normalizedReports);

        const aggregatedStats = {
          totalUsers:
            globalData.totalUsers || normalizedReports.reduce((sum, r) => sum + r.totalUsers, 0),
          totalCourses:
            globalData.totalCourses ||
            normalizedReports.reduce((sum, r) => sum + r.totalCourses, 0),
          completionRate:
            globalData.completionRate ||
            (normalizedReports.length
              ? normalizedReports.reduce((sum, r) => sum + r.completionRate, 0) /
                normalizedReports.length
              : 0),
          usersByRole: globalData.usersByRole ||
            normalizedReports[0]?.usersByRole || { admin: 0, instructor: 0, student: 0 },
        };
        setStats(aggregatedStats);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
        setSnackbarOpen(true);
        const fallbackStats = {
          totalUsers: 0,
          totalCourses: 0,
          completionRate: 0,
          usersByRole: { admin: 0, instructor: 0, student: 0 },
        };
        setStats(fallbackStats);
        setReports([
          {
            id: 'fallback-1',
            title: 'Rapport Indisponible',
            type: 'Erreur',
            date: new Date().toISOString(),
            data: { note: 'Données indisponibles' },
            totalUsers: 0,
            usersByRole: fallbackStats.usersByRole,
            totalCourses: 0,
            completionRate: 0,
          },
        ]);
        setFilteredReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role?.toLowerCase() === 'admin') {
      fetchReportsAndStats();
    }
  }, [user]);

  // Filtrage
  useEffect(() => {
    let filtered = [...reports];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) || r.type.toLowerCase().includes(searchLower)
      );
    }
    setFilteredReports(filtered);
    setPage(0);
  }, [search, reports]);

  // Vue détails
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setDetailsModalOpen(true);
  };

  // Téléchargement professionnel avec jsPDF et AutoTable
  const handleDownload = (reportId) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) throw new Error('Rapport non trouvé');

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Rapport Administratif - Plateforme', 14, 15);
      doc.setLineWidth(0.5);
      doc.line(14, 20, 196, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Rapport: ${report.title}`, 14, 30);
      doc.text(`Type: ${report.type}`, 14, 40);
      doc.text(`Date: ${formatDate(report.date)}`, 14, 50);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 60);

      const tableData = [
        ['Statistique', 'Valeur'],
        ['Total Utilisateurs', report.totalUsers],
        ['Total Cours', report.totalCourses],
        ['Taux Complétion', `${report.completionRate}%`],
      ];
      Object.entries(report.usersByRole).forEach(([role, count]) => {
        tableData.push([`Utilisateurs ${role}`, count]);
      });
      doc.autoTable({
        startY: 70,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: validateColor(colors.navy, '#010b40'),
          textColor: validateColor(colors.white, '#ffffff'),
          fontSize: 12,
        },
        bodyStyles: { textColor: validateColor(colors.navy, '#010b40'), fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 30 },
      });

      if (report.data && Object.keys(report.data).length > 0) {
        doc.text('Données Supplémentaires:', 14, doc.autoTable.previous.finalY + 10);
        doc.setFontSize(10);
        doc.text(JSON.stringify(report.data, null, 2), 14, doc.autoTable.previous.finalY + 20);
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Page ${i} de ${pageCount}`, 180, 287);
        doc.text('© 2025 Plateforme Éducative', 14, 287);
      }

      doc.save(`rapport-${report.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      setSuccess('Rapport téléchargé avec succès');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Erreur lors du téléchargement');
      setSnackbarOpen(true);
    }
  };

  // Format date
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${validateColor(colors.navy, '#010b40')}, ${validateColor(colors.lightNavy, '#1a237e')})`,
        }}
      >
        <CircularProgress
          sx={{
            color: validateColor(colors.fuschia, '#f13544'),
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        />
        <Typography sx={{ ml: 2, color: validateColor(colors.white, '#ffffff') }}>
          Chargement...
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
                  variant='h3'
                  sx={{
                    fontWeight: 800,
                    color: validateColor(colors.white, '#ffffff'),
                    mb: 1,
                    fontSize: { xs: '1.5rem', md: '2.5rem' },
                  }}
                >
                  Rapports Administrateur
                </Typography>
                <Typography
                  variant='body1'
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
                  label: 'Admins',
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
                          bgcolor: alpha(
                            stat.color || validateColor(colors.fuschia, '#f13544'),
                            0.2
                          ),
                          width: 56,
                          height: 56,
                          border: `2px solid ${stat.color || validateColor(colors.fuschia, '#f13544')}`,
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: {
                            color: stat.color || validateColor(colors.fuschia, '#f13544'),
                            fontSize: 28,
                          },
                        })}
                      </Avatar>
                      <Box>
                        <Typography
                          variant='h4'
                          sx={{ color: validateColor(colors.white, '#ffffff'), fontWeight: 800 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ color: alpha(validateColor(colors.white, '#ffffff'), 0.7) }}
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
              autoHideDuration={4000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity={success ? 'success' : 'error'}
                sx={{ boxShadow: 3 }}
              >
                {success || error}
              </Alert>
            </Snackbar>

            {/* Recherche */}
            <Box sx={{ p: 4, pt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder='Rechercher par titre ou type...'
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
                    '&:hover fieldset': { borderColor: validateColor(colors.fuschia, '#f13544') },
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

            {/* Tableau des Rapports */}
            <ReportsCard>
              <TableContainer sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{ bgcolor: alpha(validateColor(colors.fuschia, '#f13544'), 0.1) }}
                    >
                      <StyledTableCell>Titre</StyledTableCell>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Total Utilisateurs</StyledTableCell>
                      <StyledTableCell>Total Cours</StyledTableCell>
                      <StyledTableCell>Taux Complétion</StyledTableCell>
                      <StyledTableCell align='center'>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                      filteredReports
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((report) => (
                          <StyledTableRow key={report.id}>
                            <StyledTableCell>{report.title || 'N/A'}</StyledTableCell>
                            <StyledTableCell>{report.type || 'N/A'}</StyledTableCell>
                            <StyledTableCell>{formatDate(report.date)}</StyledTableCell>
                            <StyledTableCell>{report.totalUsers || 0}</StyledTableCell>
                            <StyledTableCell>{report.totalCourses || 0}</StyledTableCell>
                            <StyledTableCell>{report.completionRate || 0}%</StyledTableCell>
                            <StyledTableCell align='center'>
                              <Tooltip title='Voir détails' arrow>
                                <ActionButton
                                  onClick={() => handleViewReport(report)}
                                  sx={{
                                    bgcolor: alpha('#3b82f6', 0.2),
                                    '&:hover': { bgcolor: alpha('#3b82f6', 0.3) },
                                  }}
                                >
                                  <Visibility fontSize='small' />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title='Télécharger' arrow>
                                <ActionButton
                                  onClick={() => handleDownload(report.id)}
                                  sx={{
                                    bgcolor: alpha('#10b981', 0.2),
                                    '&:hover': { bgcolor: alpha('#10b981', 0.3) },
                                  }}
                                >
                                  <Download fontSize='small' />
                                </ActionButton>
                              </Tooltip>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={7} align='center'>
                          <Box sx={{ py: 8 }}>
                            <Typography
                              variant='h6'
                              sx={{ color: alpha(validateColor(colors.white, '#ffffff'), 0.5) }}
                            >
                              Aucun rapport trouvé
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component='div'
                count={filteredReports.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage='Lignes par page'
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                sx={{
                  color: validateColor(colors.white, '#ffffff'),
                  '& .MuiTablePagination-select': { color: validateColor(colors.white, '#ffffff') },
                  '& .MuiTablePagination-selectIcon': {
                    color: validateColor(colors.white, '#ffffff'),
                  },
                  '& .MuiTablePagination-actions button': {
                    color: validateColor(colors.white, '#ffffff'),
                  },
                }}
              />
            </ReportsCard>
          </Box>
        </Fade>
      </Container>

      {/* Modale Détails */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(validateColor(colors.navy, '#010b40'), 0.98)}, ${alpha(validateColor(colors.lightNavy, '#1a237e'), 0.98)})`,
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(validateColor(colors.fuschia, '#f13544'), 0.3)}`,
          },
        }}
      >
        <DialogTitle sx={{ color: validateColor(colors.white, '#ffffff'), fontWeight: 700 }}>
          Détails du Rapport
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ color: validateColor(colors.white, '#ffffff') }}>
              <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
                {selectedReport.title}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    Type:{' '}
                    <Chip
                      label={selectedReport.type}
                      sx={{
                        bgcolor: alpha(validateColor(colors.fuschia, '#f13544'), 0.2),
                        color: validateColor(colors.fuschia, '#f13544'),
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Date: {formatDate(selectedReport.date)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Total Utilisateurs: {selectedReport.totalUsers}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Total Cours: {selectedReport.totalCourses}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Taux Complétion: {selectedReport.completionRate}%</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Utilisateurs par rôle:</Typography>
                  {Object.entries(selectedReport.usersByRole).map(([role, count]) => (
                    <Typography key={role}>
                      - {role}: {count}
                    </Typography>
                  ))}
                </Grid>
                {selectedReport.data && Object.keys(selectedReport.data).length > 0 && (
                  <Grid item xs={12}>
                    <Typography>
                      Données supplémentaires:{' '}
                      <pre>{JSON.stringify(selectedReport.data, null, 2)}</pre>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDetailsModalOpen(false)}
            sx={{ color: alpha(validateColor(colors.white, '#ffffff'), 0.7) }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </ReportsContainer>
  );
};

export default Reports;
