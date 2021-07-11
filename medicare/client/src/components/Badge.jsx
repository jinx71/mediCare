import React from 'react';
import { cn } from '../utils/format';

const TONES = {
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  neutral: 'bg-ink-100 text-ink-700 border-ink-100',
  success: 'bg-green-50 text-green-700 border-green-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-sky-50 text-sky-700 border-sky-100',
};

const Badge = ({ tone = 'brand', className, children }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
      TONES[tone] || TONES.brand,
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
