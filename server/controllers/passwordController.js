const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const OTP = require('../models/otp');

// Generate 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        // Generate new OTP
        const otp = generateOTP();

        // Save OTP to database
        await OTP.create({
            email: email.toLowerCase(),
            otp,
            verified: false
        });

        // Send OTP email
        const transporter = createTransporter();

        // Create reset link
        // Assuming client runs on port 5173 for dev, or use env var for production URL
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetLink = `${clientUrl}/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password - MKP Designs',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
            .btn:hover { background: #764ba2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Password Reset</h1>
              <p>MKP Designs</p>
            </div>
            <div class="content">
              <p>You requested a password reset. You can either copy the OTP below or click the button to reset your password directly:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
              </div>

              <div style="text-align: center;">
                <a href="${resetLink}" class="btn">Reset Password Now</a>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">Or copy paste this link: ${resetLink}</p>
              </div>

              <p>If you didn't request this, please ignore this email.</p>
              
              <p>Best regards,<br><strong>MKP Designs Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Password reset link sent to your email',
            email: email.toLowerCase()
        });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            otp: otp.toString()
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const otpAge = (new Date() - otpRecord.createdAt) / 1000;
        if (otpAge > 300) { // 5 minutes
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Find User
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update Password
        user.password = password;
        await user.save();

        // Delete OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ message: 'Password updated successfully. Please login.' });

    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify Reset OTP (Check validity only)
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            otp: otp.toString()
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const otpAge = (new Date() - otpRecord.createdAt) / 1000;
        if (otpAge > 300) { // 5 minutes
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Just return success, don't delete yet (wait for reset)
        res.json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error('Verify Reset OTP error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
    verifyResetOTP
};
