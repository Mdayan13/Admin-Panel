// client/src/services/api.js
import axios from 'axios';
import { handleRedirect } from '../utils/handleRedirect';
import { localStorageHelper } from './authService';
// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for session management
});

// Request interceptor to attach auth token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorageHelper('getItem', 'token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      localStorageHelper('removeItem', 'token');
      // Redirect to login page
      handleRedirect({ role: 'guest' });
    }
    return Promise.reject(error);
  }
);

export default api;