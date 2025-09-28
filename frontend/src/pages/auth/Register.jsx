import React, { useState } from "react";
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
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import axios from "axios";

// Couleurs principales
const colors = {
  navy: "#010b40",
  fuschia: "#f13544",
  lightNavy: "#1a237e",
  lightFuschia: "#ff6b74",
  white: "#ffffff",
};

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const RegisterCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`,
  backdropFilter: "blur(12px)",
  border: `1px solid ${colors.fuschia}33`,
  borderRadius: "16px",
  padding: theme.spacing(4),
  width: "140%",
  maxWidth: 500,
  transition: "all 0.3s ease",
  animation: `${fadeInUp} 0.6s ease-out`,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 8px 24px ${colors.navy}33`,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.fuschia}, ${colors.lightFuschia})`,
  borderRadius: "12px",
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: "1.1rem",
  textTransform: "none",
  boxShadow: `0 4px 16px ${colors.fuschia}4d`,
  color: colors.white,
  "&:hover": {
    background: `linear-gradient(135deg, ${colors.fuschia}cc, ${colors.lightFuschia}cc)`,
    boxShadow: `0 6px 20px ${colors.fuschia}66`,
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    background: `linear-gradient(135deg, ${colors.fuschia}80, ${colors.lightFuschia}80)`,
    cursor: "not-allowed",
  },
}));

const Register = () => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedNom = nom.trim();
    const trimmedPrenom = prenom.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedNom || trimmedNom.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères");
      return false;
    }
    if (!trimmedPrenom || trimmedPrenom.length < 2) {
      setError("Le prénom doit contenir au moins 2 caractères");
      return false;
    }
    if (!trimmedEmail) {
      setError("L'email est requis");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Veuillez entrer un email valide");
      return false;
    }
    if (!trimmedPassword) {
      setError("Le mot de passe est requis");
      return false;
    }
    if (trimmedPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        password: password.trim(),
        rememberMe,
      });
      navigate("/login");
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError("Veuillez vérifier vos informations");
            break;
          case 409:
            setError("Cet email est déjà utilisé");
            break;
          case 500:
            setError("Erreur serveur, veuillez réessayer plus tard");
            break;
          default:
            setError(err.response.data.message || "Une erreur s'est produite");
        }
      } else {
        setError("Impossible de se connecter au serveur");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.lightNavy})`,
        display: "flex",
        alignItems: "center",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.fuschia}1a 1px, transparent 1px),
            linear-gradient(90deg, ${colors.fuschia}1a 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 60,
          right: 30,
          width: 100,
          height: 100,
          background: `linear-gradient(135deg, ${colors.fuschia}, ${colors.lightFuschia})`,
          borderRadius: "50%",
          opacity: 0.15,
          animation: `${floatingAnimation} 4s ease-in-out infinite`,
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            py: 5,
            gap: { xs: 4, md: 2 },
          }}
        >
          {/* Image Section */}
          <Box
            sx={{
              flex: { md: "0 0 50%", lg: "0 0 45%", xl: "0 0 40%" },
              maxWidth: { md: "50%", lg: "45%", xl: "40%" },
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
              alt="Phone illustration"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Box>

          {/* Form Section */}
          <Box
            sx={{
              flex: { md: "0 0 45%", lg: "0 0 35%", xl: "0 0 30%" },
              maxWidth: { xs: "100%", md: "45%", lg: "35%", xl: "30%" },
              mx: { xs: "auto", xl: 2 },
            }}
          >
            <Fade in timeout={800}>
              <RegisterCard elevation={0}>
                <Stack spacing={3} alignItems="center">
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: colors.white,
                      textAlign: "center",
                      fontSize: { xs: "1.6rem", md: "2rem" },
                    }}
                  >
                    Créer votre compte
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ width: "100%" }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    name="nom"
                    label="Nom"
                    variant="outlined"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={20} color={colors.fuschia} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: `${colors.fuschia}4d` },
                        "&:hover fieldset": { borderColor: colors.fuschia },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.fuschia,
                        },
                        borderRadius: "8px",
                        color: colors.white,
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: `${colors.white}b3`,
                        "&.Mui-focused": { color: colors.fuschia },
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputBase-input": { color: colors.white },
                      mb: 2,
                    }}
                  />

                  <TextField
                    name="prenom"
                    label="Prénom"
                    variant="outlined"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={20} color={colors.fuschia} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: `${colors.fuschia}4d` },
                        "&:hover fieldset": { borderColor: colors.fuschia },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.fuschia,
                        },
                        borderRadius: "8px",
                        color: colors.white,
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: `${colors.white}b3`,
                        "&.Mui-focused": { color: colors.fuschia },
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputBase-input": { color: colors.white },
                      mb: 2,
                    }}
                  />

                  <TextField
                    name="email"
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={20} color={colors.fuschia} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: `${colors.fuschia}4d` },
                        "&:hover fieldset": { borderColor: colors.fuschia },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.fuschia,
                        },
                        borderRadius: "8px",
                        color: colors.white,
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: `${colors.white}b3`,
                        "&.Mui-focused": { color: colors.fuschia },
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputBase-input": { color: colors.white },
                      mb: 2,
                    }}
                  />

                  <TextField
                    name="password"
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} color={colors.fuschia} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: `${colors.white}b3` }}
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: `${colors.fuschia}4d` },
                        "&:hover fieldset": { borderColor: colors.fuschia },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.fuschia,
                        },
                        borderRadius: "8px",
                        color: colors.white,
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: `${colors.white}b3`,
                        "&.Mui-focused": { color: colors.fuschia },
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputBase-input": { color: colors.white },
                      mb: 2,
                    }}
                  />

                  <TextField
                    name="confirmPassword"
                    label="Confirmer mot de passe"
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} color={colors.fuschia} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            sx={{ color: `${colors.white}b3` }}
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: `${colors.fuschia}4d` },
                        "&:hover fieldset": { borderColor: colors.fuschia },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.fuschia,
                        },
                        borderRadius: "8px",
                        color: colors.white,
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: `${colors.white}b3`,
                        "&.Mui-focused": { color: colors.fuschia },
                        fontSize: "1.1rem",
                      },
                      "& .MuiInputBase-input": { color: colors.white },
                      mb: 2,
                    }}
                  />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ width: "100%", mb: 2 }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{
                            color: `${colors.fuschia}80`,
                            "&.Mui-checked": { color: colors.fuschia },
                          }}
                        />
                      }
                      label="Se souvenir de moi"
                      sx={{ color: colors.white }}
                    />
                    <Typography
                      component={Link}
                      to="/forgot-password"
                      sx={{
                        color: colors.lightFuschia,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                        "&:hover": {
                          color: colors.fuschia,
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Mot de passe oublié ?
                    </Typography>
                  </Stack>

                  <StyledButton
                    type="submit"
                    variant="contained"
                    onClick={handleSubmit}
                    fullWidth
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress
                        size={20}
                        sx={{ color: colors.white }}
                      />
                    ) : (
                      "S'inscrire"
                    )}
                  </StyledButton>

                  <Typography
                    component={Link}
                    to="/login"
                    sx={{
                      color: colors.lightFuschia,
                      fontSize: "0.9rem",
                      textDecoration: "none",
                      textAlign: "center",
                      "&:hover": {
                        color: colors.fuschia,
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Déjà un compte ? Se connecter
                  </Typography>
                </Stack>
              </RegisterCard>
            </Fade>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;