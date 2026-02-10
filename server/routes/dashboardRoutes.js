const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats, getDashboardUpdates } = require('../controllers/dashboardController');

router.get('/stats', protect, getDashboardStats);
router.get('/updates', protect, getDashboardUpdates);

module.exports = router;
