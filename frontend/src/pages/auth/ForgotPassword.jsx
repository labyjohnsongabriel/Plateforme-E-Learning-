// ForgotPassword.jsx - Page mot de passe oublié
import React, { useState } from 'react';
//import { colors } from '../../styles/colors';

const ForgotPassword = ({ theme = 'light' }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', padding: '32px', borderRadius: '8px', background: theme === 'dark' ? colors.backgroundDark : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: theme === 'dark' ? colors.textDark : colors.textLight }}>Mot de passe oublié</h2>
        {message && <p style={{ color: colors.success }}>{message}</p>}
        {error && <p style={{ color: colors.error }}>{error}</p>}
        <div>
          <label>Email :</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: colors.secondary, color: 'white' }}>Envoyer le lien</button>
        <p><a href="/login" style={{ color: colors.secondary }}>Retour à la connexion</a></p>
      </form>
    </div>
  );
};

export default ForgotPassword;