// PasswordReset.jsx - Formulaire de réinitialisation de mot de passe
import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // Assumer React Router pour le token dans l'URL
import { colors, gradients } from "../../utils/colors";
const PasswordReset = () => {
  const { token } = useParams(); // Token de reset depuis l'URL (ex. /reset/:token)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      // Appel API exemple pour reset
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setMessage('Mot de passe réinitialisé avec succès.');
      } else {
        setError('Token invalide ou expiré');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Réinitialiser le mot de passe</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Nouveau mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
        />
      </div>
      <div>
        <label>Confirmer :</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
        />
      </div>
      <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white' }}>
        Réinitialiser
      </button>
      <p>
        <a href="/login">Retour à la connexion</a>
      </p>
    </form>
  );
};

export default PasswordReset;