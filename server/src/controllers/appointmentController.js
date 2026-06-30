const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created, fail } = require('../utils/apiResponse');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

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

const pad = (n) => String(n).padStart(2, '0');
const todayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Core slot logic: take the doctor's configured slots and subtract the ones
// already booked for that date, respecting working days and past times.
const computeAvailableSlots = async (doctor, date) => {
  const today = todayString();
  if (date < today) return []; // cannot book in the past

  const [y, m, d] = date.split('-').map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  if (!doctor.workingDays.includes(weekday)) return [];

  const booked = await Appointment.find({
    doctor: doctor._id,
    date,
    status: { $in: ['booked', 'completed'] },
  }).select('slot');

  const taken = new Set(booked.map((b) => b.slot));
  let slots = doctor.slots.filter((s) => !taken.has(s));

  if (date === today) {
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    slots = slots.filter((s) => {
      const [hh, mm] = s.split(':').map(Number);
      return hh * 60 + mm > cur;
    });
  }

  return slots.sort();
};

// GET /api/appointments/availability?doctor=&date=YYYY-MM-DD
const getAvailability = asyncHandler(async (req, res) => {
  const { doctor: doctorId, date } = req.query;
  if (!doctorId || !date) return fail(res, 'doctor and date are required', 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return fail(res, 'date must be in YYYY-MM-DD format', 400);
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isActive) return fail(res, 'Doctor not found', 404);

  const available = await computeAvailableSlots(doctor, date);
  ok(res, { doctor: doctor._id, date, slots: available }, `${available.length} slot(s) available`);
});

// POST /api/appointments  (patient)
const bookAppointment = asyncHandler(async (req, res) => {
  if (!handleValidation(req, res)) return;

  const { doctor: doctorId, date, slot, reason } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isActive) return fail(res, 'Doctor not found', 404);

  if (!doctor.slots.includes(slot)) {
    return fail(res, 'That time slot is not offered by this doctor', 400);
  }

  const available = await computeAvailableSlots(doctor, date);
  if (!available.includes(slot)) {
    return fail(res, 'That slot is no longer available — please pick another', 409);
  }

  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      date,
      slot,
      reason: reason || '',
    });
    const populated = await appointment.populate('doctor', 'name specialty photo location consultationFee');
    created(res, populated, 'Appointment booked');
  } catch (err) {
    // Unique-index race: someone grabbed the slot a moment earlier.
    if (err.code === 11000) {
      return fail(res, 'That slot was just taken — please pick another', 409);
    }
    throw err;
  }
});

// GET /api/appointments/me  (patient)
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate('doctor', 'name specialty photo location consultationFee')
    .sort({ date: -1, slot: -1 });
  ok(res, appointments);
});

// GET /api/appointments  (admin) — optional ?status=&date=
const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) filter.date = date;

  const appointments = await Appointment.find(filter)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialty location')
    .sort({ date: -1, slot: -1 });
  ok(res, appointments, `${appointments.length} appointment(s)`);
});

// PATCH /api/appointments/:id/cancel  (patient owner or admin)
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return fail(res, 'Appointment not found', 404);

  const isOwner = appointment.patient.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return fail(res, 'Not authorized to cancel this appointment', 403);

  if (appointment.status !== 'booked') {
    return fail(res, `Cannot cancel an appointment that is ${appointment.status}`, 400);
  }

  appointment.status = 'cancelled';
  await appointment.save();
  ok(res, appointment, 'Appointment cancelled');
});

// PATCH /api/appointments/:id/status  (admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['booked', 'completed', 'cancelled'].includes(status)) {
    return fail(res, 'status must be booked, completed, or cancelled', 400);
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return fail(res, 'Appointment not found', 404);

  appointment.status = status;
  await appointment.save();
  ok(res, appointment, 'Appointment updated');
});

module.exports = {
  getAvailability,
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  cancelAppointment,
  updateAppointmentStatus,
};
