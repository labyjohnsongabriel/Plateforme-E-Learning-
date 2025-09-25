// Login.jsx - Page de connexion
import React, { useState } from 'react';
//import { colors } from '../../styles/colors';

const Login = ({ theme = 'light' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        window.location.href = '/student/dashboard';
      } else {
        setError('Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', padding: '32px', borderRadius: '8px', background: theme === 'dark' ? colors.backgroundDark : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: theme === 'dark' ? colors.textDark : colors.textLight }}>Connexion</h2>
        {error && <p style={{ color: colors.error }}>{error}</p>}
        <div>
          <label>Email :</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        </div>
        <div>
          <label>Mot de passe :</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: colors.primary, color: 'white' }}>Se connecter</button>
        <p><a href="/forgot-password" style={{ color: colors.secondary }}>Mot de passe oublié ?</a></p>
        <p>Pas de compte ? <a href="/register" style={{ color: colors.secondary }}>S'inscrire</a></p>
      </form>
    </div>
  );
};

export default Login;