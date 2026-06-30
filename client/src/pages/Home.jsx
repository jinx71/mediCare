import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors, getSpecialties } from '../api/doctors';
import useAuth from '../hooks/useAuth';
import Button from '../components/Button';
import Card from '../components/Card';
import DoctorCard from '../components/DoctorCard';
import SectionHeading from '../components/SectionHeading';
import Spinner from '../components/Spinner';

// Signature element: a calm ECG/vitals trace that draws itself across the hero.
const PulseLine = () => (
  <svg
    viewBox="0 0 1200 200"
    className="h-32 w-full text-brand-400"
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M0 100 H300 l30 -70 l40 140 l30 -110 l25 60 H560 l40 -50 l35 90 l30 -30 H1200"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeDasharray="1200"
      className="animate-pulseline"
    />
  </svg>
);

const SPECIALTY_ICON = {
  Cardiology: '🫀',
  Dermatology: '🧴',
  Neurology: '🧠',
  Pediatrics: '🧸',
  Orthopaedics: '🦴',
  'General Medicine': '🩺',
  Psychiatry: '🛋️',
  Ophthalmology: '👁️',
  ENT: '👂',
  Gynaecology: '🌸',
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [spec, docs] = await Promise.all([getSpecialties(), getDoctors()]);
        if (!active) return;
        setSpecialties(spec.data);
        setDoctors(docs.data.slice(0, 3));
      } catch (err) {
        // Home stays usable even if the featured data fails to load.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 to-white">
        <div className="container-px pt-16 pb-10 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1 text-xs font-medium text-brand-700">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> Now accepting same-week
              appointments
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
              Care that fits around <span className="text-brand-600">your life</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">
              Find the right specialist, book an open slot in seconds, and keep every appointment in
              one place. Plus trusted drug information when you need it.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/doctors">
                <Button size="lg">Find a doctor</Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" variant="secondary">
                    Create an account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        <PulseLine />
      </section>

      {/* Specialties */}
      <section className="container-px py-14">
        <SectionHeading
          eyebrow="Departments"
          title="Browse by specialty"
          subtitle="Ten departments staffed by consultant-led teams."
        />
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {specialties.map((s) => (
              <Link key={s} to={`/doctors?specialty=${encodeURIComponent(s)}`}>
                <Card hover className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
                  <span className="text-3xl">{SPECIALTY_ICON[s] || '➕'}</span>
                  <span className="text-sm font-medium text-ink-700">{s}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured doctors */}
      {doctors.length > 0 && (
        <section className="bg-ink-50/60 py-14">
          <div className="container-px">
            <SectionHeading
              eyebrow="Top rated"
              title="Meet a few of our doctors"
              action={
                <Link to="/doctors">
                  <Button variant="ghost" size="sm">
                    See all →
                  </Button>
                </Link>
              }
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => (
                <DoctorCard key={d._id} doctor={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="container-px py-14">
        <SectionHeading eyebrow="How it works" title="Booked in three steps" />
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { n: '1', t: 'Find your doctor', d: 'Filter by specialty or search by name to find the right fit.' },
            { n: '2', t: 'Pick an open slot', d: 'See real-time availability and choose a time that works.' },
            { n: '3', t: 'Manage your care', d: 'Track upcoming visits and cancel or reschedule anytime.' },
          ].map((step) => (
            <Card key={step.n} className="p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-display text-lg font-semibold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{step.t}</h3>
              <p className="mt-1 text-sm text-ink-500">{step.d}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
