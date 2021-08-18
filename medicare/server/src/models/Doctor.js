const mongoose = require('mongoose');

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopaedics',
  'General Medicine',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Gynaecology',
];

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      enum: SPECIALTIES,
    },
    qualifications: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [600, 'Bio cannot exceed 600 characters'],
    },
    photo: {
      type: String,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },
    location: {
      type: String,
      default: 'Main Hospital, Dublin',
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    // 0 = Sunday … 6 = Saturday. Days the doctor sees patients.
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
      validate: {
        validator: (arr) => arr.every((d) => d >= 0 && d <= 6),
        message: 'workingDays must contain values between 0 (Sun) and 6 (Sat)',
      },
    },
    // Bookable start times as "HH:mm". Availability subtracts booked slots from this.
    slots: {
      type: [String],
      default: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorSchema.index({ specialty: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
module.exports.SPECIALTIES = SPECIALTIES;
