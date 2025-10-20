// Frontend: src/components/CourseList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import CourseCard from './CourseCard';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';
import { colors } from '../utils/colors';
import { useTheme } from '@mui/material/styles';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

// Styled Components
const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: `${colors.navy || '#010b40'}33`,
    color: '#ffffff',
    borderRadius: '12px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${colors.fuschia || '#f13544'}4d`,
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '8px 16px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${colors.fuschia || '#f13544'}4d`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '6px 12px',
    fontSize: '0.85rem',
  },
}));

const CourseList = ({ domain }) => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(domain || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const coursesPerPage = 9;

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch domains
      const domainsResponse = await axios.get(`${API_BASE_URL}/domaine`);
      setDomains([
        { _id: 'all', nom: 'Tous les domaines' },
        ...(Array.isArray(domainsResponse.data) ? domainsResponse.data : domainsResponse.data.data || []),
      ]);

      // Fetch courses
      const params = {
        domaineId: selectedDomain !== 'all' ? selectedDomain : undefined,
        level: levelFilter !== 'all' ? levelFilter : undefined,
        search: searchQuery || undefined,
        page,
        limit: coursesPerPage,
      };
      const coursesResponse = await axios.get(`${API_BASE_URL}/courses/public`, { params }); // Changed to /public for anonymous access
      const coursesData = Array.isArray(coursesResponse.data)
        ? coursesResponse.data
        : coursesResponse.data.courses || coursesResponse.data.data || [];
      setCourses(coursesData);
      setTotalPages(Math.ceil((coursesResponse.data.total || coursesData.length || 0) / coursesPerPage));
    } catch (err) {
      console.error('Erreur chargement données:', err);
      const errorMessage =
        err.response?.status === 404
          ? 'Cours ou domaines introuvables. Vérifiez la configuration du serveur.'
          : err.code === 'ERR_NETWORK'
          ? 'Serveur indisponible. Vérifiez si le backend est démarré.'
          : err.response?.data?.message || 'Erreur lors du chargement des cours';
      setError(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, levelFilter, searchQuery, page]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDomainChange = useCallback((e) => {
    setSelectedDomain(e.target.value);
    setPage(1);
  }, []);

  const handleLevelChange = useCallback((e) => {
    setLevelFilter(e.target.value);
    setPage(1);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        bgcolor: colors.navy || '#010b40',
        overflow: 'auto',
        pt: { xs: 6, md: 8 },
        pb: { xs: 8, md: 12 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${colors.fuschia || '#f13544'}1a 1px, transparent 1px), linear-gradient(90deg, ${colors.fuschia || '#f13544'}1a 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 80,
          right: 40,
          width: 128,
          height: 128,
          background: `linear-gradient(to right, ${colors.fuschia || '#f13544'}, ${colors.lightFuschia || '#ff6b74'})`,
          borderRadius: '50%',
          opacity: 0.1,
          animation: `${floatingAnimation} 3s ease-in-out infinite`,
          [theme.breakpoints.down('sm')]: {
            width: 80,
            height: 80,
            bottom: 40,
            right: 20,
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 100,
          left: 50,
          width: 80,
          height: 80,
          background: `linear-gradient(to right, ${colors.lightFuschia || '#ff6b74'}, ${colors.fuschia || '#f13544'})`,
          borderRadius: '50%',
          opacity: 0.1,
          animation: `${floatingAnimation} 4s ease-in-out infinite`,
          [theme.breakpoints.down('sm')]: {
            width: 60,
            height: 60,
            top: 60,
            left: 20,
          },
        }}
      />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Fade in timeout={1000}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                mb: { xs: 3, md: 4 },
              }}
            >
              Catalogue de Cours
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: { xs: 3, md: 4 }, justifyContent: 'center', alignItems: 'center' }}
            >
              <FormControl sx={{ minWidth: { xs: '100%', sm: 200 }, maxWidth: { xs: '100%', sm: 250 } }}>
                <InputLabel sx={{ color: '#ffffff' }}>Domaine</InputLabel>
                <Select
                  value={selectedDomain}
                  onChange={handleDomainChange}
                  sx={{
                    color: '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}4d`,
                    '& .MuiSvgIcon-root': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: `${colors.fuschia || '#f13544'}4d` },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuschia || '#f13544' },
                  }}
                >
                  {domains.map((domain) => (
                    <MenuItem key={domain._id} value={domain._id}>
                      {domain.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 200 }, maxWidth: { xs: '100%', sm: 250 } }}>
                <InputLabel sx={{ color: '#ffffff' }}>Niveau</InputLabel>
                <Select
                  value={levelFilter}
                  onChange={handleLevelChange}
                  sx={{
                    color: '#ffffff',
                    borderColor: `${colors.fuschia || '#f13544'}4d`,
                    '& .MuiSvgIcon-root': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: `${colors.fuschia || '#f13544'}4d` },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.fuschia || '#f13544' },
                  }}
                >
                  <MenuItem value="all">Tous les niveaux</MenuItem>
                  <MenuItem value="ALFA">Niveau ALFA</MenuItem>
                  <MenuItem value="BETA">Niveau BETA</MenuItem>
                </Select>
              </FormControl>
              <SearchField
                label="Rechercher un cours"
                variant="outlined"
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <Search size={20} color={colors.fuschia || '#f13544'} style={{ marginRight: 8 }} />
                  ),
                }}
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Stack>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '50vh',
                }}
              >
                <CircularProgress sx={{ color: colors.fuschia || '#f13544' }} size={60} />
                <Typography sx={{ color: '#ffffff', ml: 2, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                  Chargement des cours...
                </Typography>
              </Box>
            ) : courses.length === 0 ? (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '1rem', sm: '1.2rem' },
                  textAlign: 'center',
                  mt: 4,
                }}
              >
                Aucun cours disponible pour ces critères.
              </Typography>
            ) : (
              <>
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
                  {courses.map((course, index) => (
                    <Grid item key={course._id} xs={12} sm={6} md={4} lg={3}>
                      <Fade in timeout={1000 + index * 200}>
                        <CourseCard course={course} />
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
                <Stack direction="row" spacing={1} sx={{ mt: 4, justifyContent: 'center' }}>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <StyledButton
                      key={index + 1}
                      variant={page === index + 1 ? 'contained' : 'outlined'}
                      sx={{
                        borderColor: page === index + 1 ? 'transparent' : `${colors.fuschia || '#f13544'}4d`,
                        minWidth: { xs: '36px', sm: '40px' },
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                      }}
                      onClick={() => handlePageChange(index + 1)}
                      aria-label={`Aller à la page ${index + 1}`}
                    >
                      {index + 1}
                    </StyledButton>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Fade>
      </Container>

      {/* Snackbar for Error Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ boxShadow: 3, bgcolor: `${colors.fuschia || '#f13544'}1a`, color: colors.fuschia || '#f13544' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(CourseList);