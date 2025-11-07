// Contact.jsx - Page de contact professionnelle
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Stack,
  TextField,
  Button,
  Chip,
  Alert,
  Fade,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock,
  Globe,
  MessageCircle,
  CheckCircle 
} from "lucide-react";

// Animations avancées
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

const slideInRight = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(40px) rotate(2deg);
  }
  to { 
    opacity: 1; 
    transform: translateX(0) rotate(0);
  }
`;

const pulseGlow = keyframes`
  0% { 
    box-shadow: 0 0 0 0 rgba(241, 53, 68, 0.4);
  }
  70% { 
    box-shadow: 0 0 0 15px rgba(241, 53, 68, 0);
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(241, 53, 68, 0);
  }
`;

const float = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  33% { 
    transform: translateY(-10px) rotate(1deg); 
  }
  66% { 
    transform: translateY(5px) rotate(-1deg); 
  }
`;

// Palette de couleurs professionnelle
const colors = {
  navy: "#010b40",
  darkNavy: "#00072D",
  lightNavy: "#1a237e",
  electricBlue: "#0066FF",
  red: "#f13544",
  pink: "#ff6b74",
  purple: "#8b5cf6",
  cyan: "#00D4FF",
  white: "#ffffff",
  gradientPrimary: "linear-gradient(135deg, #010b40 0%, #1a237e 100%)",
  gradientAccent: "linear-gradient(135deg, #f13544 0%, #ff6b74 100%)",
  gradientCyber: "linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)",
};

// Composants stylisés
const HeroSection = styled(Box)({
  animation: `${fadeInUp} 1s ease-out forwards`,
  textAlign: "center",
});

const FormCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${colors.navy}dd, ${colors.darkNavy}ee)`,
  backdropFilter: "blur(25px)",
  border: `1px solid ${colors.electricBlue}33`,
  borderRadius: "28px",
  animation: `${slideInRight} 0.8s ease-out 0.2s forwards`,
  opacity: 0,
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: colors.gradientAccent,
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.01)",
    boxShadow: `0 25px 60px ${colors.navy}80`,
    border: `1px solid ${colors.electricBlue}66`,
  },
}));

const ContactInfoCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${colors.navy}dd, ${colors.darkNavy}ee)`,
  backdropFilter: "blur(25px)",
  border: `1px solid ${colors.purple}33`,
  borderRadius: "28px",
  animation: `${slideInRight} 0.8s ease-out 0.4s forwards`,
  opacity: 0,
  transition: "all 0.4s ease",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: colors.gradientCyber,
  },
}));

const FloatingElement = styled(Box)({
  position: "absolute",
  background: colors.gradientCyber,
  borderRadius: "50%",
  opacity: 0.1,
  animation: `${float} 6s ease-in-out infinite`,
  filter: "blur(20px)",
});

