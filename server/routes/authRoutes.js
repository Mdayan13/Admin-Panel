const express = require('express');
const {
  register,
  login,
  getMe,
  adminLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');

const router = express.Router();

// Public routes
router.post('/auth/register', validateRegister, register);
router.post('/auth/login', validateLogin, login);
router.post('/auth/admin/login', validateLogin, adminLogin);

// Protected routes
router.get('/getMe', protect, getMe);

module.exports = router;