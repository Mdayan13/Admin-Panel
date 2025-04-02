// server/routes/rebrander/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes in this file require authentication
router.use(protect);



// GET /api/rebrander/dashboard - Get dashboard data
router.get('/dashboard', userController.getDashboardData);

// POST /api/rebrander/keys - Generate a new key
router.post('/keys', userController.generateKey);

// GET /api/rebrander/keys - Get all keys for the user
router.get('/keys', userController.getUserKeys);

// GET /api/rebrander/keys/:keyId - Get specific key details
router.get('/keys/:keyId', userController.getKeyDetails);

// POST /api/rebrander/redeem - Redeem referral code

// GET /api/rebrander/transactions - Get transaction history
router.get('/transactions', userController.getTransactionHistory);

// GET /api/rebrander/referral-history - Get referral redemption history
router.get('/referral-history', userController.getReferralHistory);

module.exports = router;