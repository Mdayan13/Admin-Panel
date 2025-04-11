const User = require('../models/User');
const ErrorResponse = require('../utils/errorTypes');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token (moved from authService)
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
 exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return next(new ErrorResponse('Username already exists', 400));
    }

    // Create new user
    const user = await User.create({
      username,
      password, // Will be hashed in the User model pre-save hook
      role: 'rebrander', // Default role is rebrander
      balance: 0
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
 exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return next(new ErrorResponse('Please provide username and password', 400));
    }

    // Check for user
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
 exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        role: user.role,\
        balance: user.balance
      }
    });
  } catch (error) {
    next(error);
  }
};
