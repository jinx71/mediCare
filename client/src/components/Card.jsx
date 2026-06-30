import React from 'react';
import { cn } from '../utils/format';

const Card = ({ as: Tag = 'div', className, hover = false, children, ...rest }) => (
  <Tag
    className={cn(
      'rounded-2xl border border-ink-100 bg-white shadow-card',
      hover && 'transition-shadow duration-200 hover:shadow-lift',
      className
    )}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
