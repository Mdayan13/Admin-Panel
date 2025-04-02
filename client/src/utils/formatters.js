/**
 * Utility functions for formatting data
 */

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date object or ISO string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options
  };
  
  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(dateObj);
};

/**
 * Format a number as Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number with commas (Indian numbering system)
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-IN').format(number);
};

/**
 * Format a duration in seconds to a human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

/**
 * Truncate long text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Convert pricing duration to readable text
 * @param {string} duration - Duration code (e.g., '1hour', '30days')
 * @returns {string} Readable duration
 */
export const formatKeyDuration = (duration) => {
  const durationMap = {
    '1hour': '1 Hour',
    '6hours': '6 Hours',
    '12hours': '12 Hours',
    '1day': '1 Day',
    '3days': '3 Days',
    '7days': '7 Days',
    '15days': '15 Days',
    '30days': '30 Days',
    '60days': '60 Days'
  };
  
  return durationMap[duration] || duration;
};