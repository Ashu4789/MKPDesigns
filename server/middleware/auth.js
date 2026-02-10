const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  console.log('Admin Check - User:', req.user ? `${req.user.email} (${req.user.role})` : 'No user found');
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};


const optionalProtect = async (req, res, next) => {
  let token;

  // Debug logs
  console.log('OptionalProtect - Query:', req.query);
  console.log('OptionalProtect - Auth Header:', req.headers.authorization ? 'Present' : 'Missing');

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      console.log('OptionalProtect - User found via Header:', req.user ? req.user._id : 'None');
    } catch (error) {
      console.error('Optional auth error (ignoring):', error.message);
      // Don't fail, just continue as guest
    }
  } else if (req.query.token) {
    // Check for token in query params (for file downloads)
    try {
      token = req.query.token;
      // Handle case where token might be "null" or "undefined" string
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        console.log('OptionalProtect - User found via Query:', req.user ? req.user._id : 'None');
      } else {
        console.log('OptionalProtect - Invalid token string in query:', token);
      }
    } catch (error) {
      console.error('Optional auth query token error (ignoring):', error.message);
    }
  }
  next();
};

module.exports = { protect, admin, optionalProtect };