import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, List, ListItem, ListItemText, IconButton, TextField, MenuItem } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import SelectInput from '../../components/SelectInput';
import { colors } from '../../utils/colors';
import { Search } from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(response.data);
      } catch (err) {
        addNotification('Erreur lors du chargement des utilisateurs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, addNotification]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(users.filter(u => u.id !== userId));
      addNotification('Utilisateur supprimé avec succès', 'success');
    } catch (err) {
      addNotification('Erreur lors de la suppression de l’utilisateur', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'student', label: 'Étudiant' },
    { value: 'instructor', label: 'Instructeur' },
    { value: 'admin', label: 'Administrateur' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Gestion des Utilisateurs
      </Typography>
      <Card sx={{ p: 2, mb: 3, bgcolor: colors.globalGradientLight }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <TextField
              fullWidth
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ '& .MuiInputBase-root': { pl: 5 } }}
            />
          </Box>
          <SelectInput
            label="Rôle"
            values={roleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Card>
      <Card sx={{ bgcolor: colors.globalGradientLight }}>
        <List>
          {loading ? (
            <Typography sx={{ p: 2 }}>Chargement...</Typography>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <ListItem
                key={user.id}
                sx={{ bgcolor: '#ffffff', mb: 1, borderRadius: 1, '&:hover': { bgcolor: `${colors.navy}0a` } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: colors.navy,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Typography>{user.prenom[0]}{user.nom[0]}</Typography>
                  </Box>
                  <ListItemText
                    primary={`${user.prenom} ${user.nom}`}
                    secondary={`Email: ${user.email} | Rôle: ${user.role} | Dernière connexion: ${user.lastLogin}`}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton color="primary">
                    <Visibility />
                  </IconButton>
                  <IconButton color="success">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(user.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Aucun utilisateur trouvé" />
            </ListItem>
          )}
        </List>
      </Card>
    </Box>
  );
};

export default UserManagement;
