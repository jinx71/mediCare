require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const doctorData = require('../data/doctors');

const pad = (n) => String(n).padStart(2, '0');
// Returns a YYYY-MM-DD string offset by `days` from today (local time).
const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data…');
    await Promise.all([User.deleteMany({}), Doctor.deleteMany({}), Appointment.deleteMany({})]);

    // --- Users ---
    const admin = await User.create({
      name: 'Hospital Admin',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@medicare.dev',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
      role: 'admin',
      phone: '+353 1 000 0001',
    });

    const patient = await User.create({
      name: 'Demo Patient',
      email: process.env.SEED_PATIENT_EMAIL || 'patient@medicare.dev',
      password: process.env.SEED_PATIENT_PASSWORD || 'Patient123!',
      role: 'patient',
      phone: '+353 1 000 0002',
    });

    console.log('Seeding doctors…');
    const doctors = await Doctor.insertMany(doctorData);

    // --- A couple of sample appointments for the demo patient ---
    console.log('Seeding sample appointments…');
    const upcoming = dateOffset(2);
    const past = dateOffset(-5);
    await Appointment.create([
      {
        patient: patient._id,
        doctor: doctors[0]._id,
        date: upcoming,
        slot: '09:30',
        reason: 'Routine heart check-up',
        status: 'booked',
      },
      {
        patient: patient._id,
        doctor: doctors[5]._id,
        date: past,
        slot: '10:00',
        reason: 'Annual physical',
        status: 'completed',
      },
    ]);

    console.log('\nSeed complete ✔');
    console.log('---------------------------------------------');
    console.log(`Admin   → ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin123!'}`);
    console.log(`Patient → ${patient.email} / ${process.env.SEED_PATIENT_PASSWORD || 'Patient123!'}`);
    console.log(`Doctors → ${doctors.length} across ${new Set(doctors.map((d) => d.specialty)).size} specialties`);
    console.log('---------------------------------------------\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
