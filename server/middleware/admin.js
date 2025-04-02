const ErrorResponse = require('../utils/errorTypes');

/**
 * Check if user is admin
 */
exports.isAdmin = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(
      new ErrorResponse('Not authorized as admin to access this route', 403)
    );
  }
};