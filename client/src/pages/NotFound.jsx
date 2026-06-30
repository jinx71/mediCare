import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => (
  <div className="container-px flex min-h-[70vh] flex-col items-center justify-center text-center">
    <p className="font-display text-7xl font-semibold text-brand-500">404</p>
    <h1 className="mt-3 text-2xl font-semibold text-ink-900">Page not found</h1>
    <p className="mt-1 max-w-sm text-ink-500">
      The page you're looking for doesn't exist or may have moved.
    </p>
    <Link to="/" className="mt-6">
      <Button size="lg">Back to home</Button>
    </Link>
  </div>
);

export default NotFound;
