import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mt-16 border-t border-ink-100 bg-white">
    <div className="container-px flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
      <p className="text-sm text-ink-500">
        © {new Date().getFullYear()} MediCare. A MERN portfolio demo — not a real clinic.
      </p>
      <div className="flex items-center gap-4 text-sm text-ink-500">
        <Link to="/doctors" className="hover:text-brand-600">
          Doctors
        </Link>
        <Link to="/drugs" className="hover:text-brand-600">
          Drug info
        </Link>
        <span className="text-ink-100">|</span>
        <span>Dublin, IE</span>
      </div>
    </div>
  </footer>
);

export default Footer;
