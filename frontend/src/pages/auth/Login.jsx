import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Stack,
  Fade,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

// Palette de couleurs harmonisée pour plateforme e-learning
// Bleu marine pour professionnalisme et fiabilité
// Fuchsia pour audace créative et énergie
const colors = {
  primary: '#010b40',    // Bleu marine principal
  secondary: '#f13544',  // Fuchsia pour accents créatifs
  accent: '#f13544',     // Fuchsia comme accent principal
  accentHover: '#d91f2e',// Variation plus foncée du fuchsia pour hover
  success: '#10B981',
  error: '#EF4444',
  white: '#FFFFFF',
  gray100: '#F8FAFC',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
};

// Animations sophistiquées adaptées à un environnement éducatif dynamique
const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Composants stylisés professionnels, avec touches créatives pour e-learning
const LoginCard = styled(Card)(({ theme }) => ({
  background: colors.white,
  borderRadius: '24px',
  padding: theme.spacing(5),
  width: '100%',
  maxWidth: 480,
  boxShadow: '0 20px 60px rgba(1, 11, 64, 0.08), 0 0 1px rgba(1, 11, 64, 0.1)',
  animation: `${fadeInScale} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
  transition: 'all 0.3s ease',
  border: `1px solid ${colors.gray200}`,
  '&:hover': {
    boxShadow: '0 24px 70px rgba(241, 53, 68, 0.12), 0 0 1px rgba(241, 53, 68, 0.1)', // Touch fuchsia sur hover
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4),
    borderRadius: '20px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: colors.gray100,
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
    '&:hover': {
      backgroundColor: colors.white,
      '& fieldset': {
        borderColor: colors.gray300,
      },
    },
    '&.Mui-focused': {
      backgroundColor: colors.white,
      border: `2px solid ${colors.accent}`,
      '& fieldset': {
        borderWidth: 0,
      },
    },
    '& fieldset': {
      borderColor: 'transparent',
    },
  },
  '& .MuiInputLabel-root': {
    color: colors.gray600,
    fontWeight: 500,
    '&.Mui-focused': {
      color: colors.accent,
    },
  },
  '& .MuiInputBase-input': {
    color: colors.gray800,
    fontSize: '15px',
    padding: '14px 16px',
    '&::placeholder': {
      color: colors.gray400,
    },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`, // Gradient fuchsia
  borderRadius: '12px',
  padding: '14px 28px',
  fontWeight: 600,
  fontSize: '15px',
  textTransform: 'none',
  boxShadow: `0 4px 16px ${colors.accent}40`,
  color: colors.white,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.accentHover}, ${colors.accent})`,
    boxShadow: `0 6px 24px ${colors.accent}60`,
    transform: 'translateY(-2px)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    background: colors.gray400,
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '14px 28px',
  fontWeight: 600,
  fontSize: '15px',
  textTransform: 'none',
  color: colors.accent,
  border: `2px solid ${colors.gray200}`,
  backgroundColor: 'transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.gray100,
    borderColor: colors.accent,
    transform: 'translateY(-1px)',
  },
}));

const Login = () => {
  const { login, isLoading, error: authError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setLocalError("L'adresse email est requise");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalError('Veuillez saisir une adresse email valide');
      return false;
    }
    if (!trimmedPassword) {
      setLocalError('Le mot de passe est requis');
      return false;
    }
    if (trimmedPassword.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!validateForm()) return;

    try {
      await login(email.trim(), password.trim(), rememberMe);
    } catch (err) {
      console.error('Échec de connexion:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, // Gradient bleu marine à fuchsia
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Grille de fond sophistiquée avec touche créative */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, ${colors.accent}15 1px, transparent 0)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.4,
        }}
      />

      {/* Éléments décoratifs modernes pour e-learning */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${colors.accent}20, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '700px',
          height: '700px',
          background: `radial-gradient(circle, ${colors.accentHover}15, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(100px)',
        }}
      />

      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 6, md: 8 },
            py: 4,
          }}
        >
          {/* Section gauche - Informations adaptées à e-learning */}
          <Box
            sx={{
              flex: 1,
              maxWidth: 500,
              display: { xs: 'none', md: 'block' },
              color: colors.white,
              pr: 4,
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Shield size={56} strokeWidth={1.5} style={{ marginBottom: 24, opacity: 0.9 }} />
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { md: '2.5rem', lg: '3rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Plateforme d'E-Learning Sécurisée
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  opacity: 0.85,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: '1.1rem',
                  color: colors.gray200,
                }}
              >
                Accédez à votre espace d'apprentissage en toute sécurité avec notre système
                d'authentification moderne et fiable.
              </Typography>
            </Box>

            <Stack spacing={3} sx={{ mt: 5 }}>
              {[
                {
                  title: 'Sécurité renforcée',
                  desc: 'Authentification à deux facteurs pour protéger vos cours',
                },
                { title: 'Accès rapide', desc: 'Connexion fluide pour un apprentissage ininterrompu' },
                { title: 'Support 24/7', desc: 'Aide dédiée pour vos besoins éducatifs' },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: colors.accent,
                      mt: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '15px' }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.7, fontSize: '14px', color: colors.gray200 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Section droite - Formulaire */}
          <Box sx={{ flex: 1, maxWidth: 480, width: '100%' }}>
            <Fade in timeout={600}>
              <LoginCard elevation={0}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* En-tête */}
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                      <Typography
                        variant='h4'
                        sx={{
                          fontWeight: 700,
                          color: colors.gray800,
                          mb: 1,
                          fontSize: '28px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Connexion
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.gray600,
                          fontSize: '15px',
                        }}
                      >
                        Accédez à votre espace d'apprentissage
                      </Typography>
                    </Box>

                    {/* Alerte d'erreur */}
                    {(localError || authError) && (
                      <Alert
                        severity='error'
                        sx={{
                          borderRadius: '12px',
                          backgroundColor: `${colors.error}10`,
                          border: `1px solid ${colors.error}30`,
                          '& .MuiAlert-icon': {
                            color: colors.error,
                          },
                        }}
                      >
                        {localError || authError}
                      </Alert>
                    )}

                    {/* Champ Email */}
                    <Box>
                      <Typography
                        sx={{
                          mb: 1,
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.gray700,
                        }}
                      >
                        Adresse email
                      </Typography>
                      <StyledTextField
                        name='email'
                        placeholder='vous@exemple.com'
                        variant='outlined'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Mail size={20} color={colors.gray500} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Champ Mot de passe */}
                    <Box>
                      <Typography
                        sx={{
                          mb: 1,
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.gray700,
                        }}
                      >
                        Mot de passe
                      </Typography>
                      <StyledTextField
                        name='password'
                        placeholder='••••••••'
                        type={showPassword ? 'text' : 'password'}
                        variant='outlined'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Lock size={20} color={colors.gray500} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge='end'
                                sx={{
                                  color: colors.gray500,
                                  '&:hover': {
                                    backgroundColor: colors.gray100,
                                    color: colors.gray700,
                                  },
                                }}
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Options */}
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            sx={{
                              color: colors.gray400,
                              '&.Mui-checked': {
                                color: colors.accent,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: '14px', color: colors.gray700 }}>
                            Se souvenir de moi
                          </Typography>
                        }
                      />
                      <Typography
                        component={Link}
                        to='/forgot-password'
                        sx={{
                          color: colors.accent,
                          fontSize: '14px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: colors.accentHover,
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Mot de passe oublié ?
                      </Typography>
                    </Stack>

                    {/* Bouton de connexion */}
                    <PrimaryButton
                      type='submit'
                      variant='contained'
                      fullWidth
                      disabled={isLoading}
                      endIcon={!isLoading && <ArrowRight size={20} />}
                    >
                      {isLoading ? (
                        <CircularProgress size={22} sx={{ color: colors.white }} />
                      ) : (
                        'Se connecter'
                      )}
                    </PrimaryButton>

                    {/* Divider */}
                    <Divider sx={{ my: 1 }}>
                      <Typography sx={{ color: colors.gray400, fontSize: '13px', px: 2 }}>
                        ou
                      </Typography>
                    </Divider>

                    {/* Inscription */}
                    <SecondaryButton component={Link} to='/register' variant='outlined' fullWidth>
                      Créer un compte
                    </SecondaryButton>

                    {/* Footer */}
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontSize: '13px',
                        color: colors.gray500,
                        pt: 2,
                      }}
                    >
                      En vous connectant, vous acceptez nos{' '}
                      <Typography
                        component='span'
                        sx={{
                          color: colors.accent,
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Conditions d'utilisation
                      </Typography>
                    </Typography>
                  </Stack>
                </form>
              </LoginCard>
            </Fade>
          </Box>  
        </Box>
      </Container>
    </Box>
  );
};

export default Login;