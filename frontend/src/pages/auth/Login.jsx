import React, { useState, useContext } from "react";
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
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

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
const LoginCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.navy}cc, ${colors.lightNavy}cc)`,
  backdropFilter: "blur(12px)",
  border: `1px solid ${colors.fuschia}33`,
  borderRadius: "16px",
  padding: theme.spacing(4),
  width: "140%", // Adjusted from 150% to prevent overflow
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

const Login = () => {
  const { login, isLoading, error: authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setLocalError("L'email est requis");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setLocalError("Veuillez entrer un email valide");
      return false;
    }
    if (!trimmedPassword) {
      setLocalError("Le mot de passe est requis");
      return false;
    }
    if (trimmedPassword.length < 6) {
      setLocalError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!validateForm()) return;

    try {
      await login(email.trim(), password.trim(), rememberMe);
    } catch (err) {
      console.error("Login failed:", err);
      // Error is handled by AuthContext's Snackbar
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
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

          <Box
            sx={{
              flex: { md: "0 0 45%", lg: "0 0 35%", xl: "0 0 30%" },
              maxWidth: { xs: "100%", md: "45%", lg: "35%", xl: "30%" },
              mx: { xs: "auto", xl: 2 },
            }}
          >
            <Fade in timeout={800}>
              <LoginCard elevation={0}>
                <form onSubmit={handleSubmit}>
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
                      Connexion
                    </Typography>

                    {(localError || authError) && (
                      <Alert severity="error" sx={{ width: "100%" }}>
                        {localError || authError}
                      </Alert>
                    )}

                    <TextField
                      name="email"
                      label="Email"
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
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
                      onKeyDown={handleKeyDown}
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
                      fullWidth
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <CircularProgress
                          size={20}
                          sx={{ color: colors.white }}
                        />
                      ) : (
                        "Se connecter"
                      )}
                    </StyledButton>

                    <Typography
                      component={Link}
                      to="/register"
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
                      Pas de compte ? S'inscrire
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
