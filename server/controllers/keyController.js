const keyService = require('../services/keyGenerator');
const Key = require('../models/Key');
const User = require('../models/User');

/**
 * Generate a new key
 * @route POST /api/keys
 * @access Private (Rebrander)
 */
exports.generateKey = async (req, res) => {
  try {
    const { duration, maxDevices } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }

    const devices = maxDevices || 1;
    
    // Generate the key
    const { key, newBalance } = await keyService.generateKey(userId, duration, devices);
    
    res.status(201).json({ success: true, message: 'Key generated successfully.', key, newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false, 
      message: error.message || 'Failed to generate key' 
    });
  }
};

/**
 * Get all keys for the current user
 * @route GET /api/keys
 * @access Private (Rebrander)
 */
exports.getUserKeys = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering  
    const filter = { userId: userId };
    if (req.query.status === 'active') {
      filter.isActive = true;
    } else if (req.query.status === 'inactive') {
      filter.isActive = false;
    } else {
      delete filter.isActive; // Remove isActive filter for all keys      
    }
    
    // Get total count for pagination
    const total = await Key.countDocuments(filter);
    
    // Get keys
    const keys = await Key.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit); 
    
      // Format keys for response
      const formattedKeys = keys.map(key => ({
      id: key._id,
      keyCode: key.keyCode,
      duration: key.duration,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      isActive: key.isActive && key.expirationTime > new Date(),
      price: key.price,
      activatedAt: key.activatedAt,
      lastUsed: key.lastUsed
    }));
    
    res.json({
      success: true,
      keys: formattedKeys,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false, 
      message: error.message || 'Failed to fetch keys' 
    }); 
  }
};

/**
 * Get a single key by ID
 * @route GET /api/keys/:id
 * @access Private (Rebrander or Admin)
 */
exports.getKeyById = async (req, res) => {
  try {
    const keyId = req.params.id;
    const userId = req.user.id;
    
    const key = await Key.findById(keyId);
    
    if (!key) {
      return res.status(404).json({ success: false, message: 'Key not found.' });
    }
    
    // Check if user is authorized to view this key
    const user = await User.findById(userId);
    if (user.role !== 'admin' && key.userId.toString() !== userId) {      
      return res.status(403).json({ success: false, message: 'Unauthorized to view this key.' });
    }
    
    res.status(200).json({ success: true, message: 'Key retrieved successfully.', key });
  } catch (error) {
    console.error('Error fetching key:', error);
    res.status(500).json({
      success: false, 
      message: 'Failed to fetch key' 
    }); 
  }
};

/**
 * Deactivate a key
 * @route PUT /api/keys/:id/deactivate
 * @access Private (Rebrander or Admin)
 */
exports.deactivateKey = async (req, res) => {
  try {
    const keyId = req.params.id;
    const userId = req.user.id;

    // Deactivate the key
    const deactivatedKey = await keyService.deactivateKey(keyId, userId);
    
    // Respond with the deactivated key
    res.status(200).json({ success: true, message: 'Key deactivated successfully.', key: { id: deactivatedKey._id, isActive: deactivatedKey.isActive } });
  } catch (error) {
    // Handle errors

    console.error('Error deactivating key:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to deactivate key', // Consistent message
    });
  }
};

/**
 * Validate a key (for app login)
 * @route POST /api/keys/validate
 * @access Public
 */
exports.validateKey = async (req, res) => {
  try {
    const { keyString, deviceId } = req.body;
    if (!keyString || !deviceId) {
      return res.status(400).json({ success: false, message: 'Key and device ID are required.' }); // Clear message
    }

    const result = await keyService.validateKey(keyString, deviceId);
    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, message: 'Key validated successfully.', expiresAt: result.expiresAt, tierName: result.tierName });
  } catch (error) {
    console.error('Error validating key:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate key' 
    });
  }
};

/**
 * Get available key pricing
 * @route GET /api/keys/pricing
 * @access Private (Rebrander)
 */
exports.getKeyPricing = async (req, res) => {
  try {
    const pricing = await keyService.getPricingTiers();
    res.status(200).json({
      success: true,
      pricing, message: 'Pricing retrieved successfully.'
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pricing' 
    });
  }
};