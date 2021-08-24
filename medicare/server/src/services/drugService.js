const axios = require('axios');
const NodeCache = require('node-cache');

// --- Cache -----------------------------------------------------------------
// Drug reference data is stable, so a long-ish TTL is fine. This is also what
// keeps us comfortably under any informal rate limits on the public endpoints.
const cache = new NodeCache({ stdTTL: 60 * 60 * 6, checkperiod: 600 }); // 6h

const RXNAV = process.env.RXNAV_BASE_URL || 'https://rxnav.nlm.nih.gov/REST';
const OPENFDA = process.env.OPENFDA_BASE_URL || 'https://api.fda.gov/drug';

const http = axios.create({ timeout: 8000 });

// --- Mock fallback ---------------------------------------------------------
// Ensures the full UI flow is explorable even with no internet / API outage.
const MOCK = {
  ibuprofen: {
    name: 'Ibuprofen',
    rxcui: '5640',
    genericName: 'ibuprofen',
    brandNames: ['Advil', 'Nurofen', 'Motrin'],
    purpose: 'Nonsteroidal anti-inflammatory drug (NSAID). Pain reliever / fever reducer.',
    usage: 'Temporarily relieves minor aches and pains and reduces fever.',
    dosage: 'Adults: 200–400 mg every 4–6 hours while symptoms persist. Do not exceed 1200 mg in 24 hours unless directed by a doctor.',
    warnings: 'May increase risk of heart attack or stroke and may cause stomach bleeding. Avoid if allergic to NSAIDs.',
    sideEffects: 'Nausea, heartburn, dizziness, mild headache.',
    activeIngredients: ['Ibuprofen 200 mg'],
    manufacturer: 'Various',
  },
  paracetamol: {
    name: 'Paracetamol (Acetaminophen)',
    rxcui: '161',
    genericName: 'acetaminophen',
    brandNames: ['Panadol', 'Tylenol', 'Calpol'],
    purpose: 'Analgesic and antipyretic (pain and fever).',
    usage: 'Relief of mild to moderate pain and reduction of fever.',
    dosage: 'Adults: 500–1000 mg every 4–6 hours. Do not exceed 4000 mg in 24 hours.',
    warnings: 'Overdose can cause severe liver damage. Do not combine with other paracetamol-containing products.',
    sideEffects: 'Rare at recommended doses; allergic reactions possible.',
    activeIngredients: ['Acetaminophen 500 mg'],
    manufacturer: 'Various',
  },
  amoxicillin: {
    name: 'Amoxicillin',
    rxcui: '723',
    genericName: 'amoxicillin',
    brandNames: ['Amoxil', 'Moxatag'],
    purpose: 'Penicillin-class antibiotic.',
    usage: 'Treats bacterial infections such as chest, ear, and urinary tract infections.',
    dosage: 'Adults: typically 250–500 mg every 8 hours, as prescribed. Complete the full course.',
    warnings: 'Do not use if allergic to penicillin. Not effective against viral infections.',
    sideEffects: 'Diarrhoea, nausea, rash.',
    activeIngredients: ['Amoxicillin 500 mg'],
    manufacturer: 'Various',
  },
  lisinopril: {
    name: 'Lisinopril',
    rxcui: '29046',
    genericName: 'lisinopril',
    brandNames: ['Zestril', 'Prinivil'],
    purpose: 'ACE inhibitor for blood pressure and heart failure.',
    usage: 'Treats high blood pressure and helps protect the kidneys and heart.',
    dosage: 'Adults: 10 mg once daily initially, adjusted by a doctor.',
    warnings: 'Can cause dizziness; avoid in pregnancy. Monitor kidney function and potassium.',
    sideEffects: 'Dry cough, dizziness, headache.',
    activeIngredients: ['Lisinopril 10 mg'],
    manufacturer: 'Various',
  },
  metformin: {
    name: 'Metformin',
    rxcui: '6809',
    genericName: 'metformin',
    brandNames: ['Glucophage', 'Fortamet'],
    purpose: 'Biguanide antidiabetic.',
    usage: 'Controls blood sugar in type 2 diabetes.',
    dosage: 'Adults: 500 mg once or twice daily with meals, titrated as directed.',
    warnings: 'Rare risk of lactic acidosis. Tell your doctor about kidney problems.',
    sideEffects: 'Nausea, diarrhoea, metallic taste.',
    activeIngredients: ['Metformin hydrochloride 500 mg'],
    manufacturer: 'Various',
  },
};

