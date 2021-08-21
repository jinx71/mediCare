const express = require('express');
const { body } = require('express-validator');
const {
  getSpecialties,
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect, requireRole } = require('../middleware/auth');
const Doctor = require('../models/Doctor');

const router = express.Router();

const doctorValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('specialty')
    .isIn(Doctor.SPECIALTIES)
    .withMessage(`Specialty must be one of: ${Doctor.SPECIALTIES.join(', ')}`),
  body('consultationFee').optional().isInt({ min: 0 }).withMessage('Fee must be a positive number'),
  body('experienceYears').optional().isInt({ min: 0 }),
  body('workingDays').optional().isArray(),
  body('slots').optional().isArray(),
];

// Public reads
router.get('/specialties', getSpecialties);
router.get('/', getDoctors);
router.get('/:id', getDoctor);

// Admin-only writes (RBAC)
router.post('/', protect, requireRole('admin'), doctorValidators, createDoctor);
router.put('/:id', protect, requireRole('admin'), doctorValidators, updateDoctor);
router.delete('/:id', protect, requireRole('admin'), deleteDoctor);

module.exports = router;
