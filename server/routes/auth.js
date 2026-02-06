const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    getMe
} = require('../controllers/authController');
const {
    sendOTP,
    verifyOTP,
    resendOTP
} = require('../controllers/otpController');
const { googleAuth, completeGoogleProfile } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyOtpSchema
} = require('../validators/auth');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), require('../controllers/passwordController').forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), require('../controllers/passwordController').resetPassword);
router.post('/verify-reset-otp', validate(verifyOtpSchema), require('../controllers/passwordController').verifyResetOTP);
router.get('/me', protect, getMe);

// OTP routes
router.post('/send-otp', sendOTP); // Add schema if needed
router.post('/verify-otp', validate(verifyOtpSchema), verifyOTP);
router.post('/resend-otp', validate(forgotPasswordSchema), resendOTP); // Reusing email schema

// Google auth routes
router.post('/google', googleAuth);
router.put('/google/complete', protect, completeGoogleProfile);

module.exports = router;