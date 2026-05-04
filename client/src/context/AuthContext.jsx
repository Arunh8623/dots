import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — verify stored token
  useEffect(() => {
    getMe()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const loginUser = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  const logoutUser = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);