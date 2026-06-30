import React, { forwardRef } from 'react';
import { cn } from '../utils/format';

const Input = forwardRef(
  ({ label, error, hint, id, className, required, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 transition-colors',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
            error ? 'border-red-400' : 'border-ink-100 hover:border-ink-100',
            className
          )}
          {...rest}
        />
        {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
