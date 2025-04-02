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
        
        // Redirect based on user role
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
        return { success: true };
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return { success: false, error: err.message };
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
        navigate('/user/dashboard');
        return { success: true };
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      return { success: false, error: err.message };
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