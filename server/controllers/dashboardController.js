const Project = require('../models/project');
const Design = require('../models/design');
const User = require('../models/user');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        const totalDesigns = await Design.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalSales = await Transaction.countDocuments({ status: 'completed' });

        // Calculate total revenue
        const sales = await Transaction.find({ status: 'completed' });
        const totalRevenue = sales.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            projects: totalProjects,
            designs: totalDesigns,
            users: totalUsers,
            sales: totalSales,
            revenue: totalRevenue
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get dashboard updates (recent activity)
// @route   GET /api/dashboard/updates
// @access  Private
const getDashboardUpdates = async (req, res) => {
    try {
        // Fetch recent designs
        const recentDesigns = await Design.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt imageUrl');

        // Fetch recent projects
        const recentProjects = await Project.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt status');

        // Combine and sort
        const updates = [
            ...recentDesigns.map(d => ({
                id: d._id,
                type: 'design',
                title: d.title,
                date: d.createdAt,
                image: d.imageUrl,
                message: `New design uploaded: ${d.title}`
            })),
            ...recentProjects.map(p => ({
                id: p._id,
                type: 'project',
                title: p.title,
                date: p.createdAt,
                status: p.status,
                message: `Project update: ${p.title} is ${p.status}`
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        res.json(updates);
    } catch (error) {
        console.error('Error fetching dashboard updates:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDashboardStats,
    getDashboardUpdates
};
