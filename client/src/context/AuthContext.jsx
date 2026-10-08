import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('interviewace_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Auth token expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('interviewace_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('interviewace_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const updateUser = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const logout = () => {
    localStorage.removeItem('interviewace_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
