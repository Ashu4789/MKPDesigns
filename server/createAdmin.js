const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'nationalacdashboard2025@gmail.com'; // Fallback for safety

        console.log(`Checking for admin user with email: ${adminEmail}`);

        if (!adminEmail) {
            console.error('ADMIN_EMAIL is not defined in environment variables');
            process.exit(1);
        }

        // Check if exists
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user found. Updating credentials...');
            userExists.role = 'admin';
            userExists.password = 'National@2025'; // Update password explicitly
            await userExists.save();
            console.log('User role and password updated successfully');
        } else {
            const user = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: 'National@2025',
                phone: '9348825087',
                organization: 'Ministry of Statistics',
                role: 'admin',
                emailVerified: true
            });
            console.log('Admin user created successfully');
            console.log('Email:', adminEmail);
            console.log('Password:', 'National@2025');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
