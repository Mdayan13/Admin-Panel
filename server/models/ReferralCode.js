const mongoose = require('mongoose');

const referralCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  redeemedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('ReferralCode', referralCodeSchema);
