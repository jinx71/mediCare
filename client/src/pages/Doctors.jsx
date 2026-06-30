import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctors, getSpecialties } from '../api/doctors';
import DoctorCard from '../components/DoctorCard';
import SectionHeading from '../components/SectionHeading';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const specialty = searchParams.get('specialty') || 'all';

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSpecialties()
      .then((res) => setSpecialties(res.data))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getDoctors({ specialty, q: search || undefined });
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [specialty, search]);

  // Debounce the search box; specialty changes apply immediately.
  useEffect(() => {
    const id = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(id);
  }, [load, search]);

  const setSpecialty = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('specialty');
    else next.set('specialty', value);
    setSearchParams(next);
  };

  return (
    <div className="container-px py-10">
      <SectionHeading
        eyebrow="Our doctors"
        title="Find the right specialist"
        subtitle="Filter by department or search by name."
      />

      {/* Controls */}
      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          aria-label="Search doctors by name"
          className="w-full rounded-xl border border-ink-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
        />
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 sm:ml-auto">
          {['all', ...specialties].map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                specialty === s
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-ink-100 bg-white text-ink-700 hover:border-brand-300'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </Card>

      {/* States */}
      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && (
        <EmptyState
          tone="error"
          icon="!"
          title="Couldn't load doctors"
          message={error}
          action={
            <Button variant="secondary" onClick={load}>
              Try again
            </Button>
          }
        />
      )}

      {!loading && !error && doctors.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No doctors match"
          message="Try a different specialty or clear your search."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setSpecialty('all');
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}

      {!loading && !error && doctors.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <DoctorCard key={d._id} doctor={d} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