const mockSearch = (q) => {
  const term = q.toLowerCase();
  return Object.values(MOCK)
    .filter((d) => d.name.toLowerCase().includes(term) || d.genericName.includes(term))
    .map((d) => ({ rxcui: d.rxcui, name: d.name, tty: 'IN' }));
};

const mockInfo = (name) => {
  const key = name.toLowerCase().replace(/[^a-z]/g, '');
  const match =
    MOCK[key] ||
    Object.values(MOCK).find(
      (d) => d.name.toLowerCase().includes(name.toLowerCase()) || d.genericName.includes(name.toLowerCase())
    );
  if (match) return { ...match, source: 'mock' };
  return {
    name,
    source: 'mock',
    rxcui: null,
    genericName: name,
    brandNames: [],
    purpose: 'No detailed label found in the offline reference set.',
    usage: 'Please consult a pharmacist or your prescribing doctor for guidance.',
    dosage: 'Not available offline.',
    warnings: 'Always follow the directions provided with your medicine.',
    sideEffects: 'Not available offline.',
    activeIngredients: [],
    manufacturer: 'Unknown',
  };
};

// --- Helpers ---------------------------------------------------------------
const firstText = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : '');

// --- Public service --------------------------------------------------------

// Autocomplete-style search via RxNav /drugs.json (keyless).
const searchDrugs = async (query) => {
  const q = (query || '').trim();
  if (q.length < 2) return [];

  const cacheKey = `search:${q.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await http.get(`${RXNAV}/drugs.json`, { params: { name: q } });
    const groups = data?.drugGroup?.conceptGroup || [];
    const seen = new Set();
    const results = [];

    groups.forEach((g) => {
      (g.conceptProperties || []).forEach((c) => {
        if (!seen.has(c.rxcui)) {
          seen.add(c.rxcui);
          results.push({ rxcui: c.rxcui, name: c.name, tty: c.tty });
        }
      });
    });

    const trimmed = results.slice(0, 12);
    cache.set(cacheKey, trimmed);
    return trimmed;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[drugService] RxNav search failed, using mock:', err.message);
    const fallback = mockSearch(q);
    cache.set(cacheKey, fallback, 300); // short TTL on fallback
    return fallback;
  }
};

// Detailed label via openFDA, enriched with the RxCUI from RxNav (both keyless).
const getDrugInfo = async (name) => {
  const drug = (name || '').trim();
  if (!drug) {
    const err = new Error('A drug name is required');
    err.statusCode = 400;
    throw err;
  }

  const cacheKey = `info:${drug.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // openFDA label lookup — try brand name first, then generic name.
    const search = `(openfda.brand_name:"${drug}"+openfda.generic_name:"${drug}")`;
    const { data } = await http.get(`${OPENFDA}/label.json`, {
      params: { search, limit: 1 },
    });

    const result = data?.results?.[0];
    if (!result) throw new Error('No openFDA label found');

    const openfda = result.openfda || {};

    // Best-effort RxCUI from openFDA payload, else look it up.
    let rxcui = firstText(openfda.rxcui);
    if (!rxcui) {
      try {
        const rx = await http.get(`${RXNAV}/rxcui.json`, { params: { name: drug } });
        rxcui = rx.data?.idGroup?.rxnormId?.[0] || null;
      } catch (_) {
        rxcui = null;
      }
    }

    const info = {
      name: firstText(openfda.brand_name) || firstText(openfda.generic_name) || drug,
      source: 'openFDA',
      rxcui: rxcui || null,
      genericName: firstText(openfda.generic_name) || drug,
      brandNames: openfda.brand_name || [],
      purpose: firstText(result.purpose) || firstText(result.indications_and_usage),
      usage: firstText(result.indications_and_usage),
      dosage: firstText(result.dosage_and_administration),
      warnings: firstText(result.warnings) || firstText(result.boxed_warning),
      sideEffects:
        firstText(result.adverse_reactions) ||
        firstText(result.stop_use) ||
        firstText(result.warnings),
      activeIngredients: openfda.substance_name || [],
      manufacturer: firstText(openfda.manufacturer_name) || 'Unknown',
    };

    cache.set(cacheKey, info);
    return info;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[drugService] openFDA lookup failed, using mock:', err.message);
    const fallback = mockInfo(drug);
    cache.set(cacheKey, fallback, 300);
    return fallback;
  }
};

module.exports = { searchDrugs, getDrugInfo };
