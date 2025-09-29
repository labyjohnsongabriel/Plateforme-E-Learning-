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
  Avatar,
  Alert,
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
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Importer le contexte d'authentification
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: { main: "#010b40" }, // Bleu marine
    secondary: { main: "#f13544" }, // Fuchsia
    background: { default: "#010b40" },
    success: { main: "#4CAF50", light: "#E8F5E9" },
    error: { main: "#F44336", light: "#FFEBEE" },
  },
  typography: {
    h4: { fontSize: "2.5rem", fontWeight: 700 },
    h5: { fontSize: "2rem", fontWeight: 600 },
    body1: { fontSize: "1.2rem" },
    body2: { fontSize: "1rem" },
  },
});

const Profile = ({ userId }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    avatar: "",
    dateInscription: "",
    coursTermines: 0,
    progression: 0,
    role: "ETUDIANT",
  });
  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    email: "",
  });
  const [newAvatar, setNewAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      navigate("/login");
      return;
    }

    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const userData = response.data.data;
        setUser({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          avatar: userData.avatar || "",
          dateInscription: userData.createdAt,
          coursTermines: userData.coursTermines || 0, // À récupérer depuis l'API
          progression: userData.progression || 0, // À récupérer depuis l'API
          role: userData.role || "ETUDIANT",
        });
        setEditForm({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
        });
      } catch (err) {
        setError("Erreur lors de la récupération du profil");
        console.error("Erreur de chargement du profil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [authUser, authLoading, navigate, userId]);

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
      setNewAvatar(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setError("Veuillez sélectionner une image JPEG ou PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }
      setNewAvatar(file);
      setError("");
    }
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
      // Mettre à jour les informations du profil
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          nom: editForm.nom,
          prenom: editForm.prenom,
          email: editForm.email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Télécharger l'avatar si sélectionné
      if (newAvatar) {
        const formData = new FormData();
        formData.append("avatar", newAvatar);
        const avatarResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/upload-avatar`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setUser((prev) => ({
          ...prev,
          avatar: avatarResponse.data.data.avatar,
        }));
      }

      // Rafraîchir les données du profil
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const userData = response.data.data;
      setUser({
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        avatar: userData.avatar || "",
        dateInscription: userData.createdAt,
        coursTermines: userData.coursTermines || 0,
        progression: userData.progression || 0,
        role: userData.role || "ETUDIANT",
      });
      setMessage("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la mise à jour du profil"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
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
              <Avatar
                src={user.avatar}
                sx={{
                  width: 80,
                  height: 80,
                  border: `3px solid ${theme.palette.secondary.main}`,
                }}
              >
                {user.prenom[0]}{user.nom[0]}
              </Avatar>
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
                  <Alert severity="success" sx={{ mb: 4 }}>
                    {message}
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                  </Alert>
                )}

                {isEditing ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Avatar
                        src={
                          newAvatar
                            ? URL.createObjectURL(newAvatar)
                            : user.avatar
                        }
                        sx={{
                          width: 100,
                          height: 100,
                          border: `3px solid ${theme.palette.secondary.main}`,
                        }}
                      >
                        {user.prenom[0]}{user.nom[0]}
                      </Avatar>
                    </Box>
                    <Button
                      variant="contained"
                      component="label"
                      color="secondary"
                      sx={{ mb: 2 }}
                    >
                      Changer l'avatar
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleAvatarChange}
                      />
                    </Button>
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
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          border: `2px solid ${theme.palette.secondary.main}`,
                        }}
                      >
                        {user.prenom[0]}{user.nom[0]}
                      </Avatar>
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
                  {user.role === "ETUDIANT"
                    ? "Statistiques d'apprentissage"
                    : user.role === "ADMIN"
                    ? "Gestion des utilisateurs"
                    : "Gestion des cours"}
                </Typography>

                {user.role === "ETUDIANT" && (
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
                            {user.certificats || 0} {/* À récupérer depuis l'API */}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Certificats
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
                        {/* À remplacer par des données dynamiques depuis l'API */}
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
                      </Box>
                    </Box>
                  </Box>
                )}

                {user.role === "ADMIN" && (
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

                {user.role === "INSTRUCTEUR" && (
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