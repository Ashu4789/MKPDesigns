const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const dns = require('node:dns');

// Custom DNS to fix Node 24/Windows resolution issues
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']); // Google & Cloudflare DNS
} catch (error) {
  console.log('Could not set custom DNS servers:', error.message);
}

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());

// Security Headers
const helmet = require('helmet');
app.use(helmet());

// Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);



// Prevent Parameter Pollution
const hpp = require('hpp');
app.use(hpp());

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: false }));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/designs', require('./routes/designs'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));


// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'MKP Designs API' });
});


// General error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});