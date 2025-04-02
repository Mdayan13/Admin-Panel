// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getSystemAnalytics, getUserAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Apply protect middleware to all routes
router.use(protect);

// Admin dashboard analytics
router.get('/admin', isAdmin, getSystemAnalytics);

// Rebrander/user dashboard analytics
router.get('/rebrander', getUserAnalytics);

module.exports = router;