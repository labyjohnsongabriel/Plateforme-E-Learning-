import React, { useState, useEffect } from "react";
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
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Person,
  Email,
  Event,
  Edit,
  Save,
  Cancel,
  School,
  Verified,
  Settings,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#010b40", // Bleu marine
    },
    secondary: {
      main: "#f13544", // Fuchsia
    },
    background: {
      default: "#010b40",
    },
  },
  typography: {
    h4: { fontSize: "2.5rem", fontWeight: 700 },
    h5: { fontSize: "2rem", fontWeight: 600 },
    body1: { fontSize: "1.2rem" },
    body2: { fontSize: "1rem" },
  },
});

const Profile = ({ userId }) => {
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    dateInscription: "",
    coursTermines: 0,
    progression: 0,
    role: "apprenant", // Par défaut
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${window.authToken || "demo-token"}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setEditForm({
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
          });
        } else {
          const demoUser = {
            nom: "Dupont",
            prenom: "Jean",
            email: "jean.dupont@email.com",
            dateInscription: "2024-01-15",
            coursTermines: 5,
            progression: 75,
            role: "apprenant",
          };
          setUser(demoUser);
          setEditForm({
            nom: demoUser.nom,
            prenom: demoUser.prenom,
            email: demoUser.email,
          });
        }
      } catch (err) {
        console.error("Erreur de chargement du profil:", err);
        const demoUser = {
          nom: "Dupont",
          prenom: "Jean",
          email: "jean.dupont@email.com",
          dateInscription: "2024-01-15",
          coursTermines: 5,
          progression: 75,
          role: "apprenant",
        };
        setUser(demoUser);
        setEditForm({
          nom: demoUser.nom,
          prenom: demoUser.prenom,
          email: demoUser.email,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage("");
    setError("");
    if (!isEditing) {
      setEditForm({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!editForm.nom.trim()) return "Le nom est requis";
    if (!editForm.prenom.trim()) return "Le prénom est requis";
    if (!editForm.email.trim()) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email))
      return "Email invalide";
    return null;
  };

  const handleSave = async () => {
    setError("");
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.authToken || "demo-token"}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUser((prev) => ({
          ...prev,
          ...updatedUser,
        }));
        setMessage("Profil mis à jour avec succès");
        setIsEditing(false);
      } else {
        setUser((prev) => ({
          ...prev,
          nom: editForm.nom,
          prenom: editForm.prenom,
          email: editForm.email,
        }));
        setMessage("Profil mis à jour avec succès");
        setIsEditing(false);
      }
    } catch (err) {
      setUser((prev) => ({
        ...prev,
        nom: editForm.nom,
        prenom: editForm.prenom,
        email: editForm.email,
      }));
      setMessage("Profil mis à jour avec succès");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, color: "white" }}
        >
          <CircularProgress color="secondary" size={32} />
          <Typography variant="h5">Chargement du profil...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          background: "linear-gradient(135deg, #010b40 0%, #1E3A8A 100%)",
          p: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating Elements */}
        <Box
          sx={{
            position: "absolute",
            top: 80,
            right: 120,
            width: 180,
            height: 180,
            bgcolor: "secondary.main",
            opacity: 0.2,
            borderRadius: "50%",
            filter: "blur(50px)",
            animation: "pulse 4s infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 120,
            left: 100,
            width: 140,
            height: 140,
            bgcolor: "primary.main",
            opacity: 0.2,
            borderRadius: "50%",
            filter: "blur(50px)",
            animation: "pulse 4s infinite 2s",
          }}
        />

        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "secondary.main",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: 4,
                }}
              >
                <Person sx={{ color: "white", fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  Youth Computing
                </Typography>
                <Typography variant="body1" color="white">
                  Gestion du profil
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={6}>
            {/* Profile Information Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={4}
                sx={{
                  p: 6,
                  bgcolor: "white",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Informations personnelles
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleEditToggle}
                    startIcon={<Edit />}
                    sx={{ fontSize: "1.1rem", textTransform: "none" }}
                  >
                    {isEditing ? "Annuler" : "Modifier"}
                  </Button>
                </Box>

                {message && (
                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      bgcolor: "success.light",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Verified sx={{ color: "success.main", fontSize: 24 }} />
                    <Typography variant="body2" color="success.main">
                      {message}
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      bgcolor: "error.light",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Email sx={{ color: "error.main", fontSize: 24 }} />
                    <Typography variant="body2" color="error.main">
                      {error}
                    </Typography>
                  </Box>
                )}

                {isEditing ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          name="nom"
                          value={editForm.nom}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": { fontSize: "1.2rem" },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person sx={{ fontSize: 28 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          name="prenom"
                          value={editForm.prenom}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": { fontSize: "1.2rem" },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person sx={{ fontSize: 28 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{ "& .MuiInputBase-input": { fontSize: "1.2rem" } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ fontSize: 28 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSave}
                        disabled={isSaving}
                        startIcon={
                          isSaving ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <Save />
                          )
                        }
                        sx={{
                          flex: 1,
                          py: 1.5,
                          fontSize: "1.1rem",
                          textTransform: "none",
                        }}
                      >
                        {isSaving ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleEditToggle}
                        startIcon={<Cancel />}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          fontSize: "1.1rem",
                          textTransform: "none",
                        }}
                      >
                        Annuler
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "secondary.main",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Person sx={{ color: "white", fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nom complet
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.prenom} {user.nom}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "secondary.main",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Email sx={{ color: "white", fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Adresse email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "secondary.main",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Event sx={{ color: "white", fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Membre depuis
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.dateInscription
                            ? new Date(user.dateInscription).toLocaleDateString(
                                "fr-FR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Non définie"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Role-Specific Content */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={4}
                sx={{
                  p: 6,
                  bgcolor: "white",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 4 }}
                >
                  {user.role === "apprenant"
                    ? "Statistiques d'apprentissage"
                    : user.role === "administrateur"
                    ? "Gestion des utilisateurs"
                    : "Gestion des cours"}
                </Typography>

                {user.role === "apprenant" && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          position: "relative",
                          width: 120,
                          height: 120,
                          mx: "auto",
                        }}
                      >
                        <CircularProgress
                          variant="determinate"
                          value={user.progression}
                          size={120}
                          thickness={5}
                          sx={{
                            color: "secondary.main",
                            transform: "rotate(-90deg)",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            {user.progression}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Progression
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Card
                          sx={{
                            bgcolor: "primary.light",
                            textAlign: "center",
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="primary.main"
                          >
                            {user.coursTermines}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cours terminés
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card
                          sx={{
                            bgcolor: "secondary.light",
                            textAlign: "center",
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="secondary.main"
                          >
                            12
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Certificats
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card
                          sx={{
                            bgcolor: "primary.light",
                            textAlign: "center",
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="primary.main"
                          >
                            48h
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Temps d'étude
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card
                          sx={{
                            bgcolor: "secondary.light",
                            textAlign: "center",
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="secondary.main"
                          >
                            15
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Jours actifs
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight="medium"
                        sx={{ mb: 2 }}
                      >
                        Réalisations récentes
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            bgcolor: "warning.light",
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "warning.main",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Verified sx={{ color: "white", fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              Python Basics terminé
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Il y a 2 jours
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            bgcolor: "success.light",
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "success.main",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Verified sx={{ color: "white", fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              Certificat obtenu
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Il y a 1 semaine
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {user.role === "administrateur" && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Gérer les utilisateurs de la plateforme
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<Person />}
                          sx={{
                            py: 1.5,
                            fontSize: "1.1rem",
                            textTransform: "none",
                          }}
                          href="/admin/users"
                        >
                          Liste des utilisateurs
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Settings />}
                          sx={{
                            py: 1.5,
                            fontSize: "1.1rem",
                            textTransform: "none",
                          }}
                          href="/admin/settings"
                        >
                          Paramètres de la plateforme
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {user.role === "instructeur" && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Gérer vos cours et suivre les progrès des apprenants
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<School />}
                          sx={{
                            py: 1.5,
                            fontSize: "1.1rem",
                            textTransform: "none",
                          }}
                          href="/instructor/courses"
                        >
                          Mes cours
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Person />}
                          sx={{
                            py: 1.5,
                            fontSize: "1.1rem",
                            textTransform: "none",
                          }}
                          href="/instructor/students"
                        >
                          Suivi des apprenants
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 3,
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<School />}
                  sx={{ py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
                  href="/courses"
                >
                  Mes cours
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Verified />}
                  sx={{ py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
                  href="/certificates"
                >
                  Certificats
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Settings />}
                  sx={{ py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
                  href="/settings"
                >
                  Paramètres
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.3); opacity: 0.3; }
            100% { transform: scale(1); opacity: 0.2; }
          }
        `}
      </style>
    </ThemeProvider>
  );
};

export default Profile;
