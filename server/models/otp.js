const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires after 5 minutes
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Index for faster queries
otpSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.models.OTP || mongoose.model('OTP', otpSchema);