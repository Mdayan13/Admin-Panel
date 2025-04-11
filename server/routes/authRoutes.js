const express = require('express');
const {
  register,
  login,
  getMe,
  adminLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');

const router = express.Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)

// Protected routes
router.get('/verify', protect, getMe)

const authRouter = express.Router()
authRouter.use('/api/auth', router)

module.exports = authRouter