const express = require('express');
const { body } = require('express-validator');
const {
  getAvailability,
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: which slots are free for a doctor on a given day.
router.get('/availability', getAvailability);

// Patient: book + view own appointments.
router.post(
  '/',
  protect,
  requireRole('patient', 'admin'),
  [
    body('doctor').notEmpty().withMessage('A doctor is required'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
    body('slot').matches(/^\d{2}:\d{2}$/).withMessage('slot must be HH:mm'),
    body('reason').optional().trim().isLength({ max: 300 }),
  ],
  bookAppointment
);
router.get('/me', protect, getMyAppointments);

// Admin: view all + change status.
router.get('/', protect, requireRole('admin'), getAllAppointments);
router.patch('/:id/status', protect, requireRole('admin'), updateAppointmentStatus);

// Owner or admin: cancel.
router.patch('/:id/cancel', protect, cancelAppointment);

module.exports = router;
