const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Apply authentication and admin middleware to all routes
router.use(protect, isAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Referral code routes
router.post('/referral-codes', adminController.generateReferralCode);
router.get('/referral-codes', adminController.getAllReferralCodes);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;