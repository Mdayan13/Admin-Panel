const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorTypes');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Protect routes - Authentication middleware
 */
exports.protect = async (req, res, next) => {
  let token;

  try {
    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from Bearer token
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from database
    req.user = await User.findById(decoded.id);

    // Check if user exists
    if (!req.user) {
      return next(new ErrorResponse('User not found', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};
