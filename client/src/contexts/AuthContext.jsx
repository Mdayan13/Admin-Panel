import React, { createContext, useState, useEffect } from 'react';
import { login, register, logout, checkAuthStatus, isAdmin  } from '../services/authService';

// Create the Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const userData = await checkAuthStatus();
        setCurrentUser(userData);
      } catch (err) {
        console.error('Authentication check failed:', err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const handleLogin = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await login(username, password);
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const handleRegister = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await register(username, password);
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    setLoading(true);

    try {
      await logout();
      setCurrentUser(null);
    } catch (err) {
      setError(err.message || 'Logout failed');
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};