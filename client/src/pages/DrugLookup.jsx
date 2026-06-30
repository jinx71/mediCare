import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { searchDrugs, getDrugInfo } from '../api/drugs';
import SectionHeading from '../components/SectionHeading';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const InfoBlock = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-700">{value}</p>
    </div>
  ) : null;

const POPULAR = ['Ibuprofen', 'Paracetamol', 'Amoxicillin', 'Lisinopril', 'Metformin'];

const DrugLookup = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [infoError, setInfoError] = useState('');
  const boxRef = useRef(null);
  const [showResults, setShowResults] = useState(false);

  // Debounced search suggestions.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        const { data } = await searchDrugs(query.trim());
        setResults(data);
        setShowResults(true);
      } catch (err) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  // Close suggestions on outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const lookup = useCallback(async (name) => {
    setQuery(name);
    setShowResults(false);
    setLoadingInfo(true);
    setInfoError('');
    setInfo(null);
    try {
      const { data } = await getDrugInfo(name);
      setInfo(data);
    } catch (err) {
      setInfoError(err.message);
      toast.error(err.message);
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  return (
    <div className="container-px py-10">
      <SectionHeading
        eyebrow="Reference"
        title="Drug information"
        subtitle="Search trusted data from the U.S. NIH (RxNav) and openFDA."
      />

      {/* Search */}
      <div ref={boxRef} className="relative mx-auto max-w-2xl">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setShowResults(true)}
          placeholder="Search a medicine, e.g. Ibuprofen"
          aria-label="Search for a drug"
          className="w-full rounded-2xl border border-ink-100 bg-white px-4 py-3.5 text-sm shadow-card focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {searching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </span>
        )}

        {showResults && results.length > 0 && (
          <Card className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto p-1.5">
            {results.map((r) => (
              <button
                key={r.rxcui}
                onClick={() => lookup(r.name)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-brand-50"
              >
                <span className="text-ink-900">{r.name}</span>
                <span className="text-xs text-ink-500">{r.tty}</span>
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Popular shortcuts */}
      {!info && !loadingInfo && (
        <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
          <span className="text-sm text-ink-500">Try:</span>
          {POPULAR.map((p) => (
            <button
              key={p}
              onClick={() => lookup(p)}
              className="rounded-full border border-ink-100 bg-white px-3 py-1 text-sm text-ink-700 hover:border-brand-300"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Info result */}
      <div className="mx-auto mt-8 max-w-2xl">
        {loadingInfo && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!loadingInfo && infoError && (
          <EmptyState
            tone="error"
            icon="!"
            title="Couldn't load drug info"
            message={infoError}
          />
        )}

        {!loadingInfo && info && (
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">{info.name}</h2>
                {info.genericName && info.genericName !== info.name && (
                  <p className="text-sm text-ink-500">Generic: {info.genericName}</p>
                )}
              </div>
              <Badge tone={info.source === 'openFDA' ? 'info' : 'neutral'}>
                {info.source === 'openFDA' ? 'openFDA' : 'Offline reference'}
              </Badge>
            </div>

            {info.brandNames?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {info.brandNames.slice(0, 6).map((b) => (
                  <Badge key={b} tone="brand">
                    {b}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <InfoBlock label="Purpose" value={info.purpose} />
              <InfoBlock label="What it's used for" value={info.usage} />
              <InfoBlock label="Dosage" value={info.dosage} />
              <InfoBlock label="Warnings" value={info.warnings} />
              <InfoBlock label="Possible side effects" value={info.sideEffects} />
              {info.activeIngredients?.length > 0 && (
                <InfoBlock label="Active ingredients" value={info.activeIngredients.join(', ')} />
              )}
            </div>

            <p className="mt-6 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This information is for general reference only and is not medical advice. Always follow
              your doctor or pharmacist's guidance.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DrugLookup;
