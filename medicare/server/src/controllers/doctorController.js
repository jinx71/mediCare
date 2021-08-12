const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created, fail } = require('../utils/apiResponse');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const { SPECIALTIES } = Doctor;

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fail(
      res,
      'Validation failed',
      422,
      errors.array().map((e) => ({ field: e.param, message: e.msg }))
    );
    return false;
  }
  return true;
};

// GET /api/doctors/specialties
const getSpecialties = asyncHandler(async (req, res) => {
  ok(res, SPECIALTIES);
});

// GET /api/doctors?specialty=&q=
const getDoctors = asyncHandler(async (req, res) => {
  const { specialty, q } = req.query;
  const filter = { isActive: true };

  if (specialty && specialty !== 'all') filter.specialty = specialty;
  if (q) filter.name = { $regex: q.trim(), $options: 'i' };

  const doctors = await Doctor.find(filter).sort({ rating: -1, name: 1 });
  ok(res, doctors, `${doctors.length} doctor(s) found`);
});

// GET /api/doctors/:id
const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return fail(res, 'Doctor not found', 404);
  ok(res, doctor);
});

// POST /api/doctors  (admin)
const createDoctor = asyncHandler(async (req, res) => {
  if (!handleValidation(req, res)) return;
  const doctor = await Doctor.create(req.body);
  created(res, doctor, 'Doctor added');
});

// PUT /api/doctors/:id  (admin)
const updateDoctor = asyncHandler(async (req, res) => {
  if (!handleValidation(req, res)) return;
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doctor) return fail(res, 'Doctor not found', 404);
  ok(res, doctor, 'Doctor updated');
});

// DELETE /api/doctors/:id  (admin)
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return fail(res, 'Doctor not found', 404);

  await doctor.deleteOne();
  // Cancel any still-active appointments so patients aren't left with orphans.
  await Appointment.updateMany(
    { doctor: doctor._id, status: 'booked' },
    { $set: { status: 'cancelled', notes: 'Doctor no longer available' } }
  );

  ok(res, { id: doctor._id }, 'Doctor removed');
});

module.exports = {
  getSpecialties,
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
