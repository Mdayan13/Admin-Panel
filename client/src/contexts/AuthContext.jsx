import React, { createContext, useState, useEffect } from 'react';
import { login, register, logout, getCurrentUser, verifyToken } from '../services/authService';

// Create the Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global error handling function
  const handleError = (err) => {
    setError(err.message || 'An unexpected error occurred.');
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        await verifyToken(); // Check if the token is valid
        const user = getCurrentUser();
        if (user) {
          updateCurrentUser(user);
        }
      } catch {
        // Token is invalid or not present
        // In this case, we just leave the currentUser as null
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
  }, []);

  const updateCurrentUser = (user) => {
    setCurrentUser(user);
  };


    initAuth();
  }, []);

  // Login function
  const handleLogin = async (username, password) => {
    setLoading(true);
    handleError(null); // Clear previous errors

    try {
      let userData = await login(username, password);
      updateCurrentUser(userData);
      return userData;
    } catch (err) {
      handleError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const handleRegister = async (username, password) => {
    setLoading(true);
    handleError(null); // Clear previous errors

    try {
      let userData = await register(username, password);
      updateCurrentUser(userData);

      return userData;
    } catch (err) {
      handleError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }
  
  // Logout function
  const handleLogout = async () => {
    setLoading(true);
    handleError(null); // Clear previous errors

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

  // Context value
  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};