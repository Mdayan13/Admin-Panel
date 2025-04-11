const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['KEY_GENERATION', 'REFERRAL_REDEMPTION', 'ADMIN_ADJUSTMENT'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    keyGeneratedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Key'
    },
    referralCodeId: {
       type: mongoose.Schema.Types.ObjectId,
      ref: 'ReferralCode'
    },
    notes: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);