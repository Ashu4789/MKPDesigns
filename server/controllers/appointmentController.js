const Appointment = require('../models/Appointment');
const nodemailer = require('nodemailer');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = async (req, res) => {
    try {
        const { name, email, date, time, mode, purpose, remarks } = req.body;

        const appointment = await Appointment.create({
            user: req.user._id,
            name,
            email,
            date,
            time,
            mode,
            purpose,
            remarks,
            status: 'pending'
        });

        // Email to Admin
        await sendAppointmentEmail('admin-alert', appointment);

        // Confirmation to User
        await sendAppointmentEmail('user-confirmation', appointment);

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get appointments (User: own, Admin: all)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
    try {
        let query = {};

        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        const appointments = await Appointment.find(query)
            .populate('user', 'name email')
            .sort({ date: 1, time: 1 });

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update appointment status/reply
// @route   PUT /api/appointments/:id
// @access  Private/Admin
const updateAppointment = async (req, res) => {
    try {
        const { status, adminReply, meetingLink } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status || appointment.status;
        appointment.adminReply = adminReply || appointment.adminReply;
        appointment.meetingLink = meetingLink || appointment.meetingLink;

        await appointment.save();

        if (status === 'confirmed' || adminReply) {
            await sendAppointmentEmail('status-update', appointment);
        }

        res.json(appointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper: Send Emails
const sendAppointmentEmail = async (type, appointment) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_USER
        };

        if (type === 'admin-alert') {
            mailOptions.to = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
            mailOptions.subject = 'New Appointment Request';
            mailOptions.html = `
                <h2>New Appointment Request</h2>
                <p><strong>Name:</strong> ${appointment.name}</p>
                <p><strong>Date:</strong> ${new Date(appointment.date).toDateString()}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Mode:</strong> ${appointment.mode}</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
            `;
        } else if (type === 'user-confirmation') {
            mailOptions.to = appointment.email;
            mailOptions.subject = 'Appointment Request Received';
            mailOptions.html = `
                <h2>Appointment Request Received</h2>
                <p>Dear ${appointment.name},</p>
                <p>We have received your request for an appointment on <strong>${new Date(appointment.date).toDateString()}</strong> at <strong>${appointment.time}</strong>.</p>
                <p>We will confirm the details shortly.</p>
            `;
        } else if (type === 'status-update') {
            mailOptions.to = appointment.email;
            mailOptions.subject = `Appointment Update: ${appointment.status.toUpperCase()}`;
            mailOptions.html = `
                <h2>Appointment ${appointment.status}</h2>
                <p>Dear ${appointment.name},</p>
                <p>Your appointment status has been updated to <strong>${appointment.status}</strong>.</p>
                ${appointment.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}">${appointment.meetingLink}</a></p>` : ''}
                ${appointment.adminReply ? `<p><strong>Message from Admin:</strong><br>${appointment.adminReply}</p>` : ''}
            `;
        }

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};

module.exports = {
    bookAppointment,
    getAppointments,
    updateAppointment
};
