const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    // Stored as "YYYY-MM-DD" so slot availability is a simple, timezone-stable match.
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    slot: {
      type: String,
      required: [true, 'Time slot is required'],
      match: [/^\d{2}:\d{2}$/, 'Slot must be in HH:mm format'],
    },
    reason: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Reason cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: ['booked', 'completed', 'cancelled'],
      default: 'booked',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

// Database-level guarantee: one doctor cannot have two active appointments
// for the same date + slot. Cancelled appointments free the slot up again
// (handled in the controller via a partial index on active statuses).
appointmentSchema.index(
  { doctor: 1, date: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['booked', 'completed'] } },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
