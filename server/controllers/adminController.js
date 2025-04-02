const User = require('../models/User');
const ReferralCode = require('../models/ReferralCode');
const Key = require('../models/Key');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

// Get all users (rebranders)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'rebrander' }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user details by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, balance } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    
    // If balance is being modified, create a transaction record
    if (balance !== undefined && balance !== user.balance) {
      const transaction = new Transaction({
        user: user._id,
        amount: balance - user.balance,
        type: balance > user.balance ? 'credit' : 'debit',
        description: 'Balance adjusted by admin',
      });
      
      await transaction.save();
      user.balance = balance;
    }
    
    await user.save();
    
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user's keys, transactions, and referral codes
    await Key.deleteMany({ createdBy: user._id });
    await Transaction.deleteMany({ user: user._id });
    await ReferralCode.deleteMany({ createdBy: user._id });
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Generate referral code
exports.generateReferralCode = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount. Amount must be positive.' });
    }
    
    // Generate a unique referral code
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    const referralCode = new ReferralCode({
      code,
      amount,
      createdBy: req.user._id,
    });
    
    await referralCode.save();
    
    res.status(201).json({ 
      message: 'Referral code generated successfully', 
      referralCode 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating referral code', error: error.message });
  }
};

// Get all referral codes
exports.getAllReferralCodes = async (req, res) => {
  try {
    const referralCodes = await ReferralCode.find()
      .populate('createdBy', 'username')
      .populate('redeemedBy', 'username');
    
    res.status(200).json(referralCodes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referral codes', error: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments({ role: 'rebrander' });
    
    // Count active users (who have generated at least one key)
    const activeUsers = await User.countDocuments({
      role: 'rebrander',
      $expr: { $gt: [{ $size: "$keys" }, 0] }
    });
    
    // Get total keys generated
    const totalKeys = await Key.countDocuments();
    
    // Get active keys (not expired)
    const activeKeys = await Key.countDocuments({
      expiresAt: { $gt: new Date() }
    });
    
    // Calculate total revenue (sum of all key prices)
    const revenue = await Key.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username');
      
    res.status(200).json({
      totalUsers,
      activeUsers,
      totalKeys,
      activeKeys,
      revenue: revenue.length > 0 ? revenue[0].total : 0,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
};