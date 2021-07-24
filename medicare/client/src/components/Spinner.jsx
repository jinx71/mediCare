import React from 'react';
import { cn } from '../utils/format';

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' };

const Spinner = ({ size = 'md', className, label = 'Loading' }) => (
  <span role="status" aria-label={label} className="inline-flex">
    <span
      className={cn(
        'animate-spin rounded-full border-brand-500 border-t-transparent',
        SIZES[size],
        className
      )}
    />
  </span>
);

export default Spinner;
