import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getAllAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} from '../api/appointments';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../api/doctors';
import SectionHeading from '../components/SectionHeading';
import AppointmentCard from '../components/AppointmentCard';
import DoctorCard from '../components/DoctorCard';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DoctorForm from '../components/DoctorForm';
import { todayISO } from '../utils/format';

const STATUS_TABS = ['all', 'booked', 'completed', 'cancelled'];

const AdminDashboard = () => {
  const [tab, setTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  // Doctor modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [savingDoctor, setSavingDoctor] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appts, docs] = await Promise.all([getAllAppointments(), getDoctors()]);
      setAppointments(appts.data);
      setDoctors(docs.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // --- Appointment actions ---
  const handleComplete = async (appt) => {
    setBusyId(appt._id);
    try {
      await updateAppointmentStatus(appt._id, 'completed');
      toast.success('Marked completed');
      setAppointments((p) => p.map((a) => (a._id === appt._id ? { ...a, status: 'completed' } : a)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (appt) => {
    setBusyId(appt._id);
    try {
      await cancelAppointment(appt._id);
      toast.success('Appointment cancelled');
      setAppointments((p) => p.map((a) => (a._id === appt._id ? { ...a, status: 'cancelled' } : a)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  // --- Doctor actions ---
  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (doc) => {
    setEditing(doc);
    setModalOpen(true);
  };

  const handleSaveDoctor = async (payload) => {
    setSavingDoctor(true);
    try {
      if (editing) {
        const { data } = await updateDoctor(editing._id, payload);
        setDoctors((p) => p.map((d) => (d._id === data._id ? data : d)));
        toast.success('Doctor updated');
      } else {
        const { data } = await createDoctor(payload);
        setDoctors((p) => [data, ...p]);
        toast.success('Doctor added');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err.errors?.[0]?.message || err.message);
    } finally {
      setSavingDoctor(false);
    }
  };

  const handleDeleteDoctor = async (doc) => {
    if (!window.confirm(`Remove ${doc.name}? Active appointments will be cancelled.`)) return;
    setBusyId(doc._id);
    try {
      await deleteDoctor(doc._id);
      setDoctors((p) => p.filter((d) => d._id !== doc._id));
      toast.success('Doctor removed');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filteredAppointments =
    statusFilter === 'all' ? appointments : appointments.filter((a) => a.status === statusFilter);

  const today = todayISO();
  const bookedToday = appointments.filter((a) => a.status === 'booked' && a.date === today).length;

  return (
    <div className="container-px py-10">
      <SectionHeading
        eyebrow="Admin"
        title="Hospital dashboard"
        subtitle="Manage appointments and the doctor roster."
      />

      {/* Stats */}
      {!loading && !error && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Doctors" value={doctors.length} tone="brand" icon="🩺" />
          <StatCard label="Appointments" value={appointments.length} tone="info" icon="🗂️" />
          <StatCard label="Booked today" value={bookedToday} tone="success" icon="📅" />
          <StatCard
            label="Cancelled"
            value={appointments.filter((a) => a.status === 'cancelled').length}
            tone="danger"
            icon="✕"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-ink-100">
        {[
          ['appointments', 'Appointments'],
          ['doctors', 'Doctors'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === key
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && (
        <EmptyState
          tone="error"
          icon="!"
          title="Couldn't load dashboard"
          message={error}
          action={
            <Button variant="secondary" onClick={load}>
              Try again
            </Button>
          }
        />
      )}

      {/* Appointments tab */}
      {!loading && !error && tab === 'appointments' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-ink-100 bg-white text-ink-700 hover:border-brand-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {filteredAppointments.length === 0 ? (
            <EmptyState icon="🗂️" title="No appointments" message="Nothing matches this filter yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAppointments.map((a) => (
                <AppointmentCard
                  key={a._id}
                  appointment={a}
                  variant="admin"
                  busy={busyId === a._id}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Doctors tab */}
      {!loading && !error && tab === 'doctors' && (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={openAdd}>+ Add doctor</Button>
          </div>

          {doctors.length === 0 ? (
            <EmptyState
              icon="🩺"
              title="No doctors yet"
              message="Add your first doctor to start taking bookings."
              action={<Button onClick={openAdd}>Add doctor</Button>}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => (
                <Card key={d._id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-ink-900">{d.name}</h3>
                      <Badge tone="brand" className="mt-1">
                        {d.specialty}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-ink-900">€{d.consultationFee}</span>
                  </div>
                  <p className="mt-3 text-sm text-ink-500">
                    {d.experienceYears} yrs · {d.slots?.length || 0} slots/day ·{' '}
                    {d.workingDays?.length || 0} days/wk
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(d)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      loading={busyId === d._id}
                      onClick={() => handleDeleteDoctor(d)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Doctor add/edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit doctor' : 'Add a doctor'}
      >
        <DoctorForm
          initial={editing}
          submitting={savingDoctor}
          onSubmit={handleSaveDoctor}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
