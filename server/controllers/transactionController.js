const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Design = require('../models/design');
const nodemailer = require('nodemailer');
const User = require('../models/user');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/transactions/order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { designId } = req.body;

        const design = await Design.findById(designId);
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        const options = {
            amount: design.price * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                designId: design._id.toString(),
                userId: req.user._id.toString()
            }
        };

        const order = await razorpay.orders.create(options);

        // Create initial pending transaction
        await Transaction.create({
            user: req.user._id,
            design: design._id,
            designTitle: design.title,
            amount: design.price,
            razorpayOrderId: order.id,
            status: 'pending'
        });

        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/transactions/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update transaction status
            const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });

            if (transaction) {
                transaction.razorpayPaymentId = razorpay_payment_id;
                transaction.razorpaySignature = razorpay_signature;
                transaction.status = 'completed';
                await transaction.save();

                // Send Emails
                await sendTransactionEmails(transaction, req.user);
            }

            res.json({ message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper: Send Transaction Emails
const sendTransactionEmails = async (transaction, user) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Or use existing config from env
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Basic HTML email template - improved
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Payment Successful - MKP Designs',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Payment Successful!</h2>
                    <p>Dear ${user.name},</p>
                    <p>Thank you for purchasing <strong>${transaction.designTitle}</strong>.</p>
                    <p>Amount Paid: <strong>₹${transaction.amount}</strong></p>
                    <p>Transaction ID: ${transaction.razorpayPaymentId}</p>
                    <p>You can now download the project details from your dashboard or the design page.</p>
                    <br>
                    <p>Best Regards,</p>
                    <p>MKP Designs Team</p>
                </div>
            `
        };

        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL, // Ensure this env var is set
            subject: 'New Sale Alert - MKP Designs',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #16a34a;">New Design Sold!</h2>
                    <p><strong>Design:</strong> ${transaction.designTitle}</p>
                    <p><strong>Amount:</strong> ₹${transaction.amount}</p>
                    <p><strong>Buyer:</strong> ${user.name} (${user.email})</p>
                    <p><strong>Transaction ID:</strong> ${transaction.razorpayPaymentId}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        if (process.env.ADMIN_EMAIL) {
            await transporter.sendMail(adminMailOptions);
        }

    } catch (error) {
        console.error('Email error:', error);
        // Don't throw error here, just log it so payment success is not affected
    }
};

// @desc    Check if user has purchased a design
// @route   GET /api/transactions/check/:designId
// @access  Private
const checkPurchaseStatus = async (req, res) => {
    try {
        const { designId } = req.params;
        const userId = req.user._id;

        const transaction = await Transaction.findOne({
            user: userId,
            design: designId,
            status: 'completed'
        });

        res.json({ isPurchased: !!transaction });
    } catch (error) {
        console.error('Error checking purchase status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get User Transactions
// @route   GET /api/transactions/my-orders
// @access  Private
const getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Transactions (Admin)
// @route   GET /api/transactions/admin/all
// @access  Private/Admin
const getSalesHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = { status: 'completed' };

        if (search) {
            query.$or = [
                { designTitle: { $regex: search, $options: 'i' } },
                { razorpayPaymentId: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        res.json({
            transactions,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
            total
        });
    } catch (error) {
        console.error('Error fetching sales history:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Design Stats (Admin)
// @route   GET /api/transactions/design/:designId/stats
// @access  Private/Admin
const getDesignStats = async (req, res) => {
    try {
        const { designId } = req.params;

        const transactions = await Transaction.find({
            design: designId,
            status: 'completed'
        })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const totalSales = transactions.length;
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            totalSales,
            totalRevenue,
            recentBuyers: transactions
        });
    } catch (error) {
        console.error('Error fetching design stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getUserTransactions,
    getSalesHistory,
    getDesignStats,
    checkPurchaseStatus
};
