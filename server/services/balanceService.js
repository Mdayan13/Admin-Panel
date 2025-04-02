/**
 * Balance Service
 * Handles management of user balances, referral codes, and transactions
 */
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ReferralCode = require('../models/ReferralCode');
const analyticsService = require('./analyticsService');
const crypto = require('crypto');

/**
 * Generate a unique referral code
 * @param {number} length - Length of the code
 * @returns {string} - Generated referral code
 */
const generateReferralCode = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

/**
 * Create a new referral code that can be redeemed by users
 * @param {number} amount - Amount to add to user's balance when redeemed
 * @param {number} usageLimit - Maximum number of times the code can be used
 * @param {Date} [expiresAt] - Optional expiration date
 * @returns {Promise<Object>} - Created referral code
 */
const createReferralCode = async (amount, usageLimit = 1, expiresAt = null) => {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    
    // Generate unique code
    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = generateReferralCode();
      const existing = await ReferralCode.findOne({ code });
      isUnique = !existing;
    }
    
    const referralCode = new ReferralCode({
      code,
      amount,
      usageLimit,
      usesRemaining: usageLimit,
      expiresAt: expiresAt || undefined
    });
    
    return await referralCode.save();
  } catch (error) {
    console.error('Error creating referral code:', error);
    throw error;
  }
};

/**
 * Redeem a referral code to add balance to a user's account
 * @param {string} userId - ID of the user redeeming the code
 * @param {string} referralCode - The code to redeem
 * @returns {Promise<Object>} - Transaction record
 */
const redeemReferralCode = async (userId, referralCode) => {
  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Find referral code
    const code = await ReferralCode.findOne({ code: referralCode });
    if (!code) {
      throw new Error('Invalid referral code');
    }
    
    // Check if code is valid
    if (code.usesRemaining <= 0) {
      throw new Error('Referral code has been fully redeemed');
    }
    
    const now = new Date();
    if (code.expiresAt && code.expiresAt < now) {
      throw new Error('Referral code has expired');
    }
    
    // Check if user has already used this code
    const existingTransaction = await Transaction.findOne({
      user: userId,
      type: 'REFERRAL_REDEMPTION',
      'metadata.referralCode': referralCode
    });
    
    if (existingTransaction) {
      throw new Error('You have already redeemed this code');
    }
    
    // Update user balance
    user.balance += code.amount;
    await user.save();
    
    // Update referral code usage
    code.usesRemaining -= 1;
    await code.save();
    
    // Record transaction
    const transaction = new Transaction({
      user: userId,
      amount: code.amount,
      type: 'REFERRAL_REDEMPTION',
      description: `Redeemed referral code ${referralCode}`,
      metadata: {
        referralCode: referralCode
      }
    });
    
    await transaction.save();
    
    // Track analytics
    await analyticsService.trackReferralRedemption(userId, referralCode, code.amount);
    
    return {
      transaction,
      newBalance: user.balance
    };
  } catch (error) {
    console.error('Error redeeming referral code:', error);
    throw error;
  }
};

/**
 * Add balance directly to a user (admin function)
 * @param {string} userId - ID of the user
 * @param {number} amount - Amount to add
 * @param {string} reason - Reason for adding balance
 * @returns {Promise<Object>} - Transaction record
 */
const addBalance = async (userId, amount, reason) => {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update user balance
    user.balance += amount;
    await user.save();
    
    // Record transaction
    const transaction = new Transaction({
      user: userId,
      amount: amount,
      type: 'MANUAL_DEPOSIT',
      description: reason || 'Manual balance addition by admin'
    });
    
    await transaction.save();
    
    return {
      transaction,
      newBalance: user.balance
    };
  } catch (error) {
    console.error('Error adding balance:', error);
    throw error;
  }
};

/**
 * Get transaction history for a user
 * @param {string} userId - ID of the user
 * @param {Object} filters - Optional filters (transaction type, date range)
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} - Transactions and count
 */
const getTransactionHistory = async (userId, filters = {}, pagination = { page: 1, limit: 20 }) => {
  try {
    const query = { user: userId };
    
    // Apply filters
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    // Calculate pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Transaction.countDocuments(query);
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
};

/**
 * Get all active referral codes (admin function)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of active referral codes
 */
const getActiveReferralCodes = async (filters = {}) => {
  try {
    const query = { usesRemaining: { $gt: 0 } };
    
    // Apply filters
    if (filters.expiresAfter) {
      query.expiresAt = { $gt: new Date(filters.expiresAfter) };
    }
    
    if (filters.minAmount) {
      query.amount = { $gte: filters.minAmount };
    }
    
    const referralCodes = await ReferralCode.find(query).sort({ createdAt: -1 });
    return referralCodes;
  } catch (error) {
    console.error('Error getting active referral codes:', error);
    throw error;
  }
};

module.exports = {
  createReferralCode,
  redeemReferralCode,
  addBalance,
  getTransactionHistory,
  getActiveReferralCodes
};