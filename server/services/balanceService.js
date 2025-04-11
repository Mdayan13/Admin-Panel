/**
 * Balance Service
 * Handles management of user balances, referral codes, and transactions
 */
const { User, Transaction, ReferralCode } = require('../models'); // Import the Transaction model
const analyticsService = require('./analyticsService');
const ErrorResponse = require('../utils/errorResponse');
const { isValidReferralCode } = require('../utils/validators');

/**
 * Generate a unique referral code
 * @param {number} length - Length of the code
 * @returns {string} - Generated referral code
 * 
 */
const generateReferralCode = async (length = 8) => {
  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }

      const existingCode = await ReferralCode.findOne({ code });
      if (!existingCode) isUnique = true;
    }

    return code;
  } catch (error) {
    throw new ErrorResponse('Error generating referral code', 500);
  }
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
            throw new ErrorResponse('Amount must be greater than zero', 400);
        }

        // Generate unique code
        let code;
        let isUnique = false;

        while (!isUnique) {
            code = await generateReferralCode();
            const existing = await ReferralCode.findOne({ code });
            isUnique = !existing;
        }

        const referralCode = new ReferralCode({
            code,
            amount,
            usageLimit,
            expiresAt: expiresAt || undefined
        });

        await referralCode.save();
        return referralCode;
    } catch (error) {
        console.error('Error creating referral code:', error); // Log the error for debugging
        throw new ErrorResponse('Error creating referral code', 500);
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
      // Validate referral code format
      const validationResult = isValidReferralCode(referralCode);
      if (!validationResult.isValid) {
          throw new ErrorResponse(validationResult.message, 400);
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
          throw new ErrorResponse('User not found', 404);
      }

      // Find referral code
      const code = await ReferralCode.findOne({ code: referralCode });
      if (!code) {
          throw new ErrorResponse('Invalid referral code', 400);
      }

      // Check if the code has reached its usage limit
      if (code.currentUsage >= code.usageLimit) {
          throw new ErrorResponse('Referral code has reached its usage limit', 400);
      }

      // Update user balance and increment usage
      user.balance += code.amount;
      code.currentUsage += 1;

      await Promise.all([user.save(), code.save()]);

      // Record transaction - Assuming Transaction model is correctly set up
      const transaction = await Transaction.create({
          userId: userId,
          type: 'REFERRAL_REDEMPTION',
          amount: code.amount,
          description: `Redeemed referral code ${referralCode}`,
          metadata: { referralCodeId: code._id },
      });

      // Track analytics
      await analyticsService.trackReferralRedemption(userId, referralCode, code.amount);

      return { transaction, newBalance: user.balance };
  } catch (error) {
    console.error('Error redeeming referral code:', error); // Log the error for debugging
    throw error;
  }