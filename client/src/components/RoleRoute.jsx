import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from './Spinner';

// Client-side RBAC. The server is still the source of truth (every admin route
// is guarded by requireRole) — this just keeps the UI honest and avoids
// showing pages a role can't use.
const RoleRoute = ({ role, children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    // Send users to the dashboard that matches their actual role.
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

export default RoleRoute;
