// frontend/src/pages/Unauthorized.jsx
import React from "react";
import { Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Typography variant="h4" color="error">
        Accès non autorisé
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        sx={{ mt: 2 }}
      >
        Retour à l'accueil
      </Button>
    </div>
  );
};

export default Unauthorized;