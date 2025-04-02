const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ReferralCode = require('../models/ReferralCode');
const Key = require('../models/Key'); // Make sure to require the Key model

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('balance username createdAt');
    const recentTransactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    const activeKeys = await Key.countDocuments({ 
      user: req.user.id, 
      expiresAt: { $gt: Date.now() } 
    });

    res.json({
      user,
      recentTransactions,
      activeKeys
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Generate a new key
exports.generateKey = async (req, res) => {
  try {
    const { duration, maxDevices } = req.body;
    const user = await User.findById(req.user.id);

    // Calculate cost based on duration (implement your pricing logic)
    const cost = calculateKeyCost(duration); 

    if (user.balance < cost) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
      // Deduct from balance
      user.balance -= cost;
      await user.save({ session });

      // Create key
      const newKey = new Key({
        user: user._id,
        key: generateUniqueKey(), // Implement your key generation logic
        expiresAt: new Date(Date.now() + duration * 3600000), // Convert hours to ms
        maxDevices,
        isActive: true
      });
      await newKey.save({ session });

      // Record transaction
      const transaction = new Transaction({
        user: user._id,
        type: 'debit',
        amount: cost,
        description: `Key generation for ${duration} hours`,
        referenceId: newKey._id,
        balanceAfter: user.balance
      });
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({
        success: true,
        key: newKey.key,
        expiresAt: newKey.expiresAt,
        balance: user.balance
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all keys for user
exports.getUserKeys = async (req, res) => {
  try {
    const keys = await Key.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(keys);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get specific key details
exports.getKeyDetails = async (req, res) => {
  try {
    const key = await Key.findOne({
      _id: req.params.keyId,
      user: req.user.id
    });
    
    if (!key) {
      return res.status(404).json({ msg: 'Key not found' });
    }

    res.json(key);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get referral history
exports.getReferralHistory = async (req, res) => {
  try {
    const referrals = await ReferralCode.find({ usedBy: req.user.id })
      .sort({ usedAt: -1 });
    res.json(referrals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Helper functions (implement these according to your needs)
function calculateKeyCost(duration) {
  // Implement your pricing logic here
  // Example: return duration * 10; // ₹10 per hour
}

function generateUniqueKey() {
  // Implement your key generation logic
  // Example: return crypto.randomBytes(16).toString('hex');
}