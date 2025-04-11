const mongoose = require('mongoose');

// Event schema for tracking various events
const AnalyticsEventSchema = new mongoose.Schema({
  // User who triggered the event (if any)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
  
  // Type of event
  eventType: {
    type: String,
    required: true,
    enum: [
      'KEY_GENERATED',      // A key was generated
      'KEY_ACTIVATED',      // A key was activated (first use)
      'KEY_VALIDATED',      // A key was validated (subsequent uses)
      'KEY_EXPIRED',        // A key expired
      'REFERRAL_ADDED',     // A referral code was added
      'USER_REGISTERED',    // New user registration
      'USER_LOGIN',         // User login
      'BALANCE_ADDED'       // Balance was added to a user account
    ]
  },
  
  // Timestamp for when the event occurred
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Related object ID (e.g., keyId, userId, etc.)
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  
  // Additional data related to the event
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Daily aggregated metrics
const DailyMetricsSchema = new mongoose.Schema({
  // Date for the metrics (stored as YYYY-MM-DD)
  date: {
    type: String,
    required: true,
    unique: true
  },
  
  // Count of key generations
  keyGenerations: {
    type: Number,
    default: 0
  },
  
  // Count of key activations
  keyActivations: {
    type: Number,
    default: 0
  },
  
  // Count of key validations
  keyValidations: {
    type: Number,
    default: 0
  },
  
  // Count of user registrations
  userRegistrations: {
    type: Number,
    default: 0
  },
  
  // Count of user logins
  userLogins: {
    type: Number,
    default: 0
  },
  
  // Revenue from key generations (in ₹)
  revenue: {
    type: Number,
    default: 0
  },
  
  // Revenue breakdown by duration
  revenueByDuration: {
    type: Map,
    of: Number,
    default: {}
  },
  
  // Active users count
  activeUsers: {
    type: Number,
    default: 0
  },
  
  // Active keys count
  activeKeys: {
    type: Number,
    default: 0
  }
});

// Create indexes for efficient querying
AnalyticsEventSchema.index({ eventType: 1, timestamp: 1 });
AnalyticsEventSchema.index({ userId: 1, eventType: 1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
const DailyMetrics = mongoose.model('DailyMetrics', DailyMetricsSchema);

module.exports = {
  AnalyticsEvent,
  DailyMetrics
};