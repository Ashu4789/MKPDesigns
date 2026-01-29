const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otpController');
const { googleAuth, completeGoogleProfile } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');

// Regular auth routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

// OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Google auth routes
router.post('/google', googleAuth);
router.put('/google/complete', protect, completeGoogleProfile);

module.exports = router;