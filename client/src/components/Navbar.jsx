import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from './Button';
import { cn } from '../utils/format';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M10 3h4v6h6v6h-6v6h-4v-6H4V9h6V3Z"
          fill="currentColor"
          opacity="0.95"
        />
      </svg>
    </span>
    <span className="font-display text-lg font-semibold text-ink-900">
      Medi<span className="text-brand-600">Care</span>
    </span>
  </Link>
);

const linkClass = ({ isActive }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-100'
  );

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const navLinks = (
    <>
      <NavLink to="/doctors" className={linkClass} onClick={() => setOpen(false)}>
        Find a doctor
      </NavLink>
      {isAuthenticated && (
        <>
          <NavLink to="/drugs" className={linkClass} onClick={() => setOpen(false)}>
            Drug info
          </NavLink>
          <NavLink to={dashboardPath} className={linkClass} onClick={() => setOpen(false)}>
            {isAdmin ? 'Admin' : 'My appointments'}
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <nav className="container-px flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">{navLinks}</div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-ink-500">
                Hi, <span className="font-medium text-ink-900">{user?.name?.split(' ')[0]}</span>
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Create account</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">{navLinks}</div>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3">
            {isAuthenticated ? (
              <Button variant="secondary" onClick={handleLogout}>
                Sign out
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">Create account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
