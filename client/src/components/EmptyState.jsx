import React from 'react';
import { cn } from '../utils/format';

// Used for both empty and error states. Per the design guidance, the copy is
// directive ("here's what to do"), never an apology.
const EmptyState = ({ icon, title, message, action, tone = 'neutral', className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center',
      tone === 'error' ? 'border-red-200 bg-red-50/40' : 'border-ink-100 bg-white',
      className
    )}
  >
    {icon && (
      <div
        className={cn(
          'mb-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl',
          tone === 'error' ? 'bg-red-100 text-red-600' : 'bg-brand-50 text-brand-600'
        )}
      >
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-ink-900">{title}</h3>
    {message && <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
