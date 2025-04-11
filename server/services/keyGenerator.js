// server/services/keyGenerationService.js

const Key = require('../models/Key');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Pricing tiers (in rupees) from environment variables, default values provided
const pricingTiers = {
  '1hour': parseInt(process.env.PRICE_1HOUR || '5', 10),
  '6hours': parseInt(process.env.PRICE_6HOURS || '10', 10),
  '12hours': parseInt(process.env.PRICE_12HOURS || '20', 10),
  '1day': parseInt(process.env.PRICE_1DAY || '50', 10),
  '3days': parseInt(process.env.PRICE_3DAYS || '100', 10),
  '7days': parseInt(process.env.PRICE_7DAYS || '200', 10),
  '15days': parseInt(process.env.PRICE_15DAYS || '400', 10),
  '30days': parseInt(process.env.PRICE_30DAYS || '700', 10),
  '60days': parseInt(process.env.PRICE_60DAYS || '1000', 10),
};

// Durations in milliseconds from environment variables, default values provided
const durations = {
  '1hour': parseInt(process.env.DURATION_1HOUR || '3600000', 10), // 1 hour
  '6hours': parseInt(process.env.DURATION_6HOURS || '21600000', 10), // 6 hours
  '12hours': parseInt(process.env.DURATION_12HOURS || '43200000', 10), // 12 hours
  '1day': parseInt(process.env.DURATION_1DAY || '86400000', 10), // 1 day
  '3days': parseInt(process.env.DURATION_3DAYS || '259200000', 10), // 3 days
  '7days': parseInt(process.env.DURATION_7DAYS || '604800000', 10), // 7 days
  '15days': parseInt(process.env.DURATION_15DAYS || '1296000000', 10), // 15 days
  '30days': parseInt(process.env.DURATION_30DAYS || '2592000000', 10), // 30 days
  '60days': parseInt(process.env.DURATION_60DAYS || '5184000000', 10), // 60 days
};

class KeyService {
  /**
   * Generate a new key for app access
   * @param {string} userId   - User ID generating the key
   * @param {string} tierName - Pricing tier name (e.g., '1hour', '7days')
   * @param {number} deviceLimit - Maximum number of devices allowed
   * @returns {Promise<Object>} Generated key and transaction
   */
  static async generateKey(userId, tierName, deviceLimit = 1) {
    // Validate tier name
    if (!pricingTiers[tierName]) {
      throw new Error(`Invalid tier: ${tierName}`);
    }

    // Validate device limit
    if (deviceLimit < 1 || deviceLimit > 10) {
      throw new Error('Device limit must be between 1 and 10');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the price for the selected tier
      const price = pricingTiers[tierName];

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
      const expiresAt = new Date(Date.now() + durations[tierName]);

      // Generate unique key (16 characters)
      const keyString = crypto.randomBytes(8).toString('hex').toUpperCase();

      // Create key in database
      const key = new Key({
        keyCode: keyString,
        userId,
        tierName,
        price,
        deviceLimit,
        expiresAt,
        isActive: true,
        devices: []
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
        balanceAfter: newBalance,
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
   * @param {string} keyCode - The key to validate
   * @param {string} deviceId - Unique identifier for the device
   * @returns {Promise<Object>} Validation result with key details
   */
  static async validateKey(keyCode, deviceId) {
    // Find the key
    const key = await Key.findOne({ keyCode, isActive: true });

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
    const deviceIndex = key.devices.findIndex(
      (device) => device.deviceId === deviceId
    );

    if (deviceIndex !== -1) {
      // Device already registered, update last access time
      key.devices[deviceIndex].lastLogin = new Date();
      await key.save();

      return this.validationResult(true, key.expiresAt, key.tierName, 'Key validated successfully');
    }

    // Check if device limit reached
    if (key.devices.length >= key.deviceLimit) {
      return this.validationResult(false, null, null, `Device limit reached (${key.deviceLimit} devices)`);
    }

    // Add new device
    key.devices.push({
      deviceId,
      lastLogin: new Date(),
    });

    await key.save();

    return this.validationResult(true, key.expiresAt, key.tierName, 'Key validated and device registered successfully');
  }

  /**
   * Helper function to create a consistent validation result
   * @param {boolean} valid
   * @param {Date|null} expiresAt
   * @param {string|null} tierName
   * @param {string} message
   * @returns {{valid: boolean, expiresAt: Date|null, tierName: string|null, message: string}}
   */
  static validationResult(valid, expiresAt, tierName, message) {
    return {
        valid,
        expiresAt,
        tierName,
        message,
      };
    }

  /**
   * Get all keys generated by a user
   * Deactivate a key
   * @param {string} keyId - The ID of the key to deactivate
   * @param {string} userId - The ID of the user attempting to deactivate the key
   * @returns {Promise<Object>} The deactivated key
   */
  static async deactivateKey(keyId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const key = await Key.findById(keyId).session(session);

      if (!key || key.userId.toString() !== userId) {
        throw new Error('Key not found or unauthorized');
      }

      key.isActive = false;
      const deactivatedKey = await key.save({ session });

      await session.commitTransaction();
      return deactivatedKey;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all keys generated by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of keys
   */
  static async getUserKeys(userId) {
    return Key.find({ userId })
      .sort({ updatedAt: -1 });
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
    }).sort({ updatedAt: -1 }); // Assuming you want to sort by creation or update time
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
    return pricingTiers;
  }
}

module.exports = KeyService;
  return {
        valid: true,
        expiresAt: key.expiresAt,
        tierName: key.tierName,
        message: 'Key validated successfully',
      };
    }
