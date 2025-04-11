/**
 * Analytics Service
 * Handles tracking and reporting of key usage, sales, and user activity
 */// Analytics Service
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Key = require('../models/Key');
const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorTypes');

/**
 * Track a new key generation event
 * @param {string} userId - ID of the user generating the key
 * @param {string} keyId - ID of the generated key
 * @param {number} duration - Duration of the key in hours
 * @param {number} cost - Cost deducted from user balance
 * @returns {Promise<Object>} - Created analytics record
 */
const trackKeyGeneration = async (userId, keyId, duration, cost) => {
  try {
    const analytics = new Analytics({
      eventType: 'KEY_GENERATION',
      user: userId,
      keyGeneratedId: keyId,
      metadata: {
        duration,
        cost
      }
    });

    return await analytics.save();
  } catch (error) {    throw new ErrorResponse('Error tracking key generation', 500);
    console.error('Error tracking key generation:', error); // Log the error for debugging
    throw error;
  }
};

/**
 * Track a key usage event (when a client uses the key to authenticate)
 * @param {string} keyId - ID of the key being used
 * @param {string} deviceId - ID of the device using the key
 * @returns {Promise<Object>} - Created analytics record
 */
const trackKeyUsage = async (keyId, deviceId) => {
  try {
    const key = await Key.findById(keyId);
    if (!key) {
      throw new ErrorResponse('Key not found', 404);
    }

    const analytics = new Analytics({
      eventType: 'KEY_USAGE',
      keyGeneratedId: keyId,
      user: key.generatedBy,
      metadata: {
        deviceId,
        remainingUses: key.remainingUses
      }
    });
    
    return await analytics.save();
  } catch (error) {
    console.error('Error tracking key usage:', error); // Log the error for debugging
    throw new ErrorResponse('Error tracking key usage', 500);
  }
};

/**
 * Track a referral code redemption
 * @param {string} userId - ID of the user redeeming the code
 * @param {string} referralCode - The referral code
 * @param {number} amount - Amount added to user balance
 * @returns {Promise<Object>} - Created analytics record
 */
const trackReferralRedemption = async (userId, referralCode, amount) => {
  try {
    const analytics = new Analytics({
      eventType: 'REFERRAL_REDEMPTION',
      user: userId,
      metadata: {
        referralCode,
        amount
      }
    });

    return await analytics.save();
  } catch (error) {    throw new ErrorResponse('Error tracking referral redemption', 500);
    console.error('Error tracking referral redemption:', error); // Log the error for debugging
    throw error;
  }
};

/**
 * Get key generation statistics for a specific period
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @param {string} [userId] - Optional user ID to filter by
 * @returns {Promise<Object>} - Statistics object
 */
const getKeyGenerationStats = async (startDate, endDate, userId = null) => {
  try {
    const match = {
      eventType: 'KEY_GENERATION',
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      match.user = userId;
    }

    const stats = await Analytics.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalKeys: { $sum: 1 },
          totalRevenue: { $sum: '$metadata.cost' },
          averageDuration: { $avg: '$metadata.duration' }
        }
      },
      {
        $project: {
          _id: 0,
          totalKeys: 1,
          totalRevenue: 1,
          averageDuration: 1
        }
      }
    ]);

    return stats[0] || { totalKeys: 0, totalRevenue: 0, averageDuration: 0 };
  } catch (error) {    throw new ErrorResponse('Error getting key generation stats', 500);
    console.error('Error getting key generation stats:', error); // Log the error for debugging
    throw error;
  }
};

/**
 * Get key usage statistics for a specific period
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @param {string} [userId] - Optional user ID to filter by
 * @returns {Promise<Object>} - Statistics object
 */
const getKeyUsageStats = async (startDate, endDate, userId = null) => {
  try {
    const match = {
      eventType: 'KEY_USAGE',
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      match.user = userId;
    }

    const stats = await Analytics.aggregate([
      { $match: match },
      {
        $group: {
          _id: { keyId: '$key' },
          usageCount: { $sum: 1 },          throw new ErrorResponse('Error getting key usage stats', 500);
          uniqueDevices: { $addToSet: '$metadata.deviceId' }
        }
      },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usageCount' },
          uniqueKeysUsed: { $sum: 1 },
          averageUsagePerKey: { $avg: '$usageCount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalUsage: 1,
          uniqueKeysUsed: 1,
          averageUsagePerKey: 1
        }
      }
    ]);

    return stats[0] || { totalUsage: 0, uniqueKeysUsed: 0, averageUsagePerKey: 0 };
  } catch (error) {    throw new ErrorResponse('Error getting key usage stats', 500);
    console.error('Error getting key usage stats:', error); // Log the error for debugging
    throw error;
  }
};

/**
 * Get top users by revenue generated (key sales) for a specific period
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @param {number} limit - Maximum number of users to return
 * @returns {Promise<Array>} - Array of top users with their stats
 */
const getTopUsersByRevenue = async (startDate, endDate, limit = 10) => {
  try {
    const topUsers = await Analytics.aggregate([
      {
        $match: {
          eventType: 'KEY_GENERATION',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$user',
          totalRevenue: { $sum: '$metadata.cost' },
          keysGenerated: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: { $arrayElemAt: ['$userDetails.username', 0] },
          totalRevenue: 1,
          keysGenerated: 1
        }
      }
    ]);

    return topUsers;
  } catch (error) {    throw new ErrorResponse('Error getting top users by revenue', 500);
    console.error('Error getting top users by revenue:', error); // Log the error for debugging
    throw error;
  }
};

/**
 * Get daily analytics for dashboard charts
 * @param {number} days - Number of past days to include
 * @param {string} [userId] - Optional user ID to filter by
 * @returns {Promise<Object>} - Daily statistics
 */
const getDailyAnalytics = async (days = 30, userId = null) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const match = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      match.user = userId;
    }

    const dailyStats = await Analytics.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            eventType: '$eventType'
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$eventType', 'KEY_GENERATION'] },
                '$metadata.cost',
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.date': 1 } },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              type: '$_id.eventType',
              count: '$count',
              revenue: '$revenue'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          events: 1
        }
      }
    ]);

    return dailyStats;
  } catch (error) {    throw new ErrorResponse('Error getting daily analytics', 500);
    console.error('Error getting daily analytics:', error); // Log the error for debugging
    throw error;
  }
};

module.exports = {
  trackKeyGeneration,
  trackKeyUsage,
  trackReferralRedemption,
  getKeyGenerationStats,
  getKeyUsageStats,
  getTopUsersByRevenue,
  getDailyAnalytics
};