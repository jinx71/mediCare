import React, { forwardRef } from 'react';
import { cn } from '../utils/format';

const Select = forwardRef(
  ({ label, error, id, className, required, children, ...rest }, ref) => {
    const selectId = id || rest.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 transition-colors',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
            error ? 'border-red-400' : 'border-ink-100',
            className
          )}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
