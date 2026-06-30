import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyAppointments, cancelAppointment } from '../api/appointments';
import useAuth from '../hooks/useAuth';
import SectionHeading from '../components/SectionHeading';
import AppointmentCard from '../components/AppointmentCard';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { isPast } from '../utils/format';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (appt) => {
    setBusyId(appt._id);
    try {
      await cancelAppointment(appt._id);
      toast.success('Appointment cancelled');
      setAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? { ...a, status: 'cancelled' } : a))
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const upcoming = appointments.filter((a) => a.status === 'booked' && !isPast(a.date, a.slot));
  const history = appointments.filter((a) => a.status !== 'booked' || isPast(a.date, a.slot));

  return (
    <div className="container-px py-10">
      <SectionHeading
        eyebrow={`Welcome, ${user?.name?.split(' ')[0]}`}
        title="My appointments"
        action={
          <Link to="/doctors">
            <Button size="sm">Book new</Button>
          </Link>
        }
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && (
        <EmptyState
          tone="error"
          icon="!"
          title="Couldn't load your appointments"
          message={error}
          action={
            <Button variant="secondary" onClick={load}>
              Try again
            </Button>
          }
        />
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Upcoming" value={upcoming.length} tone="info" icon="📅" />
            <StatCard
              label="Completed"
              value={appointments.filter((a) => a.status === 'completed').length}
              tone="success"
              icon="✓"
            />
            <StatCard label="Total" value={appointments.length} tone="brand" icon="🗂️" />
          </div>

          {/* Upcoming */}
          <h3 className="mb-3 text-lg font-semibold text-ink-900">Upcoming</h3>
          {upcoming.length === 0 ? (
            <EmptyState
              icon="🌱"
              title="Nothing booked yet"
              message="Find a specialist and grab an open slot."
              action={
                <Link to="/doctors">
                  <Button>Find a doctor</Button>
                </Link>
              }
              className="mb-10"
            />
          ) : (
            <div className="mb-10 grid gap-4 md:grid-cols-2">
              {upcoming.map((a) => (
                <AppointmentCard
                  key={a._id}
                  appointment={a}
                  variant="patient"
                  busy={busyId === a._id}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <>
              <h3 className="mb-3 text-lg font-semibold text-ink-900">History</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {history.map((a) => (
                  <AppointmentCard key={a._id} appointment={a} variant="patient" onCancel={handleCancel} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PatientDashboard;
