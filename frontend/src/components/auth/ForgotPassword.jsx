// ForgotPassword.jsx - Formulaire pour mot de passe oublié
import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Appel API exemple pour demande de reset
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage('Un email de réinitialisation a été envoyé.');
      } else {
        setError('Email non trouvé');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Mot de passe oublié</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email :</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
        />
      </div>
      <button type="submit" style={{ width: '100%', padding: '10px', background: '#ffc107', color: 'black' }}>
        Envoyer le lien de réinitialisation
      </button>
      <p>
        <a href="/login">Retour à la connexion</a>
      </p>
    </form>
  );
};

export default ForgotPassword;