const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Google OAuth callback
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, picture } = req.body;

    console.log('Google Auth Request:', { email, name, googleId });

    if (!email || !name || !googleId) {
      return res.status(400).json({ message: 'Missing required Google data' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - login
      console.log('Existing user found:', user._id);
      
      if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.profilePicture = picture;
        user.emailVerified = true;
        await user.save();
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        organization: user.organization || '',
        role: user.role,
        googleId: user.googleId,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        isComplete: !!(user.phone && user.organization && user.phone !== '' && user.organization !== ''),
        token: generateToken(user._id)
      });
    } else {
      // New Google user - create minimal profile
      console.log('Creating new Google user');
      
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        profilePicture: picture,
        password: 'GOOGLE_AUTH_' + Math.random().toString(36).substring(2, 15), // Random password
        phone: '',
        organization: '',
        emailVerified: true
      });

      console.log('New user created:', user._id);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        organization: user.organization || '',
        role: user.role,
        googleId: user.googleId,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        isComplete: false, // Needs to complete profile
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: 'Google authentication failed',
      error: error.message 
    });
  }
};

// @desc    Complete Google user profile
// @route   PUT /api/auth/google/complete
// @access  Private
const completeGoogleProfile = async (req, res) => {
  try {
    const { phone, organization } = req.body;

    if (!phone || !organization) {
      return res.status(400).json({ message: 'Phone and organization are required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.phone = phone;
    user.organization = organization;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      organization: user.organization,
      role: user.role,
      googleId: user.googleId,
      profilePicture: user.profilePicture,
      isComplete: true
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Failed to complete profile' });
  }
};

module.exports = {
  googleAuth,
  completeGoogleProfile
};