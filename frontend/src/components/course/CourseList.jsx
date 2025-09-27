// CourseList.jsx - Liste de cours professionnelle avec fond global gradient
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { Search } from 'lucide-react';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000/api';

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
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
const SearchField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: `${colors.navy}33`,
    color: '#ffffff',
    borderRadius: '12px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${colors.red}4d`,
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
});

const CourseList = ({ domain }) => {
  const [courses, setCourses] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(domain || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const coursesPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer les domaines
        const domainsResponse = await axios.get(`${API_BASE_URL}/domaine`);
        setDomains([{ id: 'all', nom: 'Tous les domaines' }, ...domainsResponse.data]);

        // Récupérer les cours avec filtres
        const params = {
          domaineId: selectedDomain !== 'all' ? selectedDomain : undefined,
          level: levelFilter !== 'all' ? levelFilter : undefined,
          search: searchQuery || undefined,
          page,
          limit: coursesPerPage,
        };
        const coursesResponse = await axios.get(`${API_BASE_URL}/courses`, { params });
        setCourses(coursesResponse.data.courses || []);
        setTotalPages(Math.ceil(coursesResponse.data.total / coursesPerPage));
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDomain, levelFilter, searchQuery, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Réinitialiser la pagination lors d'une nouvelle recherche
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        overflow: 'hidden',
        pt: 8,
        pb: 12,
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.red}1a 1px, transparent 1px),
            linear-gradient(90deg, ${colors.red}1a 1px, transparent 1px)
          `,
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
          background: `linear-gradient(to right, ${colors.red}, ${colors.pink})`,
          borderRadius: '50%',
          opacity: 0.1,
          animation: `${floatingAnimation} 3s ease-in-out infinite`,
        }}
      />

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Fade in timeout={1000}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                mb: 4,
              }}
            >
              Catalogue de Cours
            </Typography>

            {/* Filtres et recherche */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: '#ffffff' }}>Domaine</InputLabel>
                <Select
                  value={selectedDomain}
                  onChange={(e) => {
                    setSelectedDomain(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    color: '#ffffff',
                    borderColor: `${colors.red}4d`,
                    '& .MuiSvgIcon-root': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: `${colors.red}4d`,
                    },
                  }}
                >
                  {domains.map((domain) => (
                    <MenuItem key={domain.id} value={domain.id}>
                      {domain.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: '#ffffff' }}>Niveau</InputLabel>
                <Select
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    color: '#ffffff',
                    borderColor: `${colors.red}4d`,
                    '& .MuiSvgIcon-root': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: `${colors.red}4d`,
                    },
                  }}
                >
                  <MenuItem value="all">Tous les niveaux</MenuItem>
                  <MenuItem value="ALFA">Niveau ALFA</MenuItem>
                  <MenuItem value="BÊTA">Niveau BÊTA</MenuItem>
                </Select>
              </FormControl>

              <SearchField
                label="Rechercher un cours"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <Search size={20} color={colors.red} style={{ marginRight: 8 }} />,
                }}
                sx={{ maxWidth: 300 }}
              />
            </Stack>

            {/* Gestion des erreurs */}
            {error && (
              <Typography
                sx={{
                  color: colors.red,
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  mb: 4,
                }}
              >
                {error}
              </Typography>
            )}

            {/* Liste des cours */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress sx={{ color: colors.red }} />
              </Box>
            ) : courses.length === 0 ? (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  mt: 4,
                }}
              >
                Aucun cours disponible pour ce domaine.
              </Typography>
            ) : (
              <>
                <Grid container spacing={4} justifyContent="center">
                  {courses.map((course, index) => (
                    <Grid item key={course.id} xs={12} sm={6} md={4}>
                      <Fade in timeout={1000 + index * 200}>
                        <CourseCard course={course} />
                      </Fade>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Button
                      key={index + 1}
                      variant={page === index + 1 ? 'contained' : 'outlined'}
                      sx={{
                        background:
                          page === index + 1
                            ? `linear-gradient(135deg, ${colors.red}, ${colors.pink})`
                            : 'transparent',
                        borderColor: `${colors.red}4d`,
                        color: '#ffffff',
                        borderRadius: '12px',
                        minWidth: '40px',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${colors.pink}, ${colors.red})`,
                        },
                      }}
                      onClick={() => handlePageChange(index + 1)}
                      aria-label={`Page ${index + 1}`}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

// Optimisation avec React.memo
export default React.memo(CourseList);