const express = require('express');
const router = express.Router();
const keyController = require('../controllers/keyController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Public routes
router.post('/validate', keyController.validateKey);

// Protected routes (requires authentication)
router.use(protect);

// Get key pricing
router.get('/pricing', keyController.getKeyPricing);

// Generate a new key
router.post('/', keyController.generateKey);

// Get all keys for the current user
router.get('/', keyController.getUserKeys);

// Get a single key by ID
router.get('/:id', keyController.getKeyById);

// Deactivate a key
router.put('/:id/deactivate', keyController.deactivateKey);

module.exports = router;