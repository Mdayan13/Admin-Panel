// src/services/adminService.js
import api from './api';

/**
 * Admin service for handling admin-related API calls
 */
const adminService = {
  /**
   * Get all users (rebranders)
   * @returns {Promise} Promise object with user data
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} Promise object with user data
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Update user (rebrander) details
   * @param {string} userId - User ID
   * @param {object} userData - Updated user data
   * @returns {Promise} Promise object with updated user data
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Delete user (rebrander)
   * @param {string} userId - User ID
   * @returns {Promise} Promise object with deletion status
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Generate referral code for a user
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add to user's balance
   * @returns {Promise} Promise object with referral code data
   */
  generateReferralCode: async (userId, amount) => {
    try {
      const response = await api.post('/api/admin/referral-codes', { userId, amount });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Get all generated referral codes
   * @returns {Promise} Promise object with referral codes data
   */
  getAllReferralCodes: async () => {
    try {
      const response = await api.get('/api/admin/referral-codes');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Add balance to user account directly
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add
   * @param {string} reason - Reason for adding balance
   * @returns {Promise} Promise object with updated balance data
   */
  addUserBalance: async (userId, amount, reason) => {
    try {
      const response = await api.post(`/api/admin/users/${userId}/balance`, { 
        amount, 
        reason 
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Get analytics data
   * @param {string} timeframe - Timeframe for analytics (day, week, month)
   * @returns {Promise} Promise object with analytics data
   */
  getAnalytics: async (timeframe = 'week') => {
    try {
      const response = await api.get(`/api/admin/analytics?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Get key generation history
   * @returns {Promise} Promise object with key generation history
   */
  getKeyGenerationHistory: async () => {
    try {
      const response = await api.get('/api/admin/keys');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  }
};

export default adminService;