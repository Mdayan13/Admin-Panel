// server/services/analyticsService.js

const User = require('../models/User');
const Key = require('../models/Key');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

/**
 * Get overall analytics summary for the admin dashboard
 * @returns {Promise<Object>} Analytics summary data
 */
const getAnalyticsSummary = async () => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total admin count
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get active keys count (not expired)
    const activeKeys = await Key.countDocuments({ 
      expiresAt: { $gt: new Date() }
    });
    
    // Get total keys generated
    const totalKeys = await Key.countDocuments();
    
    // Get total revenue from transactions
    const revenueResult = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get recent activity (last 5 transactions)
    const recentActivity = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username')
      .lean();
    
    return {
      totalUsers,
      totalAdmins,
      activeKeys,
      totalKeys,
      totalRevenue,
      recentActivity
    };
  } catch (error) {
    console.error('Error in getAnalyticsSummary:', error);
    throw new Error('Failed to fetch analytics summary');
  }
};

/**
 * Get key generation statistics by time period
 * @param {String} period - Time period for stats (day, week, month, year)
 * @returns {Promise<Array>} Key generation data
 */
const getKeyGenerationStats = async (period = 'week') => {
  try {
    let groupBy, dateFormat, lookbackDays;
    
    // Configure grouping based on the period
    switch (period) {
      case 'day':
        groupBy = { $hour: "$createdAt" };
        dateFormat = "%H:00";
        lookbackDays = 1;
        break;
      case 'week':
        groupBy = { $dayOfWeek: "$createdAt" };
        dateFormat = "%a"; // Abbreviated day name
        lookbackDays = 7;
        break;
      case 'month':
        groupBy = { $dayOfMonth: "$createdAt" };
        dateFormat = "%d";
        lookbackDays = 30;
        break;
      case 'year':
        groupBy = { $month: "$createdAt" };
        dateFormat = "%b"; // Abbreviated month name
        lookbackDays = 365;
        break;
      default:
        groupBy = { $dayOfWeek: "$createdAt" };
        dateFormat = "%a";
        lookbackDays = 7;
    }
    
    // Calculate the start date based on lookback period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);
    
    // Get key generation data grouped by the specified period
    const stats = await Key.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          date: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          period: "$_id",
          label: { $dateToString: { format: dateFormat, date: "$date" } },
          count: 1
        }
      },
      {
        $sort: { period: 1 }
      }
    ]);
    
    return stats;
  } catch (error) {
    console.error('Error in getKeyGenerationStats:', error);
    throw new Error('Failed to fetch key generation statistics');
  }
};

/**
 * Get user growth data over time
 * @param {String} timeframe - Timeframe for data (week, month, year)
 * @returns {Promise<Array>} User growth data
 */
const getUserGrowthData = async (timeframe = 'month') => {
  try {
    let groupBy, dateFormat, lookbackDays;
    
    // Configure grouping based on the timeframe
    switch (timeframe) {
      case 'week':
        groupBy = { $dayOfWeek: "$createdAt" };
        dateFormat = "%a"; // Abbreviated day name
        lookbackDays = 7;
        break;
      case 'month':
        groupBy = { $dayOfMonth: "$createdAt" };
        dateFormat = "%d";
        lookbackDays = 30;
        break;
      case 'year':
        groupBy = { $month: "$createdAt" };
        dateFormat = "%b"; // Abbreviated month name
        lookbackDays = 365;
        break;
      default:
        groupBy = { $dayOfMonth: "$createdAt" };
        dateFormat = "%d";
        lookbackDays = 30;
    }
    
    // Calculate the start date based on lookback period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);
    
    // Get new user registrations grouped by the specified timeframe
    const newUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          role: 'user'
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          date: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          period: "$_id",
          label: { $dateToString: { format: dateFormat, date: "$date" } },
          newUsers: "$count"
        }
      },
      {
        $sort: { period: 1 }
      }
    ]);
    
    // Calculate cumulative user growth
    let runningTotal = 0;
    const userGrowthData = newUsers.map(item => {
      runningTotal += item.newUsers;
      return {
        ...item,
        totalUsers: runningTotal
      };
    });
    
    return userGrowthData;
  } catch (error) {
    console.error('Error in getUserGrowthData:', error);
    throw new Error('Failed to fetch user growth data');
  }
};

/**
 * Get revenue data over time
 * @param {String} timeframe - Timeframe for data (week, month, year)
 * @returns {Promise<Array>} Revenue data
 */
const getRevenueData = async (timeframe = 'month') => {
  try {
    let groupBy, dateFormat, lookbackDays;
    
    // Configure grouping based on the timeframe
    switch (timeframe) {
      case 'week':
        groupBy = { $dayOfWeek: "$createdAt" };
        dateFormat = "%a"; // Abbreviated day name
        lookbackDays = 7;
        break;
      case 'month':
        groupBy = { $dayOfMonth: "$createdAt" };
        dateFormat = "%d";
        lookbackDays = 30;
        break;
      case 'year':
        groupBy = { $month: "$createdAt" };
        dateFormat = "%b"; // Abbreviated month name
        lookbackDays = 365;
        break;
      default:
        groupBy = { $dayOfMonth: "$createdAt" };
        dateFormat = "%d";
        lookbackDays = 30;
    }
    
    // Calculate the start date based on lookback period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);
    
    // Get revenue data grouped by the specified timeframe
    const revenueData = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          type: 'credit' // Only include positive transactions (income)
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$amount" },
          date: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          period: "$_id",
          label: { $dateToString: { format: dateFormat, date: "$date" } },
          revenue: 1
        }
      },
      {
        $sort: { period: 1 }
      }
    ]);
    
    return revenueData;
  } catch (error) {
    console.error('Error in getRevenueData:', error);
    throw new Error('Failed to fetch revenue data');
  }
};

module.exports = {
  getAnalyticsSummary,
  getKeyGenerationStats,
  getUserGrowthData,
  getRevenueData
};