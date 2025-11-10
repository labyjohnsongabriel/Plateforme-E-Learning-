  import React, { useState, useEffect } from 'react';
  import {
    Box,
    Button,
    TextField,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    InputAdornment,
    Container,
    Avatar,
    Alert,
    Card,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Badge,
    Fade,
    Chip,
    CardContent,
    CardActions,
    LinearProgress,
  } from '@mui/material';
  import { styled, keyframes } from '@mui/material/styles';
  import {
    Person,
    Email,
    Event,
    Edit,
    Save,
    Cancel,
    School,
    Settings,
    Notifications as NotificationsIcon,
    MenuBook,
    HowToReg,
    AdminPanelSettings,
    Groups,
    Dashboard,
    Assignment,
    BarChart,
    People,
    Book,
    Star,
    TrendingUp,
    CheckCircle,
    Schedule,
    WorkspacePremium,
  } from '@mui/icons-material';
  import axios from 'axios';
  import { useAuth } from '../../context/AuthContext';
  import { useNotifications } from '../../context/NotificationContext';
  import { useNavigate } from 'react-router-dom';

  // Animations
  const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  const floatingAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  `;

  const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(241, 53, 68, 0.4); }
    50% { box-shadow: 0 0 40px rgba(241, 53, 68, 0.8); }
  `;

  // Couleurs alignées avec About.jsx
  const colors = {
    navy: '#010b40',
    lightNavy: '#1a237e',
    red: '#f13544',
    pink: '#ff6b74',
    purple: '#8b5cf6',
    green: '#10b981',
    orange: '#f59e0b',
    blue: '#3b82f6',
  };

  // Styled Components
  const ProfileContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
    padding: theme.spacing(4),
    position: 'relative',
    overflow: 'hidden',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  }));

  const GlassCard = styled(Paper)(({ theme }) => ({
    background: `linear-gradient(135deg, rgba(1, 11, 64, 0.9), rgba(26, 35, 126, 0.8))`,
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: `1px solid ${colors.red}33`,
    padding: theme.spacing(4),
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: `0 32px 80px ${colors.navy}4d`,
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
  }));

  const StatCard = styled(Card)(({ theme }) => ({
    background: `linear-gradient(135deg, rgba(1, 11, 64, 0.7), rgba(26, 35, 126, 0.5))`,
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    border: `1px solid ${colors.red}33`,
    padding: theme.spacing(2),
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: `${colors.red}66`,
      transform: 'translateY(-4px)',
    },
  }));

  const ProfileHeader = ({ user, isEditing, onEditToggle }) => {
    const getRoleConfig = () => {
      switch (user.role) {
        case 'ADMIN':
          return {
            icon: <AdminPanelSettings sx={{ fontSize: 32, color: colors.red }} />,
            title: 'Administrateur',
            color: colors.red,
          };
        case 'ENSEIGNANT':
          return {
            icon: <Groups sx={{ fontSize: 32, color: colors.orange }} />,
            title: 'Enseignant',
            color: colors.orange,
          };
        default:
          return {
            icon: <HowToReg sx={{ fontSize: 32, color: colors.blue }} />,
            title: 'Étudiant',
            color: colors.blue,
          };
      }
    };

    const roleConfig = getRoleConfig();

    return (
      <GlassCard elevation={0}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.avatar || undefined}
                alt={`${user.prenom} ${user.nom}`}
                sx={{
                  width: { xs: 80, md: 120 },
                  height: { xs: 80, md: 120 },
                  border: `3px solid ${roleConfig.color}`,
                  boxShadow: `0 8px 32px ${colors.navy}4d`,
                  animation: `${floatingAnimation} 3s ease-in-out infinite`,
                  backgroundColor: colors.lightNavy,
                  objectFit: 'cover',
                }}
              >
                {user.prenom?.[0] || ''}
                {user.nom?.[0] || ''}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  background: roleConfig.color,
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.navy}`,
                }}
              >
                {roleConfig.icon}
              </Box>
            </Box>
            <Box>
              <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
                {user.prenom} {user.nom}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={roleConfig.icon}
                  label={roleConfig.title}
                  sx={{
                    background: `${roleConfig.color}33`,
                    color: '#ffffff',
                    border: `1px solid ${roleConfig.color}`,
                    fontWeight: 600,
                  }}
                />
                <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {user.email}
                </Typography>
              </Box>
              <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                Membre depuis{' '}
                {user.dateInscription
                  ? new Date(user.dateInscription).toLocaleDateString('fr-FR')
                  : 'récemment'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onEditToggle}
            sx={{
              background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
              color: '#ffffff',
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.red}dd, ${colors.pink}dd)`,
                transform: 'scale(1.1)',
              },
            }}
          >
            {isEditing ? <Cancel /> : <Edit />}
          </IconButton>
        </Box>
      </GlassCard>
    );
  };

  const ProfileInfo = ({
    user,
    isEditing,
    editForm,
    handleInputChange,
    handleAvatarChange,
    handleEditToggle,
    handleSave,
    isSaving,
    message,
    error,
  }) => {
    return (
      <GlassCard elevation={0}>
        <Fade in={true} timeout={1000}>
          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant='h5' sx={{ fontWeight: 700, color: '#ffffff' }}>
                Informations personnelles
              </Typography>
            </Box>

            {message && (
              <Alert
                severity='success'
                sx={{ mb: 3, background: `${colors.green}33`, color: '#ffffff' }}
              >
                {message}
              </Alert>
            )}
            {error && (
              <Alert severity='error' sx={{ mb: 3, background: `${colors.red}33`, color: '#ffffff' }}>
                {error}
              </Alert>
            )}

            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={
                      editForm.avatar
                        ? URL.createObjectURL(editForm.avatar)
                        : user.avatar || undefined
                    }
                    alt='Avatar Preview'
                    sx={{
                      width: 120,
                      height: 120,
                      border: `3px solid ${colors.red}`,
                      boxShadow: `0 8px 32px ${colors.navy}4d`,
                      objectFit: 'cover',
                    }}
                  />
                  <Button
                    variant='outlined'
                    component='label'
                    sx={{
                      borderColor: colors.red,
                      color: colors.red,
                      '&:hover': {
                        borderColor: colors.pink,
                        color: colors.pink,
                      },
                    }}
                  >
                    Changer l'avatar
                    <input
                      type='file'
                      hidden
                      accept='image/jpeg,image/png'
                      onChange={handleAvatarChange}
                    />
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Nom'
                      name='nom'
                      value={editForm.nom}
                      onChange={handleInputChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Person sx={{ color: colors.red }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#ffffff',
                          '& fieldset': { borderColor: `${colors.red}4d` },
                          '&:hover fieldset': { borderColor: colors.red },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Prénom'
                      name='prenom'
                      value={editForm.prenom}
                      onChange={handleInputChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Person sx={{ color: colors.red }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#ffffff',
                          '& fieldset': { borderColor: `${colors.red}4d` },
                          '&:hover fieldset': { borderColor: colors.red },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Email'
                      name='email'
                      value={editForm.email}
                      onChange={handleInputChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Email sx={{ color: colors.red }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#ffffff',
                          '& fieldset': { borderColor: `${colors.red}4d` },
                          '&:hover fieldset': { borderColor: colors.red },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant='outlined'
                    onClick={handleEditToggle}
                    startIcon={<Cancel />}
                    sx={{
                      borderColor: colors.red,
                      color: colors.red,
                      '&:hover': {
                        borderColor: colors.pink,
                        color: colors.pink,
                      },
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant='contained'
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${colors.red}dd, ${colors.pink}dd)`,
                      },
                    }}
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Person sx={{ fontSize: 24, color: colors.red }} />
                    <Box>
                      <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Nom complet
                      </Typography>
                      <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {user.prenom} {user.nom}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Email sx={{ fontSize: 24, color: colors.red }} />
                    <Box>
                      <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Email
                      </Typography>
                      <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Event sx={{ fontSize: 24, color: colors.red }} />
                    <Box>
                      <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Membre depuis
                      </Typography>
                      <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {user.dateInscription
                          ? new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Date non disponible'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <HowToReg sx={{ fontSize: 24, color: colors.red }} />
                    <Box>
                      <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Rôle
                      </Typography>
                      <Typography variant='body1' sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {user.role === 'ETUDIANT'
                          ? 'Étudiant'
                          : user.role === 'ENSEIGNANT'
                            ? 'Enseignant'
                            : 'Administrateur'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        </Fade>
      </GlassCard>
    );
  };

  const StudentDashboard = ({ user }) => {
    const stats = user.statistics || {
      progression: 0,
      coursTermines: 0,
      coursInscrits: 0,
      certificats: 0,
      heuresEtude: 0,
    };

    return (
      <GlassCard elevation={0}>
        <Typography variant='h5' sx={{ fontWeight: 700, color: '#ffffff', mb: 4 }}>
          Tableau de Bord Étudiant
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <StatCard>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress
                  variant='determinate'
                  value={stats.progression || 0}
                  size={80}
                  thickness={4}
                  sx={{ color: colors.green, mb: 2 }}
                />
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {stats.progression || 0}%
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Progression globale
                </Typography>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatCard>
                  <Typography variant='h4' sx={{ color: colors.blue, fontWeight: 700 }}>
                    {stats.coursInscrits || 0}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Cours inscrits
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard>
                  <Typography variant='h4' sx={{ color: colors.green, fontWeight: 700 }}>
                    {stats.coursTermines || 0}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Cours terminés
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard>
                  <Typography variant='h4' sx={{ color: colors.orange, fontWeight: 700 }}>
                    {stats.certificats || 0}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Certificats
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard>
                  <Typography variant='h4' sx={{ color: colors.purple, fontWeight: 700 }}>
                    {stats.heuresEtude || 0}h
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Heures d'étude
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Typography variant='h6' sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
          Cours récents
        </Typography>
        <Grid container spacing={2}>
          {(user.coursRecents || []).slice(0, 3).map((cours, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.red}33` }}>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant='h6' sx={{ color: '#ffffff' }}>
                      {cours.titre || 'Cours inconnu'}
                    </Typography>
                    <Chip
                      label={`${cours.progression || 0}%`}
                      size='small'
                      sx={{ bgcolor: colors.green, color: '#ffffff' }}
                    />
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={cours.progression || 0}
                    sx={{
                      mt: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': { bgcolor: colors.green },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {(!user.coursRecents || user.coursRecents.length === 0) && (
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2 }}>
              Aucun cours récent
            </Typography>
          )}
        </Grid>
      </GlassCard>
    );
  };

  const TeacherDashboard = ({ user }) => {
    const stats = user.statistics || {
      totalCours: 0,
      coursEnAttente: 0,
      etudiantsInscrits: 0,
      tauxApproval: 0,
      revenus: 0,
    };

    return (
      <GlassCard elevation={0}>
        <Typography variant='h5' sx={{ fontWeight: 700, color: '#ffffff', mb: 4 }}>
          Tableau de Bord Enseignant
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard>
              <Box sx={{ textAlign: 'center' }}>
                <Book sx={{ fontSize: 40, color: colors.blue, mb: 1 }} />
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {stats.totalCours || 0}
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Cours créés
                </Typography>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard>
              <Box sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: colors.green, mb: 1 }} />
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {stats.etudiantsInscrits || 0}
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Étudiants
                </Typography>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: colors.orange, mb: 1 }} />
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {stats.tauxApproval || 0}%
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Taux d'approbation
                </Typography>
              </Box>
            </StatCard>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            startIcon={<Book />}
            sx={{
              background: `linear-gradient(135deg, ${colors.blue}, ${colors.blue}dd)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.blue}dd, ${colors.blue}bb)`,
              },
            }}
            href='/instructor/courses'
          >
            Mes cours
          </Button>
          <Button
            variant='contained'
            startIcon={<People />}
            sx={{
              background: `linear-gradient(135deg, ${colors.green}, ${colors.green}dd)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.green}dd, ${colors.green}bb)`,
              },
            }}
            href='/instructor/students'
          >
            Mes étudiants
          </Button>
          <Button
            variant='contained'
            startIcon={<BarChart />}
            sx={{
              background: `linear-gradient(135deg, ${colors.orange}, ${colors.orange}dd)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.orange}dd, ${colors.orange}bb)`,
              },
            }}
            href='/instructor/analytics'
          >
            Analytics
          </Button>
        </Box>
      </GlassCard>
    );
  };

  const AdminDashboard = ({ user }) => {
    const stats = user.statistics || {
      totalUsers: 0,
      totalCourses: 0,
      pendingApprovals: 0,
      activeUsers: 0,
      revenue: 0,
    };

    return (
      <GlassCard elevation={0}>
        <Typography variant='h5' sx={{ fontWeight: 700, color: '#ffffff', mb: 4 }}>
          Tableau de Bord Administrateur
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard>
              <Box sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: colors.blue, mb: 1 }} />
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {stats.totalUsers || 0}
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Utilisateurs totaux
                </Typography>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard>
              <Box sx={{ textAlign: 'center' }}>
                <MenuBook sx={{ fontSize: 40, color: colors.green, mb: 1 }} />
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {stats.totalCourses || 0}
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Cours totaux
                </Typography>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard>
              <Box sx={{ textAlign: 'center' }}>
                <Schedule sx={{ fontSize: 40, color: colors.orange, mb: 1 }} />
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {stats.pendingApprovals || 0}
                </Typography>
                <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  En attente
                </Typography>
              </Box>
            </StatCard>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            startIcon={<People />}
            sx={{
              background: `linear-gradient(135deg, ${colors.blue}, ${colors.blue}dd)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.blue}dd, ${colors.blue}bb)`,
              },
            }}
            href='/admin/users'
          >
            Gestion utilisateurs
          </Button>
          <Button
            variant='contained'
            startIcon={<MenuBook />}
            sx={{
              background: `linear-gradient(135deg, ${colors.green}, ${colors.green}dd)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.green}dd, ${colors.green}bb)`,
              },
            }}
            href='/admin/courses'
          >
            Gestion cours
          </Button>
          <Button
            variant='contained'
            startIcon={<Settings />}
            sx={{
              background: `linear-gradient(135deg, ${colors.orange}, ${colors.orange}dd)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.orange}dd, ${colors.orange}bb)`,
              },
            }}
            href='/admin/settings'
          >
            Paramètres
          </Button>
        </Box>
      </GlassCard>
    );
  };

  const NotificationsPanel = ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  }) => {
    return (
      <GlassCard elevation={0}>
        <Fade in={true} timeout={1200}>
          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant='h5' sx={{ fontWeight: 700, color: '#ffffff' }}>
                Notifications
                <Badge
                  badgeContent={unreadCount}
                  sx={{ ml: 2, '& .MuiBadge-badge': { backgroundColor: colors.red } }}
                />
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  sx={{
                    borderColor: colors.red,
                    color: colors.red,
                    '&:hover': { borderColor: colors.pink, color: colors.pink },
                  }}
                >
                  Tout lire
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={clearNotifications}
                  disabled={notifications.length === 0}
                  sx={{
                    borderColor: colors.red,
                    color: colors.red,
                    '&:hover': { borderColor: colors.pink, color: colors.pink },
                  }}
                >
                  Tout supprimer
                </Button>
              </Box>
            </Box>

            {notifications.length === 0 ? (
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 4 }}>
                Aucune notification
              </Typography>
            ) : (
              <List>
                {notifications.slice(0, 5).map((notification, index) => (
                  <ListItem
                    key={notification._id || notification.id || index}
                    sx={{
                      bgcolor: notification.lu ? 'transparent' : `${colors.purple}1a`,
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { bgcolor: `${colors.purple}33` },
                    }}
                    button
                    onClick={() => markAsRead(notification._id || notification.id)}
                  >
                    <ListItemIcon>
                      <NotificationsIcon
                        sx={{ color: notification.lu ? 'rgba(255, 255, 255, 0.7)' : colors.red }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{ color: '#ffffff', fontWeight: notification.lu ? 500 : 700 }}
                        >
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                          {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Fade>
      </GlassCard>
    );
  };

  const Profile = ({ userId }) => {
    const { user: authUser, loading: authLoading } = useAuth();
    const {
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      error: notificationError,
    } = useNotifications();
    const navigate = useNavigate();

    const [user, setUser] = useState({
      nom: '',
      prenom: '',
      email: '',
      avatar: '',
      dateInscription: '',
      role: 'ETUDIANT',
      statistics: {
        progression: 0,
        coursTermines: 0,
        coursInscrits: 0,
        certificats: 0,
        heuresEtude: 0,
      },
      coursRecents: [],
    });

    const [editForm, setEditForm] = useState({
      nom: '',
      prenom: '',
      email: '',
      avatar: null,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
      if (authLoading) return;
      if (!authUser) {
        navigate('/login');
        return;
      }

      const loadUserProfile = async () => {
        setIsLoading(true);
        try {
          console.log('🔄 Chargement du profil utilisateur...');

          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token non trouvé');
          }

          const response = await axios.get(`${API_URL}/api/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });

          console.log('✅ Réponse complète du profil:', response.data);

          if (!response.data) {
            throw new Error('Aucune donnée dans la réponse');
          }

          if (!response.data.success) {
            throw new Error(response.data.message || 'Erreur lors de la récupération du profil');
          }

          if (!response.data.data) {
            throw new Error('Données utilisateur non trouvées dans la réponse');
          }

          const userData = response.data.data;
          console.log('📊 Données utilisateur reçues:', userData);

          setUser({
            nom: userData.nom || '',
            prenom: userData.prenom || '',
            email: userData.email || '',
            avatar: userData.avatar || '',
            dateInscription:
              userData.dateInscription || userData.createdAt || new Date().toISOString(),
            role: userData.role || 'ETUDIANT',
            statistics: userData.statistics || {
              progression: 0,
              coursTermines: 0,
              coursInscrits: 0,
              certificats: 0,
              heuresEtude: 0,
            },
            coursRecents: userData.coursRecents || [],
          });

          setEditForm({
            nom: userData.nom || '',
            prenom: userData.prenom || '',
            email: userData.email || '',
            avatar: null,
          });
        } catch (err) {
          console.error('❌ Erreur détaillée chargement profil:', err);

          let errorMessage = 'Erreur lors de la récupération du profil';

          if (err.response) {
            console.log('📡 Statut HTTP:', err.response.status);
            console.log('📡 URL appelée:', err.config?.url);
            console.log('📡 Données erreur:', err.response.data);

            errorMessage = err.response.data?.message || `Erreur ${err.response.status}`;

            if (err.response.status === 401) {
              errorMessage = 'Session expirée. Veuillez vous reconnecter.';
              setTimeout(() => navigate('/login'), 2000);
            } else if (err.response.status === 404) {
              errorMessage = 'Profil non trouvé. Vérifiez la configuration des routes API.';
            }
          } else if (err.request) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          } else {
            errorMessage = err.message || 'Erreur inconnue';
          }

          setError(errorMessage);

          // Données de démonstration en cas d'erreur (fallback)
          const fallbackUser = {
            nom: authUser?.nom || 'Utilisateur',
            prenom: authUser?.prenom || '',
            email: authUser?.email || '',
            avatar: authUser?.avatar || '',
            dateInscription: new Date().toISOString(),
            role: authUser?.role || 'ETUDIANT',
            statistics: {
              progression: 45,
              coursTermines: 3,
              coursInscrits: 8,
              certificats: 2,
              heuresEtude: 24,
            },
            coursRecents: [
              { titre: 'Python Basics', progression: 80 },
              { titre: 'Web Development', progression: 45 },
              { titre: 'Data Science', progression: 20 },
            ],
          };

          setUser(fallbackUser);
          setEditForm({
            nom: fallbackUser.nom,
            prenom: fallbackUser.prenom,
            email: fallbackUser.email,
            avatar: null,
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadUserProfile();
    }, [authUser, authLoading, navigate, userId, API_URL]);

    const handleEditToggle = () => {
      setIsEditing(!isEditing);
      setMessage('');
      setError('');
      if (!isEditing) {
        setEditForm({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          avatar: null,
        });
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          setError('Veuillez sélectionner une image JPEG ou PNG');
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          setError("L'image ne doit pas dépasser 2MB");
          return;
        }
        setEditForm((prev) => ({ ...prev, avatar: file }));
        setError('');
      }
    };

    const validateForm = () => {
      if (!editForm.nom.trim()) return 'Le nom est requis';
      if (!editForm.prenom.trim()) return 'Le prénom est requis';
      if (!editForm.email.trim()) return "L'email est requis";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) return 'Email invalide';
      return null;
    };

    const handleSave = async () => {
      setError('');
      setMessage('');
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsSaving(true);
      try {
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('nom', editForm.nom);
        formData.append('prenom', editForm.prenom);
        formData.append('email', editForm.email);
        if (editForm.avatar) {
          formData.append('avatar', editForm.avatar);
        }

        const response = await axios.put(`${API_URL}/api/auth/profile`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 15000,
        });

        console.log('✅ Réponse mise à jour:', response.data);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Erreur lors de la mise à jour');
        }

        const updatedUserData = response.data.data;
        if (!updatedUserData) {
          throw new Error('Données utilisateur non trouvées après mise à jour');
        }

        setUser((prev) => ({
          ...prev,
          ...updatedUserData,
          avatar: updatedUserData.avatar || prev.avatar,
          statistics: updatedUserData.statistics || prev.statistics,
          coursRecents: updatedUserData.coursRecents || prev.coursRecents,
        }));

        setMessage('Profil mis à jour avec succès');
        setIsEditing(false);
      } catch (err) {
        console.error('❌ Erreur mise à jour profil:', err);

        let errorMessage = 'Erreur lors de la mise à jour du profil';

        if (err.response) {
          console.log('📡 Statut HTTP:', err.response.status);
          console.log('📡 Données erreur:', err.response.data);
          errorMessage = err.response.data?.message || `Erreur ${err.response.status}`;
          if (err.response.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            setTimeout(() => navigate('/login'), 2000);
          }
        } else if (err.request) {
          errorMessage = 'Impossible de contacter le serveur';
        } else {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    };

    if (authLoading || isLoading) {
      return (
        <ProfileContainer>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <CircularProgress size={60} sx={{ color: colors.red }} />
            <Typography variant='h5' sx={{ color: '#ffffff', fontWeight: 600 }}>
              Chargement de votre profil...
            </Typography>
          </Box>
        </ProfileContainer>
      );
    }

    const renderRoleDashboard = () => {
      switch (user.role) {
        case 'ADMIN':
          return <AdminDashboard user={user} />;
        case 'ENSEIGNANT':
          return <TeacherDashboard user={user} />;
        default:
          return <StudentDashboard user={user} />;
      }
    };

    return (
      <ProfileContainer>
        {/* Arrière-plan décoratif */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 20% 20%, ${colors.red}15 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, ${colors.purple}10 0%, transparent 50%)
            `,
            zIndex: 0,
          }}
        />

        <Container maxWidth='xl' sx={{ position: 'relative', zIndex: 10, py: 4 }}>
          <Fade in={true} timeout={800}>
            <Box>
              <ProfileHeader user={user} isEditing={isEditing} onEditToggle={handleEditToggle} />
            </Box>
          </Fade>

          {notificationError && (
            <Alert severity='error' sx={{ mt: 3, background: `${colors.red}33`, color: '#ffffff' }}>
              {notificationError}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ProfileInfo
                    user={user}
                    isEditing={isEditing}
                    editForm={editForm}
                    handleInputChange={handleInputChange}
                    handleAvatarChange={handleAvatarChange}
                    handleEditToggle={handleEditToggle}
                    handleSave={handleSave}
                    isSaving={isSaving}
                    message={message}
                    error={error}
                  />
                </Grid>
                <Grid item xs={12}>
                  {renderRoleDashboard()}
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <NotificationsPanel
                    notifications={notifications}
                    unreadCount={unreadCount}
                    markAsRead={markAsRead}
                    markAllAsRead={markAllAsRead}
                    clearNotifications={clearNotifications}
                  />
                </Grid>

                <Grid item xs={12}>
                  <GlassCard>
                    <Typography variant='h6' sx={{ color: '#ffffff', mb: 3, fontWeight: 600 }}>
                      Actions Rapides
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant='contained'
                        startIcon={<Dashboard />}
                        sx={{
                          background: `linear-gradient(135deg, ${colors.blue}, ${colors.blue}dd)`,
                          justifyContent: 'flex-start',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${colors.blue}dd, ${colors.blue}bb)`,
                          },
                        }}
                        href='/dashboard'
                      >
                        Tableau de bord
                      </Button>
                      <Button
                        variant='contained'
                        startIcon={<MenuBook />}
                        sx={{
                          background: `linear-gradient(135deg, ${colors.green}, ${colors.green}dd)`,
                          justifyContent: 'flex-start',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${colors.green}dd, ${colors.green}bb)`,
                          },
                        }}
                        href='/courses'
                      >
                        Mes cours
                      </Button>
                      <Button
                        variant='contained'
                        startIcon={<WorkspacePremium />}
                        sx={{
                          background: `linear-gradient(135deg, ${colors.orange}, ${colors.orange}dd)`,
                          justifyContent: 'flex-start',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${colors.orange}dd, ${colors.orange}bb)`,
                          },
                        }}
                        href='/certificates'
                      >
                        Mes certificats
                      </Button>
                      <Button
                        variant='contained'
                        startIcon={<Settings />}
                        sx={{
                          background: `linear-gradient(135deg, ${colors.purple}, ${colors.purple}dd)`,
                          justifyContent: 'flex-start',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${colors.purple}dd, ${colors.purple}bb)`,
                          },
                        }}
                        href='/settings'
                      >
                        Paramètres
                      </Button>
                    </Box>
                  </GlassCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </ProfileContainer>
    );
  };

  export default Profile;
