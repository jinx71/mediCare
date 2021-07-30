import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDoctor } from '../api/doctors';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import SlotPicker from '../components/SlotPicker';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getDoctor(id)
      .then((res) => active && setDoctor(res.data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container-px py-16">
        <EmptyState
          tone="error"
          icon="!"
          title="Doctor not found"
          message={error || 'This profile may have been removed.'}
          action={
            <Link to="/doctors">
              <Button variant="secondary">Back to doctors</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-px py-10">
      <button onClick={() => navigate(-1)} className="mb-5 text-sm text-ink-500 hover:text-brand-600">
        ← Back
      </button>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Profile */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar name={doctor.name} src={doctor.photo} size="lg" />
              <div>
                <h1 className="text-2xl font-semibold text-ink-900">{doctor.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{doctor.specialty}</Badge>
                  <span className="text-sm text-ink-500">{doctor.qualifications}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ['Experience', `${doctor.experienceYears} yrs`],
                ['Rating', `${doctor.rating?.toFixed(1)} ★`],
                ['Fee', `€${doctor.consultationFee}`],
                ['Location', doctor.location],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-ink-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-900">{value}</p>
                </div>
              ))}
            </div>

            {doctor.bio && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-ink-700">About</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{doctor.bio}</p>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-ink-700">Consulting days</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d, i) => (
                  <span
                    key={d}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      doctor.workingDays?.includes(i)
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-ink-50 text-ink-500/60 line-through'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Booking */}
        <div className="lg:col-span-2">
          <Card className="p-6 lg:sticky lg:top-20">
            <h2 className="text-lg font-semibold text-ink-900">Book an appointment</h2>
            <p className="mt-0.5 text-sm text-ink-500">Pick a date to see open times.</p>
            <div className="mt-4">
              <SlotPicker doctor={doctor} onBooked={() => navigate('/dashboard')} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
