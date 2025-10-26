import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

// Palette de couleurs harmonisée avec Register.jsx et About.jsx
const colors = {
  primary: '#010b40', // Bleu marine principal
  secondary: '#f13544', // Fuchsia pour accents créatifs
  accent: '#f13544', // Fuchsia comme accent principal
  accentHover: '#d91f2e', // Variation plus foncée du fuchsia pour hover
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

// Animations sophistiquées
const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

// Composants stylisés professionnels
const ForgotPasswordCard = styled(Card)(({ theme }) => ({
  background: `${colors.primary}cc`, // Semi-transparent navy
  borderRadius: '24px',
  padding: theme.spacing(5),
  width: '100%',
  maxWidth: 480,
  boxShadow: `0 20px 60px ${colors.primary}33, 0 0 1px ${colors.accent}33`,
  animation: `${fadeInScale} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
  transition: 'all 0.3s ease',
  border: `1px solid ${colors.gray800}`,
  '&:hover': {
    boxShadow: `0 24px 70px ${colors.accent}33, 0 0 1px ${colors.accent}66`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4),
    borderRadius: '20px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: `${colors.primary}cc`, // Semi-transparent navy
    color: colors.white,
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
    '&:hover': {
      backgroundColor: `${colors.gray800}cc`,
      '& fieldset': {
        borderColor: colors.gray700,
      },
    },
    '&.Mui-focused': {
      backgroundColor: `${colors.gray800}cc`,
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
    color: colors.accent, // Fuchsia labels
    fontWeight: 500,
    fontSize: '14px',
    '&.Mui-focused': {
      color: colors.accent,
    },
  },
  '& .MuiInputBase-input': {
    color: colors.white,
    fontSize: '15px',
    padding: '14px 16px',
    '&::placeholder': {
      color: colors.gray400,
    },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
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
  color: colors.white,
  border: `2px solid ${colors.gray700}`,
  backgroundColor: 'transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: `${colors.gray800}33`,
    borderColor: colors.accent,
    transform: 'translateY(-1px)',
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'start',
  gap: theme.spacing(2),
  animation: `${slideInFromLeft} 0.6s ease-out`,
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("L'adresse email est requise");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Veuillez saisir une adresse email valide');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Un email de réinitialisation a été envoyé à votre adresse.');
        setEmail('');
      } else {
        setError(data.message || 'Email non trouvé dans notre système');
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
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
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Grille de fond sophistiquée */}
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

      {/* Éléments décoratifs modernes */}
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
          {/* Section gauche - Informations */}
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
              <KeyRound
                size={56}
                strokeWidth={1.5}
                style={{ marginBottom: 24, opacity: 0.9, color: colors.accent }}
              />
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { md: '2.5rem', lg: '3rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  color: colors.white,
                }}
              >
                Réinitialisation
                <br />
                Sécurisée
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
                Récupérez l'accès à votre compte en quelques étapes simples et sécurisées
              </Typography>
            </Box>

            <Stack spacing={3} sx={{ mt: 5 }}>
              {[
                { title: 'Processus sécurisé', desc: 'Vos données sont protégées à chaque étape' },
                {
                  title: 'Email instantané',
                  desc: 'Recevez votre lien de réinitialisation immédiatement',
                },
                { title: 'Lien temporaire', desc: 'Valable 1 heure pour votre sécurité' },
              ].map((item, idx) => (
                <FeatureItem key={idx} sx={{ animationDelay: `${idx * 0.1}s` }}>
                  <CheckCircle2
                    size={20}
                    color={colors.accent}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography
                      sx={{ fontWeight: 600, mb: 0.5, fontSize: '15px', color: colors.white }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.7, fontSize: '14px', color: colors.gray200 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </FeatureItem>
              ))}
            </Stack>
          </Box>

          {/* Section droite - Formulaire */}
          <Box sx={{ flex: 1, maxWidth: 480, width: '100%' }}>
            <Fade in timeout={600}>
              <ForgotPasswordCard elevation={0}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* En-tête */}
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '16px',
                          backgroundColor: `${colors.accent}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                        }}
                      >
                        <KeyRound size={32} color={colors.accent} />
                      </Box>
                      <Typography
                        variant='h4'
                        sx={{
                          fontWeight: 700,
                          color: colors.white, // White for header
                          mb: 1,
                          fontSize: '28px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Mot de passe oublié ?
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.gray200, // Lighter gray for subtitle
                          fontSize: '15px',
                          lineHeight: 1.6,
                        }}
                      >
                        Pas de problème ! Entrez votre email et nous vous enverrons un lien pour
                        réinitialiser votre mot de passe.
                      </Typography>
                    </Box>

                    {/* Alerte de succès */}
                    {message && (
                      <Alert
                        severity='success'
                        icon={<CheckCircle2 size={20} />}
                        sx={{
                          borderRadius: '12px',
                          backgroundColor: `${colors.success}10`,
                          border: `1px solid ${colors.success}30`,
                          color: colors.white, // White text for readability
                          '& .MuiAlert-icon': {
                            color: colors.success,
                          },
                          '& .MuiAlert-message': {
                            fontWeight: 500,
                          },
                        }}
                      >
                        {message}
                      </Alert>
                    )}

                    {/* Alerte d'erreur */}
                    {error && (
                      <Alert
                        severity='error'
                        sx={{
                          borderRadius: '12px',
                          backgroundColor: `${colors.error}10`,
                          border: `1px solid ${colors.error}30`,
                          color: colors.white, // White text for readability
                          '& .MuiAlert-icon': {
                            color: colors.error,
                          },
                          '& .MuiAlert-message': {
                            fontWeight: 500,
                          },
                        }}
                      >
                        {error}
                      </Alert>
                    )}

                    {/* Champ Email */}
                    <Box>
                      <Typography
                        sx={{
                          mb: 1,
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.accent, // Fuchsia for labels
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
                              <Mail size={20} color={colors.gray400} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Bouton d'envoi */}
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
                        'Envoyer le lien de réinitialisation'
                      )}
                    </PrimaryButton>

                    {/* Divider */}
                    <Divider sx={{ my: 1, borderColor: colors.gray700 }}>
                      <Typography sx={{ color: colors.gray400, fontSize: '13px', px: 2 }}>
                        ou
                      </Typography>
                    </Divider>

                    {/* Bouton retour */}
                    <SecondaryButton
                      component={Link}
                      to='/login'
                      variant='outlined'
                      fullWidth
                      startIcon={<ArrowLeft size={20} />}
                    >
                      Retour à la connexion
                    </SecondaryButton>

                    {/* Footer - Info supplémentaire */}
                    <Box
                      sx={{
                        mt: 3,
                        p: 3,
                        backgroundColor: `${colors.primary}cc`, // Semi-transparent navy
                        borderRadius: '12px',
                        border: `1px solid ${colors.gray800}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: colors.gray200, // Lighter gray for readability
                          textAlign: 'center',
                          lineHeight: 1.6,
                        }}
                      >
                        💡 <strong>Conseil :</strong> Vérifiez vos spams si vous ne recevez pas
                        l'email dans les 5 prochaines minutes.
                      </Typography>
                    </Box>

                    {/* Lien d'aide */}
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontSize: '13px',
                        color: colors.gray200,
                        pt: 1,
                      }}
                    >
                      Besoin d'aide ?{' '}
                      <Typography
                        component='span'
                        sx={{
                          color: colors.accent,
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Contactez le support
                      </Typography>
                    </Typography>
                  </Stack>
                </form>
              </ForgotPasswordCard>
            </Fade>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
