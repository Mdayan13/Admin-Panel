// Application configuration
module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // Key generation configuration
  KEY_PREFIXES: {
    STANDARD: 'KEY',
    PREMIUM: 'PKEY',
  },
  
  // Pricing tiers for key generation (in rupees)
  KEY_PRICING: {
    '1hour': 5,
    '6hours': 10,
    '12hours': 20,
    '1day': 50,
    '3days': 100,
    '7days': 200,
    '15days': 400,
    '30days': 700,
    '60days': 1000
  },
  
  // Key expiration time in milliseconds
  KEY_EXPIRY: {
    '1hour': 60 * 60 * 1000,
    '6hours': 6 * 60 * 60 * 1000,
    '12hours': 12 * 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000,
    '3days': 3 * 24 * 60 * 60 * 1000,
    '7days': 7 * 24 * 60 * 60 * 1000,
    '15days': 15 * 24 * 60 * 60 * 1000,
    '30days': 30 * 24 * 60 * 60 * 1000,
    '60days': 60 * 24 * 60 * 60 * 1000
  },
  
  // Default device limit for keys
  DEFAULT_DEVICE_LIMIT: 1,
  
  // Referral code configuration
  REFERRAL_CODE_LENGTH: 8
};