// Register.jsx - Page d'inscription
import React, { useState } from 'react';
//import { colors } from '../../styles/colors';

const Register = ({ theme = 'light' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (response.ok) {
        window.location.href = '/login';
      } else {
        setError('Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', padding: '32px', borderRadius: '8px', background: theme === 'dark' ? colors.backgroundDark : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: theme === 'dark' ? colors.textDark : colors.textLight }}>Inscription</h2>
        {error && <p style={{ color: colors.error }}>{error}</p>}
        <div>
          <label>Nom :</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        </div>
        <div>
          <label>Email :</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        </div>
        <div>
          <label>Mot de passe :</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        </div>
        <div>
          <label>Confirmer mot de passe :</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: colors.primary, color: 'white' }}>S'inscrire</button>
        <p>Déjà un compte ? <a href="/login" style={{ color: colors.secondary }}>Se connecter</a></p>
      </form>
    </div>
  );
};

export default Register;