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

    // Default maxDevices to 1 if not specified
    const devices = maxDevices || 1;
    
    // Create the key
    const key = await keyService.createKey(userId, duration, devices);
    
    res.status(201).json({ 
      success: true, 
      key: {
        id: key._id,
        keyString: key.keyString,
        duration: key.duration,
        expirationTime: key.expirationTime,
        maxDevices: key.maxDevices,
        price: key.price
      }
    });
  } catch (error) {
    console.error('Error generating key:', error);
    res.status(400).json({ 
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
    const filter = { createdBy: userId };
    
    if (req.query.status === 'active') {
      filter.isActive = true;
      filter.expirationTime = { $gt: new Date() };
    } else if (req.query.status === 'expired') {
      filter.$or = [
        { isActive: false },
        { expirationTime: { $lte: new Date() } }
      ];
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
      keyString: key.keyString,
      duration: key.duration,
      expirationTime: key.expirationTime,
      createdAt: key.createdAt,
      maxDevices: key.maxDevices,
      activeDevices: key.activeDevices.length,
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
    console.error('Error fetching keys:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch keys' 
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
      return res.status(404).json({ 
        success: false, 
        message: 'Key not found' 
      });
    }
    
    // Check if user is authorized to view this key
    const user = await User.findById(userId);
    if (!user.isAdmin && key.createdBy.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this key' 
      });
    }
    
    res.json({
      success: true,
      key: {
        id: key._id,
        keyString: key.keyString,
        duration: key.duration,
        expirationTime: key.expirationTime,
        createdAt: key.createdAt,
        maxDevices: key.maxDevices,
        activeDevices: key.activeDevices,
        isActive: key.isActive && key.expirationTime > new Date(),
        price: key.price,
        activatedAt: key.activatedAt,
        lastUsed: key.lastUsed
      }
    });
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
    
    const deactivatedKey = await keyService.deactivateKey(keyId, userId);
    
    res.json({
      success: true,
      message: 'Key deactivated successfully',
      key: {
        id: deactivatedKey._id,
        keyString: deactivatedKey.keyString,
        isActive: false
      }
    });
  } catch (error) {
    console.error('Error deactivating key:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to deactivate key' 
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
      return res.status(400).json({ 
        success: false, 
        message: 'Key and device ID are required' 
      });
    }
    
    const result = await keyService.validateKey(keyString, deviceId);
    
    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid key',
        reason: result.reason
      });
    }
    
    res.json({
      success: true,
      message: 'Key is valid',
      expiresAt: result.expiresAt,
      duration: result.duration
    });
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
    // Format pricing for UI
    const pricing = Object.entries(keyService.PRICING).map(([duration, price]) => ({
      duration,
      price,
      label: `₹${price}/${duration}`
    }));
    
    res.json({
      success: true,
      pricing
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pricing' 
    });
  }
};