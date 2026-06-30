import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getAvailability, bookAppointment } from '../api/appointments';
import { upcomingDates } from '../utils/format';
import useAuth from '../hooks/useAuth';
import Button from './Button';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

const DATES = upcomingDates(14);

const SlotPicker = ({ doctor, onBooked }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [date, setDate] = useState(DATES[0].value);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: { reason: '' } });

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelected(null);
    try {
      const { data } = await getAvailability(doctor._id, date);
      setSlots(data.slots);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctor._id, date]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const onSubmit = async (values) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to book an appointment');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selected) {
      toast.error('Pick a time slot first');
      return;
    }
    setBooking(true);
    try {
      const { data } = await bookAppointment({
        doctor: doctor._id,
        date,
        slot: selected,
        reason: values.reason,
      });
      toast.success('Appointment booked');
      reset();
      setSelected(null);
      await loadSlots();
      if (onBooked) onBooked(data);
    } catch (err) {
      toast.error(err.message);
      // A 409 means the slot was just taken — refresh to show the truth.
      if (err.status === 409) loadSlots();
    } finally {
      setBooking(false);
    }
  };

  return (
    <div>
      {/* Date chips */}
      <p className="mb-2 text-sm font-medium text-ink-700">Choose a date</p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {DATES.map((d) => (
          <button
            key={d.value}
            onClick={() => setDate(d.value)}
            className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              date === d.value
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-ink-100 bg-white text-ink-700 hover:border-brand-300'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Slots */}
      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-ink-700">Available times</p>

        {loading && (
          <div className="flex items-center gap-2 py-6 text-sm text-ink-500">
            <Spinner size="sm" /> Checking availability…
          </div>
        )}

        {!loading && error && (
          <EmptyState
            tone="error"
            icon="!"
            title="Couldn't load times"
            message={error}
            action={
              <Button variant="secondary" size="sm" onClick={loadSlots}>
                Try again
              </Button>
            }
          />
        )}

        {!loading && !error && slots.length === 0 && (
          <EmptyState
            icon="📅"
            title="No times on this day"
            message={`${doctor.name} isn't taking appointments then. Try another date.`}
          />
        )}

        {!loading && !error && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSelected(s)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  selected === s
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                    : 'border-ink-100 bg-white text-ink-700 hover:border-brand-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reason + book */}
      {!loading && !error && slots.length > 0 && (
        <div className="mt-5">
          <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-ink-700">
            Reason for visit <span className="text-ink-500">(optional)</span>
          </label>
          <textarea
            id="reason"
            rows={2}
            maxLength={300}
            placeholder="e.g. Follow-up on blood pressure"
            className="w-full rounded-xl border border-ink-100 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            {...register('reason')}
          />
          <Button
            className="mt-3 w-full"
            size="lg"
            loading={booking}
            disabled={!selected}
            onClick={handleSubmit(onSubmit)}
          >
            {selected ? `Confirm booking for ${selected}` : 'Select a time to continue'}
          </Button>
          {!isAuthenticated && (
            <p className="mt-2 text-center text-xs text-ink-500">
              You'll be asked to sign in to confirm.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
