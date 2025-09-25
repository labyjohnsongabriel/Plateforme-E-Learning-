// useAuth.js - Hook d'authentification
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    // À implémenter : clear token
  };

  return { user, login, logout };
};