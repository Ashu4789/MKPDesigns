const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    bookAppointment,
    getAppointments,
    updateAppointment
} = require('../controllers/appointmentController');

router.route('/')
    .post(protect, bookAppointment)
    .get(protect, getAppointments);

router.route('/:id')
    .put(protect, admin, updateAppointment);

module.exports = router;
