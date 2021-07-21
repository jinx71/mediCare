import React from 'react';
import { cn } from '../utils/format';

const SectionHeading = ({ eyebrow, title, subtitle, action, className }) => (
  <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-3', className)}>
    <div>
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default SectionHeading;
