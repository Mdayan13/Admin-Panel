/**
 * Utility functions for form validation
 */

/**
 * Validate a username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result and message
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: 'Username must be less than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers and underscores' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a password
 * @param {string} password - Password to validate
 * @returns {Object} Validation result and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 50) {
    return { isValid: false, message: 'Password must be less than 50 characters' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a referral code format
 * @param {string} code - Referral code to validate
 * @returns {Object} Validation result and message
 */
export const validateReferralCode = (code) => {
  if (!code || code.trim() === '') {
    return { isValid: false, message: 'Referral code is required' };
  }
  
  if (code.length !== 10) {
    return { isValid: false, message: 'Referral code must be 10 characters long' };
  }
  
  if (!/^[A-Z0-9]+$/.test(code)) {
    return { isValid: false, message: 'Referral code can only contain uppercase letters and numbers' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a numeric input
 * @param {string|number} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result and message
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, required = true } = options;
  const numberValue = Number(value);
  
  if (required && (!value && value !== 0)) {
    return { isValid: false, message: 'This field is required' };
  }
  
  if (value && isNaN(numberValue)) {
    return { isValid: false, message: 'Must be a valid number' };
  }
  
  if (min !== undefined && numberValue < min) {
    return { isValid: false, message: `Must be at least ${min}` };
  }
  
  if (max !== undefined && numberValue > max) {
    return { isValid: false, message: `Must be at most ${max}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates if all form fields are valid
 * @param {Object} validationResults - Object containing validation results for each field
 * @returns {boolean} Whether all fields are valid
 */
export const isFormValid = (validationResults) => {
  return Object.values(validationResults).every(result => result.isValid);
};

/**
 * Validate key generation parameters
 * @param {Object} params - Key generation parameters
 * @returns {Object} Validation result with field-specific messages
 */
export const validateKeyParams = ({ duration, deviceLimit }) => {
  const validationResults = {
    duration: { isValid: true, message: '' },
    deviceLimit: { isValid: true, message: '' }
  };
  
  // Validate duration
  if (!duration) {
    validationResults.duration = { isValid: false, message: 'Duration is required' };
  }
  
  // Validate device limit
  const deviceLimitValidation = validateNumber(deviceLimit, { min: 1, max: 10 });
  if (!deviceLimitValidation.isValid) {
    validationResults.deviceLimit = deviceLimitValidation;
  }
  
  return {
    ...validationResults,
    isValid: Object.values(validationResults).every(result => result.isValid)
  };
};