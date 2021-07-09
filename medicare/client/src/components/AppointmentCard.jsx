import React from 'react';
import Card from './Card';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import Button from './Button';
import { formatDate } from '../utils/format';

// Flexible card: patient view (cancel) and admin view (status actions + patient info).
const AppointmentCard = ({ appointment, variant = 'patient', onCancel, onComplete, busy }) => {
  const { doctor, patient, date, slot, reason, status } = appointment;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={doctor?.name || patient?.name} size="sm" />
          <div>
            <p className="font-semibold text-ink-900">{doctor?.name || 'Doctor'}</p>
            <p className="text-sm text-ink-500">{doctor?.specialty}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-ink-700">
          <span className="text-ink-500">When</span>
          <span className="font-medium">
            {formatDate(date)} · {slot}
          </span>
        </div>
        {doctor?.location && (
          <div className="flex items-center gap-2 text-ink-700">
            <span className="text-ink-500">Where</span>
            <span className="font-medium">{doctor.location}</span>
          </div>
        )}
      </div>

      {variant === 'admin' && patient && (
        <div className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-sm">
          <span className="text-ink-500">Patient: </span>
          <span className="font-medium text-ink-900">{patient.name}</span>
          <span className="text-ink-500"> · {patient.email}</span>
          {patient.phone && <span className="text-ink-500"> · {patient.phone}</span>}
        </div>
      )}

      {reason && (
        <p className="mt-3 text-sm text-ink-500">
          <span className="font-medium text-ink-700">Reason: </span>
          {reason}
        </p>
      )}

      {/* Actions */}
      {status === 'booked' && (
        <div className="mt-4 flex flex-wrap gap-2">
          {variant === 'admin' && (
            <Button variant="subtle" size="sm" loading={busy} onClick={() => onComplete(appointment)}>
              Mark completed
            </Button>
          )}
          <Button variant="danger" size="sm" loading={busy} onClick={() => onCancel(appointment)}>
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AppointmentCard;
