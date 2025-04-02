import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Custom hook for handling API requests with loading, error states, and token refresh
 * @param {string} url - The API endpoint to fetch from
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {boolean} immediate - Whether to fetch immediately on mount
 */
const useFetch = (url, options = {}, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Execute the fetch request
  const fetchData = useCallback(async (customUrl = url, customOptions = {}) => {
    const fetchUrl = customUrl || url;
    const fetchOptions = { ...options, ...customOptions };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.request({
        url: fetchUrl,
        ...fetchOptions
      });
      
      setData(response.data);
      return response.data;
    } catch (err) {
      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        navigate('/login');
      }
      
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options, navigate]);

  // Execute fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  // Method to manually reset states
  const reset = () => {
    setData(null);
    setLoading(false);
    setError(null);
  };

  return { data, loading, error, fetchData, reset };
};

export default useFetch;