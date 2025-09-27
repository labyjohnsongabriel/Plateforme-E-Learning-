// Contact.jsx - Page de contact
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
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { Mail, Phone, MapPin, Send } from "lucide-react";

// Animations sophistiquées
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

// Couleurs principales
const colors = {
  navy: "#010b40",
  lightNavy: "#1a237e",
  red: "#f13544",
  pink: "#ff6b74",
  purple: "#8b5cf6",
};

// Styled Components
const AnimatedBox = styled(Box)({
  animation: `${fadeInUp} 0.8s ease-out forwards`,
});

const AnimatedCard = styled(Card)({
  background: `linear-gradient(135deg, ${colors.navy}b3, ${colors.lightNavy}b3)`,
  backdropFilter: "blur(20px)",
  border: `1px solid ${colors.red}33`,
  borderRadius: "24px",
  animation: `${fadeInRight} 0.8s ease-out 0.3s forwards`,
  opacity: 0,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: `0 12px 40px ${colors.navy}4d`,
  },
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission (replace with API call)
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000); // Reset after 3 seconds
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.lightNavy} 100%)`,
        pt: 8,
        overflow: "hidden",
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.red}1a 1px, transparent 1px),
            linear-gradient(90deg, ${colors.red}1a 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 80,
          right: 40,
          width: 128,
          height: 128,
          background: `linear-gradient(to right, ${colors.red}, ${colors.pink})`,
          borderRadius: "50%",
          opacity: 0.1,
          animation: `${floatingAnimation} 3s ease-in-out infinite`,
        }}
      />

      <Container
        maxWidth={false}
        sx={{ position: "relative", zIndex: 10, py: 10, px: { xs: 2, md: 4 } }}
      >
        <Grid container spacing={6}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <AnimatedBox>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "3rem", md: "4.5rem", lg: "5.5rem" },
                  fontWeight: "bold",
                  color: "#ffffff",
                  lineHeight: 1.1,
                  mb: 4,
                }}
              >
                Contactez-nous
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                  color: "rgba(255, 255, 255, 0.7)",
                  maxWidth: 600,
                  mb: 6,
                }}
              >
                Nous sommes ici pour répondre à vos questions et vous
                accompagner dans votre parcours d'apprentissage.
              </Typography>
            </AnimatedBox>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={6}>
            <AnimatedCard sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{ color: "#ffffff", mb: 3, fontSize: "1.4rem" }}
              >
                Envoyez-nous un message
              </Typography>
              <Stack spacing={3}>
                <TextField
                  name="name"
                  label="Nom"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: `${colors.red}4d` },
                      "&:hover fieldset": { borderColor: colors.red },
                      "&.Mui-focused fieldset": { borderColor: colors.red },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input": { color: "#ffffff" },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.red },
                  }}
                />
                <TextField
                  name="email"
                  label="Email"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: `${colors.red}4d` },
                      "&:hover fieldset": { borderColor: colors.red },
                      "&.Mui-focused fieldset": { borderColor: colors.red },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input": { color: "#ffffff" },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.red },
                  }}
                />
                <TextField
                  name="message"
                  label="Message"
                  variant="outlined"
                  value={formData.message}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: `${colors.red}4d` },
                      "&:hover fieldset": { borderColor: colors.red },
                      "&.Mui-focused fieldset": { borderColor: colors.red },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input": { color: "#ffffff" },
                    "& .MuiInputLabel-root.Mui-focused": { color: colors.red },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitted}
                  startIcon={<Send size={24} />}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.red}, ${colors.pink})`,
                    px: 4,
                    py: 2,
                    borderRadius: "16px",
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    textTransform: "none",
                    boxShadow: `0 8px 32px ${colors.red}4d`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 40px ${colors.red}66`,
                    },
                    "&:disabled": { background: `${colors.red}80` },
                  }}
                >
                  {isSubmitted ? "Envoyé!" : "Envoyer"}
                </Button>
              </Stack>
            </AnimatedCard>
          </Grid>

          {/* Contact Details */}
          <Grid item xs={12} md={6}>
            <AnimatedCard sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{ color: "#ffffff", mb: 3, fontSize: "1.4rem" }}
              >
                Informations de contact
              </Typography>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Mail size={28} color={colors.red} />
                  <Typography sx={{ color: "#ffffff", fontSize: "1.1rem" }}>
                    support@youthcomputing.org
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Phone size={28} color={colors.red} />
                  <Typography sx={{ color: "#ffffff", fontSize: "1.1rem" }}>
                    +254 712 345 678
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <MapPin size={28} color={colors.red} />
                  <Typography sx={{ color: "#ffffff", fontSize: "1.1rem" }}>
                    Nairobi, Kenya
                  </Typography>
                </Stack>
              </Stack>
            </AnimatedCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
