/**
 * Server-side validation utilities
 * Used for validating incoming requests
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  return {
    isValid,
    message: isValid ? null : 'Invalid email format'
  };

};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with status and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }  // Check for at least one uppercase, one lowercase, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  const isValid = passwordRegex.test(password);
  return {
    isValid,
    message: isValid ? null : 'Password must include at least one uppercase character, one lowercase character, and one number'
  };
};

  /**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result with status and message
 */
const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters long'
    };
  }
  
  // Check if username contains only alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate registration input
 * @param {Object} userData - User registration data
 * @returns {Object} - Validation errors if any
 */
const validateRegistration = (userData) => {
  const errors = {};
  
  // Validate username
  const usernameValidation = validateUsername(userData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.message;
  }
  
  // Validate password
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login input
 * @param {Object} credentials - Login credentials
 * @returns {Object} - Validation errors if any
 */
const validateLogin = (credentials) => {
  const errors = {};
  
  if (!credentials.username) {
    errors.username = 'Username is required';
  }
  
  if (!credentials.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate key generation parameters
 * @param {Object} keyParams - Key generation parameters
 * @returns {Object} - Validation errors if any
 */
const validateKeyGeneration = (keyParams) => {
  const errors = {};
  const validDurations = [
    '1hour', '6hours', '12hours', '1day',
    '3days', '7days', '15days', '30days', '60days'
  ];
  
  if (!keyParams.duration || !validDurations.includes(keyParams.duration)) {
    errors.duration = 'Invalid duration selected';
  }
  
  if (
    !keyParams.deviceLimit || 
    isNaN(keyParams.deviceLimit) || 
    keyParams.deviceLimit < 1 || 
    keyParams.deviceLimit > 10
  ) {
    errors.deviceLimit = 'Device limit must be between 1 and 10';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate referral code format
 * @param {string} code - Referral code to validate
 * @returns {object} - Object with isValid (boolean) and message (string)
 */
const isValidReferralCode = (code) => {
  // Referral codes should be 8-12 characters alphanumeric
  const referralCodeRegex = /^[A-Z0-9]{8,12}$/;
  const isValid = referralCodeRegex.test(code);
  return {
    isValid,
    message: isValid ? null : 'Referral code must be 8-12 alphanumeric characters'
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateUsername,
  validateRegistration,
  validateLogin,
  validateKeyGeneration,
  isValidReferralCode
};