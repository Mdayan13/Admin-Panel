const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  keyCode: {
    type: String,
    required: true,
    unique: true
  },
  duration: {
    type: String,
    required: true
  },
  durationHours: {
    type: Number,
    required: true
  },
  deviceLimit: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  devices: [{
    deviceId: String,
    lastLogin: Date
  }]
}, {
  timestamps: true
});

// Index for finding a user's keys
keySchema.index({ userId: 1, isActive: 1 });
// Index for expiration queries
keySchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Key', keySchema);