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
import { Mail, Lock, Eye, EyeOff, User, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

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

// Composants stylisés professionnels, avec touches créatives pour e-learning
const RegisterCard = styled(Card)(({ theme }) => ({
  background: colors.white,
  borderRadius: '24px',
  padding: theme.spacing(5),
  width: '100%',
  maxWidth: 520,
  boxShadow: '0 20px 60px rgba(1, 11, 64, 0.08), 0 0 1px rgba(1, 11, 64, 0.1)',
  animation: `${fadeInScale} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
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
    fontSize: '14px',
    '&.Mui-focused': {
      color: colors.accent,
    },
  },
  '& .MuiInputBase-input': {
    color: colors.primary,
    fontSize: '15px',
    padding: '12px 14px',
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

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'start',
  gap: theme.spacing(2),
  animation: `${slideInFromLeft} 0.6s ease-out`,
}));

const Register = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoading: contextLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedNom = nom.trim();
    const trimmedPrenom = prenom.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedNom || trimmedNom.length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return false;
    }
    if (!trimmedPrenom || trimmedPrenom.length < 2) {
      setError('Le prénom doit contenir au moins 2 caractères');
      return false;
    }
    if (!trimmedEmail) {
      setError("L'adresse email est requise");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Veuillez saisir une adresse email valide');
      return false;
    }
    if (!trimmedPassword) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (trimmedPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post('http://localhost:3001/api/auth/register', {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      await login(email.trim(), password.trim(), rememberMe);
    } catch (err) {
      if (err.response) {
        if (err.response.status >= 500) {
          setError('Erreur serveur, veuillez réessayer plus tard');
        } else if (err.response.data?.errors?.length) {
          const errorMessages = err.response.data.errors.map((e) => e.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data?.message || 'Veuillez vérifier vos informations');
        }
      } else {
        setError('Impossible de se connecter au serveur');
      }
    } finally {
      setIsLoading(false);
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
              <UserPlus size={56} strokeWidth={1.5} style={{ marginBottom: 24, opacity: 0.9 }} />
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
                Rejoignez Notre
                <br />
                Plateforme d'E-Learning
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
                Créez votre compte et commencez votre parcours d'apprentissage innovant dès aujourd'hui
              </Typography>
            </Box>

            <Stack spacing={3} sx={{ mt: 5 }}>
              {[
                { title: 'Inscription rapide', desc: 'Processus simplifié pour un démarrage immédiat' },
                { title: 'Sécurité garantie', desc: 'Vos données éducatives sont protégées' },
                { title: 'Accès immédiat', desc: 'Découvrez nos cours innovants sans attendre' },
              ].map((item, idx) => (
                <FeatureItem key={idx} sx={{ animationDelay: `${idx * 0.1}s` }}>
                  <CheckCircle2
                    size={20}
                    color={colors.accent}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '15px' }}>
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
          <Box sx={{ flex: 1, maxWidth: 520, width: '100%' }}>
            <Fade in timeout={600}>
              <RegisterCard elevation={0}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* En-tête */}
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                      <Typography
                        variant='h4'
                        sx={{
                          fontWeight: 700,
                          color: colors.primary,
                          mb: 1,
                          fontSize: '28px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Créer un compte
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.gray600,
                          fontSize: '15px',
                        }}
                      >
                        Remplissez les informations ci-dessous
                      </Typography>
                    </Box>

                    {/* Alerte d'erreur */}
                    {error && (
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
                        {error}
                      </Alert>
                    )}

                    {/* Champs Nom et Prénom sur une ligne */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            mb: 1,
                            fontSize: '14px',
                            fontWeight: 600,
                            color: colors.gray600,
                          }}
                        >
                          Nom
                        </Typography>
                        <StyledTextField
                          name='nom'
                          placeholder='Dupont'
                          variant='outlined'
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          onKeyDown={handleKeyDown}
                          required
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <User size={18} color={colors.gray400} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            mb: 1,
                            fontSize: '14px',
                            fontWeight: 600,
                            color: colors.gray600,
                          }}
                        >
                          Prénom
                        </Typography>
                        <StyledTextField
                          name='prenom'
                          placeholder='Jean'
                          variant='outlined'
                          value={prenom}
                          onChange={(e) => setPrenom(e.target.value)}
                          onKeyDown={handleKeyDown}
                          required
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <User size={18} color={colors.gray400} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Champ Email */}
                    <Box>
                      <Typography
                        sx={{
                          mb: 1,
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.gray600,
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
                              <Mail size={18} color={colors.gray400} />
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
                          color: colors.gray600,
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
                              <Lock size={18} color={colors.gray400} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge='end'
                                sx={{
                                  color: colors.gray400,
                                  '&:hover': {
                                    backgroundColor: colors.gray100,
                                    color: colors.gray600,
                                  },
                                }}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Champ Confirmation mot de passe */}
                    <Box>
                      <Typography
                        sx={{
                          mb: 1,
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.gray600,
                        }}
                      >
                        Confirmer le mot de passe
                      </Typography>
                      <StyledTextField
                        name='confirmPassword'
                        placeholder='••••••••'
                        type={showConfirmPassword ? 'text' : 'password'}
                        variant='outlined'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Lock size={18} color={colors.gray400} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge='end'
                                sx={{
                                  color: colors.gray400,
                                  '&:hover': {
                                    backgroundColor: colors.gray100,
                                    color: colors.gray600,
                                  },
                                }}
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Checkbox */}
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
                        <Typography sx={{ fontSize: '14px', color: colors.gray600 }}>
                          Se souvenir de moi après l'inscription
                        </Typography>
                      }
                    />

                    {/* Bouton d'inscription */}
                    <PrimaryButton
                      type='submit'
                      variant='contained'
                      fullWidth
                      disabled={isLoading || contextLoading}
                      endIcon={!(isLoading || contextLoading) && <ArrowRight size={20} />}
                    >
                      {isLoading || contextLoading ? (
                        <CircularProgress size={22} sx={{ color: colors.white }} />
                      ) : (
                        'Créer mon compte'
                      )}
                    </PrimaryButton>

                    {/* Divider */}
                    <Divider sx={{ my: 1 }}>
                      <Typography sx={{ color: colors.gray400, fontSize: '13px', px: 2 }}>
                        ou
                      </Typography>
                    </Divider>

                    {/* Connexion */}
                    <SecondaryButton component={Link} to='/login' variant='outlined' fullWidth>
                      J'ai déjà un compte
                    </SecondaryButton>

                    {/* Footer */}
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontSize: '13px',
                        color: colors.gray400,
                        pt: 2,
                      }}
                    >
                      En créant un compte, vous acceptez nos{' '}
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
                      </Typography>{' '}
                      et notre{' '}
                      <Typography
                        component='span'
                        sx={{
                          color: colors.accent,
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Politique de confidentialité
                      </Typography>
                    </Typography>
                  </Stack>
                </form>
              </RegisterCard>
            </Fade>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;