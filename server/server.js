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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/contact', require('./routes/contact'));


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