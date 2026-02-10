const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    createOrder,
    verifyPayment,
    getUserTransactions,
    getSalesHistory,
    getDesignStats,
    checkPurchaseStatus,
    downloadInvoice
} = require('../controllers/transactionController');

// User Routes
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-orders', protect, getUserTransactions);

// Admin Routes
router.get('/admin/all', protect, admin, getSalesHistory);
router.get('/design/:designId/stats', protect, admin, getDesignStats);
router.get('/check/:designId', protect, checkPurchaseStatus);
router.get('/:id/invoice', protect, downloadInvoice);

module.exports = router;
