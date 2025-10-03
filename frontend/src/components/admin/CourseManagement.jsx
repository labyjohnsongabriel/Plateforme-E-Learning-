
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Grid, Button, TextField } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import SelectInput from '../../components/SelectInput';
import { colors } from '../../utils/colors';

const CourseCard = ({ course, onDelete }) => (
  <Card sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{course.title}</Typography>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: course.status === 'active' ? 'green.100' : 'yellow.100',
          color: course.status === 'active' ? 'green.800' : 'yellow.800',
          fontSize: '0.75rem',
        }}
      >
        {course.status === 'active' ? 'Actif' : 'Brouillon'}
      </Box>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, color: 'text.secondary' }}>
      <Typography variant="body2">Instructeur: {course.instructor}</Typography>
      <Typography variant="body2">Inscrits: {course.enrolled}</Typography>
    </Box>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="contained" color="primary" startIcon={<Edit />}>
        Modifier
      </Button>
      <Button variant="outlined" startIcon={<Visibility />}>
        Voir
      </Button>
      <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => onDelete(course.id)}>
        Supprimer
      </Button>
    </Box>
  </Card>
);

const CourseManagement = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setCourses(response.data);
      } catch (err) {
        addNotification('Erreur lors du chargement des cours', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user, addNotification]);

  const handleDelete = async (courseId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCourses(courses.filter(c => c.id !== courseId));
      addNotification('Cours supprimé avec succès', 'success');
    } catch (err) {
      addNotification('Erreur lors de la suppression du cours', 'error');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'inactive', label: 'Inactif' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Gestion des Cours
        </Typography>
        <Button variant="contained" color="primary" startIcon={<Plus />}>
          Nouveau Cours
        </Button>
      </Box>
      <Card sx={{ p: 2, mb: 3, bgcolor: colors.globalGradientLight }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <TextField
              fullWidth
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ '& .MuiInputBase-root': { pl: 5 } }}
            />
          </Box>
          <SelectInput
            label="Statut"
            values={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Card>
      <Grid container spacing={3}>
        {loading ? (
          <Typography sx={{ p: 2 }}>Chargement...</Typography>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <CourseCard course={course} onDelete={handleDelete} />
            </Grid>
          ))
        ) : (
          <Typography sx={{ p: 2 }}>Aucun cours trouvé</Typography>
        )}
      </Grid>
    </Box>
  );
};

export default CourseManagement;
