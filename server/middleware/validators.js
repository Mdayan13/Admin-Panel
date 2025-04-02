const { body, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorTypes');

/**
 * Process validation results
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

/**
 * Validate registration input
 */
exports.validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  validateResults
];

/**
 * Validate login input
 */
exports.validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validateResults
];

/**
 * Validate key generation input
 */
exports.validateKeyGeneration = [
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isIn(['1hour', '6hours', '12hours', '1day', '3days', '7days', '15days', '30days', '60days'])
    .withMessage('Invalid duration'),
  
  body('deviceLimit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Device limit must be between 1 and 10'),
  
  validateResults
];