const SubmitButton = styled(Button)(({ isSubmitted }) => ({
  background: isSubmitted 
    ? `${colors.electricBlue}` 
    : colors.gradientAccent,
  padding: "16px 32px",
  borderRadius: "16px",
  fontWeight: 700,
  fontSize: "1.1rem",
  textTransform: "none",
  transition: "all 0.3s ease",
  animation: isSubmitted ? `${pulseGlow} 2s infinite` : "none",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `0 15px 35px ${colors.red}80`,
    background: colors.gradientAccent,
  },
  "& .MuiButton-startIcon": {
    transition: "transform 0.3s ease",
  },
  "&:hover .MuiButton-startIcon": {
    transform: "translateX(4px)",
  },
}));

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (!formData.subject.trim()) newErrors.subject = "Le sujet est requis";
    if (!formData.message.trim()) newErrors.message = "Le message est requis";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulation d'envoi
      console.log("Formulaire soumis:", formData);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 4000);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "contact@youthcomputing.org",
      description: "Réponse sous 24h",
      color: colors.red
    },
    {
      icon: Phone,
      label: "Téléphone",
      value: "+254 712 345 678",
      description: "Lun-Ven • 9h-18h",
      color: colors.electricBlue
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: "Nairobi, Kenya",
      description: "Siège social",
      color: colors.purple
    },
    {
      icon: Clock,
      label: "Support",
      value: "24/7 Disponible",
      description: "Chat en direct",
      color: colors.cyan
    }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: colors.gradientPrimary,
        position: "relative",
        overflow: "hidden",
        pt: 10,
      }}
    >
      {/* Éléments de fond animés */}
      <FloatingElement sx={{ top: "10%", left: "5%", width: 120, height: 120, animationDelay: "0s" }} />
      <FloatingElement sx={{ top: "60%", right: "10%", width: 80, height: 80, animationDelay: "2s" }} />
      <FloatingElement sx={{ bottom: "20%", left: "15%", width: 100, height: 100, animationDelay: "4s" }} />
      
      {/* Grille géométrique de fond */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, ${colors.electricBlue}15 2px, transparent 0),
            radial-gradient(circle at 75% 75%, ${colors.red}10 2px, transparent 0)
          `,
          backgroundSize: "60px 60px, 80px 80px",
          opacity: 0.4,
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 10, py: 8 }}>
        {/* Section Hero */}
        <HeroSection sx={{ mb: 10 }}>
          <Chip 
            icon={<MessageCircle size={16} />}
            label="Contactez-nous"
            sx={{
              background: colors.gradientAccent,
              color: colors.white,
              fontWeight: 600,
              mb: 3,
              px: 2,
              py: 1,
              fontSize: "0.9rem",
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem", lg: "5rem" },
              fontWeight: 800,
              background: colors.gradientCyber,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
              mb: 3,
            }}
          >
            Parlons de votre projet
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              color: "rgba(255, 255, 255, 0.8)",
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Notre équipe d'experts est prête à vous accompagner dans votre transformation numérique. 
            Discutons de vos objectifs et trouvons ensemble les meilleures solutions.
          </Typography>
        </HeroSection>

        <Grid container spacing={4} alignItems="stretch">
          {/* Formulaire de contact */}
          <Grid item xs={12} lg={7}>
            <FormCard sx={{ p: { xs: 3, md: 5 }, height: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <Send color={colors.red} size={32} />
                <Typography variant="h4" sx={{ color: colors.white, fontWeight: 700 }}>
                  Envoyez-nous un message
                </Typography>
              </Stack>

              {isSubmitted && (
                <Fade in={isSubmitted}>
                  <Alert 
                    icon={<CheckCircle size={24} />}
                    severity="success"
                    sx={{
                      mb: 3,
                      background: `${colors.electricBlue}20`,
                      color: colors.white,
                      border: `1px solid ${colors.electricBlue}40`,
                      borderRadius: "12px",
                    }}
                  >
                    Votre message a été envoyé avec succès ! Nous vous répondons dans les 24h.
                  </Alert>
                </Fade>
              )}

              <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="name"
                      label="Nom complet"
                      variant="outlined"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { 
                            borderColor: `${colors.electricBlue}40`,
                            borderRadius: "12px",
                          },
                          "&:hover fieldset": { 
                            borderColor: colors.electricBlue,
                          },
                          "&.Mui-focused fieldset": { 
                            borderColor: colors.electricBlue,
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                        "& .MuiInputBase-input": { 
                          color: colors.white,
                          padding: "14px 16px",
                        },
                        "& .MuiFormHelperText-root": {
                          color: colors.red,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      label="Adresse email"
                      type="email"
                      variant="outlined"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { 
                            borderColor: `${colors.electricBlue}40`,
                            borderRadius: "12px",
                          },
                          "&:hover fieldset": { 
                            borderColor: colors.electricBlue,
                          },
                          "&.Mui-focused fieldset": { 
                            borderColor: colors.electricBlue,
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                        "& .MuiInputBase-input": { 
                          color: colors.white,
                          padding: "14px 16px",
                        },
                        "& .MuiFormHelperText-root": {
                          color: colors.red,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  name="subject"
                  label="Sujet du message"
                  variant="outlined"
                  value={formData.subject}
                  onChange={handleChange}
                  error={!!errors.subject}
                  helperText={errors.subject}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { 
                        borderColor: `${colors.electricBlue}40`,
                        borderRadius: "12px",
                      },
                      "&:hover fieldset": { 
                        borderColor: colors.electricBlue,
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: colors.electricBlue,
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input": { 
                      color: colors.white,
                      padding: "14px 16px",
                    },
                  }}
                />

                <TextField
                  name="message"
                  label="Votre message"
                  variant="outlined"
                  value={formData.message}
                  onChange={handleChange}
                  error={!!errors.message}
                  helperText={errors.message}
                  multiline
                  rows={5}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { 
                        borderColor: `${colors.electricBlue}40`,
                        borderRadius: "12px",
                      },
                      "&:hover fieldset": { 
                        borderColor: colors.electricBlue,
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: colors.electricBlue,
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input": { 
                      color: colors.white,
                    },
                  }}
                />

                <SubmitButton
                  type="submit"
                  isSubmitted={isSubmitted}
                  startIcon={isSubmitted ? <CheckCircle size={24} /> : <Send size={24} />}
                  fullWidth
                  size="large"
                >
                  {isSubmitted ? "Message envoyé !" : "Envoyer le message"}
                </SubmitButton>
              </Stack>
            </FormCard>
          </Grid>

          {/* Informations de contact */}
          <Grid item xs={12} lg={5}>
            <ContactInfoCard sx={{ p: { xs: 3, md: 5 }, height: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <Globe color={colors.cyan} size={32} />
                <Typography variant="h4" sx={{ color: colors.white, fontWeight: 700 }}>
                  Nos coordonnées
                </Typography>
              </Stack>

              <Stack spacing={4}>
                {contactMethods.map((method, index) => (
                  <Box
                    key={method.label}
                    sx={{
                      animation: `${fadeInUp} 0.6s ease-out ${0.6 + index * 0.1}s forwards`,
                      opacity: 0,
                    }}
                  >
                    <Stack 
                      direction="row" 
                      spacing={3} 
                      sx={{ 
                        p: 3,
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "16px",
                        border: `1px solid ${method.color}20`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.08)",
                          transform: "translateX(8px)",
                          border: `1px solid ${method.color}40`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 50,
                          height: 50,
                          background: `linear-gradient(135deg, ${method.color}20, ${method.color}10)`,
                          borderRadius: "12px",
                          border: `1px solid ${method.color}30`,
                        }}
                      >
                        <method.icon color={method.color} size={24} />
                      </Box>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: colors.white, 
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        >
                          {method.label}
                        </Typography>
                        <Typography 
                          sx={{ 
                            color: colors.white, 
                            fontSize: "1.1rem",
                            mb: 0.5,
                          }}
                        >
                          {method.value}
                        </Typography>
                        <Typography 
                          sx={{ 
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {method.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              {/* Section réseaux sociaux */}
              <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${colors.electricBlue}20` }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: colors.white, 
                    mb: 3,
                    fontWeight: 600,
                  }}
                >
                  Suivez-nous
                </Typography>
                <Stack direction="row" spacing={2}>
                  {["LinkedIn", "Twitter", "GitHub", "Instagram"].map((social) => (
                    <Chip
                      key={social}
                      label={social}
                      variant="outlined"
                      sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          background: colors.electricBlue,
                          color: colors.white,
                          borderColor: colors.electricBlue,
                        },
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </ContactInfoCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;