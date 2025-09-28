import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Badge } from '@mui/material';
import { Menu as MenuIcon, Mail as MailIcon, Settings as SettingsIcon, Shield as ShieldIcon } from '@mui/icons-material';
import { Users, BookOpen, BarChart3, Settings } from 'lucide-react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import StatisticsPanel from './StatisticsPanel';
import SystemSettings from './SystemSettings';
import { colors } from '../../utils/colors';

const Sidebar = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 240,
    backgroundColor: '#ffffff',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  marginLeft: 240,
  padding: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
  },
}));

const Header = styled(AppBar)(({ theme }) => ({
  marginLeft: 240,
  background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
  },
}));

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading: authLoading, logout } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      addNotification('Veuillez vous connecter.', 'error');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/student/dashboard');
      addNotification('Accès réservé aux administrateurs.', 'error');
    }
  }, [user, authLoading, navigate, addNotification]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'courses', label: 'Cours', icon: BookOpen },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatisticsPanel />;
      case 'users':
        return <UserManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'statistics':
        return <StatisticsPanel />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <StatisticsPanel />;
    }
  };

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, borderBottom: `1px solid ${colors.lightNavy}33` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon sx={{ color: '#ffffff', bgcolor: colors.navy, p: 0.5, borderRadius: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.navy }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setMobileOpen(false);
            }}
            sx={{
              bgcolor: activeTab === item.id ? `${colors.navy}1a` : 'transparent',
              color: activeTab === item.id ? colors.navy : 'text.primary',
              '&:hover': { bgcolor: `${colors.navy}0a` },
            }}
          >
            <ListItemIcon>
              <item.icon size={20} color={activeTab === item.id ? colors.navy : '#666'} />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2, borderTop: `1px solid ${colors.lightNavy}33` }}>
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
            <Typography>{user?.prenom?.[0]}{user?.nom?.[0]}</Typography>
          </Box>
          <Box>
            <Typography variant="body2">{user?.prenom} {user?.nom}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color={colors.red}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Déconnexion
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  if (authLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Typography>Chargement...</Typography>
    </Box>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Sidebar
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {drawerContent}
      </Sidebar>
      <Sidebar
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawerContent}
      </Sidebar>
      <Box sx={{ flexGrow: 1 }}>
        <Header position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {navItems.find(item => item.id === activeTab)?.label}
            </Typography>
            <Badge badgeContent={3} color="error">
              <IconButton color="inherit">
                <MailIcon />
              </IconButton>
            </Badge>
            <IconButton color="inherit" onClick={() => setActiveTab('settings')}>
              <SettingsIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: colors.navy,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Typography variant="caption">{user?.prenom?.[0]}{user?.nom?.[0]}</Typography>
              </Box>
              <Typography variant="body2">{user?.prenom}</Typography>
            </Box>
          </Toolbar>
        </Header>
        <ContentContainer sx={{ mt: 8 }}>
          {renderContent()}
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
