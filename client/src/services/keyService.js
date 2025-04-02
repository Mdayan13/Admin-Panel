// client/src/services/keyService.js
import api from './api';

// Key management services
const keyService = {
  // Generate a new key
  generateKey: async (keyOptions) => {
    try {
      const response = await api.post('/keys/generate', keyOptions);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get all keys for the current user
  getUserKeys: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/keys/my-keys?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get single key details
  getKeyDetails: async (keyId) => {
    try {
      const response = await api.get(`/keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get key pricing options
  getKeyPricing: async () => {
    try {
      const response = await api.get('/keys/pricing');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Deactivate a key
  deactivateKey: async (keyId) => {
    try {
      const response = await api.put(`/keys/${keyId}/deactivate`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Verify a key's validity (used by your app)
  verifyKey: async (keyValue, deviceId) => {
    try {
      const response = await api.post('/keys/verify', { key: keyValue, deviceId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // For admin: Get all keys in the system
  getAllKeys: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      }).toString();
      
      const response = await api.get(`/admin/keys?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  }
};

export default keyService;