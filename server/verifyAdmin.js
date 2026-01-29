const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');
const connectDB = require('./config/db');

dotenv.config();

const verifyAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL || 'nationalacdashboard2025@gmail.com';
        console.log(`Verifying user: ${adminEmail}`);

        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log('User NOT FOUND in database!');
        } else {
            console.log('User found:');
            console.log(`ID: ${user._id}`);
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Email Verified: ${user.emailVerified}`);

            if (user.role !== 'admin') {
                console.log('WARNING: User is NOT an admin!');
                // Optional: Fix it right here
                // user.role = 'admin';
                // await user.save();
                // console.log('FIXED: User role updated to admin');
            } else {
                console.log('SUCCESS: User is an admin.');
            }
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyAdmin();
