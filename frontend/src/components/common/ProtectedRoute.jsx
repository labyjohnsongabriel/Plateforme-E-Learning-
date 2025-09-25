import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Container 
} from '@mui/material';
//import { useAuth } from '../context/AuthContext';
//import { colors } from '../utils/colors';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredLevel = null,
  fallbackPath = '/login',
  showLoading = true 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Affichage pendant le chargement
  if (isLoading && showLoading) {
    return (
      <Container 
        maxWidth="sm" 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: colors.primary.main,
            mb: 3
          }} 
        />
        <Typography variant="h6" color={colors.text.primary} gutterBottom>
          Vérification de l'accès...
        </Typography>
        <Typography variant="body2" color={colors.text.secondary}>
          Chargement de vos informations de sécurité
        </Typography>
      </Container>
    );
  }

  // Redirection si non authentifié
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          from: location,
          message: 'Veuillez vous connecter pour accéder à cette page'
        }} 
        replace 
      />
    );
  }

  // Vérification du rôle requis
  if (requiredRole && user?.role !== requiredRole) {
    // Si l'utilisateur a un rôle mais pas le bon, rediriger vers son dashboard
    const userDashboard = `/${user?.role}/dashboard`;
    
    return (
      <Navigate 
        to={userDashboard} 
        state={{ 
          from: location,
          message: `Accès réservé aux ${requiredRole}s`,
          severity: 'warning'
        }} 
        replace 
      />
    );
  }

  // Vérification du niveau requis
  if (requiredLevel) {
    const levelHierarchy = {
      'alfa': 1,
      'beta': 2,
      'gamma': 3,
      'delta': 4,
      'epsilon': 5
    };

    const userLevelIndex = levelHierarchy[user?.level] || 0;
    const requiredLevelIndex = levelHierarchy[requiredLevel] || 0;

    if (userLevelIndex < requiredLevelIndex) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location,
            message: `Niveau ${requiredLevel} requis. Vous êtes actuellement au niveau ${user?.level}`,
            requiredLevel,
            currentLevel: user?.level
          }} 
          replace 
        />
      );
    }
  }

  // Si toutes les vérifications sont passées, afficher le contenu
  return children;
};

// Variante pour les routes administratives
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

// Variante pour les routes instructeurs
export const InstructorRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="instructor" {...props}>
    {children}
  </ProtectedRoute>
);

// Variante pour les routes étudiants
export const StudentRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="student" {...props}>
    {children}
  </ProtectedRoute>
);

// Variante avec niveau minimum requis
export const LevelRoute = ({ children, minLevel, ...props }) => (
  <ProtectedRoute requiredLevel={minLevel} {...props}>
    {children}
  </ProtectedRoute>
);

// Route publique uniquement pour les non-authentifiés (ex: login, register)
export const PublicOnlyRoute = ({ children, redirectPath = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    // Rediriger vers la page d'origine ou le dashboard
    const from = location.state?.from?.pathname || redirectPath;
    return <Navigate to={from} replace />;
  }

  return children;
};

// Composant pour afficher les erreurs d'autorisation
export const AuthorizationError = ({ 
  title = "Accès non autorisé", 
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
  requiredRole = null,
  currentRole = null,
  requiredLevel = null,
  currentLevel = null 
}) => {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          color={colors.error.main}
          fontWeight={700}
        >
          ⚠️ {title}
        </Typography>
        
        <Typography variant="h6" color={colors.text.primary} paragraph>
          {message}
        </Typography>

        {(requiredRole || currentRole) && (
          <Box sx={{ 
            backgroundColor: colors.grey[50], 
            p: 3, 
            borderRadius: 2,
            mb: 3 
          }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Informations sur les rôles:
            </Typography>
            {requiredRole && (
              <Typography variant="body2">
                <strong>Rôle requis:</strong> {requiredRole}
              </Typography>
            )}
            {currentRole && (
              <Typography variant="body2">
                <strong>Votre rôle:</strong> {currentRole}
              </Typography>
            )}
          </Box>
        )}

        {(requiredLevel || currentLevel) && (
          <Box sx={{ 
            backgroundColor: colors.grey[50], 
            p: 3, 
            borderRadius: 2,
            mb: 3 
          }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Informations sur les niveaux:
            </Typography>
            {requiredLevel && (
              <Typography variant="body2">
                <strong>Niveau requis:</strong> {requiredLevel}
              </Typography>
            )}
            {currentLevel && (
              <Typography variant="body2">
                <strong>Votre niveau:</strong> {currentLevel}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => window.history.back()}
            sx={{ minWidth: 120 }}
          >
            Retour
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/'}
            sx={{ minWidth: 120 }}
          >
            Accueil
          </Button>
          <Button 
            variant="text" 
            onClick={() => window.location.href = '/contact'}
            sx={{ minWidth: 120 }}
          >
            Support
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ProtectedRoute;