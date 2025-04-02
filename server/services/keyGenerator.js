// server/services/keyGenerationService.js

const Key = require('../models/Key');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Define pricing tiers (in rupees)
const PRICING_TIERS = {
  '1hour': 5,
  '6hours': 10,
  '12hours': 20,
  '1day': 50,
  '3days': 100,
  '7days': 200,
  '15days': 400,
  '30days': 700,
  '60days': 1000
};

// Define duration in milliseconds for each tier
const DURATIONS = {
  '1hour': 60 * 60 * 1000,
  '6hours': 6 * 60 * 60 * 1000,
  '12hours': 12 * 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
  '3days': 3 * 24 * 60 * 60 * 1000,
  '7days': 7 * 24 * 60 * 60 * 1000,
  '15days': 15 * 24 * 60 * 60 * 1000,
  '30days': 30 * 24 * 60 * 60 * 1000,
  '60days': 60 * 24 * 60 * 60 * 1000
};

class KeyGenerationService {
  /**
   * Generate a new key for app access
   * @param {string} userId - User ID generating the key
   * @param {string} tierName - Pricing tier name (e.g., '1hour', '7days')
   * @param {number} deviceLimit - Maximum number of devices allowed
   * @returns {Promise<Object>} Generated key and transaction
   */
  static async generateKey(userId, tierName, deviceLimit = 1) {
    // Validate tier name
    if (!PRICING_TIERS[tierName]) {
      throw new Error(`Invalid tier: ${tierName}`);
    }
    
    // Validate device limit
    if (deviceLimit < 1 || deviceLimit > 10) {
      throw new Error('Device limit must be between 1 and 10');
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get price for the selected tier
      const price = PRICING_TIERS[tierName];
      
      // Find the user
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user has enough balance
      if (user.balance < price) {
        throw new Error('Insufficient balance');
      }
      
      // Calculate expiration date
      const expiresAt = new Date(Date.now() + DURATIONS[tierName]);
      
      // Generate unique key (16 characters)
      const keyString = crypto.randomBytes(8).toString('hex').toUpperCase();
      
      // Create key in database
      const key = new Key({
        key: keyString,
        userId,
        tierName,
        price,
        deviceLimit,
        expiresAt,
        isActive: true,
        activatedDevices: []
      });
      
      await key.save({ session });
      
      // Deduct balance from user account
      const newBalance = user.balance - price;
      await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: -price } },
        { session }
      );
      
      // Create transaction record
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount: price,
        description: `Generated ${tierName} key`,
        referenceId: key._id,
        balanceAfter: newBalance
      });
      
      await transaction.save({ session });
      
      await session.commitTransaction();
      
      return { key, transaction, newBalance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Validate a key for app access
   * @param {string} keyString - The key to validate
   * @param {string} deviceId - Unique identifier for the device
   * @returns {Promise<Object>} Validation result with key details
   */
  static async validateKey(keyString, deviceId) {
    // Find the key
    const key = await Key.findOne({ key: keyString, isActive: true });
    
    if (!key) {
      return { valid: false, message: 'Invalid or inactive key' };
    }
    
    // Check if key has expired
    if (new Date() > key.expiresAt) {
      key.isActive = false;
      await key.save();
      return { valid: false, message: 'Key has expired' };
    }
    
    // Check if device is already activated
    const deviceIndex = key.activatedDevices.findIndex(
      device => device.deviceId === deviceId
    );
    
    if (deviceIndex >= 0) {
      // Device already registered, update last access time
      key.activatedDevices[deviceIndex].lastAccessAt = new Date();
      await key.save();
      
      return { 
        valid: true,
        expiresAt: key.expiresAt,
        tierName: key.tierName,
        message: 'Key validated successfully'
      };
    }
    
    // Check if device limit reached
    if (key.activatedDevices.length >= key.deviceLimit) {
      return { 
        valid: false, 
        message: `Device limit reached (${key.deviceLimit} devices)` 
      };
    }
    
    // Add new device
    key.activatedDevices.push({
      deviceId,
      activatedAt: new Date(),
      lastAccessAt: new Date()
    });
    
    await key.save();
    
    return { 
      valid: true,
      expiresAt: key.expiresAt,
      tierName: key.tierName,
      message: 'Key validated and device registered successfully'
    };
  }
  
  /**
   * Get all keys generated by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of keys
   */
  static async getUserKeys(userId) {
    return Key.find({ userId })
      .sort({ createdAt: -1 });
  }
  
  /**
   * Get active (non-expired) keys for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of active keys
   */
  static async getActiveUserKeys(userId) {
    return Key.find({ 
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
  }
  
  /**
   * Get detailed information about a specific key
   * @param {string} userId - User ID (for authorization)
   * @param {string} keyId - Key ID to retrieve
   * @returns {Promise<Object>} Key details
   */
  static async getKeyDetails(userId, keyId) {
    const key = await Key.findById(keyId);
    
    if (!key) {
      throw new Error('Key not found');
    }
    
    // Check if user owns this key or is admin
    const user = await User.findById(userId);
    if (key.userId.toString() !== userId && user.role !== 'admin') {
      throw new Error('Unauthorized: You do not have access to this key');
    }
    
    return key;
  }
  
  /**
   * Get pricing tiers information
   * @returns {Object} Pricing tiers
   */
  static getPricingTiers() {
    return PRICING_TIERS;
  }
}

module.exports = KeyGenerationService;