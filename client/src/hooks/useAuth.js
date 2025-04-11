import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { login, logout, register, checkAuthStatus } from '../services/authService';

/**
 * Custom hook for authentication functionality
 * Provides methods for login, logout, registration and accessing auth state
 */
const useAuth = () => {
  const { user, setUser, isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin, loading, setLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Global error handling function
    const handleError = (operation, error) => {
        const message = error.response?.data?.message || error.message || `${operation} failed. Please try again.`;
        setError(message);
        return { success: false, error: message };
    };

    // Handle redirection based on user role
    const handleRedirect = (user) => {
        const path = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        navigate(path);
    };
  // Check if user is already logged in on initial load

  useEffect(() => {
    const verifyAuth = async () => {
      setLoading(true);
      try {
        const response = await checkAuthStatus();
        if (response.success) {
          setUser(response.user);
          setIsAuthenticated(true);
          setIsAdmin(response.user.role === 'admin');
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [setUser, setIsAuthenticated, setIsAdmin, setLoading]);

  // Handle user login
  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsAdmin(response.user.role === 'admin');
        handleRedirect(response.user);
        return { success: true };
      }
    } catch (err) {
      return handleError('Login', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle user registration
  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register(userData);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsAdmin(false); // New users are never admins
        handleRedirect(response.user);
        return { success: true };
      }
    } catch (err) {
      return handleError('Registration', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };
};

export default useAuth;