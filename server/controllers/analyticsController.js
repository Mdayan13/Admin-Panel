// server/controllers/analyticsController.js
const { AnalyticsEvent, DailyMetrics } = require('../models/Analytics');
const ErrorResponse = require('../utils/errorTypes');

/**
 * Get system-wide analytics (admin only)
 */
exports.getSystemAnalytics = async (req, res, next) => {
  try {
    const stats = await DailyMetrics.find().sort({ date: -1 }).limit(30);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(new ErrorResponse('Failed to fetch system analytics', 500));
  }
};

/**
 * Get user-specific analytics
 */
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const events = await AnalyticsEvent.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(new ErrorResponse('Failed to fetch user analytics', 500));
  }
};