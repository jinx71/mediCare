import React from 'react';
import { cn, initials } from '../utils/format';

const SIZES = { sm: 'h-10 w-10 text-sm', md: 'h-14 w-14 text-base', lg: 'h-20 w-20 text-2xl' };

// Deterministic soft-tinted initials avatar. Keeps the UI clean offline with
// no broken image requests.
const Avatar = ({ name, src, size = 'md', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-2xl object-cover', SIZES[size], className)}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 font-semibold text-brand-700',
        SIZES[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
};

export default Avatar;
