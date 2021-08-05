import dayjs from 'dayjs';

// Lightweight className combiner (avoids a clsx dependency).
export const cn = (...args) => args.filter(Boolean).join(' ');

export const formatDate = (date) => dayjs(date).format('ddd, D MMM YYYY');

export const formatDateTime = (date, slot) =>
  `${dayjs(date).format('ddd, D MMM YYYY')}${slot ? ` · ${slot}` : ''}`;

export const initials = (name = '') =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const isPast = (date, slot = '23:59') => {
  if (!date) return false;
  const [h, m] = (slot || '23:59').split(':').map(Number);
  const dt = dayjs(date).hour(h || 23).minute(m || 59).second(0);
  return dt.isBefore(dayjs());
};

// Returns today's date as YYYY-MM-DD (used as the min for date pickers).
export const todayISO = () => dayjs().format('YYYY-MM-DD');

// Generates the next `count` selectable dates as { value, label } pairs.
export const upcomingDates = (count = 14) =>
  Array.from({ length: count }, (_, i) => {
    const d = dayjs().add(i, 'day');
    return {
      value: d.format('YYYY-MM-DD'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.format('ddd, D MMM'),
    };
  });
