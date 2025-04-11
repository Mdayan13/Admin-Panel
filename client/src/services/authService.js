// client/src/services/authService.js
import api from './api';

// Authentication services
const authService = {
  // Helper function to set token in local storage
  localStorageHelper: {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),
    getUser: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('user'),
    getIsAdmin: () => localStorage.getItem('isAdmin') === 'true',
    setIsAdmin: (isAdmin) => localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false'),
    removeIsAdmin: () => localStorage.removeItem('isAdmin'),
  },
  
  // Register a new user
  register: async (userData) => {
    const { setToken, setUser } = authService.localStorageHelper;



    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } 
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
  
  // Login user (can handle both regular and admin logins)
  login: async (credentials, isAdmin = false) => {
    const { setToken, setUser, setIsAdmin } = authService.localStorageHelper;

    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      const response = await api.post(endpoint, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));        
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Logout user
  logout: () => {
    const { removeToken, removeUser, removeIsAdmin } = authService.localStorageHelper;

    removeToken();
    removeUser();
    removeIsAdmin();
  },

  // Get current user from local storage
  getCurrentUser: () => {
    const { getUser, removeUser } = authService.localStorageHelper;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  },

  // Check if user is admin
  isAdmin: () => {
    const { getIsAdmin } = authService.localStorageHelper;

    return getIsAdmin();
  },

  // Check if user is authenticated
  checkAuthStatus: async () => {
    const { getToken } = authService.localStorageHelper;    
    const token = getToken();
    
    if (!token) {
      return false;
    }
    
    try {
      await authService.verifyToken(); // This will throw an error if the token is invalid
      return true;
    } catch {
      return false;
    }
  },

  // Verify token validity
  verifyToken: async () => {
    const { removeToken, removeUser, removeIsAdmin } = authService.localStorageHelper;

    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      // If token verification fails, clear local storage
      removeToken();
      removeUser();
      removeIsAdmin();
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default authService;