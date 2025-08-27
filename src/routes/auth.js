const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;