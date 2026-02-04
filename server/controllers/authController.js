const jwt = require('jsonwebtoken');
const User = require('../models/user');
const OTP = require('../models/otp');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register new user (after OTP verification)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, organization } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !organization) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify that OTP was verified for this email

    const verifiedOTP = await OTP.findOne({
      email: email.toLowerCase(),
      verified: true
    }).sort({ createdAt: -1 });

    if (!verifiedOTP) {
      return res.status(400).json({ message: 'Please verify your email with OTP first' });
    }

    // Check if OTP verification is still valid (within 30 minutes)
    const otpAge = (new Date() - verifiedOTP.createdAt) / 1000;
    const OTP_EXPIRY_SECONDS = 1800; // 30 minutes
    if (otpAge > OTP_EXPIRY_SECONDS) {
      await OTP.deleteOne({ _id: verifiedOTP._id });
      return res.status(400).json({ message: 'OTP verification expired. Please start again.' });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      organization,
      emailVerified: true
    });

    // Delete the used OTP
    await OTP.deleteOne({ _id: verifiedOTP._id });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,
        emailVerified: user.emailVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      organization: user.organization,
      role: user.role,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  getMe
};